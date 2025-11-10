export interface HistorialItem {
  id: number;
  mascotaId?: number;   // id de la mascota (opcional)
  titulo: string;       // ej: "Vacuna antirrábica"
  tipo: string;         // ej: "Vacuna", "Baño", "Consulta"
  fecha: string;        // YYYY-MM-DD
  hora: string;         // HH:mm
  notas?: string;       // detalles del cuidado
}
