import { query } from '../config/db.js';
import { mapTransaction, mapDbAlertLevel } from '../utils/mappers.js';

function buildDateBankFilter(params, alias = 't') {
  const where = [];
  const values = [];
  const joins = [];

  function add(value) {
    values.push(value);
    return `$${values.length}`;
  }

  if (params.bankId && params.bankId !== 'all') {
    joins.push(`LEFT JOIN trida.bancos b_filter ON b_filter.id_banco = ${alias}.id_banco`);
    where.push(`b_filter.codigo = ${add(params.bankId)}`);
  }
  if (params.from) where.push(`${alias}.fecha_transaccion >= ${add(params.from)}`);
  if (params.to) where.push(`${alias}.fecha_transaccion <= ${add(params.to)}`);

  return { joinSql: joins.join('\n'), whereSql: where.length ? `WHERE ${where.join(' AND ')}` : '', values };
}

const RECENT_ALERT_SELECT = `
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
    u.longitud,

    a.id_alerta,
    a.nivel_criticidad,
    a.estado_alerta,
    a.prioridad,
    a.fecha_generacion
  FROM trida.alertas a
  JOIN trida.transacciones t ON t.id_transaccion = a.id_transaccion
  JOIN trida.clientes c ON c.id_cliente = t.id_cliente
  LEFT JOIN trida.bancos b ON b.id_banco = t.id_banco
  JOIN trida.dispositivos d ON d.id_dispositivo = t.id_dispositivo
  JOIN trida.historico_de_ubicacion u ON u.id_ubicacion = t.id_ubicacion
`;

export async function getDashboard(req, res, next) {
  try {
    const { joinSql, whereSql, values } = buildDateBankFilter(req.query);

    const statsResult = await query(
      `SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE es_fraude_real = TRUE)::int AS fraudulent,
          COUNT(*) FILTER (WHERE estado_transaccion = 'BLOQUEADA')::int AS blocked,
          COUNT(*) FILTER (WHERE estado_transaccion = 'APROBADA')::int AS approved,
          COUNT(*) FILTER (WHERE estado_transaccion = 'ALERTADA')::int AS flagged,
          COALESCE(ROUND(AVG(tiempo_de_procesamiento)), 0)::int AS avg_time,
          COALESCE(SUM(monto), 0)::numeric AS total_amount,
          COUNT(*) FILTER (WHERE score_riesgo IS NULL OR score_riesgo < 30)::int AS low,
          COUNT(*) FILTER (WHERE score_riesgo >= 30 AND score_riesgo < 60)::int AS medium,
          COUNT(*) FILTER (WHERE score_riesgo >= 60 AND score_riesgo < 80)::int AS high,
          COUNT(*) FILTER (WHERE score_riesgo >= 80)::int AS critical
       FROM trida.transacciones t
       ${joinSql}
       ${whereSql}`,
      values
    );

    const s = statsResult.rows[0];

    const alertValues = [...values];
    const recentResult = await query(
      `${RECENT_ALERT_SELECT}
       ${joinSql ? 'LEFT JOIN trida.bancos b_filter ON b_filter.id_banco = t.id_banco' : ''}
       ${whereSql}
       ORDER BY a.fecha_generacion DESC
       LIMIT 10`,
      alertValues
    );

    const recentAlerts = recentResult.rows.map((row) => ({
      ...mapTransaction(row),
      alertId: row.id_alerta,
      alertLevel: mapDbAlertLevel(row.nivel_criticidad, row.score_riesgo),
      alertStatus: row.estado_alerta,
      priority: row.prioridad,
      generatedAt: row.fecha_generacion
    }));

    res.json({
      ok: true,
      stats: {
        total: s.total,
        fraudulent: s.fraudulent,
        blocked: s.blocked,
        approved: s.approved,
        flagged: s.flagged,
        avgTime: s.avg_time,
        totalAmount: Number(s.total_amount),
        txPerSecond: 0
      },
      riskDistribution: {
        low: s.low,
        medium: s.medium,
        high: s.high,
        critical: s.critical
      },
      recentAlerts
    });
  } catch (err) {
    next(err);
  }
}
