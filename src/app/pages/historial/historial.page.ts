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
} from '@ionic/angular/standalone';
import { NgIf, NgForOf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

import { HistorialService } from '../../services/historial.service';
import { MascotasService } from '../../services/mascotas.service';

import { HistorialItem } from '../../models/historial.model';
import { Mascota } from '../../models/mascota.model';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
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
    NgIf,
    NgForOf,
    FormsModule,
  ],
})
export class HistorialPage {
  historial: HistorialItem[] = [];
  mascotas: Mascota[] = [];

  // Filtro por mascota (null = todas)
  filtroMascotaId: number | null = null;

  nuevaEntrada: Partial<HistorialItem> = {
    titulo: '',
    tipo: '',
    fecha: '',
    hora: '',
    notas: '',
    mascotaId: undefined,
  };

  constructor(
    private historialService: HistorialService,
    private mascotasService: MascotasService
  ) {}

  async ionViewWillEnter() {
    this.historial = await this.historialService.getHistorial();
    this.mascotas = await this.mascotasService.getMascotas();
  }

  get historialFiltrado(): HistorialItem[] {
    const filtrados = this.filtroMascotaId
      ? this.historial.filter(h => h.mascotaId === this.filtroMascotaId)
      : this.historial;

    // Orden cronológico (más reciente primero)
    return [...filtrados].sort((a, b) => {
      const aDate = new Date(`${a.fecha}T${a.hora || '00:00'}`);
      const bDate = new Date(`${b.fecha}T${b.hora || '00:00'}`);
      return bDate.getTime() - aDate.getTime();
    });
  }

  async guardarEntrada(form: NgForm) {
    if (form.invalid) {
      return;
    }

    await this.historialService.agregarEntrada({
      titulo: this.nuevaEntrada.titulo!,
      tipo: this.nuevaEntrada.tipo!,
      fecha: this.nuevaEntrada.fecha!,
      hora: this.nuevaEntrada.hora!,
      notas: this.nuevaEntrada.notas,
      mascotaId: this.nuevaEntrada.mascotaId,
    });

    // limpiar formulario
    this.nuevaEntrada = {
      titulo: '',
      tipo: '',
      fecha: '',
      hora: '',
      notas: '',
      mascotaId: undefined,
    };
    form.resetForm();

    // recargar lista
    this.historial = await this.historialService.getHistorial();
  }

  async eliminarEntrada(id: number) {
    await this.historialService.eliminarEntrada(id);
    this.historial = await this.historialService.getHistorial();
  }

  obtenerNombreMascota(mascotaId?: number): string | undefined {
    if (mascotaId == null) {
      return undefined;
    }
    const mascota = this.mascotas.find(m => m.id === mascotaId);
    return mascota?.nombre;
  }
}
