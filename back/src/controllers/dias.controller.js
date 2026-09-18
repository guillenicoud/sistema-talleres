import { pool } from "../config/db.js";

export const getDias = async (req, res, next) => {
    try {
        const [rows] = await pool.query("SELECT * FROM dias_semana ORDER BY id_dia");
        res.json(rows);
    } catch (error) {
    next(error);
  }
};

export const getDia = async (req, res, next) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query("SELECT * FROM dias_semana WHERE id_dia = ?", [id]);
        res.json(rows);
    } catch (error) {
    next(error);
  }
};
