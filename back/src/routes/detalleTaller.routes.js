import { Router } from 'express';
import {
  getDetalleTalleres,
  deleteDetalleTaller,
  getDetalleTaller,
  updateDetalleTaller,
  postDetalleTaller,
  getTalleresPorDia,
} from "../controllers/detalleTaller.controller.js";

const router = Router();

router.get('/detalle-taller', getDetalleTalleres);
router.get('/detalle-taller/:id', getDetalleTaller); 
router.get('/detalle-talleres/dia/:id', getTalleresPorDia);
router.put('/detalle-taller/:id', updateDetalleTaller);  
router.post('/detalle-taller', postDetalleTaller); 

router.delete('/detalle-taller/:id', deleteDetalleTaller);

export default router;
