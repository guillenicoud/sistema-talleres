import { Router } from "express";
import { getTalleristas, getTallerista, postTallerista, updateTallerista, deleteTallerista } from "../controllers/talleristas.controller.js";

const talleristasRouter = Router();

talleristasRouter.get('/talleristas/:id', getTallerista);
talleristasRouter.get('/talleristas', getTalleristas);
talleristasRouter.post('/talleristas', postTallerista);
talleristasRouter.put('/talleristas/:id', updateTallerista);
talleristasRouter.delete('/talleristas/:id', deleteTallerista);


export default talleristasRouter;