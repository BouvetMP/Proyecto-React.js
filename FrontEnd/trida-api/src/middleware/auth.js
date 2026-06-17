import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { mapSystemUser } from '../utils/mappers.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ ok: false, error: 'Token requerido' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');

    const result = await query(
      `SELECT id_usuario, nombre_completo, email, rol, fecha_creacion, ultimo_acceso,
              estado, id_usuario_generador
       FROM trida.usuarios_sistemas
       WHERE id_usuario = $1`,
      [payload.sub]
    );

    if (!result.rows.length || !result.rows[0].estado) {
      return res.status(401).json({ ok: false, error: 'Usuario no válido o inactivo' });
    }

    req.user = mapSystemUser(result.rows[0]);
    req.tokenPayload = payload;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: 'Token inválido o expirado' });
  }
}

export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user?.permissions?.[permission]) {
      return res.status(403).json({ ok: false, error: 'No tienes permisos para esta acción' });
    }
    next();
  };
}
