import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Configuracion } from '../models/configuracion.model';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  private configuracion: Configuracion | null = null;
  private storageKey = 'configuracion';
  private initPromise: Promise<void>;

  constructor(private storage: Storage) {
    this.initPromise = this.init();
  }

  private async init(): Promise<void> {
    await this.storage.create();
    const stored = await this.storage.get(this.storageKey);
    if (stored) {
      this.configuracion = stored as Configuracion;
    } else {
      // Valores por defecto
      this.configuracion = {
        nombre: '',
        correo: '',
        telefono: '',
        ciudad: '',
        idioma: 'es',
        fotoPerfil: '',
        horaRecordatoriosPorDefecto: '09:00',
        notificacionesActivadas: true,
        tipoNotificacion: 'sonido',
        respaldoFrecuencia: 'semanal',
        tema: 'automatico',
        tamanoFuente: 'normal',
        mostrarEmojisMascotas: true,
      };
      await this.saveToStorage();
    }
  }

  private async saveToStorage(): Promise<void> {
    if (this.configuracion) {
      await this.storage.set(this.storageKey, this.configuracion);
    }
  }

  async getConfiguracion(): Promise<Configuracion> {
    await this.initPromise;
    if (!this.configuracion) {
      // seguridad extra, no debería pasar
      this.configuracion = {
        nombre: '',
        correo: '',
        telefono: '',
        ciudad: '',
        idioma: 'es',
        fotoPerfil: '',
        horaRecordatoriosPorDefecto: '09:00',
        notificacionesActivadas: true,
        tipoNotificacion: 'sonido',
        respaldoFrecuencia: 'semanal',
        tema: 'automatico',
        tamanoFuente: 'normal',
        mostrarEmojisMascotas: true,
      };
    }
    return this.configuracion;
  }

  async guardarConfiguracion(config: Configuracion): Promise<void> {
    this.configuracion = config;
    await this.saveToStorage();
  }
}
