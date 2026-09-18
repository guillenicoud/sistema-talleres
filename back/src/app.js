import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { validateRequest, errorHandler } from './middleware/validation.js';

import diasRouter from './routes/dias.routes.js';
import talleresRouter from './routes/talleres.routes.js'
import alumnosRouter from './routes/alumnos.routes.js'
import talleristasRouter from './routes/talleristas.routes.js';
import detalleTallerRouter from './routes/detalleTaller.routes.js';

export const app = express();

app.disable('x-powered-by');
const origins = (process.env.CORS_ORIGINS || 'http://localhost:4200,http://127.0.0.1:4200').split(',').map(value => value.trim());
app.use(cors({ origin: origins }));
app.use(express.json({ limit: '100kb' }));
app.use('/api', validateRequest);


app.use('/api/', alumnosRouter);
app.use('/api/', talleresRouter);
app.use('/api/', detalleTallerRouter);
app.use('/api/', talleristasRouter);
app.use('/api/', diasRouter);

app.get('/', (req, res) => {
    res.send('¡Servidor funcionando con ES Modules!');
});





app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));
app.use(errorHandler);
