import { query } from '../config/db.js';

function buildAnalyticsFilter(params) {
  const where = [];
  const values = [];
  const joins = [];

  function add(value) {
    values.push(value);
    return `$${values.length}`;
  }

  if (params.bankId && params.bankId !== 'all') {
    joins.push(`LEFT JOIN trida.bancos b_filter ON b_filter.id_banco = t.id_banco`);
    where.push(`b_filter.codigo = ${add(params.bankId)}`);
  }
  if (params.from) where.push(`t.fecha_transaccion >= ${add(params.from)}`);
  if (params.to) where.push(`t.fecha_transaccion <= ${add(params.to)}`);

  return { joinSql: joins.join('\n'), whereSql: where.length ? `WHERE ${where.join(' AND ')}` : '', values };
}

export async function getAnalytics(req, res, next) {
  try {
    const { joinSql, whereSql, values } = buildAnalyticsFilter(req.query);

    const summaryResult = await query(
      `SELECT
          COUNT(*)::int AS total_analyzed,
          COUNT(*) FILTER (WHERE es_fraude_real = TRUE)::int AS total_fraud,
          COALESCE(AVG(monto), 0)::numeric AS average_amount
       FROM trida.transacciones t
       ${joinSql}
       ${whereSql}`,
      values
    );

    const byTypeResult = await query(
      `SELECT
          t.tipo_transaccion AS type,
          COUNT(*)::int AS count,
          COALESCE(SUM(t.monto), 0)::numeric AS amount,
          COUNT(*) FILTER (WHERE t.es_fraude_real = TRUE)::int AS fraud
       FROM trida.transacciones t
       ${joinSql}
       ${whereSql}
       GROUP BY t.tipo_transaccion
       ORDER BY count DESC`,
      values
    );

    const byCityResult = await query(
      `SELECT
          u.ciudad AS city,
          COUNT(*)::int AS count
       FROM trida.transacciones t
       JOIN trida.historico_de_ubicacion u ON u.id_ubicacion = t.id_ubicacion
       ${joinSql}
       ${whereSql}
       GROUP BY u.ciudad
       ORDER BY count DESC
       LIMIT 20`,
      values
    );

    const byChannelResult = await query(
      `SELECT
          COALESCE(t.canal, 'sin_canal') AS channel,
          COUNT(*)::int AS count
       FROM trida.transacciones t
       ${joinSql}
       ${whereSql}
       GROUP BY COALESCE(t.canal, 'sin_canal')
       ORDER BY count DESC`,
      values
    );

    const byBankResult = await query(
      `SELECT
          COALESCE(b.nombre, 'Sin banco asignado') AS bank,
          COALESCE(b.codigo, 'sin_asignar') AS bank_id,
          COALESCE(b.color, '#6366F1') AS color,
          COUNT(*)::int AS count,
          COUNT(*) FILTER (WHERE t.es_fraude_real = TRUE)::int AS fraud
       FROM trida.transacciones t
       LEFT JOIN trida.bancos b ON b.id_banco = t.id_banco
       ${whereSql.replaceAll('b_filter.', 'b.')}
       GROUP BY b.nombre, b.codigo, b.color
       ORDER BY count DESC`,
      values
    );

    const validationsResult = await query(
      `SELECT
          COUNT(*) FILTER (WHERE clasificacion = 'FRAUDE_CONFIRMADO')::int AS fraud_confirmed,
          COUNT(*) FILTER (WHERE clasificacion = 'FALSO_POSITIVO')::int AS false_positive
       FROM trida.validaciones`
    );

    const summary = summaryResult.rows[0];
    const validations = validationsResult.rows[0];
    const validationTotal = validations.fraud_confirmed + validations.false_positive;
    const detectionRate = validationTotal > 0
      ? Number(((validations.fraud_confirmed / validationTotal) * 100).toFixed(1))
      : 0;
    const falsePositiveRate = validationTotal > 0
      ? Number(((validations.false_positive / validationTotal) * 100).toFixed(1))
      : 0;

    res.json({
      ok: true,
      summary: {
        detectionRate,
        falsePositiveRate,
        averageAmount: Number(summary.average_amount || 0),
        totalAnalyzed: summary.total_analyzed,
        totalFraud: summary.total_fraud
      },
      byType: byTypeResult.rows.map((r) => ({ ...r, amount: Number(r.amount) })),
      byCity: byCityResult.rows,
      byChannel: byChannelResult.rows,
      byBank: byBankResult.rows
    });
  } catch (err) {
    next(err);
  }
}
