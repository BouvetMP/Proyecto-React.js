import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, BankProvider, DataProvider, getRoleHome, isAdminRole, PermProvider, ThemeProvider, TransactionProvider, useAuth } from './store/Context';
import Login from './components/Login';
import AppShell from './components/AppShell';
import Dashboard from './components/Dashboard';
import TransactionMap from './components/TransactionMap';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import UsersCrudPage from './pages/UsersCrudPage';
import TransactionsCrudPage from './pages/TransactionsCrudPage';
import AlertsCrudPage from './pages/AlertsCrudPage';
import BanksCrudPage from './pages/BanksCrudPage';
import DevicesCrudPage from './pages/DevicesCrudPage';
import RulesCrudPage from './pages/RulesCrudPage';
import ModelsCrudPage from './pages/ModelsCrudPage';
import AuditLogsCrudPage from './pages/AuditLogsCrudPage';
import './styles/Global.css';

function PublicOnly({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={getRoleHome(user.role)} replace />;
  return children;
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdminRole(user.role)) return <Navigate to={getRoleHome(user.role)} replace />;
  return children;
}

function RoleRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? getRoleHome(user.role) : '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/registro" element={<PublicOnly><RegisterPage /></PublicOnly>} />
      <Route path="/dashboard" element={<RoleRedirect />} />

      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="admin" element={<ProtectedRoute adminOnly><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="admin/usuarios" element={<ProtectedRoute adminOnly><UsersCrudPage /></ProtectedRoute>} />
        <Route path="admin/transacciones" element={<ProtectedRoute adminOnly><TransactionsCrudPage /></ProtectedRoute>} />
        <Route path="admin/alertas" element={<ProtectedRoute adminOnly><AlertsCrudPage /></ProtectedRoute>} />
        <Route path="admin/bancos" element={<ProtectedRoute adminOnly><BanksCrudPage /></ProtectedRoute>} />
        <Route path="admin/dispositivos" element={<ProtectedRoute adminOnly><DevicesCrudPage /></ProtectedRoute>} />
        <Route path="admin/reglas" element={<ProtectedRoute adminOnly><RulesCrudPage /></ProtectedRoute>} />
        <Route path="admin/modelos" element={<ProtectedRoute adminOnly><ModelsCrudPage /></ProtectedRoute>} />
        <Route path="admin/auditoria" element={<ProtectedRoute adminOnly><AuditLogsCrudPage /></ProtectedRoute>} />

        <Route path="cliente" element={<ClientDashboardPage />} />
        <Route path="monitor/mapa" element={<Dashboard />} />
        <Route path="monitor/mapa-2d" element={<TransactionMap />} />
        <Route path="monitor/analiticas" element={<Analytics />} />
        <Route path="monitor/configuracion" element={<Settings />} />
      </Route>

      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <PermProvider>
            <BankProvider>
              <TransactionProvider>
                <DataProvider>
                  <AppRoutes />
                </DataProvider>
              </TransactionProvider>
            </BankProvider>
          </PermProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
