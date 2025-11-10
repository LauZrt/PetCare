import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonSearchbar,
} from '@ionic/angular/standalone';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

import { RecordatoriosService } from '../../services/recordatorios.service';
import { MascotasService } from '../../services/mascotas.service';
import { HistorialService } from '../../services/historial.service';

import { Recordatorio } from '../../models/recordatorio.model';
import { Mascota } from '../../models/mascota.model';

type EstadoFiltro = 'TODOS' | 'HOY' | 'PROXIMO' | 'VENCIDO';

@Component({
  selector: 'app-recordatorios',
  templateUrl: './recordatorios.page.html',
  styleUrls: ['./recordatorios.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonButton,
    IonSelect,
    IonSelectOption,
    IonSearchbar,
    NgForOf,
    NgIf,
    FormsModule,
  ],
})
export class RecordatoriosPage {
  // lista completa
  recordatorios: Recordatorio[] = [];
  // lista que se muestra (filtrada)
  recordatoriosFiltrados: Recordatorio[] = [];
  mascotas: Mascota[] = [];

  filtroEstado: EstadoFiltro = 'TODOS';
  textoBusqueda = '';

  nuevoRecordatorio: Partial<Recordatorio> = {
    mascotaId: undefined,
    titulo: '',
    tipo: '',
    fecha: '',
    hora: '',
    recurrencia: '',
    notas: '',
  };

  constructor(
    private recordatoriosService: RecordatoriosService,
    private mascotasService: MascotasService,
    private historialService: HistorialService
  ) {}

  async ionViewWillEnter() {
    await this.cargarDatos();
  }

  private async cargarDatos() {
    this.recordatorios = await this.recordatoriosService.getRecordatorios();
    this.mascotas = await this.mascotasService.getMascotas();
    this.aplicarFiltros();
  }

  async guardarRecordatorio(form: NgForm) {
    if (form.invalid) {
      return;
    }

    await this.recordatoriosService.agregarRecordatorio({
      mascotaId: this.nuevoRecordatorio.mascotaId,
      titulo: this.nuevoRecordatorio.titulo!,
      tipo: this.nuevoRecordatorio.tipo!,
      fecha: this.nuevoRecordatorio.fecha!,
      hora: this.nuevoRecordatorio.hora!,
      recurrencia: this.nuevoRecordatorio.recurrencia || 'Única vez',
      notas: this.nuevoRecordatorio.notas || '',
    });

    // limpiar formulario
    this.nuevoRecordatorio = {
      mascotaId: undefined,
      titulo: '',
      tipo: '',
      fecha: '',
      hora: '',
      recurrencia: '',
      notas: '',
    };
    form.resetForm();

    await this.cargarDatos();
  }

  async eliminarRecordatorio(id: number) {
    await this.recordatoriosService.eliminarRecordatorio(id);
    await this.cargarDatos();
  }

  async marcarComoCompletado(recordatorio: Recordatorio) {
    const ahora = new Date();
    const fechaHoy = ahora.toISOString().slice(0, 10); // YYYY-MM-DD
    const horaHoy = ahora.toTimeString().slice(0, 5);   // HH:mm

    // 1. Crear entrada en historial
    await this.historialService.agregarEntrada({
      titulo: recordatorio.titulo,
      tipo: recordatorio.tipo,
      fecha: fechaHoy,
      hora: horaHoy,
      notas: recordatorio.notas,
      mascotaId: recordatorio.mascotaId,
    });

    // 2. Marcar recordatorio como completado
    await this.recordatoriosService.marcarComoCompletado(recordatorio.id);

    // 3. Recargar lista
    await this.cargarDatos();
  }

  // ----------- Filtros -----------

  onCambiarFiltroEstado(estado: EstadoFiltro) {
    this.filtroEstado = estado;
    this.aplicarFiltros();
  }

  onBuscar(texto: string) {
    this.textoBusqueda = (texto || '').toLowerCase();
    this.aplicarFiltros();
  }

  private aplicarFiltros() {
    let lista = [...this.recordatorios];

    // filtro por estado (HOY / PROXIMO / VENCIDO)
    if (this.filtroEstado !== 'TODOS') {
      lista = lista.filter(
        (r) => this.obtenerEstadoRecordatorio(r) === this.filtroEstado
      );
    }

    // filtro por texto (título, tipo o nombre de mascota)
    const t = this.textoBusqueda.trim();
    if (t) {
      lista = lista.filter((r) => {
        const nombreMascota = this.obtenerNombreMascota(r.mascotaId)
          .toLowerCase();
        return (
          r.titulo.toLowerCase().includes(t) ||
          r.tipo.toLowerCase().includes(t) ||
          nombreMascota.includes(t)
        );
      });
    }

    this.recordatoriosFiltrados = lista;
  }

  // ----------- Utilidades existentes -----------

  obtenerNombreMascota(mascotaId?: number): string {
    if (mascotaId == null) {
      return '';
    }
    const mascota = this.mascotas.find((m) => m.id === mascotaId);
    return mascota ? mascota.nombre : '';
  }

  obtenerEstadoRecordatorio(rec: Recordatorio): EstadoFiltro | '' {
    if (rec.completado) {
      return '';
    }

    const ahora = new Date();
    const fechaRec = this.crearFechaDesdeRecordatorio(rec);

    // mismo día
    if (this.esMismoDia(fechaRec, ahora)) {
      if (fechaRec.getTime() >= ahora.getTime()) {
        return 'HOY';
      } else {
        return 'VENCIDO';
      }
    }

    // otros días
    if (fechaRec.getTime() < ahora.getTime()) {
      return 'VENCIDO';
    } else {
      return 'PROXIMO';
    }
  }

  private crearFechaDesdeRecordatorio(rec: Recordatorio): Date {
    const [year, month, day] = rec.fecha.split('-').map((n) => parseInt(n, 10));
    const [hour, minute] = rec.hora.split(':').map((n) => parseInt(n, 10));
    return new Date(year, month - 1, day, hour, minute, 0, 0);
  }

  private esMismoDia(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
}
