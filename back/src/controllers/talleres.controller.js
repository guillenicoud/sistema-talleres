import { pool } from "../config/db.js";

export const getTalleres = async (req, res, next) => {
    try {
        const [ rows ]  = await pool.query('SELECT * FROM talleres');
        res.json(rows);
    } catch (error) {
    next(error);
  }
};

export const getTaller = async (req, res, next) => {

    const { id } = req.params;

    try {
        const [ rows ] = await pool.query('SELECT * FROM talleres WHERE id_taller = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Registro no encontrado" });
        res.json(rows);
    } catch (error) {
    next(error);
  }
};

export const postTaller = async (req, res, next) => {

    const { taller } = req.body;

    try {
        const [ existing ] = await pool.query('SELECT id_taller FROM talleres WHERE LOWER(taller) = LOWER(?) LIMIT 1', [taller]);
        if (existing.length > 0) return res.status(409).json({ message: "Ya existe un taller con ese nombre" });
        const [ rows ] = await pool.query('INSERT INTO talleres (taller) VALUES (?)', [taller]);
        res.status(201).json({ id_taller: rows.insertId, taller });
    } catch (error) {
    next(error);
  }
};

export const putTaller = async (req, res, next) => {

        const { id } = req.params;
        const { taller } = req.body;

        try {
            const [ existing ] = await pool.query('SELECT id_taller FROM talleres WHERE LOWER(taller) = LOWER(?) AND id_taller <> ? LIMIT 1', [taller, id]);
            if (existing.length > 0) return res.status(409).json({ message: "Ya existe un taller con ese nombre" });
            const [ rows ] = await pool.query('UPDATE talleres SET taller = ? WHERE id_taller = ?', [taller, id]);
            if (rows.affectedRows === 0) return res.status(404).json({ message: "Registro no encontrado" });
            res.json(rows);
        } catch (error) {
    next(error);
  }
};

export const deleteTaller = async (req, res, next) => {

    const { id } = req.params;

    try {
        const [ rows ] = await pool.query('DELETE FROM talleres WHERE id_taller = ?', [id]);
        if (rows.affectedRows === 0) return res.status(404).json({ message: "Registro no encontrado" });
        res.json(rows);
    } catch (error) {
    next(error);
  }
};
