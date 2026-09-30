import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { AlumnosService } from '../../services/alumnos.service';
import { Alumno } from '../../models/alumno.interface';
import { Persona, personaVacia } from '../../models/persona.interface';
import { mensajeError, validarPersona } from '../../shared/validation';

@Component({ selector: 'app-alumnos', templateUrl: './alumnos.component.html' })
export class AlumnosComponent implements OnInit {
  alumnos: Alumno[] = [];
  editId: number | null = null;
  formData: Persona = personaVacia();
  nuevoAlumno: Persona = personaVacia();
  cargando = false;
  guardando = false;
  error = '';
  constructor(private service: AlumnosService) {}
  ngOnInit(): void { this.cargar(); }
  trackById(_: number, item: Alumno): number { return item.id_alumno; }
  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.service.getAll().pipe(finalize(() => this.cargando = false)).subscribe({
      next: data => this.alumnos = data,
      error: error => this.error = mensajeError(error)
    });
  }
  agregarAlumno(): void {
    if (this.guardando || this.cargando) return;
    this.error = validarPersona(this.nuevoAlumno);
    if (this.error) return;
    this.guardando = true;
    this.service.create(this.nuevoAlumno).pipe(finalize(() => this.guardando = false)).subscribe({
      next: data => {
        this.alumnos = [...this.alumnos, data];
        this.nuevoAlumno = personaVacia();
      },
      error: error => this.error = mensajeError(error)
    });
  }
  startEdit(persona: Alumno): void {
    if (this.guardando) return;
    this.editId = persona.id_alumno;
    this.formData = { ...persona };
  }
  cancelEdit(): void { this.editId = null; this.formData = personaVacia(); }
  saveEdit(): void {
    if (!this.editId || this.guardando || this.cargando) return;
    this.error = validarPersona(this.formData);
    if (this.error) return;
    const id = this.editId;
    const data = { ...this.formData };
    this.guardando = true;
    this.service.update(id, data).pipe(finalize(() => this.guardando = false)).subscribe({
      next: () => {
        this.alumnos = this.alumnos.map(item => item.id_alumno === id ? { ...item, ...data } : item);
        this.cancelEdit();
      },
      error: error => this.error = mensajeError(error)
    });
  }
  deleteAlumno(id: number): void {
    if (this.guardando || !confirm('¿Estás seguro de que querés eliminar este alumno?')) return;
    this.guardando = true;
    this.error = '';
    this.service.delete(id).pipe(finalize(() => this.guardando = false)).subscribe({
      next: () => { this.alumnos = this.alumnos.filter(item => item.id_alumno !== id); if (this.editId === id) this.cancelEdit(); },
      error: error => this.error = mensajeError(error)
    });
  }
}
