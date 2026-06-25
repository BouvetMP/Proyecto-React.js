/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { generateTransaction, CREDENTIALS, DEFAULT_PERMISSIONS } from '../data/mockData';
import { initialDb, resourceConfig } from '../data/initialDb';
import { backendCreate, backendDelete, backendList, backendUpdate } from '../services/api';

const ThemeCtx = createContext(null);
const AuthCtx = createContext(null);
const BankCtx = createContext(null);
const TxnCtx = createContext(null);
const PermCtx = createContext(null);
const DataCtx = createContext(null);

const ADMIN_ROLES = ['superAdmin', 'admin'];
const ROLE_HOME = {
  superAdmin: '/admin',
  admin: '/admin',
  analyst: '/cliente',
  operator: '/cliente',
  client: '/cliente',
};

const toBase64Url = (obj) => {
  const json = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

export const isAdminRole = (role) => ADMIN_ROLES.includes(role);
export const getRoleHome = (role) => ROLE_HOME[role] || '/cliente';

export function createDemoToken(user) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: user.email,
    name: user.name,
    role: user.role,
    scope: isAdminRole(user.role) ? 'admin:all crud:all' : 'client:read alerts:read transactions:read',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
  };
  const signature = toBase64Url({ demo: 'trida-signature', role: user.role });
  return `${toBase64Url(header)}.${toBase64Url(payload)}.${signature}`;
}

function initials(name = 'TU') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(x => x[0]?.toUpperCase()).join('') || 'TU';
}

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('trida-theme') || 'dark');
  useEffect(() => {
    localStorage.setItem('trida-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  return <ThemeCtx.Provider value={{ theme, toggleTheme: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }}>{children}</ThemeCtx.Provider>;
}
export const useTheme = () => useContext(ThemeCtx);

export function AuthProvider({ children }) {
  const [registeredCredentials, setRegisteredCredentials] = useState(() => readJson('trida-registered-credentials', {}));
  const [user, setUser] = useState(() => readJson('trida-user', null));

  const allCredentials = useMemo(() => ({ ...CREDENTIALS, ...registeredCredentials }), [registeredCredentials]);

  const persistUser = useCallback((u) => {
    const token = createDemoToken(u);
    const userWithToken = { ...u, token };
    setUser(userWithToken);
    localStorage.setItem('trida-user', JSON.stringify(userWithToken));
    localStorage.setItem('trida-token', token);
    return userWithToken;
  }, []);

  const login = useCallback((email, pw) => {
    const normalizedEmail = email.trim().toLowerCase();
    const c = allCredentials[normalizedEmail];
    if (c && c.password === pw) {
      const u = { email: normalizedEmail, ...c };
      persistUser(u);
      return { ok: true, token: createDemoToken(u), role: u.role };
    }
    return { ok: false, error: 'Credenciales inválidas' };
  }, [allCredentials, persistUser]);

  const register = useCallback((payload) => {
    const email = payload.email.trim().toLowerCase();
    if (!email || !payload.password || !payload.name) return { ok: false, error: 'Completa nombre, correo y contraseña' };
    if (allCredentials[email]) return { ok: false, error: 'El correo ya está registrado' };
    const newCredential = {
      password: payload.password,
      name: payload.name,
      role: payload.role || 'client',
      avatar: initials(payload.name),
      securityQ: { q1: 0, a1: payload.securityAnswer || 'demo', q2: 1, a2: payload.city || 'bogota' },
    };
    const next = { ...registeredCredentials, [email]: newCredential };
    setRegisteredCredentials(next);
    localStorage.setItem('trida-registered-credentials', JSON.stringify(next));
    const createdUser = persistUser({ email, ...newCredential });
    return { ok: true, user: createdUser, token: createdUser.token };
  }, [allCredentials, persistUser, registeredCredentials]);

  const verifySecurity = useCallback((email, q1, a1, q2, a2) => {
    const c = allCredentials[email.trim().toLowerCase()];
    if (!c) return { ok: false, error: 'Email no registrado' };
    if (c.securityQ.q1 === q1 && c.securityQ.a1.toLowerCase().trim() === a1.toLowerCase().trim()
      && c.securityQ.q2 === q2 && c.securityQ.a2.toLowerCase().trim() === a2.toLowerCase().trim()) {
      return { ok: true, code: String(Math.floor(100000 + Math.random() * 900000)) };
    }
    return { ok: false, error: 'Respuestas incorrectas' };
  }, [allCredentials]);

  const resetPassword = useCallback((email, newPw) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (CREDENTIALS[normalizedEmail]) return { ok: true };
    const c = registeredCredentials[normalizedEmail];
    if (!c) return { ok: false, error: 'Usuario no encontrado' };
    const next = { ...registeredCredentials, [normalizedEmail]: { ...c, password: newPw } };
    setRegisteredCredentials(next);
    localStorage.setItem('trida-registered-credentials', JSON.stringify(next));
    return { ok: true };
  }, [registeredCredentials]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('trida-user');
    localStorage.removeItem('trida-token');
  }, []);

  return <AuthCtx.Provider value={{ user, token: user?.token || localStorage.getItem('trida-token'), login, register, logout, verifySecurity, resetPassword }}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);

export function BankProvider({ children }) {
  const [selectedBank, setSelectedBank] = useState('all');
  return <BankCtx.Provider value={{ selectedBank, setSelectedBank }}>{children}</BankCtx.Provider>;
}
export const useBank = () => useContext(BankCtx);

function buildInitialTransactions() {
  const init = [];
  for (let i = 0; i < 200; i++) {
    const txn = generateTransaction(200 - i);
    const d = new Date();
    d.setSeconds(d.getSeconds() - (200 - i) * 2);
    txn.timestamp = d.toISOString();
    init.push(txn);
  }
  return init;
}

function computeStats(list) {
  const total = list.length;
  const fraudulent = list.filter(x => x.isFraud).length;
  const blocked = list.filter(x => x.status === 'blocked').length;
  const approved = list.filter(x => x.status === 'approved').length;
  const flagged = list.filter(x => x.status === 'flagged').length;
  const avgTime = total > 0 ? Math.round(list.reduce((s, x) => s + x.processingTime, 0) / total) : 0;
  const totalAmount = list.reduce((s, x) => s + x.amount, 0);
  return { total, fraudulent, blocked, approved, flagged, avgTime, totalAmount };
}

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState(buildInitialTransactions);
  const [isLive, setIsLive] = useState(true);
  const counter = useRef(200);
  const timer = useRef(null);
  const stats = useMemo(() => computeStats(transactions), [transactions]);

  const add = useCallback(() => {
    counter.current += 1;
    const txn = generateTransaction(counter.current);
    setTransactions(prev => [txn, ...prev].slice(0, 500));
  }, []);

  useEffect(() => {
    if (!isLive) return undefined;
    const loop = () => {
      const delay = 150 + Math.random() * 500;
      timer.current = setTimeout(() => {
        const burst = Math.random() > 0.6 ? Math.floor(2 + Math.random() * 4) : 1;
        for (let i = 0; i < burst; i += 1) add();
        loop();
      }, delay);
    };
    loop();
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [isLive, add]);

  return <TxnCtx.Provider value={{ transactions, stats, isLive, setIsLive }}>{children}</TxnCtx.Provider>;
}
export const useTransactions = () => useContext(TxnCtx);

export function DataProvider({ children }) {
  const { token } = useAuth();
  const [db, setDb] = useState(() => readJson('trida-db', initialDb));
  const [syncStatus, setSyncStatus] = useState({ backend: 'pending', lastSync: null, message: 'Inicializando conexión backend...' });

  useEffect(() => {
    localStorage.setItem('trida-db', JSON.stringify(db));
  }, [db]);

  useEffect(() => {
    let mounted = true;
    async function warmBackendConnection() {
      const result = await backendList('health');
      if (!mounted) return;
      setSyncStatus({
        backend: result.ok ? 'connected' : 'fallback',
        lastSync: new Date().toISOString(),
        message: result.ok ? 'Backend conectado correctamente.' : 'Backend no disponible; usando store local funcional.',
      });
    }
    warmBackendConnection();
    return () => { mounted = false; };
  }, []);

  const list = useCallback((resource) => db[resource] || [], [db]);

  const createItem = useCallback(async (resource, draft) => {
    const cfg = resourceConfig[resource];
    const timestamp = new Date().toISOString();
    const item = {
      id: draft.id || `${cfg?.idPrefix || resource.toUpperCase()}-${String(Date.now()).slice(-6)}`,
      ...draft,
      createdAt: draft.createdAt || timestamp,
      updatedAt: timestamp,
    };
    setDb(prev => ({ ...prev, [resource]: [item, ...(prev[resource] || [])] }));
    const result = await backendCreate(resource, item, token);
    setSyncStatus({ backend: result.ok ? 'connected' : 'fallback', lastSync: timestamp, message: result.ok ? `Creado en backend: ${resource}` : `Creado localmente; backend no disponible (${resource}).` });
    return item;
  }, [token]);

  const updateItem = useCallback(async (resource, id, patch) => {
    const timestamp = new Date().toISOString();
    const nextItem = { ...patch, id, updatedAt: timestamp };
    setDb(prev => ({
      ...prev,
      [resource]: (prev[resource] || []).map(item => item.id === id ? { ...item, ...nextItem } : item),
    }));
    const result = await backendUpdate(resource, id, nextItem, token);
    setSyncStatus({ backend: result.ok ? 'connected' : 'fallback', lastSync: timestamp, message: result.ok ? `Actualizado en backend: ${resource}` : `Actualizado localmente; backend no disponible (${resource}).` });
    return nextItem;
  }, [token]);

  const deleteItem = useCallback(async (resource, id) => {
    const timestamp = new Date().toISOString();
    setDb(prev => ({ ...prev, [resource]: (prev[resource] || []).filter(item => item.id !== id) }));
    const result = await backendDelete(resource, id, token);
    setSyncStatus({ backend: result.ok ? 'connected' : 'fallback', lastSync: timestamp, message: result.ok ? `Eliminado en backend: ${resource}` : `Eliminado localmente; backend no disponible (${resource}).` });
  }, [token]);

  const resetDb = useCallback(() => {
    setDb(initialDb);
    localStorage.setItem('trida-db', JSON.stringify(initialDb));
    setSyncStatus({ backend: 'fallback', lastSync: new Date().toISOString(), message: 'Base demo reiniciada desde datos iniciales.' });
  }, []);

  return <DataCtx.Provider value={{ db, list, createItem, updateItem, deleteItem, resetDb, syncStatus }}>{children}</DataCtx.Provider>;
}
export const useDataStore = () => useContext(DataCtx);

// Permissions context — stores role permissions (mutable by Admin)
export function PermProvider({ children }) {
  const [permissions, setPermissions] = useState(() => readJson('trida-permissions', DEFAULT_PERMISSIONS));
  useEffect(() => { localStorage.setItem('trida-permissions', JSON.stringify(permissions)); }, [permissions]);
  const updateRolePerm = useCallback((role, key, value) => {
    setPermissions(prev => ({ ...prev, [role]: { ...prev[role], [key]: value } }));
  }, []);
  const hasPerm = useCallback((role, key) => permissions[role]?.[key] ?? false, [permissions]);
  return <PermCtx.Provider value={{ permissions, updateRolePerm, hasPerm }}>{children}</PermCtx.Provider>;
}
export const usePermissions = () => useContext(PermCtx);
