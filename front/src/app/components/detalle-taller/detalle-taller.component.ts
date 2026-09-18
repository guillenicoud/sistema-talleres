import { Component, OnInit } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { TalleresService } from '../../services/talleres.service';
import { DetalleTallerService } from '../../services/detalle-taller.service';
import { TalleristasService } from '../../services/talleristas.service';
import { DetalleTaller, Horario, Taller, horarioVacio } from '../../models/taller.interface';
import { Tallerista } from '../../models/tallerista.interface';
import { mensajeError, validarHorario } from '../../shared/validation';

@Component({ selector: 'app-detalle-taller', templateUrl: './detalle-taller.component.html' })
export class DetalleTallerComponent implements OnInit {
  detalleTalleres: DetalleTaller[] = [];
  talleres: Taller[] = [];
  talleristas: Tallerista[] = [];
  agrupados: Record<string, DetalleTaller[]> = Object.create(null);
  grupoExpandido: Record<string, boolean> = Object.create(null);
  objectKeys = Object.keys;
  agregando = false;
  cargando = false;
  guardando = false;
  error = '';
  nuevoHorario = horarioVacio();
  formData = horarioVacio();
  editId: number | null = null;
  dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((nombre, index) => ({ id: index + 1, nombre }));
  constructor(private detalleService: DetalleTallerService, private talleristaService: TalleristasService, private talleresService: TalleresService) {}
  ngOnInit(): void { this.cargar(); }
  cargar(): void {
    this.cargando = true;
    this.error = '';
    forkJoin({ detalles: this.detalleService.getAll(), talleristas: this.talleristaService.getAll(), talleres: this.talleresService.getAll() })
      .pipe(finalize(() => this.cargando = false)).subscribe({
        next: data => { this.detalleTalleres = data.detalles; this.talleristas = data.talleristas; this.talleres = data.talleres; this.agrupar(); },
        error: error => this.error = mensajeError(error)
      });
  }
  private agrupar(): void {
    this.agrupados = Object.create(null);
    for (const detalle of this.detalleTalleres) (this.agrupados[detalle.taller] ??= []).push(detalle);
  }
  private completar(horario: Horario, id: number): DetalleTaller {
    const persona = this.talleristas.find(t => t.id_tallerista === horario.id_tallerista);
    return { ...horario, id_detalle: id,
      taller: this.talleres.find(t => t.id_taller === horario.id_taller)?.taller || '',
      dia: this.dias.find(d => d.id === horario.id_dia)?.nombre || '',
      nombre: persona?.nombre || '', apellido: persona?.apellido || '' };
  }
  toggleGrupo(taller: string): void { this.grupoExpandido[taller] = !this.grupoExpandido[taller]; }
  startEdit(detalle: DetalleTaller): void { if (!this.guardando) { this.editId = detalle.id_detalle; this.formData = { ...detalle }; } }
  cancelEdit(): void { this.editId = null; this.formData = horarioVacio(); }
  saveEdit(): void {
    if (!this.editId || this.guardando || this.cargando) return;
    this.error = validarHorario(this.formData);
    if (this.error) return;
    const id = this.editId;
    const data = { ...this.formData };
    this.guardando = true;
    this.detalleService.update(id, data).pipe(finalize(() => this.guardando = false)).subscribe({
      next: () => { this.detalleTalleres = this.detalleTalleres.map(d => d.id_detalle === id ? this.completar(data, id) : d); this.agrupar(); this.cancelEdit(); },
      error: error => this.error = mensajeError(error)
    });
  }
  deleteDetalle(id: number): void {
    if (this.guardando || !confirm('¿Estás seguro de que querés eliminar este horario?')) return;
    this.error = '';
    this.guardando = true;
    this.detalleService.delete(id).pipe(finalize(() => this.guardando = false)).subscribe({
      next: () => { this.detalleTalleres = this.detalleTalleres.filter(d => d.id_detalle !== id); this.agrupar(); if (this.editId === id) this.cancelEdit(); },
      error: error => this.error = mensajeError(error)
    });
  }
  guardarNuevo(): void {
    if (this.guardando || this.cargando) return;
    this.error = validarHorario(this.nuevoHorario);
    if (this.error) return;
    const data = { ...this.nuevoHorario };
    this.guardando = true;
    this.detalleService.create(data).pipe(finalize(() => this.guardando = false)).subscribe({
      next: resultado => { this.detalleTalleres = [...this.detalleTalleres, this.completar(data, resultado.id_detalle)]; this.agrupar(); this.nuevoHorario = horarioVacio(); this.agregando = false; },
      error: error => this.error = mensajeError(error)
    });
  }
}
