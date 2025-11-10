import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
} from '@ionic/angular/standalone';
import { NgIf, NgForOf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MascotasService } from '../../services/mascotas.service';
import { Mascota } from '../../models/mascota.model';

@Component({
  selector: 'app-mascotas',
  templateUrl: './mascotas.page.html',
  styleUrls: ['./mascotas.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    NgIf,
    NgForOf,
    RouterLink,
  ],
})
export class MascotasPage {
  mascotas: Mascota[] = [];

  constructor(private mascotasService: MascotasService) {}

  async ionViewWillEnter() {
    this.mascotas = await this.mascotasService.getMascotas();
  }

  async eliminarMascota(id: number) {
    await this.mascotasService.eliminarMascota(id);
    this.mascotas = await this.mascotasService.getMascotas();
  }
}
