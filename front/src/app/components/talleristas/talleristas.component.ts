import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { TalleristasService } from '../../services/talleristas.service';
import { Tallerista } from '../../models/tallerista.interface';
import { Persona, personaVacia } from '../../models/persona.interface';
import { mensajeError, validarPersona } from '../../shared/validation';

@Component({ selector: 'app-talleristas', templateUrl: './talleristas.component.html' })
export class TalleristasComponent implements OnInit {
  talleristas: Tallerista[] = [];
  editId: number | null = null;
  formData: Persona = personaVacia();
  nuevo: Persona = personaVacia();
  creandoNuevo = false;
  cargando = false;
  guardando = false;
  error = '';
  constructor(private service: TalleristasService) {}
  ngOnInit(): void { this.cargar(); }
  trackById(_: number, item: Tallerista): number { return item.id_tallerista; }
  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.service.getAll().pipe(finalize(() => this.cargando = false)).subscribe({
      next: data => this.talleristas = data,
      error: error => this.error = mensajeError(error)
    });
  }
  guardarNuevo(): void {
    if (this.guardando || this.cargando) return;
    this.error = validarPersona(this.nuevo);
    if (this.error) return;
    this.guardando = true;
    this.service.create(this.nuevo).pipe(finalize(() => this.guardando = false)).subscribe({
      next: data => {
        this.talleristas = [...this.talleristas, data];
        this.nuevo = personaVacia();
        this.creandoNuevo = false;
      },
      error: error => this.error = mensajeError(error)
    });
  }
  nuevoTallerista(): void { this.creandoNuevo = true; this.nuevo = personaVacia(); }
  cancelarNuevo(): void { this.creandoNuevo = false; }
  startEdit(persona: Tallerista): void {
    if (this.guardando) return;
    this.editId = persona.id_tallerista;
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
        this.talleristas = this.talleristas.map(item => item.id_tallerista === id ? { ...item, ...data } : item);
        this.cancelEdit();
      },
      error: error => this.error = mensajeError(error)
    });
  }

  deleteTallerista(tallerista: Tallerista): void {
    if (this.guardando || this.cargando || !confirm(`¿Querés eliminar a ${tallerista.nombre} ${tallerista.apellido}?`)) return;
    this.guardando = true;
    this.error = '';
    this.service.delete(tallerista.id_tallerista).pipe(finalize(() => this.guardando = false)).subscribe({
      next: () => {
        this.talleristas = this.talleristas.filter(item => item.id_tallerista !== tallerista.id_tallerista);
        if (this.editId === tallerista.id_tallerista) this.cancelEdit();
      },
      error: error => this.error = mensajeError(error)
    });
  }

}
