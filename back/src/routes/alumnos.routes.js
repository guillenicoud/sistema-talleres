// routes/alumno.routes.js
import { Router } from 'express';
import { getAlumnos, getAlumno, postAlumno, putAlumno, deleteAlumno } from '../controllers/alumnos.controller.js';

const alumnosRouter = Router();

alumnosRouter.get('/alumnos', getAlumnos);
alumnosRouter.get('/alumnos/:id', getAlumno);
alumnosRouter.post('/alumnos', postAlumno);
alumnosRouter.put('/alumnos/:id', putAlumno);
alumnosRouter.delete('/alumnos/:id', deleteAlumno);

export default alumnosRouter;
