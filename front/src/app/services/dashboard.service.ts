import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { DetalleTaller } from '../models/taller.interface';

export interface ResumenDashboard {
  alumnos: number;
  talleres: number;
  talleristas: number;
  horarios: DetalleTaller[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}
  // El backend aún no expone totales: se cuentan los registros de cada listado.
  getResumen(): Observable<ResumenDashboard> {
    return forkJoin({
      alumnos: this.http.get<unknown[]>('/api/alumnos'),
      talleres: this.http.get<unknown[]>('/api/talleres'),
      talleristas: this.http.get<unknown[]>('/api/talleristas'),
      horarios: this.http.get<DetalleTaller[]>('/api/detalle-taller')
    }).pipe(map(datos => ({
      alumnos: datos.alumnos.length,
      talleres: datos.talleres.length,
      talleristas: datos.talleristas.length,
      horarios: datos.horarios
    })));
  }
}
