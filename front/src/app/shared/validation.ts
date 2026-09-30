import { HttpErrorResponse } from '@angular/common/http';
import { Persona } from '../models/persona.interface';
import { Horario } from '../models/taller.interface';

export function validarPersona(persona: Persona): string {
  if (!persona.nombre?.trim() || !persona.apellido?.trim() || persona.nombre.length > 100 || persona.apellido.length > 100) return 'Completá nombre y apellido (máximo 100 caracteres).';
  if (persona.dni && !/^\d{7,8}$/.test(String(persona.dni))) return 'El DNI debe tener 7 u 8 dígitos.';
  if (persona.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(persona.email)) return 'Ingresá un email válido.';
  if ([persona.email, persona.telefono, persona.direccion].some(value => value && value.length > 255)) return 'Los datos de contacto no pueden superar 255 caracteres.';
  return '';
}

export function validarHorario(horario: Horario): string {
  if (![horario.id_taller, horario.id_tallerista, horario.id_dia].every(id => Number.isInteger(id) && Number(id) > 0) || Number(horario.id_dia) > 7) return 'Seleccioná taller, tallerista y día.';
  const time = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;
  if (!time.test(horario.hora_inicio) || !time.test(horario.hora_fin) || horario.hora_inicio.padEnd(8, ':00') >= horario.hora_fin.padEnd(8, ':00')) return 'El horario de fin debe ser posterior al inicio.';
  if (horario.nivel.length > 100) return 'El nivel no puede superar 100 caracteres.';
  return '';
}

export function validarNombreTaller(nombre: string): string {
  if (typeof nombre !== 'string' || !nombre.trim()) return 'Ingresá el nombre del taller.';
  if (nombre.trim().length > 100) return 'El nombre no puede superar 100 caracteres.';
  return '';
}

export function mensajeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'No se pudo conectar con el servidor. Intentá nuevamente.';
    const detalle = typeof error.error?.message === 'string' ? error.error.message : '';
    if (error.status === 409) return detalle || 'El registro ya existe o tiene relaciones que impiden la operación.';
    if (error.status === 404) return 'El registro ya no está disponible. Actualizá la lista.';
    if (error.status === 400) return detalle || 'Revisá los datos ingresados e intentá nuevamente.';
  }
  return 'No se pudo completar la operación. Intentá nuevamente.';
}
