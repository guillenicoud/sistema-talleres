import { of, Subject, throwError } from 'rxjs';
import { DetalleTallerComponent } from './detalle-taller.component';
import { DetalleTallerService } from '../../services/detalle-taller.service';
import { TalleristasService } from '../../services/talleristas.service';
import { TalleresService } from '../../services/talleres.service';
import { DetalleTaller } from '../../models/taller.interface';

describe('Horarios', () => {
  let component: DetalleTallerComponent;
  let detalles: jasmine.SpyObj<DetalleTallerService>;
  const registro: DetalleTaller = { id_detalle: 1, id_taller: 1, id_tallerista: 2, id_dia: 1, hora_inicio: '09:00', hora_fin: '10:00', nivel: '', taller: 'Música', dia: 'Lunes', nombre: 'Ana', apellido: 'Pérez' };
  beforeEach(() => {
    detalles = jasmine.createSpyObj('DetalleTallerService', ['getAll', 'update', 'delete', 'create']);
    detalles.getAll.and.returnValue(of([{ ...registro }]));
    const talleristas = jasmine.createSpyObj<TalleristasService>('TalleristasService', ['getAll']);
    talleristas.getAll.and.returnValue(of([{ id_tallerista: 2, nombre: 'Ana', apellido: 'Pérez', dni: '12345678', telefono: '', email: '', direccion: '' }]));
    const talleres = jasmine.createSpyObj<TalleresService>('TalleresService', ['getAll']);
    talleres.getAll.and.returnValue(of([{ id_taller: 1, taller: 'Música' }]));
    component = new DetalleTallerComponent(detalles, talleristas, talleres);
    component.ngOnInit();
  });
  it('actualiza también el grupo visible al editar', () => {
    detalles.update.and.returnValue(of({}));
    component.startEdit(registro);
    component.formData.id_dia = 2;
    component.saveEdit();
    expect(component.agrupados['Música'][0].dia).toBe('Martes');
    expect(component.editId).toBeNull();
  });
  it('elimina el grupo vacío al borrar su último horario', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    detalles.delete.and.returnValue(of({}));
    component.deleteDetalle(1);
    expect(component.detalleTalleres.length).toBe(0);
    expect(Object.keys(component.agrupados)).toEqual([]);
  });
  it('bloquea envíos duplicados y conserva datos si falla el guardado', () => {
    const response = new Subject<unknown>();
    detalles.update.and.returnValue(response);
    component.startEdit(registro);
    component.formData.nivel = 'Inicial';
    component.saveEdit(); component.saveEdit();
    expect(detalles.update).toHaveBeenCalledTimes(1);
    response.error(new Error('fallo'));
    expect(component.guardando).toBeFalse();
    expect(component.formData.nivel).toBe('Inicial');
    expect(component.error).toBeTruthy();
    expect(component.agrupados['Música'][0].nivel).toBe('');
  });
  it('muestra errores de carga y finaliza el indicador', () => {
    detalles.getAll.and.returnValue(throwError(() => new Error('fallo')));
    component.cargar();
    expect(component.error).toBeTruthy();
    expect(component.cargando).toBeFalse();
  });
});
