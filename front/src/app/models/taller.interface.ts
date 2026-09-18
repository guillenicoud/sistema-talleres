export interface Taller { id_taller: number; taller: string; }

export interface Horario {
  id_taller: number | null;
  id_tallerista: number | null;
  id_dia: number | null;
  hora_inicio: string;
  hora_fin: string;
  nivel: string;
}
export interface DetalleTaller extends Horario {
  id_detalle: number;
  taller: string;
  dia: string;
  nombre: string;
  apellido: string;
}
export interface TallerDelDia {
  id_detalle: number;
  nombre: string;
  nivel: string;
  hora_inicio: string;
  hora_fin: string;
  nombre_tallerista: string;
  apellido_tallerista: string;
}
export const horarioVacio = (): Horario => ({ id_taller: null, id_tallerista: null, id_dia: null, hora_inicio: '', hora_fin: '', nivel: '' });
