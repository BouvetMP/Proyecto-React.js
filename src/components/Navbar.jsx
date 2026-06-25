import { NavLink } from 'react-router-dom';
import { Activity, AlertTriangle, Banknote, Bot, Gauge, History, LayoutDashboard, LogOut, Map, MonitorSmartphone, Settings, ShieldCheck, UserCog, UsersRound } from 'lucide-react';
import { useAuth, isAdminRole } from '../store/Context';
import { resourceConfig } from '../data/initialDb';

const adminLinks = [
  { to: '/admin', label: 'Dashboard admin', icon: LayoutDashboard },
  { to: resourceConfig.users.route, label: 'Usuarios', icon: UsersRound },
  { to: resourceConfig.transactions.route, label: 'Transacciones', icon: Activity },
  { to: resourceConfig.alerts.route, label: 'Alertas', icon: AlertTriangle },
  { to: resourceConfig.banks.route, label: 'Bancos', icon: Banknote },
  { to: resourceConfig.devices.route, label: 'Dispositivos', icon: MonitorSmartphone },
  { to: resourceConfig.rules.route, label: 'Reglas', icon: ShieldCheck },
  { to: resourceConfig.models.route, label: 'Modelos IA', icon: Bot },
  { to: resourceConfig.auditLogs.route, label: 'Auditoría', icon: History },
];

const monitorLinks = [
  { to: '/cliente', label: 'Dashboard cliente', icon: Gauge },
  { to: '/monitor/mapa', label: 'Mapa mundi 3D', icon: Map },
  { to: '/monitor/mapa-2d', label: 'Mapa 2D', icon: Map },
  { to: '/monitor/analiticas', label: 'Analíticas', icon: Activity },
  { to: '/monitor/configuracion', label: 'Configuración', icon: Settings },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const canAdmin = isAdminRole(user?.role);
  const links = canAdmin ? [...adminLinks, ...monitorLinks] : monitorLinks;

  return (
    <aside className="app-nav">
      <NavLink className="app-nav__brand" to={canAdmin ? '/admin' : '/cliente'}>
        <img src="/logo.png" alt="TriDa" />
        <div>
          <strong>TriDa</strong>
          <span>Fraud AI</span>
        </div>
      </NavLink>

      <div className="app-nav__section">
        <span className="app-nav__caption">Navegación</span>
        {links.map(item => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} end={item.to === '/admin' || item.to === '/cliente'} className={({ isActive }) => `app-nav__link ${isActive ? 'active' : ''}`}>
              <Icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="app-nav__bottom">
        <div className="token-mini">
          <UserCog size={15} />
          <div>
            <span>Token activo</span>
            <code>{user?.token ? `${user.token.slice(0, 18)}...` : 'sin-token'}</code>
          </div>
        </div>
        <button type="button" onClick={logout} className="app-nav__logout">
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
