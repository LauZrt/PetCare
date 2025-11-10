import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Mascota } from '../models/mascota.model';

@Injectable({
  providedIn: 'root'
})
export class MascotasService {
  private mascotas: Mascota[] = [];
  private nextId = 1;
  private storageKey = 'mascotas';
  private initPromise: Promise<void>;

  constructor(private storage: Storage) {
    this.initPromise = this.init();
  }

  // Inicializa el storage y carga las mascotas guardadas
  private async init() {
    await this.storage.create();
    const stored = await this.storage.get(this.storageKey);
    if (stored && Array.isArray(stored)) {
      this.mascotas = stored;
      const lastId = this.mascotas.reduce(
        (max, m) => (m.id > max ? m.id : max),
        0
      );
      this.nextId = lastId + 1;
    }
  }

  private async saveToStorage() {
    await this.storage.set(this.storageKey, this.mascotas);
  }

  async getMascotas(): Promise<Mascota[]> {
    await this.initPromise;
    return this.mascotas;
  }

  async agregarMascota(mascota: Omit<Mascota, 'id'>): Promise<void> {
    await this.initPromise;
    const nuevaMascota: Mascota = { id: this.nextId++, ...mascota };
    this.mascotas.push(nuevaMascota);
    await this.saveToStorage();
  }

  async eliminarMascota(id: number): Promise<void> {
    await this.initPromise;
    this.mascotas = this.mascotas.filter(m => m.id !== id);
    await this.saveToStorage();
  }

  async obtenerMascota(id: number): Promise<Mascota | undefined> {
    await this.initPromise;
    return this.mascotas.find(m => m.id === id);
  }

  async editarMascota(mascotaEditada: Mascota): Promise<void> {
    await this.initPromise;
    const index = this.mascotas.findIndex(m => m.id === mascotaEditada.id);
    if (index !== -1) {
      this.mascotas[index] = mascotaEditada;
      await this.saveToStorage();
    }
  }
}
