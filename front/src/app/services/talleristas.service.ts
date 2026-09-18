import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tallerista } from '../models/tallerista.interface';
import { Persona } from '../models/persona.interface';

@Injectable({ providedIn: 'root' })
export class TalleristasService {
  private readonly baseUrl = '/api/talleristas';
  constructor(private http: HttpClient) {}
  getAll(): Observable<Tallerista[]> { return this.http.get<Tallerista[]>(this.baseUrl); }
  create(data: Persona): Observable<Tallerista> { return this.http.post<Tallerista>(this.baseUrl, data); }
  update(id: number, data: Persona): Observable<unknown> { return this.http.put(this.baseUrl + '/' + id, data); }
  delete(id: number): Observable<unknown> { return this.http.delete(this.baseUrl + '/' + id); }
}
