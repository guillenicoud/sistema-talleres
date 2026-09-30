import { Component, OnInit, OnDestroy } from '@angular/core';
import { finalize, Subject, takeUntil, timer } from 'rxjs';
import { DashboardService, ResumenDashboard } from '../../services/dashboard.service';
import { DetalleTaller } from '../../models/taller.interface';
import { mensajeError } from '../../shared/validation';

export type EstadoTaller = 'en-curso' | 'proximo' | 'finalizado';

export interface TallerAgenda {
  id: number;
  nombre: string;
  nivel: string;
  tallerista: string;
  inicio: string;
  fin: string;
  estado: EstadoTaller;
}

export interface DiaSemana { id: number; corto: string; cantidad: number; hoy: boolean; }

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function saludo(fecha: Date): string {
  const hora = fecha.getHours();
  return hora < 12 ? 'Buenos días' : hora < 20 ? 'Buenas tardes' : 'Buenas noches';
}

const minutos = (hora: string): number => Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5));

export function estadoTaller(ahora: Date, inicio: string, fin: string): EstadoTaller {
  const actual = ahora.getHours() * 60 + ahora.getMinutes();
  if (actual >= minutos(fin)) return 'finalizado';
  return actual >= minutos(inicio) ? 'en-curso' : 'proximo';
}

@Component({ selector: 'app-dashboard', templateUrl: './dashboard.component.html', styleUrls: ['./dashboard.component.css'] })
export class DashboardComponent implements OnInit, OnDestroy {
  resumen: ResumenDashboard | null = null;
  agenda: TallerAgenda[] = [];
  semana: DiaSemana[] = [];
  maxSemana = 1;
  fechaHoy = new Date();
  cargando = false;
  error = '';
  readonly estados: Record<EstadoTaller, string> = { 'en-curso': 'En curso', proximo: 'Próximo', finalizado: 'Finalizado' };
  private readonly destroy$ = new Subject<void>();
  constructor(private dashboardService: DashboardService) {}
  get saludo(): string { return saludo(this.fechaHoy); }
  get diaHoy(): number { return this.fechaHoy.getDay() || 7; }
  ngOnInit(): void {
    this.cargar();
    // Cada 30 s se actualiza el estado de los talleres y se detecta el cambio de día.
    timer(30000, 30000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      const anterior = this.fechaHoy.toDateString();
      this.fechaHoy = new Date();
      if (anterior !== this.fechaHoy.toDateString()) this.cargar();
      else this.calcular();
    });
  }
  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.dashboardService.getResumen()
      .pipe(takeUntil(this.destroy$), finalize(() => this.cargando = false)).subscribe({
        next: resumen => { this.resumen = resumen; this.calcular(); },
        error: error => this.error = mensajeError(error)
      });
  }
  trackById(_: number, item: TallerAgenda): number { return item.id; }
  altura(cantidad: number): number { return cantidad === 0 ? 4 : Math.max(12, Math.round(cantidad / this.maxSemana * 100)); }
  private calcular(): void {
    const horarios: DetalleTaller[] = this.resumen?.horarios ?? [];
    this.agenda = horarios
      .filter(h => h.id_dia === this.diaHoy)
      .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
      .map(h => ({
        id: h.id_detalle, nombre: h.taller, nivel: h.nivel, tallerista: `${h.nombre} ${h.apellido}`.trim(),
        inicio: h.hora_inicio.slice(0, 5), fin: h.hora_fin.slice(0, 5),
        estado: estadoTaller(this.fechaHoy, h.hora_inicio, h.hora_fin)
      }));
    this.semana = DIAS.map((corto, index) => ({
      id: index + 1, corto, hoy: index + 1 === this.diaHoy,
      cantidad: horarios.filter(h => h.id_dia === index + 1).length
    }));
    this.maxSemana = Math.max(1, ...this.semana.map(d => d.cantidad));
  }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
