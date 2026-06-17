export const ROLES = [
  {
    id: 'superAdmin',
    label: 'Super Administrador',
    color: '#E040FB',
    desc: 'Control total: permisos, bancos, configuración',
  },
  {
    id: 'admin',
    label: 'Administrador',
    color: '#6366F1',
    desc: 'Gestión de usuarios y monitoreo',
  },
  {
    id: 'analyst',
    label: 'Analista de Fraude',
    color: '#06B6D4',
    desc: 'Análisis y gestión de alertas',
  },
  {
    id: 'operator',
    label: 'Operador',
    color: '#10B981',
    desc: 'Monitoreo de transacciones',
  },
  {
    id: 'auditor',
    label: 'Auditor',
    color: '#F59E0B',
    desc: 'Consulta, revisión y auditoría del sistema',
  },
];

export const DEFAULT_PERMISSIONS = {
  superAdmin: {
    dashboard: true,
    map: true,
    transactions: true,
    alerts: true,
    users: true,
    analytics: true,
    settings: true,
    export: true,
    manageUsers: true,
    manageRoles: true,
    assignBanks: true,
    manageModel: true,
  },
  admin: {
    dashboard: true,
    map: true,
    transactions: true,
    alerts: true,
    users: true,
    analytics: true,
    settings: true,
    export: true,
    manageUsers: true,
    manageRoles: false,
    assignBanks: false,
    manageModel: false,
  },
  analyst: {
    dashboard: true,
    map: true,
    transactions: true,
    alerts: true,
    users: false,
    analytics: true,
    settings: false,
    export: true,
    manageUsers: false,
    manageRoles: false,
    assignBanks: false,
    manageModel: false,
  },
  operator: {
    dashboard: true,
    map: false,
    transactions: true,
    alerts: true,
    users: false,
    analytics: false,
    settings: false,
    export: false,
    manageUsers: false,
    manageRoles: false,
    assignBanks: false,
    manageModel: false,
  },
  auditor: {
    dashboard: true,
    map: false,
    transactions: true,
    alerts: true,
    users: false,
    analytics: true,
    settings: false,
    export: true,
    manageUsers: false,
    manageRoles: false,
    assignBanks: false,
    manageModel: false,
  },
};

export const SECURITY_QUESTIONS = [
  '¿Cuál es el nombre de tu primera mascota?',
  '¿En qué ciudad naciste?',
  '¿Cuál es el apellido de soltera de tu madre?',
  '¿Cuál fue tu primer colegio?',
  '¿Cuál es tu plato favorito?',
  '¿Cómo se llama tu mejor amigo/a de la infancia?',
  '¿Cuál es tu película favorita?',
  '¿Cuál fue tu primer vehículo?',
];

export const ALERT_LEVELS = {
  low: {
    label: 'Bajo',
    color: '#34D399',
  },
  medium: {
    label: 'Medio',
    color: '#FBBF24',
  },
  high: {
    label: 'Alto',
    color: '#F97316',
  },
  critical: {
    label: 'Crítico',
    color: '#EF4444',
  },
};

export const CHANNEL_LABELS = {
  mobile: 'Mobile',
  web: 'Web',
  pos: 'POS',
  atm: 'ATM',
  branch: 'Sucursal',
};

export const TRANSACTION_STATUS_LABELS = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  flagged: 'Marcada',
  blocked: 'Bloqueada',
};

export const ALERT_STATUS_LABELS = {
  active: 'Activa',
  in_review: 'En revisión',
  resolved: 'Resuelta',
  discarded: 'Descartada',
};