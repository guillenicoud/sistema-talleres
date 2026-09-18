import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AlumnosComponent } from './alumnos.component';

describe('Formulario de alumnos y API', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FormsModule, HttpClientTestingModule], declarations: [AlumnosComponent] }).compileComponents();
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('distingue error de carga de lista vacía y permite reintentar', () => {
    const fixture = TestBed.createComponent(AlumnosComponent);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/alumnos').flush({}, { status: 500, statusText: 'Error' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    expect(fixture.nativeElement.textContent).not.toContain('No hay alumnos registrados.');
    fixture.componentInstance.cargar();
    http.expectOne('/api/alumnos').flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No hay alumnos registrados.');
  });
  it('rechaza formulario vacío y evita duplicar un alta mientras espera respuesta', () => {
    const fixture = TestBed.createComponent(AlumnosComponent);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/alumnos').flush([]);
    const component = fixture.componentInstance;
    component.agregarAlumno();
    http.expectNone('/api/alumnos');
    expect(component.error).toBeTruthy();
    component.nuevoAlumno = { nombre: 'Ana', apellido: 'Pérez', dni: '', email: '', telefono: '', direccion: '' };
    component.agregarAlumno(); component.agregarAlumno();
    const request = http.expectOne('/api/alumnos');
    expect(request.request.method).toBe('POST');
    request.flush({ ...request.request.body, id_alumno: 42 });
    expect(component.alumnos[0].id_alumno).toBe(42);
    expect(component.guardando).toBeFalse();
  });
});
