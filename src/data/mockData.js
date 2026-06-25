// ─── TriDa Mock Data ────────────────────────────────────────────────

export const BANKS = [
  { id: 'all', name: 'Todos los Bancos', color: '#6366F1' },
  { id: 'bancolombia', name: 'Bancolombia', color: '#FFD700' },
  { id: 'davivienda', name: 'Davivienda', color: '#E31837' },
  { id: 'bogota', name: 'Banco de Bogotá', color: '#003DA5' },
  { id: 'bbva', name: 'BBVA Colombia', color: '#004481' },
  { id: 'avvillas', name: 'AV Villas', color: '#00A651' },
  { id: 'nequi', name: 'Nequi', color: '#7B2D8E' },
  { id: 'daviplata', name: 'Daviplata', color: '#FF6B00' },
  { id: 'scotiabank', name: 'Scotiabank Colpatria', color: '#EC111A' },
  { id: 'occidente', name: 'Banco de Occidente', color: '#006341' },
  { id: 'popular', name: 'Banco Popular', color: '#0072CE' },
  { id: 'falabella', name: 'Banco Falabella', color: '#00A650' },
];

export const DEVICES = [
  { id: 'd1', type: 'iPhone 15 Pro', os: 'iOS 17.5', brand: 'Apple', icon: '📱' },
  { id: 'd2', type: 'Samsung Galaxy S24', os: 'Android 14', brand: 'Samsung', icon: '📱' },
  { id: 'd3', type: 'Google Pixel 8', os: 'Android 14', brand: 'Google', icon: '📱' },
  { id: 'd4', type: 'iPad Air M2', os: 'iPadOS 17', brand: 'Apple', icon: '📱' },
  { id: 'd5', type: 'Windows Desktop', os: 'Windows 11', brand: 'PC', icon: '💻' },
  { id: 'd6', type: 'MacBook Pro M3', os: 'macOS Sonoma', brand: 'Apple', icon: '💻' },
  { id: 'd7', type: 'Samsung Galaxy A54', os: 'Android 13', brand: 'Samsung', icon: '📱' },
  { id: 'd8', type: 'Xiaomi Redmi Note 13', os: 'Android 13', brand: 'Xiaomi', icon: '📱' },
  { id: 'd9', type: 'Motorola Edge 40', os: 'Android 13', brand: 'Motorola', icon: '📱' },
  { id: 'd10', type: 'Huawei P60 Pro', os: 'HarmonyOS', brand: 'Huawei', icon: '📱' },
  { id: 'd11', type: 'Linux Desktop', os: 'Ubuntu 24.04', brand: 'PC', icon: '💻' },
  { id: 'd12', type: 'Chromebook', os: 'ChromeOS', brand: 'Google', icon: '💻' },
];

// ─── 4 Roles System ─────────────────────────────────────────────
export const ROLES = [
  { id: 'superAdmin', label: 'Super Administrador', color: '#E040FB', desc: 'Control total: permisos, bancos, configuración' },
  { id: 'admin', label: 'Administrador', color: '#6366F1', desc: 'Gestión de usuarios y monitoreo' },
  { id: 'analyst', label: 'Analista de Fraude', color: '#06B6D4', desc: 'Análisis y gestión de alertas' },
  { id: 'operator', label: 'Operador', color: '#10B981', desc: 'Monitoreo de transacciones' },
  { id: 'client', label: 'Cliente estándar', color: '#F59E0B', desc: 'Consulta su actividad y alertas asociadas' },
];

// Default permissions per role (Super Admin can toggle these)
export const DEFAULT_PERMISSIONS = {
  superAdmin: { dashboard: true, map: true, transactions: true, alerts: true, users: true, analytics: true, settings: true, export: true, manageUsers: true, manageRoles: true, assignBanks: true, manageModel: true },
  admin:      { dashboard: true, map: true, transactions: true, alerts: true, users: true, analytics: true, settings: true, export: true, manageUsers: true, manageRoles: false, assignBanks: false, manageModel: false },
  analyst:    { dashboard: true, map: true, transactions: true, alerts: true, users: false, analytics: true, settings: false, export: true, manageUsers: false, manageRoles: false, assignBanks: false, manageModel: false },
  operator:   { dashboard: true, map: false, transactions: true, alerts: true, users: false, analytics: false, settings: false, export: false, manageUsers: false, manageRoles: false, assignBanks: false, manageModel: false },
  client:     { dashboard: true, map: false, transactions: true, alerts: true, users: false, analytics: false, settings: false, export: false, manageUsers: false, manageRoles: false, assignBanks: false, manageModel: false },
};

// Security questions for password recovery
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

export const USERS = [
  { id: 'u1', name: 'Carlos Andrés Muñoz', email: 'carlos.munoz@trida.co', phone: '+57 300 123 4567', bank: 'bancolombia', role: 'superAdmin', avatar: 'CM', risk: 12, device: 'd6', status: 'active', lastLogin: '2025-11-13T10:30:00', txns: 847, branch: 'Oficina Principal Bogotá', twoFA: true, assignedBanks: ['bancolombia','davivienda','bbva','bogota','nequi','daviplata','avvillas','scotiabank','occidente','popular','falabella'] },
  { id: 'u2', name: 'María Fernanda López', email: 'maria.lopez@trida.co', phone: '+57 301 234 5678', bank: 'davivienda', role: 'analyst', avatar: 'ML', risk: 45, device: 'd5', status: 'active', lastLogin: '2025-11-13T09:15:00', txns: 523, branch: 'Centro Medellín', twoFA: true, assignedBanks: ['davivienda','bancolombia'] },
  { id: 'u3', name: 'Juan Sebastián Rodríguez', email: 'juan.rod@trida.co', phone: '+57 302 345 6789', bank: 'bbva', role: 'operator', avatar: 'JR', risk: 78, device: 'd3', status: 'active', lastLogin: '2025-11-13T08:45:00', txns: 312, branch: 'Oficina Norte Cali', twoFA: false, assignedBanks: ['bbva'] },
  { id: 'u4', name: 'Ana Valentina Gómez', email: 'ana.gomez@trida.co', phone: '+57 303 456 7890', bank: 'bogota', role: 'analyst', avatar: 'AG', risk: 23, device: 'd1', status: 'active', lastLogin: '2025-11-13T11:00:00', txns: 691, branch: 'Sucursal Chapinero', twoFA: true, assignedBanks: ['bogota','bbva'] },
  { id: 'u5', name: 'Diego Alejandro Torres', email: 'diego.torres@trida.co', phone: '+57 304 567 8901', bank: 'nequi', role: 'admin', avatar: 'DT', risk: 8, device: 'd2', status: 'active', lastLogin: '2025-11-13T07:30:00', txns: 1203, branch: 'Digital Remoto', twoFA: true, assignedBanks: ['nequi','daviplata'] },
  { id: 'u6', name: 'Laura Patricia Sánchez', email: 'laura.sanchez@trida.co', phone: '+57 305 678 9012', bank: 'avvillas', role: 'operator', avatar: 'LS', risk: 56, device: 'd7', status: 'inactive', lastLogin: '2025-11-10T16:20:00', txns: 198, branch: 'Sucursal Pereira', twoFA: false, assignedBanks: ['avvillas'] },
  { id: 'u7', name: 'Andrés Camilo Rivera', email: 'andres.rivera@trida.co', phone: '+57 306 789 0123', bank: 'daviplata', role: 'analyst', avatar: 'AR', risk: 34, device: 'd8', status: 'active', lastLogin: '2025-11-13T10:10:00', txns: 445, branch: 'Digital Remoto', twoFA: true, assignedBanks: ['daviplata','nequi'] },
  { id: 'u8', name: 'Camila Julieta Herrera', email: 'camila.herrera@trida.co', phone: '+57 307 890 1234', bank: 'bancolombia', role: 'admin', avatar: 'CH', risk: 15, device: 'd4', status: 'active', lastLogin: '2025-11-13T09:55:00', txns: 934, branch: 'Oficina Principal Medellín', twoFA: true, assignedBanks: ['bancolombia','davivienda'] },
  { id: 'u9', name: 'Santiago Morales', email: 'santiago.morales@trida.co', phone: '+57 308 901 2345', bank: 'scotiabank', role: 'operator', avatar: 'SM', risk: 62, device: 'd9', status: 'active', lastLogin: '2025-11-13T08:00:00', txns: 267, branch: 'Sucursal Barranquilla', twoFA: false, assignedBanks: ['scotiabank'] },
  { id: 'u10', name: 'Valentina Ruiz', email: 'valentina.ruiz@trida.co', phone: '+57 309 012 3456', bank: 'occidente', role: 'analyst', avatar: 'VR', risk: 29, device: 'd10', status: 'inactive', lastLogin: '2025-11-08T14:30:00', txns: 156, branch: 'Sucursal Cali Sur', twoFA: false, assignedBanks: ['occidente'] },
  { id: 'u11', name: 'Felipe Castillo', email: 'felipe.castillo@trida.co', phone: '+57 310 123 4567', bank: 'popular', role: 'operator', avatar: 'FC', risk: 41, device: 'd11', status: 'active', lastLogin: '2025-11-13T07:45:00', txns: 389, branch: 'Oficina Centro Bogotá', twoFA: false, assignedBanks: ['popular'] },
  { id: 'u12', name: 'Isabella Ramírez', email: 'isabella.ramirez@trida.co', phone: '+57 311 234 5678', bank: 'falabella', role: 'admin', avatar: 'IR', risk: 18, device: 'd12', status: 'active', lastLogin: '2025-11-13T10:20:00', txns: 578, branch: 'Sucursal CC', twoFA: true, assignedBanks: ['falabella','bancolombia'] },
];

export const CITIES = [
  { name: 'Bogotá', lat: 4.711, lng: -74.0721 }, { name: 'Medellín', lat: 6.2442, lng: -75.5812 },
  { name: 'Cali', lat: 3.4516, lng: -76.5320 }, { name: 'Barranquilla', lat: 10.9639, lng: -74.7813 },
  { name: 'Cartagena', lat: 10.3910, lng: -75.5364 }, { name: 'Bucaramanga', lat: 7.1254, lng: -73.1198 },
  { name: 'Pereira', lat: 4.8133, lng: -75.6961 }, { name: 'Manizales', lat: 5.0680, lng: -75.5174 },
  { name: 'Ibagué', lat: 4.4389, lng: -75.2322 }, { name: 'Cúcuta', lat: 7.8939, lng: -72.5078 },
  { name: 'Villavicencio', lat: 4.1510, lng: -73.6377 }, { name: 'Pasto', lat: 1.2136, lng: -77.2811 },
  { name: 'Montería', lat: 8.7480, lng: -75.8814 }, { name: 'Neiva', lat: 2.9273, lng: -75.2819 },
  { name: 'Armenia', lat: 4.5339, lng: -75.6811 }, { name: 'Popayán', lat: 2.4448, lng: -76.6147 },
  { name: 'Sincelejo', lat: 9.3047, lng: -75.3917 }, { name: 'Valledupar', lat: 10.4686, lng: -73.2533 },
  { name: 'Leticia', lat: -1.2136, lng: -71.8928 }, { name: 'San Andrés', lat: 12.5847, lng: -81.7006 },
  { name: 'New York', lat: 40.7128, lng: -74.0060 }, { name: 'Miami', lat: 25.7617, lng: -80.1918 },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 }, { name: 'Madrid', lat: 40.4168, lng: -3.7038 },
  { name: 'Londres', lat: 51.5074, lng: -0.1278 }, { name: 'Tokio', lat: 35.6762, lng: 139.6503 },
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333 }, { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816 },
  { name: 'Ciudad de México', lat: 19.4326, lng: -99.1332 }, { name: 'Lima', lat: -12.0464, lng: -77.0428 },
  { name: 'Panamá', lat: 8.9824, lng: -79.5199 }, { name: 'Santiago', lat: -33.4489, lng: -70.6693 },
  { name: 'Quito', lat: -0.1807, lng: -78.4678 }, { name: 'La Habana', lat: 23.1136, lng: -82.3666 },
  { name: 'París', lat: 48.8566, lng: 2.3522 }, { name: 'Berlín', lat: 52.5200, lng: 13.4050 },
  { name: 'Dubái', lat: 25.2048, lng: 55.2708 }, { name: 'Singapur', lat: 1.3521, lng: 103.8198 },
  { name: 'Sídney', lat: -33.8688, lng: 151.2093 }, { name: 'Toronto', lat: 43.6532, lng: -79.3832 },
];

export const TXN_TYPES = [
  'Transferencia PSE', 'Transferencia ACH', 'Retiro ATM', 'Depósito Efectivo',
  'Pago Tarjeta Crédito', 'Transferencia Nequi', 'Transferencia Daviplata',
  'Pago Servicios Públicos', 'Compra Online', 'Transferencia Internacional',
  'Pago Nómina', 'Giros Nacional', 'Recarga Celular', 'Pago Seguro',
  'Transferencia Inmediata', 'Pago Matrícula', 'Recaudo Empresarial',
  'Compra POS', 'Transferencia Programada', 'Pago Crédito Hipotecario',
];

export const ALERT_LEVELS = {
  low: { label: 'Bajo', color: '#34D399' },
  medium: { label: 'Medio', color: '#FBBF24' },
  high: { label: 'Alto', color: '#F97316' },
  critical: { label: 'Crítico', color: '#EF4444' },
};

export const CREDENTIALS = {
  'admin@trida.co': { password: 'admin123', name: 'Carlos Andrés Muñoz', role: 'admin', avatar: 'CM', securityQ: { q1: 0, a1: 'firulais', q2: 3, a2: 'san bartolome' } },
  'analyst@trida.co': { password: 'analyst123', name: 'María Fernanda López', role: 'analyst', avatar: 'ML', securityQ: { q1: 1, a1: 'medellin', q2: 4, a2: 'bandeja paisa' } },
  'operator@trida.co': { password: 'operator123', name: 'Juan Sebastián Rodríguez', role: 'operator', avatar: 'JR', securityQ: { q1: 2, a1: 'rodriguez', q2: 5, a2: 'camilo' } },
  'cliente@trida.co': { password: 'cliente123', name: 'Cliente Estándar', role: 'client', avatar: 'CE', securityQ: { q1: 4, a1: 'ajiaco', q2: 1, a2: 'bogota' } },
};

const NAMES = ['Carlos','María','Juan','Ana','Diego','Laura','Andrés','Camila','Santiago','Valentina','Sebastián','Isabella','Alejandro','Daniela','Felipe','Natalia','Mateo','Paula','Nicolas','Juliana','Andrea','David','Carolina','Esteban','Lorena','Ricardo','Gabriela','Javier','Luisa','Miguel'];
const SURNAMES = ['Muñoz','López','Rodríguez','Gómez','Torres','Sánchez','Rivera','Herrera','Díaz','Morales','Ramírez','Castro','Vargas','Ortiz','Jiménez','Rojas','Arias','Navarro','Mendoza','Peña','Castillo','Ruiz','Beltrán','Cardona','Duque','Restrepo','Ospina','Montoya','Henao','Galvis'];
const pick = a => a[Math.floor(Math.random() * a.length)];

export function generateTransaction(id) {
  const city = pick(CITIES);
  const bank = pick(BANKS.slice(1));
  const type = pick(TXN_TYPES);
  const device = pick(DEVICES);
  const rawRisk = Math.random();
  let riskScore;
  if (rawRisk < 0.62) riskScore = Math.floor(Math.random() * 28);
  else if (rawRisk < 0.84) riskScore = 28 + Math.floor(Math.random() * 32);
  else if (rawRisk < 0.95) riskScore = 60 + Math.floor(Math.random() * 20);
  else riskScore = 80 + Math.floor(Math.random() * 20);
  let alertLevel;
  if (riskScore < 28) alertLevel = 'low';
  else if (riskScore < 60) alertLevel = 'medium';
  else if (riskScore < 80) alertLevel = 'high';
  else alertLevel = 'critical';
  const status = riskScore >= 90 ? 'blocked' : riskScore >= 75 ? 'flagged' : 'approved';
  const now = new Date();
  now.setSeconds(now.getSeconds() - Math.floor(Math.random() * 20));
  return {
    id: `TXN-${String(id).padStart(7, '0')}`,
    timestamp: now.toISOString(),
    user: `${pick(NAMES)} ${pick(SURNAMES)}`,
    account: '****' + String(Math.floor(1000 + Math.random() * 9000)),
    bank, type, device,
    amount: Math.floor(2000 + Math.random() * 85000000),
    riskScore, alertLevel, status,
    isFraud: riskScore > 75 && Math.random() > 0.3,
    location: { city: city.name, lat: city.lat + (Math.random() - 0.5) * 0.1, lng: city.lng + (Math.random() - 0.5) * 0.1 },
    processingTime: Math.floor(25 + Math.random() * 460),
    channel: Math.random() > 0.4 ? 'mobile' : Math.random() > 0.5 ? 'web' : 'pos',
  };
}
