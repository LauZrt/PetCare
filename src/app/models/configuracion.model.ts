export interface Configuracion {
  // Perfil de usuario
  nombre: string;
  correo: string;
  telefono: string;
  ciudad: string;
  idioma: string; // 'es' | 'en'

  fotoPerfil?: string; // base64 (data URL)

  // Preferencias de recordatorios
  horaRecordatoriosPorDefecto: string; // HH:mm
  notificacionesActivadas: boolean;
  tipoNotificacion: string; // 'sonido' | 'silencio' | 'solo_visual'
  respaldoFrecuencia: string; // 'nunca' | 'diario' | 'semanal'

  // Personalización
  tema: string; // 'claro' | 'oscuro' | 'automatico'
  tamanoFuente: string; // 'pequena' | 'normal' | 'grande'
  mostrarEmojisMascotas: boolean;
}
