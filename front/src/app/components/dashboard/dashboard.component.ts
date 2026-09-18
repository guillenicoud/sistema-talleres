import { Component, OnInit, OnDestroy } from '@angular/core';
import { finalize, Subject, takeUntil, timer } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { TallerDelDia } from '../../models/taller.interface';
import { mensajeError } from '../../shared/validation';

@Component({ selector: 'app-dashboard', templateUrl: './dashboard.component.html', styleUrls: ['./dashboard.component.css'] })
export class DashboardComponent implements OnInit, OnDestroy {
  talleresHoy: (TallerDelDia & { tallerista: string })[] = [];
  fechaHoy = new Date();
  cargando = false;
  error = '';
  private readonly destroy$ = new Subject<void>();
  constructor(private dashboardService: DashboardService) {}
  ngOnInit(): void {
    this.cargar();
    timer(1000, 1000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      const anterior = this.fechaHoy.toDateString();
      this.fechaHoy = new Date();
      if (anterior !== this.fechaHoy.toDateString()) this.cargar();
    });
  }
  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.dashboardService.getTalleresPorDia(this.fechaHoy.getDay() || 7)
      .pipe(takeUntil(this.destroy$), finalize(() => this.cargando = false)).subscribe({
        next: data => this.talleresHoy = data.map(t => ({ ...t, tallerista: t.nombre_tallerista + ' ' + t.apellido_tallerista })),
        error: error => this.error = mensajeError(error)
      });
  }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
