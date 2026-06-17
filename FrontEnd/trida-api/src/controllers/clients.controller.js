import { query } from '../config/db.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';

function mapClient(row) {
  return {
    id: row.id_cliente,
    name: row.nombre_completo,
    email: row.email,
    phone: row.telefono,
    registeredAt: row.fecha_registro,
    active: row.estado,
    status: row.estado ? 'active' : 'inactive',
    country: row.pais,
    city: row.ciudad,
    bank: {
      id: row.banco_codigo || 'sin_asignar',
      rawId: row.id_banco,
      name: row.banco_nombre || 'Sin banco asignado',
      color: row.banco_color || '#6366F1'
    }
  };
}

function buildFilters(params) {
  const where = [];
  const values = [];
  const add = (v) => { values.push(v); return `$${values.length}`; };

  if (params.bankId && params.bankId !== 'all') where.push(`b.codigo = ${add(params.bankId)}`);
  if (params.city) where.push(`LOWER(c.ciudad) = LOWER(${add(params.city)})`);
  if (params.active !== undefined) where.push(`c.estado = ${add(params.active === 'true' || params.active === true)}`);
  if (params.search) {
    const s = `%${params.search.toLowerCase()}%`;
    where.push(`(LOWER(c.nombre_completo) LIKE ${add(s)} OR LOWER(c.email) LIKE ${add(s)} OR LOWER(c.ciudad) LIKE ${add(s)})`);
  }

  return { whereSql: where.length ? `WHERE ${where.join(' AND ')}` : '', values };
}

export async function listClients(req, res, next) {
  try {
    const { page, pageSize, offset } = getPagination(req.query);
    const { whereSql, values } = buildFilters(req.query);

    const count = await query(
      `SELECT COUNT(*)::int AS total
       FROM trida.clientes c
       LEFT JOIN trida.bancos b ON b.id_banco = c.id_banco
       ${whereSql}`,
      values
    );

    const dataValues = [...values, pageSize, offset];
    const result = await query(
      `SELECT c.*, b.codigo AS banco_codigo, b.nombre AS banco_nombre, b.color AS banco_color
       FROM trida.clientes c
       LEFT JOIN trida.bancos b ON b.id_banco = c.id_banco
       ${whereSql}
       ORDER BY c.fecha_registro DESC
       LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}`,
      dataValues
    );

    res.json({
      ok: true,
      items: result.rows.map(mapClient),
      pagination: paginationMeta({ page, pageSize, total: count.rows[0].total })
    });
  } catch (err) {
    next(err);
  }
}

export async function getClient(req, res, next) {
  try {
    const id = Number(req.params.id);
    const result = await query(
      `SELECT c.*, b.codigo AS banco_codigo, b.nombre AS banco_nombre, b.color AS banco_color
       FROM trida.clientes c
       LEFT JOIN trida.bancos b ON b.id_banco = c.id_banco
       WHERE c.id_cliente = $1`,
      [id]
    );

    if (!result.rows.length) return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });
    res.json({ ok: true, item: mapClient(result.rows[0]) });
  } catch (err) {
    next(err);
  }
}
