import { Component, OnInit } from '@angular/core';
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
} from '@ionic/angular/standalone';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';

import { MascotasService } from '../../services/mascotas.service';
import { Mascota } from '../../models/mascota.model';

@Component({
  selector: 'app-mascota-form',
  templateUrl: './mascota-form.page.html',
  styleUrls: ['./mascota-form.page.scss'],
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
    FormsModule,
    NgIf,
  ],
})
export class MascotaFormPage implements OnInit {
  mascota: Partial<Mascota> = {
    nombre: '',
    especie: '',
    raza: '',
    fechaNacimiento: '',
    observaciones: '',
    foto: '',
  };

  esEdicion = false;
  private mascotaId?: number;

  constructor(
    private mascotasService: MascotasService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.esEdicion = true;
      this.mascotaId = Number(idParam);
      const mascota = await this.mascotasService.obtenerMascota(this.mascotaId);
      if (mascota) {
        // Clonamos la mascota para editarla
        this.mascota = { ...mascota };
      }
    }
  }

  async guardarMascota(form: NgForm) {
    if (form.invalid) {
      return;
    }

    if (this.esEdicion && this.mascotaId != null) {
      await this.mascotasService.editarMascota({
        id: this.mascotaId,
        nombre: this.mascota.nombre!,
        especie: this.mascota.especie!,
        raza: this.mascota.raza!,
        fechaNacimiento: this.mascota.fechaNacimiento!,
        observaciones: this.mascota.observaciones,
        foto: this.mascota.foto,
      });
    } else {
      await this.mascotasService.agregarMascota({
        nombre: this.mascota.nombre!,
        especie: this.mascota.especie!,
        raza: this.mascota.raza!,
        fechaNacimiento: this.mascota.fechaNacimiento!,
        observaciones: this.mascota.observaciones,
        foto: this.mascota.foto,
      });
    }

    this.router.navigateByUrl('/mascotas');
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.mascota.foto = reader.result as string; // data:image/png;base64,...
    };
    reader.readAsDataURL(file);
  }
}
