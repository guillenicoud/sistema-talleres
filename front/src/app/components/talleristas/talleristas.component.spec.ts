import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TalleristasComponent } from './talleristas.component';
import { Tallerista } from '../../models/tallerista.interface';

describe('Eliminación de talleristas', () => {
  const tallerista: Tallerista = {
    id_tallerista: 7,
    nombre: 'Ana',
    apellido: 'Pérez',
    dni: '12345678',
    telefono: '',
    direccion: '',
    email: ''
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, HttpClientTestingModule],
      declarations: [TalleristasComponent]
    }).compileComponents();
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  function iniciar() {
    const fixture = TestBed.createComponent(TalleristasComponent);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/talleristas').flush([tallerista]);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance, http };
  }

  it('no llama a la API si se cancela la confirmación', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    const { component, http } = iniciar();
    component.deleteTallerista(tallerista);
    http.expectNone('/api/talleristas/7');
    expect(component.talleristas).toEqual([tallerista]);
  });

  it('elimina el registro de la lista después de que la API confirma', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const { component, http } = iniciar();
    component.deleteTallerista(tallerista);
    expect(component.talleristas).toEqual([tallerista]);
    const request = http.expectOne('/api/talleristas/7');
    expect(request.request.method).toBe('DELETE');
    request.flush({ message: 'Tallerista eliminado correctamente' });
    expect(component.talleristas).toEqual([]);
    expect(component.guardando).toBeFalse();
  });

  it('mantiene el registro y muestra el conflicto si tiene horarios asociados', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const { component, http } = iniciar();
    component.deleteTallerista(tallerista);
    http.expectOne('/api/talleristas/7').flush({}, { status: 409, statusText: 'Conflict' });
    expect(component.talleristas).toEqual([tallerista]);
    expect(component.error).toContain('relaciones');
    expect(component.guardando).toBeFalse();
  });
});
