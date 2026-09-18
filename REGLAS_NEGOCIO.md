# Reglas de Negocio

## Alumnos

* Un alumno puede estar inscripto en uno o varios talleres.
* Cada alumno posee información personal identificatoria.

## Talleristas

* Un tallerista puede dictar uno o varios talleres.
* Un tallerista puede tener distintos horarios asignados.

## Talleres

* Un taller puede tener múltiples horarios.
* Un taller puede estar asociado a uno o más talleristas.

## Detalle Taller

La tabla detalle_taller almacena la configuración operativa de cada taller.

Contiene:

* Taller.
* Tallerista.
* Día.
* Horario.

Observación:

* El campo que identifica el día de la semana se denomina id_dia.

## Inscripciones

* Un alumno puede inscribirse a múltiples talleres.
* Un taller puede tener múltiples alumnos inscriptos.

## Asistencia

* La asistencia será registrada por alumno.
* La asistencia estará asociada a una fecha específica.
* Solo podrán registrarse asistencias de alumnos previamente inscriptos.

## Dashboard

El panel principal deberá mostrar como mínimo:

* Cantidad total de inscriptos.
* Cantidad de talleres del día.
* Cantidad total de talleres.

## Reportes

El sistema deberá permitir obtener información relacionada con:

* Asistencia por alumno.
* Asistencia por taller.
* Estadísticas generales.
