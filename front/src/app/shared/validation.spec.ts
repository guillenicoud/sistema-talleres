import { validarHorario, validarPersona, mensajeError } from './validation';
import { personaVacia } from '../models/persona.interface';
import { HttpErrorResponse } from '@angular/common/http';

describe('Validaciones', () => {
  it('rechaza nombres vacíos, DNI inválido y email inválido', () => {
    expect(validarPersona(personaVacia())).toBeTruthy();
    const persona = { ...personaVacia(), nombre: 'Ana', apellido: 'Pérez', dni: '12345678' };
    expect(validarPersona(persona)).toBe('');
    expect(validarPersona({ ...persona, nombre: ' ' })).toBeTruthy();
    expect(validarPersona({ ...persona, dni: 'abc' })).toBeTruthy();
    expect(validarPersona({ ...persona, email: 'invalido' })).toBeTruthy();
  });
  it('valida intervalos, IDs y formatos de hora de MySQL', () => {
    const horario = { id_taller: 1, id_tallerista: 2, id_dia: 7, hora_inicio: '09:00:00', hora_fin: '10:00', nivel: '' };
    expect(validarHorario(horario)).toBe('');
    expect(validarHorario({ ...horario, hora_fin: '09:00' })).toBeTruthy();
    expect(validarHorario({ ...horario, id_dia: null })).toBeTruthy();
    expect(validarHorario({ ...horario, hora_inicio: '25:00' })).toBeTruthy();
  });
  it('no muestra al usuario detalles internos de la API', () => {
    expect(mensajeError(new HttpErrorResponse({ status: 500, error: 'SECRET SQL' }))).not.toContain('SECRET');
    expect(mensajeError(new HttpErrorResponse({ status: 0 }))).toContain('conectar');
  });
});
