import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { DEFAULT_PERMISSIONS } from '../data/mockData';
import { apiFetch } from '../services/api';

const ThemeCtx = createContext();
const AuthCtx = createContext();
const BankCtx = createContext();
const TxnCtx = createContext();
const PermCtx = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('trida-theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('trida-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeCtx.Provider
      value={{
        theme,
        toggleTheme: () => setTheme(t => (t === 'dark' ? 'light' : 'dark')),
      }}
    >
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('trida-user'));
    } catch {
      return null;
    }
  });

  const [authLoading, setAuthLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    try {
      setAuthLoading(true);

      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('trida-token', data.accessToken);
      localStorage.setItem('trida-user', JSON.stringify(data.user));

      setUser(data.user);

      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err.message || 'Credenciales inválidas',
      };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('trida-user');
    localStorage.removeItem('trida-token');
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const token = localStorage.getItem('trida-token');

      if (!token) {
        setUser(null);
        return;
      }

      const data = await apiFetch('/auth/me');

      localStorage.setItem('trida-user', JSON.stringify(data.user));
      setUser(data.user);
    } catch {
      setUser(null);
      localStorage.removeItem('trida-user');
      localStorage.removeItem('trida-token');
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const verifySecurity = useCallback(() => {
    return {
      ok: false,
      error: 'La recuperación de contraseña aún no está conectada a la API',
    };
  }, []);

  const resetPassword = useCallback(() => {
    return {
      ok: false,
      error: 'El cambio de contraseña aún no está conectado a la API',
    };
  }, []);

  return (
    <AuthCtx.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        refreshMe,
        verifySecurity,
        resetPassword,
        authLoading,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);

export function BankProvider({ children }) {
  const [selectedBank, setSelectedBank] = useState('all');
  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [banksError, setBanksError] = useState('');

  const loadBanks = useCallback(async () => {
    try {
      setBanksLoading(true);
      setBanksError('');

      const data = await apiFetch('/banks?includeAll=true');

      setBanks(data.items || []);
    } catch (err) {
      console.error('Error cargando bancos:', err);
      setBanks([]);
      setBanksError(err.message || 'Error cargando bancos');
    } finally {
      setBanksLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanks();
  }, [loadBanks]);

  return (
    <BankCtx.Provider
      value={{
        selectedBank,
        setSelectedBank,
        banks,
        banksLoading,
        banksError,
        loadBanks,
      }}
    >
      {children}
    </BankCtx.Provider>
  );
}

export const useBank = () => useContext(BankCtx);

export function TransactionProvider({ children }) {
  const { selectedBank } = useBank();

  const [transactions, setTransactions] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

    const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: '1',
        pageSize: '500',
        sort: 'timestamp',
        dir: 'desc',
      });

      if (selectedBank && selectedBank !== 'all') {
        params.set('bankId', selectedBank);
      }

      const data = await apiFetch(`/transactions?${params.toString()}`);

      setTransactions(data.items || []);
    } catch (err) {
      console.error('Error cargando transacciones:', err);
      setError(err.message || 'Error cargando transacciones');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBank]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      loadTransactions();
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive, loadTransactions]);

  const stats = useMemo(() => {
    const total = transactions.length;

    const fraudulent = transactions.filter(t => t.isFraud).length;
    const blocked = transactions.filter(t => t.status === 'blocked').length;
    const approved = transactions.filter(t => t.status === 'approved').length;
    const flagged = transactions.filter(t => t.status === 'flagged').length;

    const avgTime =
      total > 0
        ? Math.round(
            transactions.reduce((sum, t) => {
              return sum + Number(t.processingTime || 0);
            }, 0) / total
          )
        : 0;

    const totalAmount = transactions.reduce((sum, t) => {
      return sum + Number(t.amount || 0);
    }, 0);

    return {
      total,
      fraudulent,
      blocked,
      approved,
      flagged,
      avgTime,
      totalAmount,
    };
  }, [transactions]);

  return (
    <TxnCtx.Provider
      value={{
        transactions,
        setTransactions,
        stats,
        isLive,
        setIsLive,
        loading,
        error,
        reloadTransactions: loadTransactions,
      }}
    >
      {children}
    </TxnCtx.Provider>
  );
}

export const useTransactions = () => useContext(TxnCtx);

export function PermProvider({ children }) {
  const { user } = useAuth();

  const [permissions, setPermissions] = useState(() => {
    try {
      const saved = localStorage.getItem('trida-permissions');
      return saved ? JSON.parse(saved) : DEFAULT_PERMISSIONS;
    } catch {
      return DEFAULT_PERMISSIONS;
    }
  });

  useEffect(() => {
    if (user?.role && user?.permissions) {
      setPermissions(prev => ({
        ...prev,
        [user.role]: user.permissions,
      }));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('trida-permissions', JSON.stringify(permissions));
  }, [permissions]);

  const updateRolePerm = useCallback((role, key, value) => {
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [key]: value,
      },
    }));
  }, []);

  const hasPerm = useCallback(
    (role, key) => {
      return permissions[role]?.[key] ?? false;
    },
    [permissions]
  );

  return (
    <PermCtx.Provider
      value={{
        permissions,
        updateRolePerm,
        hasPerm,
      }}
    >
      {children}
    </PermCtx.Provider>
  );
}

export const usePermissions = () => useContext(PermCtx);