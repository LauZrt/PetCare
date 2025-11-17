import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

import { MascotasService } from '../services/mascotas.service';
import { RecordatoriosService } from '../services/recordatorios.service';

import { Mascota } from '../models/mascota.model';
import { Recordatorio } from '../models/recordatorio.model';

import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    RouterLink,
    NgIf,
  ],
})
export class HomePage {
  mascotas: Mascota[] = [];
  recordatorios: Recordatorio[] = [];

  totalMascotas = 0;
  totalRecordatoriosHoy = 0;
  totalRecordatoriosVencidos = 0;
  proximoRecordatorio: Recordatorio | null = null;

  fechaActualTexto = '';

  constructor(
    private mascotasService: MascotasService,
    private recordatoriosService: RecordatoriosService,
    private router: Router,
    private navCtrl: NavController
  ) {}

  async ionViewWillEnter() {
    await this.cargarDatos();
  }

  private async cargarDatos() {
    this.mascotas = await this.mascotasService.getMascotas();
    this.recordatorios = await this.recordatoriosService.getRecordatorios();

    this.totalMascotas = this.mascotas.length;

    const ahora = new Date();

    const pendientes = this.recordatorios.filter(r => !r.completado);

    const hoy: Recordatorio[] = [];
    const vencidos: Recordatorio[] = [];
    const futuros: Recordatorio[] = [];

    for (const r of pendientes) {
      const fechaRec = this.crearFechaDesdeRecordatorio(r);

      if (this.esMismoDia(fechaRec, ahora)) {
        if (fechaRec.getTime() < ahora.getTime()) {
          vencidos.push(r);
        } else {
          hoy.push(r);
        }
      } else if (fechaRec.getTime() < ahora.getTime()) {
        vencidos.push(r);
      } else {
        futuros.push(r);
      }
    }

    this.totalRecordatoriosHoy = hoy.length;
    this.totalRecordatoriosVencidos = vencidos.length;

    const candidatosProximo = [...hoy, ...futuros];
    candidatosProximo.sort(
      (a, b) =>
        this.crearFechaDesdeRecordatorio(a).getTime() -
        this.crearFechaDesdeRecordatorio(b).getTime()
    );
    this.proximoRecordatorio =
      candidatosProximo.length > 0 ? candidatosProximo[0] : null;

    this.fechaActualTexto = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  private crearFechaDesdeRecordatorio(rec: Recordatorio): Date {
    const [year, month, day] = rec.fecha.split('-').map(n => parseInt(n, 10));
    const [hour, minute] = rec.hora.split(':').map(n => parseInt(n, 10));
    return new Date(year, month - 1, day, hour, minute, 0, 0);
  }

  private esMismoDia(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  obtenerNombreMascota(mascotaId?: number): string {
    if (mascotaId == null) {
      return '';
    }
    const mascota = this.mascotas.find(m => m.id === mascotaId);
    return mascota ? mascota.nombre : '';
  }

  irAConfiguracion() {
    this.router.navigateByUrl('/configuracion', { replaceUrl: true });
  }
}
