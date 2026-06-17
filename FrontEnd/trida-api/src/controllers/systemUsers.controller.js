import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { mapFrontendRoleToDb, mapSystemUser } from '../utils/mappers.js';

function buildFilters(params) {
  const where = [];
  const values = [];
  const add = (v) => { values.push(v); return `$${values.length}`; };

  if (params.role && params.role !== 'all') {
    where.push(`rol = ${add(mapFrontendRoleToDb(params.role))}`);
  }
  if (params.status && params.status !== 'all') {
    const active = params.status === 'active' || params.status === 'true';
    where.push(`estado = ${add(active)}`);
  }
  if (params.search) {
    const s = `%${params.search.toLowerCase()}%`;
    where.push(`(LOWER(nombre_completo) LIKE ${add(s)} OR LOWER(email) LIKE ${add(s)})`);
  }
  return { whereSql: where.length ? `WHERE ${where.join(' AND ')}` : '', values };
}

export async function listSystemUsers(req, res, next) {
  try {
    const { page, pageSize, offset } = getPagination(req.query);
    const { whereSql, values } = buildFilters(req.query);

    const count = await query(
      `SELECT COUNT(*)::int AS total FROM trida.usuarios_sistemas ${whereSql}`,
      values
    );

    const dataValues = [...values, pageSize, offset];
    const result = await query(
      `SELECT id_usuario, nombre_completo, email, rol, fecha_creacion,
              ultimo_acceso, estado, id_usuario_generador
       FROM trida.usuarios_sistemas
       ${whereSql}
       ORDER BY fecha_creacion DESC
       LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}`,
      dataValues
    );

    res.json({
      ok: true,
      items: result.rows.map(mapSystemUser),
      pagination: paginationMeta({ page, pageSize, total: count.rows[0].total })
    });
  } catch (err) {
    next(err);
  }
}

export async function createSystemUser(req, res, next) {
  try {
    const { name, email, password, role = 'operator' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ ok: false, error: 'Nombre, email y contraseña son requeridos' });
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO trida.usuarios_sistemas
       (nombre_completo, email, password_hash, rol, id_usuario_generador)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_usuario, nombre_completo, email, rol, fecha_creacion,
                 ultimo_acceso, estado, id_usuario_generador`,
      [name, email, hash, mapFrontendRoleToDb(role), req.user.id]
    );

    res.status(201).json({ ok: true, item: mapSystemUser(result.rows[0]) });
  } catch (err) {
    if (err.code === '23505') {
      err.status = 409;
      err.publicMessage = 'El email ya está registrado';
    }
    next(err);
  }
}

export async function updateSystemUserStatus(req, res, next) {
  try {
    const id = Number(req.params.id);
    const active = req.body.active ?? req.body.status === 'active';

    const result = await query(
      `UPDATE trida.usuarios_sistemas
       SET estado = $1
       WHERE id_usuario = $2
       RETURNING id_usuario, nombre_completo, email, rol, fecha_creacion,
                 ultimo_acceso, estado, id_usuario_generador`,
      [Boolean(active), id]
    );

    if (!result.rows.length) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    res.json({ ok: true, item: mapSystemUser(result.rows[0]) });
  } catch (err) {
    next(err);
  }
}

export async function updateSystemUserRole(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;

    const result = await query(
      `UPDATE trida.usuarios_sistemas
       SET rol = $1
       WHERE id_usuario = $2
       RETURNING id_usuario, nombre_completo, email, rol, fecha_creacion,
                 ultimo_acceso, estado, id_usuario_generador`,
      [mapFrontendRoleToDb(role), id]
    );

    if (!result.rows.length) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    res.json({ ok: true, item: mapSystemUser(result.rows[0]) });
  } catch (err) {
    next(err);
  }
}
