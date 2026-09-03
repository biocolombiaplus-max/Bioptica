import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { pool } from '../../db/pool';

export const cie10Router = Router();

cie10Router.use(requireAuth);

cie10Router.get('/', async (req, res, next) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const result = q
      ? await pool.query(
          `SELECT codigo, descripcion FROM cie10_oftalmologia
           WHERE codigo ILIKE $1 OR descripcion ILIKE $1
           ORDER BY codigo LIMIT 20`,
          [`%${q}%`]
        )
      : await pool.query(`SELECT codigo, descripcion FROM cie10_oftalmologia ORDER BY codigo`);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});
