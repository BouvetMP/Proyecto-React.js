import { getPermissions } from '../config/permissions.js';

export function mapDbRoleToFrontend(role) {
  const map = {
    ADMINISTRADOR: 'superAdmin',
    ANALISTA: 'analyst',
    OPERADOR: 'operator',
    AUDITOR: 'auditor'
  };
  return map[role] || 'operator';
}

export function mapFrontendRoleToDb(role) {
  const map = {
    superAdmin: 'ADMINISTRADOR',
    admin: 'ADMINISTRADOR',
    analyst: 'ANALISTA',
    operator: 'OPERADOR',
    auditor: 'AUDITOR',
    ADMINISTRADOR: 'ADMINISTRADOR',
    ANALISTA: 'ANALISTA',
    OPERADOR: 'OPERADOR',
    AUDITOR: 'AUDITOR'
  };
  return map[role] || 'OPERADOR';
}

export function mapSystemUser(row) {
  const role = mapDbRoleToFrontend(row.rol);
  const name = row.nombre_completo;
  return {
    id: row.id_usuario,
    name,
    email: row.email,
    role,
    dbRole: row.rol,
    avatar: getInitials(name),
    status: row.estado ? 'active' : 'inactive',
    active: row.estado,
    createdAt: row.fecha_creacion,
    lastLogin: row.ultimo_acceso,
    generatedBy: row.id_usuario_generador,
    permissions: getPermissions(role)
  };
}

export function mapDbTransactionStatus(status) {
  const map = {
    PENDIENTE: 'pending',
    APROBADA: 'approved',
    ALERTADA: 'flagged',
    BLOQUEADA: 'blocked'
  };
  return map[status] || 'pending';
}

export function mapFrontendTransactionStatus(status) {
  const map = {
    pending: 'PENDIENTE',
    approved: 'APROBADA',
    flagged: 'ALERTADA',
    blocked: 'BLOQUEADA',
    PENDIENTE: 'PENDIENTE',
    APROBADA: 'APROBADA',
    ALERTADA: 'ALERTADA',
    BLOQUEADA: 'BLOQUEADA'
  };
  return map[status] || null;
}

export function riskToAlertLevel(score) {
  if (score === null || score === undefined) return 'low';
  const n = Number(score);
  if (n < 30) return 'low';
  if (n < 60) return 'medium';
  if (n < 80) return 'high';
  return 'critical';
}

export function mapDbAlertLevel(level, score = null) {
  const map = {
    BAJA: 'low',
    MEDIA: 'medium',
    ALTA: 'high',
    CRITICA: 'critical'
  };
  return map[level] || riskToAlertLevel(score);
}

export function mapFrontendAlertLevelToDb(level) {
  const map = {
    low: 'BAJA',
    medium: 'MEDIA',
    high: 'ALTA',
    critical: 'CRITICA',
    BAJA: 'BAJA',
    MEDIA: 'MEDIA',
    ALTA: 'ALTA',
    CRITICA: 'CRITICA'
  };
  return map[level] || null;
}

export function mapDbAlertStatus(status) {
  const map = {
    ACTIVA: 'active',
    EN_REVISION: 'in_review',
    RESUELTA: 'resolved',
    DESCARTADA: 'discarded'
  };
  return map[status] || 'active';
}

export function mapFrontendAlertStatusToDb(status) {
  const map = {
    active: 'ACTIVA',
    in_review: 'EN_REVISION',
    resolved: 'RESUELTA',
    discarded: 'DESCARTADA',
    ACTIVA: 'ACTIVA',
    EN_REVISION: 'EN_REVISION',
    RESUELTA: 'RESUELTA',
    DESCARTADA: 'DESCARTADA'
  };
  return map[status] || null;
}

export function formatTxnId(id) {
  return `TXN-${String(id).padStart(7, '0')}`;
}

export function parseTxnId(id) {
  if (!id) return null;
  const asString = String(id);
  const match = asString.match(/(\d+)$/);
  return match ? Number(match[1]) : null;
}

export function maskAccount(account) {
  if (!account) return '****0000';
  const last4 = String(account).replace(/\D/g, '').slice(-4) || String(account).slice(-4);
  return `****${last4}`;
}

export function inferChannel(row) {
  if (row.canal) return row.canal;
  const type = String(row.tipo_dispositivo || '').toLowerCase();
  if (type.includes('cajero') || type.includes('atm')) return 'atm';
  if (type.includes('pos')) return 'pos';
  if (type.includes('móvil') || type.includes('movil') || type.includes('celular') || type.includes('phone')) return 'mobile';
  return 'web';
}

export function deviceIcon(type) {
  const t = String(type || '').toLowerCase();
  if (t.includes('móvil') || t.includes('movil') || t.includes('phone') || t.includes('tablet')) return '📱';
  if (t.includes('cajero') || t.includes('atm')) return '🏧';
  if (t.includes('pos')) return '💳';
  return '💻';
}

export function mapTransaction(row) {
  const riskScore = row.score_riesgo === null ? null : Number(row.score_riesgo);
  return {
    id: formatTxnId(row.id_transaccion),
    rawId: row.id_transaccion,
    timestamp: row.fecha_transaccion,
    user: row.cliente_nombre,
    client: {
      id: row.id_cliente,
      name: row.cliente_nombre,
      email: row.cliente_email,
      country: row.cliente_pais,
      city: row.cliente_ciudad
    },
    account: maskAccount(row.cuenta_origen),
    sourceAccount: maskAccount(row.cuenta_origen),
    destinationAccount: maskAccount(row.cuenta_destino),
    bank: {
      id: row.banco_codigo || 'sin_asignar',
      rawId: row.id_banco,
      name: row.banco_nombre || 'Sin banco asignado',
      color: row.banco_color || '#6366F1'
    },
    type: row.tipo_transaccion,
    device: {
      id: row.id_dispositivo,
      type: row.tipo_dispositivo,
      os: row.sistema_operativo,
      browser: row.navegador,
      icon: deviceIcon(row.tipo_dispositivo)
    },
    amount: Number(row.monto || 0),
    currency: row.moneda || 'COP',
    riskScore,
    alertLevel: riskToAlertLevel(riskScore),
    status: mapDbTransactionStatus(row.estado_transaccion),
    dbStatus: row.estado_transaccion,
    isFraud: row.es_fraude_real === true,
    location: {
      city: row.ubicacion_ciudad || row.cliente_ciudad,
      country: row.ubicacion_pais || row.cliente_pais,
      lat: row.latitud === null ? null : Number(row.latitud),
      lng: row.longitud === null ? null : Number(row.longitud),
      ip: row.direccion_ip
    },
    processingTime: row.tiempo_de_procesamiento || 0,
    channel: inferChannel(row)
  };
}

export function getInitials(name = '') {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || 'U';
}
