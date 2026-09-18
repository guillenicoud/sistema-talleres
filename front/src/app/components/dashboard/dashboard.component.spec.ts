import { fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../services/dashboard.service';

describe('Dashboard', () => {
  it('consulta el domingo como día 7', () => {
    const service = jasmine.createSpyObj<DashboardService>('DashboardService', ['getTalleresPorDia']);
    service.getTalleresPorDia.and.returnValue(of([]));
    const component = new DashboardComponent(service);
    component.fechaHoy = new Date(2026, 8, 20);
    component.cargar();
    expect(service.getTalleresPorDia).toHaveBeenCalledWith(7);
  });
  it('cancela el reloj al abandonar la pantalla', fakeAsync(() => {
    const service = jasmine.createSpyObj<DashboardService>('DashboardService', ['getTalleresPorDia']);
    service.getTalleresPorDia.and.returnValue(of([]));
    const component = new DashboardComponent(service);
    component.ngOnInit();
    tick(1000);
    component.ngOnDestroy();
    const fecha = component.fechaHoy;
    tick(2000);
    expect(component.fechaHoy).toBe(fecha);
  }));
});
