import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Recordatorio } from '../models/recordatorio.model';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class RecordatoriosService {
  private recordatorios: Recordatorio[] = [];
  private nextId = 1;
  private storageKey = 'recordatorios';
  private initPromise: Promise<void>;

  constructor(private storage: Storage) {
    this.initPromise = this.init();
  }

  // Inicializa Storage y carga los recordatorios guardados
  private async init(): Promise<void> {
    await this.storage.create();

    const stored = await this.storage.get(this.storageKey);
    if (stored && Array.isArray(stored)) {
      this.recordatorios = stored as Recordatorio[];

      const lastId = this.recordatorios.reduce(
        (max, r) => (r.id > max ? r.id : max),
        0
      );
      this.nextId = lastId + 1;
    }

    // Pedir permisos de notificaciones al iniciar
    await this.requestNotificationPermissions();
  }

  private async requestNotificationPermissions(): Promise<void> {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }
  }

  private async saveToStorage(): Promise<void> {
    await this.storage.set(this.storageKey, this.recordatorios);
  }

  // Devuelve la lista actual de recordatorios
  async getRecordatorios(): Promise<Recordatorio[]> {
    await this.initPromise;
    return this.recordatorios;
  }

  // Agrega un nuevo recordatorio y programa su notificación
  async agregarRecordatorio(
    data: Omit<Recordatorio, 'id' | 'completado'>
  ): Promise<void> {
    await this.initPromise;

    const nuevo: Recordatorio = {
      id: this.nextId++,
      completado: false,
      ...data,
    };

    this.recordatorios.push(nuevo);
    await this.saveToStorage();

    await this.programarNotificacion(nuevo);
  }

  // Elimina recordatorio y su notificación asociada
  async eliminarRecordatorio(id: number): Promise<void> {
    await this.initPromise;

    this.recordatorios = this.recordatorios.filter(r => r.id !== id);
    await this.saveToStorage();

    await LocalNotifications.cancel({
      notifications: [{ id }]
    });
  }

  // Marca recordatorio como completado y cancela futuras notificaciones
  async marcarComoCompletado(id: number): Promise<void> {
    await this.initPromise;

    const rec = this.recordatorios.find(r => r.id === id);
    if (rec) {
      rec.completado = true;
      await this.saveToStorage();
    }

    await LocalNotifications.cancel({
      notifications: [{ id }]
    });
  }

  // ------------------ LÓGICA DE NOTIFICACIONES ------------------ //

  // Construye un Date a partir de fecha (YYYY-MM-DD) y hora (HH:mm)
  private crearFechaDesdeRecordatorio(rec: Recordatorio): Date {
    const [year, month, day] = rec.fecha.split('-').map(n => parseInt(n, 10));
    const [hour, minute] = rec.hora.split(':').map(n => parseInt(n, 10));

    // En JS el mes es 0-based, por eso month - 1
    return new Date(year, month - 1, day, hour, minute, 0, 0);
  }

  // Devuelve el objeto "schedule" que entiende el plugin de notificaciones
  private obtenerSchedule(rec: Recordatorio): any {
    const firstAt = this.crearFechaDesdeRecordatorio(rec);

    const recurrencia = (rec.recurrencia || 'Única vez').toLowerCase();

    if (recurrencia.includes('diario')) {
      return {
        every: 'day',
        on: {
          hour: firstAt.getHours(),
          minute: firstAt.getMinutes(),
        },
      };
    }

    if (recurrencia.includes('semanal')) {
      return {
        every: 'week',
        on: {
          day: firstAt.getDay(), // 0-6, domingo-sábado
          hour: firstAt.getHours(),
          minute: firstAt.getMinutes(),
        },
      };
    }

    if (recurrencia.includes('mensual')) {
      return {
        every: 'month',
        on: {
          day: firstAt.getDate(),
          hour: firstAt.getHours(),
          minute: firstAt.getMinutes(),
        },
      };
    }

    // "Única vez" (sin recurrencia)
    return {
      at: firstAt,
    };
  }

  private async programarNotificacion(rec: Recordatorio): Promise<void> {
    const schedule = this.obtenerSchedule(rec);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: rec.id, // usamos el mismo id del recordatorio
          title: rec.titulo,
          body: `${rec.tipo} • ${rec.fecha} ${rec.hora}`,
          schedule,
          smallIcon: 'ic_stat_icon', // se puede personalizar en Android
          sound: undefined,
          attachments: [],
          actionTypeId: '',
          extra: {
            mascotaId: rec.mascotaId,
          },
        },
      ],
    });
  }
}
