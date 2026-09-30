import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { TalleresService } from '../../services/talleres.service';
import { Taller } from '../../models/taller.interface';
import { mensajeError, validarNombreTaller } from '../../shared/validation';

@Component({ selector: 'app-talleres', templateUrl: './talleres.component.html', styleUrls: ['./talleres.component.css'] })
export class TalleresComponent implements OnInit {
  talleres: Taller[] = [];
  nuevoTaller = '';
  editId: number | null = null;
  nombreEditado = '';
  cargando = false;
  guardando = false;
  error = '';

  constructor(private service: TalleresService) {}
  ngOnInit(): void { this.cargar(); }
  trackById(_: number, item: Taller): number { return item.id_taller; }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.service.getAll().pipe(finalize(() => this.cargando = false)).subscribe({
      next: data => this.talleres = data,
      error: error => this.error = mensajeError(error)
    });
  }

  crear(): void {
    if (this.guardando || this.cargando) return;
    const nombre = this.nuevoTaller.trim();
    this.error = this.validar(nombre);
    if (this.error) return;
    this.guardando = true;
    this.service.create(nombre).pipe(finalize(() => this.guardando = false)).subscribe({
      next: taller => {
        this.talleres = [...this.talleres, taller];
        this.nuevoTaller = '';
      },
      error: error => this.error = mensajeError(error)
    });
  }

  comenzarEdicion(taller: Taller): void {
    if (this.guardando) return;
    this.editId = taller.id_taller;
    this.nombreEditado = taller.taller;
    this.error = '';
  }

  cancelarEdicion(): void {
    this.editId = null;
    this.nombreEditado = '';
  }

  guardarEdicion(): void {
    if (!this.editId || this.guardando || this.cargando) return;
    const id = this.editId;
    const nombre = this.nombreEditado.trim();
    this.error = this.validar(nombre, id);
    if (this.error) return;
    this.guardando = true;
    this.service.update(id, nombre).pipe(finalize(() => this.guardando = false)).subscribe({
      next: () => {
        this.talleres = this.talleres.map(taller => taller.id_taller === id ? { ...taller, taller: nombre } : taller);
        this.cancelarEdicion();
      },
      error: error => this.error = mensajeError(error)
    });
  }

  eliminar(taller: Taller): void {
    if (this.guardando || this.cargando || !confirm(`¿Querés eliminar el taller "${taller.taller}"?`)) return;
    this.guardando = true;
    this.error = '';
    this.service.delete(taller.id_taller).pipe(finalize(() => this.guardando = false)).subscribe({
      next: () => {
        this.talleres = this.talleres.filter(item => item.id_taller !== taller.id_taller);
        if (this.editId === taller.id_taller) this.cancelarEdicion();
      },
      error: error => this.error = mensajeError(error)
    });
  }

  private validar(nombre: string, idActual?: number): string {
    const error = validarNombreTaller(nombre);
    if (error) return error;
    const repetido = this.talleres.some(taller => taller.id_taller !== idActual && taller.taller.trim().toLocaleLowerCase() === nombre.toLocaleLowerCase());
    return repetido ? 'Ya existe un taller con ese nombre.' : '';
  }
}
