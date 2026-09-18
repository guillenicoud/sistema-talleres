import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DetalleTaller, Horario } from '../models/taller.interface';


@Injectable({ providedIn: 'root' })
export class DetalleTallerService {
  private readonly baseUrl = '/api/detalle-taller';
  constructor(private http: HttpClient) {}
  getAll(): Observable<DetalleTaller[]> { return this.http.get<DetalleTaller[]>(this.baseUrl); }
  getById(id: number): Observable<DetalleTaller> { return this.http.get<DetalleTaller>(this.baseUrl + '/' + id); }
  create(data: Horario): Observable<Horario & { id_detalle: number }> { return this.http.post<Horario & { id_detalle: number }>(this.baseUrl, data); }
  update(id: number, data: Horario): Observable<unknown> { return this.http.put(this.baseUrl + '/' + id, data); }
  delete(id: number): Observable<unknown> { return this.http.delete(this.baseUrl + '/' + id); }
}
