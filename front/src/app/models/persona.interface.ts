export interface Persona {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  direccion: string;
  email: string;
}

export const personaVacia = (): Persona => ({ nombre: '', apellido: '', dni: '', telefono: '', direccion: '', email: '' });
