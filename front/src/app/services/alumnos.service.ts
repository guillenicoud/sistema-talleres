import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alumno } from '../models/alumno.interface';
import { Persona } from '../models/persona.interface';

@Injectable({ providedIn: 'root' })
export class AlumnosService {
  private readonly baseUrl = '/api/alumnos';
  constructor(private http: HttpClient) {}
  getAll(): Observable<Alumno[]> { return this.http.get<Alumno[]>(this.baseUrl); }
  getById(id: number): Observable<Alumno[]> { return this.http.get<Alumno[]>(this.baseUrl + '/' + id); }
  postALumno(data: Persona): Observable<Alumno> { return this.http.post<Alumno>(this.baseUrl, data); }
  update(id: number, data: Persona): Observable<unknown> { return this.http.put(this.baseUrl + '/' + id, data); }
  delete(id: number): Observable<unknown> { return this.http.delete(this.baseUrl + '/' + id); }
}
