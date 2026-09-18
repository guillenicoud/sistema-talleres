import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TalleresComponent } from './talleres.component';

describe('CRUD de talleres', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, HttpClientTestingModule, RouterTestingModule],
      declarations: [TalleresComponent]
    }).compileComponents();
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  function iniciar() {
    const fixture = TestBed.createComponent(TalleresComponent);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/talleres').flush([{ id_taller: 1, taller: 'Música' }]);
    fixture.detectChanges();
    return { component: fixture.componentInstance, http };
  }

  it('crea un taller, recorta el nombre y agrega el identificador devuelto', () => {
    const { component, http } = iniciar();
    component.nuevoTaller = '  Teatro  ';
    component.crear();
    const request = http.expectOne('/api/talleres');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ taller: 'Teatro' });
    request.flush({ id_taller: 2, taller: 'Teatro' });
    expect(component.talleres[1]).toEqual({ id_taller: 2, taller: 'Teatro' });
    expect(component.nuevoTaller).toBe('');
  });

  it('rechaza nombres vacíos y duplicados sin llamar a la API', () => {
    const { component, http } = iniciar();
    component.nuevoTaller = ' ';
    component.crear();
    http.expectNone('/api/talleres');
    expect(component.error).toContain('nombre');
    component.nuevoTaller = 'música';
    component.crear();
    http.expectNone('/api/talleres');
    expect(component.error).toContain('existe');
  });

  it('edita el nombre solo después de que la API confirma', () => {
    const { component, http } = iniciar();
    component.comenzarEdicion(component.talleres[0]);
    component.nombreEditado = 'Música avanzada';
    component.guardarEdicion();
    expect(component.talleres[0].taller).toBe('Música');
    const request = http.expectOne('/api/talleres/1');
    expect(request.request.method).toBe('PUT');
    request.flush({ message: 'Actualizado' });
    expect(component.talleres[0].taller).toBe('Música avanzada');
    expect(component.editId).toBeNull();
  });

  it('conserva el taller si la eliminación tiene un conflicto y lo quita si tiene éxito', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const { component, http } = iniciar();
    component.eliminar(component.talleres[0]);
    const request = http.expectOne('/api/talleres/1');
    expect(request.request.method).toBe('DELETE');
    request.flush({}, { status: 409, statusText: 'Conflict' });
    expect(component.talleres.length).toBe(1);
    expect(component.error).toContain('relaciones');
    component.eliminar(component.talleres[0]);
    http.expectOne('/api/talleres/1').flush({});
    expect(component.talleres.length).toBe(0);
  });
});
