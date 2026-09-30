import { fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { DashboardComponent, estadoTaller, saludo } from './dashboard.component';
import { DashboardService, ResumenDashboard } from '../../services/dashboard.service';
import { DetalleTaller } from '../../models/taller.interface';

const horario = (id: number, id_dia: number, inicio: string, fin: string): DetalleTaller => ({
  id_detalle: id, id_taller: id, id_tallerista: 1, id_dia, hora_inicio: inicio, hora_fin: fin,
  nivel: '', taller: 'Taller ' + id, dia: '', nombre: 'Ana', apellido: 'Pérez'
});

describe('Dashboard', () => {
  let service: jasmine.SpyObj<DashboardService>;
  const resumen = (horarios: DetalleTaller[]): ResumenDashboard => ({ alumnos: 10, talleres: 3, talleristas: 2, horarios });
  beforeEach(() => { service = jasmine.createSpyObj<DashboardService>('DashboardService', ['getResumen']); });

  it('trata el domingo como día 7 y arma la agenda ordenada por hora', () => {
    service.getResumen.and.returnValue(of(resumen([horario(1, 7, '18:00:00', '19:00:00'), horario(2, 7, '09:00:00', '10:00:00'), horario(3, 1, '09:00:00', '10:00:00')])));
    const component = new DashboardComponent(service);
    component.fechaHoy = new Date(2026, 8, 20, 8, 0);
    component.cargar();
    expect(component.diaHoy).toBe(7);
    expect(component.agenda.map(t => t.id)).toEqual([2, 1]);
    expect(component.agenda[0].inicio).toBe('09:00');
  });
  it('cuenta los talleres por día y marca el día actual', () => {
    service.getResumen.and.returnValue(of(resumen([horario(1, 1, '09:00', '10:00'), horario(2, 1, '11:00', '12:00'), horario(3, 3, '09:00', '10:00')])));
    const component = new DashboardComponent(service);
    component.fechaHoy = new Date(2026, 8, 28, 8, 0); // lunes
    component.cargar();
    expect(component.semana.map(d => d.cantidad)).toEqual([2, 0, 1, 0, 0, 0, 0]);
    expect(component.semana.filter(d => d.hoy).map(d => d.corto)).toEqual(['Lun']);
    expect(component.maxSemana).toBe(2);
  });
  it('informa el error de carga sin romper la pantalla', () => {
    service.getResumen.and.returnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    const component = new DashboardComponent(service);
    component.cargar();
    expect(component.error).toContain('conectar');
    expect(component.cargando).toBeFalse();
    expect(component.agenda).toEqual([]);
  });
  it('calcula el estado de cada taller según la hora', () => {
    const a = (h: number, m: number) => new Date(2026, 8, 28, h, m);
    expect(estadoTaller(a(8, 59), '09:00:00', '10:00:00')).toBe('proximo');
    expect(estadoTaller(a(9, 0), '09:00:00', '10:00:00')).toBe('en-curso');
    expect(estadoTaller(a(9, 59), '09:00:00', '10:00:00')).toBe('en-curso');
    expect(estadoTaller(a(10, 0), '09:00:00', '10:00:00')).toBe('finalizado');
  });
  it('saluda según el momento del día', () => {
    expect(saludo(new Date(2026, 8, 28, 9))).toBe('Buenos días');
    expect(saludo(new Date(2026, 8, 28, 15))).toBe('Buenas tardes');
    expect(saludo(new Date(2026, 8, 28, 21))).toBe('Buenas noches');
  });
  it('cancela el temporizador al abandonar la pantalla', fakeAsync(() => {
    service.getResumen.and.returnValue(of(resumen([])));
    const component = new DashboardComponent(service);
    component.ngOnInit();
    tick(30000);
    component.ngOnDestroy();
    const fecha = component.fechaHoy;
    tick(60000);
    expect(component.fechaHoy).toBe(fecha);
  }));
});
