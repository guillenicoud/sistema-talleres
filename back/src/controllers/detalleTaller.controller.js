import { pool } from "../config/db.js";

export const getDetalleTalleres = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT dt.id_detalle, dt.id_taller, t.taller AS taller, dt.nivel, ds.id_dia, ds.dia AS dia, dt.hora_inicio, dt.hora_fin, tr.id_tallerista, tr.nombre AS nombre, tr.apellido AS apellido FROM detalle_taller dt JOIN talleres t ON dt.id_taller = t.id_taller JOIN talleristas tr ON dt.id_tallerista = tr.id_tallerista JOIN dias_semana ds ON dt.id_dia = ds.id_dia"
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const getDetalleTaller = async (req, res, next) => {

  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT dt.id_detalle, t.taller AS taller, dt.nivel,dt.id_dia, t.id_taller, tr.id_tallerista, ds.dia AS dia, dt.hora_inicio, dt.hora_fin, tr.nombre AS nombre_tallerista, tr.apellido AS apellido_tallerista FROM detalle_taller dt JOIN talleres t ON dt.id_taller = t.id_taller JOIN talleristas tr ON dt.id_tallerista = tr.id_tallerista JOIN dias_semana ds ON dt.id_dia = ds.id_dia WHERE dt.id_detalle = ?",
      [id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Detalle de taller no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

export const postDetalleTaller = async (req, res, next) => {

  const {id_taller, id_tallerista, id_dia, hora_inicio, hora_fin, nivel} = req.body;

  try {
    const [result] = await pool.query(`
      INSERT INTO detalle_taller (id_taller, id_tallerista, id_dia, hora_inicio, hora_fin, nivel)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [id_taller, id_tallerista, id_dia, hora_inicio, hora_fin, nivel]
    );

    res.status(201).json({ ...req.body, id_detalle: result.insertId });
  } catch (error) {
    next(error);
  }
};


export const updateDetalleTaller = async (req, res, next) => {

  const { id } = req.params;
  const { id_taller, nivel, id_dia, hora_inicio, hora_fin, id_tallerista } =
    req.body;

  try {
    const [result] = await pool.query(
      `UPDATE detalle_taller
       SET id_taller = ?, nivel = ?, id_dia = ?, hora_inicio = ?, hora_fin = ?, id_tallerista = ?
       WHERE id_detalle = ?`,
      [id_taller, nivel, id_dia, hora_inicio, hora_fin, id_tallerista, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No se encontró el registro" });
    }

    res.json({ message: "Detalle actualizado correctamente" });
  } catch (error) {
    next(error);
  }
};

export const deleteDetalleTaller = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      "DELETE FROM detalle_taller WHERE id_detalle = ?",
      [id]
    );
    result.affectedRows > 0
      ? res.json({ message: "Detalle eliminado" })
      : res.status(404).json({ message: "No encontrado" });
  } catch (error) {
    next(error);
  }
};

export const getTalleresPorDia = async (req, res, next) => {



  const { id } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT
        dt.id_detalle,
        t.taller AS nombre,
        dt.nivel,
        dt.hora_inicio,
        dt.hora_fin,
        tr.nombre AS nombre_tallerista,
        tr.apellido AS apellido_tallerista
      FROM detalle_taller dt
      JOIN talleres t ON dt.id_taller = t.id_taller
      JOIN talleristas tr ON dt.id_tallerista = tr.id_tallerista
      WHERE dt.id_dia = ?
    `, [id]);

    res.json(rows);
  } catch (error) {
    next(error);
  }
};
