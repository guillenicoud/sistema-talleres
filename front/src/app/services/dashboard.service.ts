import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TallerDelDia } from '../models/taller.interface';


@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly baseUrl = '/api/dashboard';
  constructor(private http: HttpClient) {}
  getTalleresPorDia(dia: number): Observable<TallerDelDia[]> { return this.http.get<TallerDelDia[]>('/api/detalle-talleres/dia/' + dia); }
}
