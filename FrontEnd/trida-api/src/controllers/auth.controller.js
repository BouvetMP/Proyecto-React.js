import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { mapSystemUser } from '../utils/mappers.js';

function signToken(userRow) {
  return jwt.sign(
    {
      sub: userRow.id_usuario,
      email: userRow.email,
      role: userRow.rol
    },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

async function writeAuditLog({ userId, action, entity, description, entityId, ip }) {
  try {
    await query(
      `INSERT INTO trida.logs_auditoria
       (id_usuario, tipo_accion, entidad_afectada, descripcion, id_identidad, direccion_ip)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, action, entity, description, entityId || userId, ip || '127.0.0.1']
    );
  } catch (err) {
    // No bloquea el flujo si falla auditoría en ambiente de desarrollo.
    console.warn('No se pudo escribir log de auditoría:', err.message);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Email y contraseña son requeridos' });
    }

    const result = await query(
      `SELECT id_usuario, nombre_completo, email, password_hash, rol, fecha_creacion,
              ultimo_acceso, estado, id_usuario_generador
       FROM trida.usuarios_sistemas
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [email]
    );

    if (!result.rows.length) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }

    const userRow = result.rows[0];

    if (!userRow.estado) {
      return res.status(403).json({ ok: false, error: 'Usuario inactivo' });
    }

    const isValid = await bcrypt.compare(password, userRow.password_hash);

    if (!isValid) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }

    await query(
      `UPDATE trida.usuarios_sistemas
       SET ultimo_acceso = NOW()
       WHERE id_usuario = $1`,
      [userRow.id_usuario]
    );

    userRow.ultimo_acceso = new Date().toISOString();

    const token = signToken(userRow);
    const user = mapSystemUser(userRow);

    await writeAuditLog({
      userId: userRow.id_usuario,
      action: 'LOGIN',
      entity: 'usuarios_sistemas',
      description: `Inicio de sesión de ${userRow.email}`,
      entityId: userRow.id_usuario,
      ip: req.ip
    });

    res.json({ ok: true, accessToken: token, user });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  res.json({ ok: true, user: req.user });
}

export async function logout(req, res) {
  res.json({ ok: true, message: 'Sesión cerrada en el cliente' });
}
