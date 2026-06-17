import { query } from '../config/db.js';

export async function listBanks(req, res, next) {
  try {
    const includeAll = req.query.includeAll === 'true';
    const includeUnassigned = req.query.includeUnassigned === 'true';

    const result = await query(
      `SELECT id_banco, codigo, nombre, color, estado, fecha_creacion
       FROM trida.bancos
       WHERE estado = TRUE
         AND ($1::boolean OR codigo <> 'sin_asignar')
       ORDER BY CASE WHEN codigo = 'sin_asignar' THEN 0 ELSE 1 END, nombre ASC`,
      [includeUnassigned]
    );

    const items = result.rows.map((b) => ({
      id: b.codigo,
      rawId: b.id_banco,
      name: b.nombre,
      color: b.color,
      active: b.estado,
      createdAt: b.fecha_creacion
    }));

    if (includeAll) {
      items.unshift({ id: 'all', rawId: null, name: 'Todos los Bancos', color: '#6366F1', active: true });
    }

    res.json({ ok: true, items });
  } catch (err) {
    next(err);
  }
}
