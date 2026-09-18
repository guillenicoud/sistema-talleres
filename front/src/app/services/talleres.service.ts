import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Taller } from '../models/taller.interface';


@Injectable({ providedIn: 'root' })
export class TalleresService {
  private readonly baseUrl = '/api/talleres';
  constructor(private http: HttpClient) {}
  getAll(): Observable<Taller[]> { return this.http.get<Taller[]>(this.baseUrl); }
  getById(id: number): Observable<Taller[]> { return this.http.get<Taller[]>(this.baseUrl + '/' + id); }
  create(taller: string): Observable<Taller> { return this.http.post<Taller>(this.baseUrl, { taller }); }
  update(id: number, taller: string): Observable<unknown> { return this.http.put(this.baseUrl + '/' + id, { taller }); }
  delete(id: number): Observable<unknown> { return this.http.delete(this.baseUrl + '/' + id); }
}
