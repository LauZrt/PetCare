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
  IonButton,
  IonSelect,
  IonSelectOption,
  IonToggle,
} from '@ionic/angular/standalone';
import { NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

import { ConfiguracionService } from '../../services/configuracion.service';
import { Configuracion } from '../../models/configuracion.model';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
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
    IonButton,
    IonSelect,
    IonSelectOption,
    IonToggle,
    NgIf,
    FormsModule,
  ],
})
export class ConfiguracionPage implements OnInit {
  configuracion!: Configuracion;

  constructor(private configuracionService: ConfiguracionService) {}

  async ngOnInit() {
    this.configuracion = await this.configuracionService.getConfiguracion();
  }

  // Se llama al hacer submit del formulario
  async guardarConfiguracion(form: NgForm) {
    await this.configuracionService.guardarConfiguracion(this.configuracion);
    console.log('Configuración guardada', this.configuracion);
  }

  // Se llama cada vez que cambie cualquier campo
  async onConfigChange() {
    if (!this.configuracion) return;
    await this.configuracionService.guardarConfiguracion(this.configuracion);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      this.configuracion.fotoPerfil = reader.result as string;
      await this.onConfigChange();
    };
    reader.readAsDataURL(file);
  }
}
