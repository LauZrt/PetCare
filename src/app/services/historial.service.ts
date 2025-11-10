import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { HistorialItem } from '../models/historial.model';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private historial: HistorialItem[] = [];
  private nextId = 1;
  private storageKey = 'historial';
  private initPromise: Promise<void>;

  constructor(private storage: Storage) {
    this.initPromise = this.init();
  }

  // Inicializar storage y cargar historial guardado
  private async init(): Promise<void> {
    await this.storage.create();
    const stored = await this.storage.get(this.storageKey);
    if (stored && Array.isArray(stored)) {
      this.historial = stored as HistorialItem[];
      const lastId = this.historial.reduce(
        (max, h) => (h.id > max ? h.id : max),
        0
      );
      this.nextId = lastId + 1;
    }
  }

  private async saveToStorage(): Promise<void> {
    await this.storage.set(this.storageKey, this.historial);
  }

  async getHistorial(): Promise<HistorialItem[]> {
    await this.initPromise;
    return this.historial;
  }

  async agregarEntrada(data: Omit<HistorialItem, 'id'>): Promise<void> {
    await this.initPromise;
    const nueva: HistorialItem = { id: this.nextId++, ...data };
    this.historial.push(nueva);
    await this.saveToStorage();
  }

  async eliminarEntrada(id: number): Promise<void> {
    await this.initPromise;
    this.historial = this.historial.filter(h => h.id !== id);
    await this.saveToStorage();
  }
}
