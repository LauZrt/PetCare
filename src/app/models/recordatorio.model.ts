export interface Recordatorio {
  id: number;
  mascotaId?: number;      // id de la mascota asociada (opcional)
  titulo: string;          // ej: "Vacuna antirrábica"
  tipo: string;            // ej: "Vacuna", "Baño", "Medicamento"
  fecha: string;           // YYYY-MM-DD (fecha programada)
  hora: string;            // HH:mm (hora programada)
  recurrencia: string;     // texto libre: Diario, Semanal, Mensual, etc.
  notas?: string;          // comentarios adicionales
  completado: boolean;     // true cuando ya se marcó como realizado
}
