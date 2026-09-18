import { Router } from 'express';
import { getTalleres, getTaller, postTaller, putTaller, deleteTaller } from '../controllers/talleres.controller.js'; 

const talleresRouter = Router();

talleresRouter.get('/talleres/:id', getTaller);
talleresRouter.get('/talleres', getTalleres);
talleresRouter.post('/talleres', postTaller);
talleresRouter.put('/talleres/:id', putTaller);
talleresRouter.delete('/talleres/:id', deleteTaller);

export default talleresRouter;