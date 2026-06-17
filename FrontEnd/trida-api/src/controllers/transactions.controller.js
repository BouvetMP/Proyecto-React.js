import { query } from '../config/db.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import {
  mapTransaction,
  mapFrontendTransactionStatus,
  parseTxnId
} from '../utils/mappers.js';

const BASE_SELECT = `
  SELECT
    t.id_transaccion,
    t.tipo_transaccion,
    t.monto,
    t.cuenta_origen,
    t.cuenta_destino,
    t.fecha_transaccion,
    t.score_riesgo,
    t.estado_transaccion,
    t.es_fraude_real,
    t.tiempo_de_procesamiento,
    t.moneda,
    t.canal,
    t.id_banco,

    c.id_cliente,
    c.nombre_completo AS cliente_nombre,
    c.email AS cliente_email,
    c.pais AS cliente_pais,
    c.ciudad AS cliente_ciudad,

    b.codigo AS banco_codigo,
    b.nombre AS banco_nombre,
    b.color AS banco_color,

    d.id_dispositivo,
    d.tipo_dispositivo,
    d.sistema_operativo,
    d.navegador,

    u.id_ubicacion,
    u.direccion_ip::TEXT AS direccion_ip,
    u.pais AS ubicacion_pais,
    u.ciudad AS ubicacion_ciudad,
    u.latitud,
    u.longitud
  FROM trida.transacciones t
  JOIN trida.clientes c ON c.id_cliente = t.id_cliente
  LEFT JOIN trida.bancos b ON b.id_banco = t.id_banco
  JOIN trida.dispositivos d ON d.id_dispositivo = t.id_dispositivo
  JOIN trida.historico_de_ubicacion u ON u.id_ubicacion = t.id_ubicacion
`;

function buildTransactionFilters(params) {
  const where = [];
  const values = [];

  function add(value) {
    values.push(value);
    return `$${values.length}`;
  }

  if (params.bankId && params.bankId !== 'all') {
    where.push(`b.codigo = ${add(params.bankId)}`);
  }

  if (params.status && params.status !== 'all') {
    const dbStatus = mapFrontendTransactionStatus(params.status);
    if (dbStatus) where.push(`t.estado_transaccion = ${add(dbStatus)}`);
  }

  if (params.alertLevel && params.alertLevel !== 'all') {
    if (params.alertLevel === 'low') {
      where.push(`(t.score_riesgo IS NULL OR t.score_riesgo < 30)`);
    } else if (params.alertLevel === 'medium') {
      where.push(`t.score_riesgo >= 30 AND t.score_riesgo < 60`);
    } else if (params.alertLevel === 'high') {
      where.push(`t.score_riesgo >= 60 AND t.score_riesgo < 80`);
    } else if (params.alertLevel === 'critical') {
      where.push(`t.score_riesgo >= 80`);
    }
  }

  if (params.channel && params.channel !== 'all') {
    where.push(`t.canal = ${add(params.channel)}`);
  }

  if (params.from) {
    where.push(`t.fecha_transaccion >= ${add(params.from)}`);
  }

  if (params.to) {
    where.push(`t.fecha_transaccion <= ${add(params.to)}`);
  }

  if (params.search) {
    const s = `%${params.search.toLowerCase()}%`;
    const idNumber = parseTxnId(params.search);
    const idCondition = idNumber ? ` OR t.id_transaccion = ${add(idNumber)}` : '';
    where.push(`(
      LOWER(c.nombre_completo) LIKE ${add(s)}
      OR LOWER(c.email) LIKE ${add(s)}
      OR LOWER(t.tipo_transaccion) LIKE ${add(s)}
      OR LOWER(u.ciudad) LIKE ${add(s)}
      OR LOWER(COALESCE(b.nombre, '')) LIKE ${add(s)}
      ${idCondition}
    )`);
  }

  return {
    whereSql: where.length ? `WHERE ${where.join(' AND ')}` : '',
    values
  };
}

function sortSql(sort = 'timestamp', dir = 'desc') {
  const direction = String(dir).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const map = {
    id: 't.id_transaccion',
    timestamp: 't.fecha_transaccion',
    amount: 't.monto',
    riskScore: 't.score_riesgo'
  };
  return `${map[sort] || map.timestamp} ${direction}`;
}

export async function listTransactions(req, res, next) {
  try {
    const { page, pageSize, offset } = getPagination(req.query);
    const { whereSql, values } = buildTransactionFilters(req.query);

    const countResult = await query(
      `SELECT COUNT(*)::int AS total
       FROM trida.transacciones t
       JOIN trida.clientes c ON c.id_cliente = t.id_cliente
       LEFT JOIN trida.bancos b ON b.id_banco = t.id_banco
       JOIN trida.dispositivos d ON d.id_dispositivo = t.id_dispositivo
       JOIN trida.historico_de_ubicacion u ON u.id_ubicacion = t.id_ubicacion
       ${whereSql}`,
      values
    );

    const total = countResult.rows[0].total;
    const dataValues = [...values, pageSize, offset];

    const result = await query(
      `${BASE_SELECT}
       ${whereSql}
       ORDER BY ${sortSql(req.query.sort, req.query.dir)}
       LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}`,
      dataValues
    );

    res.json({
      ok: true,
      items: result.rows.map(mapTransaction),
      pagination: paginationMeta({ page, pageSize, total })
    });
  } catch (err) {
    next(err);
  }
}

export async function getTransaction(req, res, next) {
  try {
    const rawId = parseTxnId(req.params.id);
    if (!rawId) return res.status(400).json({ ok: false, error: 'ID de transacción inválido' });

    const result = await query(
      `${BASE_SELECT}
       WHERE t.id_transaccion = $1
       LIMIT 1`,
      [rawId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ ok: false, error: 'Transacción no encontrada' });
    }

    res.json({ ok: true, item: mapTransaction(result.rows[0]) });
  } catch (err) {
    next(err);
  }
}

export async function mapTransactions(req, res, next) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit || 150), 1), 500);
    const { whereSql, values } = buildTransactionFilters({ ...req.query, page: undefined, pageSize: undefined });
    const dataValues = [...values, limit];

    const result = await query(
      `${BASE_SELECT}
       ${whereSql}
       ORDER BY t.fecha_transaccion DESC
       LIMIT $${dataValues.length}`,
      dataValues
    );

    res.json({ ok: true, items: result.rows.map(mapTransaction) });
  } catch (err) {
    next(err);
  }
}
