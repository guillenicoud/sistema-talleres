// routes/dia.routes.js
import { Router } from 'express';
import { getDia, getDias } from '../controllers/dias.controller.js';

const diasRouter = Router();

diasRouter.get('/dias/:id', getDia);
diasRouter.get('/dias', getDias);

export default diasRouter;
