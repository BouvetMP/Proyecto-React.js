import { query } from '../config/db.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { deviceIcon } from '../utils/mappers.js';

function mapDevice(row) {
  return {
    id: row.id_dispositivo,
    clientId: row.id_cliente,
    clientName: row.cliente_nombre,
    type: row.tipo_dispositivo,
    uniqueIdentifier: row.identificador_unico,
    os: row.sistema_operativo,
    browser: row.navegador,
    icon: deviceIcon(row.tipo_dispositivo),
    firstUsedAt: row.fecha_primer_uso,
    lastUsedAt: row.fecha_ultimo_uso
  };
}

function buildFilters(params) {
  const where = [];
  const values = [];
  const add = (v) => { values.push(v); return `$${values.length}`; };

  if (params.clientId) where.push(`d.id_cliente = ${add(Number(params.clientId))}`);
  if (params.search) {
    const s = `%${params.search.toLowerCase()}%`;
    where.push(`(
      LOWER(d.tipo_dispositivo) LIKE ${add(s)}
      OR LOWER(d.identificador_unico) LIKE ${add(s)}
      OR LOWER(d.sistema_operativo) LIKE ${add(s)}
      OR LOWER(d.navegador) LIKE ${add(s)}
      OR LOWER(c.nombre_completo) LIKE ${add(s)}
    )`);
  }
  return { whereSql: where.length ? `WHERE ${where.join(' AND ')}` : '', values };
}

export async function listDevices(req, res, next) {
  try {
    const { page, pageSize, offset } = getPagination(req.query);
    const { whereSql, values } = buildFilters(req.query);

    const count = await query(
      `SELECT COUNT(*)::int AS total
       FROM trida.dispositivos d
       JOIN trida.clientes c ON c.id_cliente = d.id_cliente
       ${whereSql}`,
      values
    );

    const dataValues = [...values, pageSize, offset];
    const result = await query(
      `SELECT d.*, c.nombre_completo AS cliente_nombre
       FROM trida.dispositivos d
       JOIN trida.clientes c ON c.id_cliente = d.id_cliente
       ${whereSql}
       ORDER BY d.fecha_ultimo_uso DESC
       LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}`,
      dataValues
    );

    res.json({
      ok: true,
      items: result.rows.map(mapDevice),
      pagination: paginationMeta({ page, pageSize, total: count.rows[0].total })
    });
  } catch (err) {
    next(err);
  }
}

export async function listClientDevices(req, res, next) {
  req.query.clientId = req.params.id;
  return listDevices(req, res, next);
}

export async function getDevice(req, res, next) {
  try {
    const id = Number(req.params.id);
    const result = await query(
      `SELECT d.*, c.nombre_completo AS cliente_nombre
       FROM trida.dispositivos d
       JOIN trida.clientes c ON c.id_cliente = d.id_cliente
       WHERE d.id_dispositivo = $1`,
      [id]
    );

    if (!result.rows.length) return res.status(404).json({ ok: false, error: 'Dispositivo no encontrado' });
    res.json({ ok: true, item: mapDevice(result.rows[0]) });
  } catch (err) {
    next(err);
  }
}
