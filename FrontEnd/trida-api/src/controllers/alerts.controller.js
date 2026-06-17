import { query } from '../config/db.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import {
  mapTransaction,
  mapDbAlertLevel,
  mapDbAlertStatus,
  mapFrontendAlertLevelToDb,
  mapFrontendAlertStatusToDb
} from '../utils/mappers.js';

const ALERT_SELECT = `
  SELECT
    a.id_alerta,
    a.nivel_criticidad,
    a.fecha_generacion,
    a.factores_sospechosos,
    a.estado_alerta,
    a.prioridad,

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
  FROM trida.alertas a
  JOIN trida.transacciones t ON t.id_transaccion = a.id_transaccion
  JOIN trida.clientes c ON c.id_cliente = t.id_cliente
  LEFT JOIN trida.bancos b ON b.id_banco = t.id_banco
  JOIN trida.dispositivos d ON d.id_dispositivo = t.id_dispositivo
  JOIN trida.historico_de_ubicacion u ON u.id_ubicacion = t.id_ubicacion
`;

function mapAlertRow(row) {
  const tx = mapTransaction(row);
  return {
    ...tx,
    alertId: row.id_alerta,
    alertLevel: mapDbAlertLevel(row.nivel_criticidad, row.score_riesgo),
    alertStatus: mapDbAlertStatus(row.estado_alerta),
    alert: {
      id: row.id_alerta,
      dbLevel: row.nivel_criticidad,
      level: mapDbAlertLevel(row.nivel_criticidad, row.score_riesgo),
      generatedAt: row.fecha_generacion,
      suspiciousFactors: row.factores_sospechosos,
      status: mapDbAlertStatus(row.estado_alerta),
      dbStatus: row.estado_alerta,
      priority: row.prioridad
    }
  };
}

function buildAlertFilters(params) {
  const where = [];
  const values = [];

  function add(value) {
    values.push(value);
    return `$${values.length}`;
  }

  if (params.bankId && params.bankId !== 'all') {
    where.push(`b.codigo = ${add(params.bankId)}`);
  }

  if (params.level && params.level !== 'all') {
    const dbLevel = mapFrontendAlertLevelToDb(params.level);
    if (dbLevel) where.push(`a.nivel_criticidad = ${add(dbLevel)}`);
  }

  if (params.status && params.status !== 'all') {
    const dbStatus = mapFrontendAlertStatusToDb(params.status);
    if (dbStatus) where.push(`a.estado_alerta = ${add(dbStatus)}`);
  }

  if (params.from) {
    where.push(`a.fecha_generacion >= ${add(params.from)}`);
  }

  if (params.to) {
    where.push(`a.fecha_generacion <= ${add(params.to)}`);
  }

  if (params.search) {
    const s = `%${params.search.toLowerCase()}%`;
    where.push(`(
      LOWER(c.nombre_completo) LIKE ${add(s)}
      OR LOWER(t.tipo_transaccion) LIKE ${add(s)}
      OR LOWER(u.ciudad) LIKE ${add(s)}
      OR LOWER(COALESCE(b.nombre, '')) LIKE ${add(s)}
      OR LOWER(COALESCE(a.factores_sospechosos, '')) LIKE ${add(s)}
    )`);
  }

  return {
    whereSql: where.length ? `WHERE ${where.join(' AND ')}` : '',
    values
  };
}

export async function listAlerts(req, res, next) {
  try {
    const { page, pageSize, offset } = getPagination(req.query);
    const { whereSql, values } = buildAlertFilters(req.query);

    const countResult = await query(
      `SELECT COUNT(*)::int AS total
       FROM trida.alertas a
       JOIN trida.transacciones t ON t.id_transaccion = a.id_transaccion
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
      `${ALERT_SELECT}
       ${whereSql}
       ORDER BY a.fecha_generacion DESC
       LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}`,
      dataValues
    );

    res.json({
      ok: true,
      items: result.rows.map(mapAlertRow),
      pagination: paginationMeta({ page, pageSize, total })
    });
  } catch (err) {
    next(err);
  }
}

export async function getAlert(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ ok: false, error: 'ID de alerta inválido' });

    const result = await query(
      `${ALERT_SELECT}
       WHERE a.id_alerta = $1
       LIMIT 1`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ ok: false, error: 'Alerta no encontrada' });
    }

    res.json({ ok: true, item: mapAlertRow(result.rows[0]) });
  } catch (err) {
    next(err);
  }
}

export async function updateAlertStatus(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const dbStatus = mapFrontendAlertStatusToDb(status);

    if (!id || !dbStatus) {
      return res.status(400).json({ ok: false, error: 'ID o estado inválido' });
    }

    const result = await query(
      `UPDATE trida.alertas
       SET estado_alerta = $1
       WHERE id_alerta = $2
       RETURNING *`,
      [dbStatus, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ ok: false, error: 'Alerta no encontrada' });
    }

    res.json({ ok: true, item: result.rows[0] });
  } catch (err) {
    next(err);
  }
}
