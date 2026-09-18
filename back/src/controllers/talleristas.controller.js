import { pool } from "../config/db.js";

export const getTalleristas = async (req, res, next) => {
    try {
        const [ rows ] = await pool.query('SELECT * FROM talleristas');
        res.json(rows);
    } catch (error) {
    next(error);
  }
};

export const getTallerista = async (req, res, next) => {
    const { id } = req.params;

    try {
        const [ rows ] = await pool.query('SELECT * FROM talleristas WHERE id_tallerista = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Tallerista no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
    next(error);
  }
};

export const postTallerista = async (req, res, next) => {

    const { nombre, apellido, dni, telefono = '', email = '', direccion = '' } = req.body;

    try {
        const [ result ] = await pool.query('INSERT INTO talleristas (nombre, apellido, dni, telefono, email, direccion) VALUES (?, ?, ?, ?, ?, ?)', [nombre, apellido, dni, telefono, email, direccion]);
        res.status(201).json({ id: result.insertId, id_tallerista: result.insertId, nombre, apellido, dni, telefono, email, direccion });
    } catch (error) {
    next(error);
  }
};

export const deleteTallerista = async (req, res, next) => {
    const { id } = req.params;

    try {
        const [ result ] = await pool.query('DELETE FROM talleristas WHERE id_tallerista = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tallerista no encontrado' });
        }

        res.json({ message: 'Tallerista eliminado correctamente' });
    } catch (error) {
    next(error);
  }
};

// PUT actualizar
export const updateTallerista = async (req, res, next) => {


  const { id } = req.params;
  const { nombre, apellido, dni, telefono, direccion, email } = req.body;

  try {
  const [result] = await pool.query(
    `UPDATE talleristas SET nombre = ?, apellido = ?, dni = ?, telefono = ?, direccion = ?, email = ?
     WHERE id_tallerista = ?`,
    [nombre, apellido, dni, telefono, direccion, email, id]
  );

  result.affectedRows > 0
    ? res.json({ message: 'Tallerista actualizado' })
    : res.status(404).json({ message: 'No encontrado' });
  } catch (error) { next(error); }
};

