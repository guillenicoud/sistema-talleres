import { pool } from '../config/db.js';

export const getAlumno = async (req, res, next) => {

	const { id } = req.params;

	try {
		const  [ rows ]  = await pool.query('SELECT * FROM alumnos WHERE id_alumno = ?', [id]);
		if (rows.length === 0) return res.status(404).json({ message: "Registro no encontrado" });
        res.json(rows);
	} catch (error) {
    next(error);
  }
}

export const getAlumnos = async (req, res, next) => {
	try {
		const  [ rows]  = await pool.query('SELECT * FROM alumnos');
		res.json(rows);
	} catch (error) {
    next(error);
  }
}

export const postAlumno = async (req, res, next) => {
	const { nombre, apellido, dni, email = '', telefono = '', direccion = '' } = req.body;

	try {
		const [ rows ] = await pool.query('INSERT INTO alumnos (nombre, apellido, dni, email, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)', [nombre, apellido, dni, email, telefono, direccion]);


		res.status(201).json({ ...req.body, id_alumno: rows.insertId });
	} catch (error) {
    next(error);
  }
}

export const putAlumno = async (req, res, next) => {

	const { id } = req.params;
	const { nombre, apellido, dni, email = '', telefono = '', direccion = '' } = req.body;

	try {
		const  [ rows ] = await pool.query('UPDATE alumnos SET nombre = ?, apellido = ?, dni = ?, email = ?, telefono = ?, direccion = ? WHERE id_alumno = ?', [nombre, apellido, dni, email, telefono, direccion, id]);
		if (rows.affectedRows === 0) return res.status(404).json({ message: "Registro no encontrado" });
		res.json(rows);
	} catch (error) {
    next(error);
  }
}

export const deleteAlumno = async (req, res, next) => {

	const { id } = req.params;

	try {
		const [ rows ] = await pool.query('DELETE FROM alumnos WHERE id_alumno = ?', [id]);

		if (rows.affectedRows === 0) return res.status(404).json({ message: "Registro no encontrado" });

		res.json(rows);
	} catch (error) {
    next(error);
  }
}
