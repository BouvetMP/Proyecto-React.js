import { useState, useRef, useEffect } from 'react';
import { useAuth, useTheme, useTransactions, useBank } from '../store/Context';
import { LayoutDashboard, Globe, Activity, Bell, Users, BarChart3, Settings, LogOut, Sun, Moon, Building2, ChevronDown, PanelLeftClose,
  PanelLeftOpen, Clock,} from 'lucide-react';
import '../styles/Sidebar.css';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'map', label: 'Mapa en Vivo', icon: Globe },
  { id: 'transactions', label: 'Transacciones', icon: Activity },
  { id: 'alerts', label: 'Alertas', icon: Bell },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'analytics', label: 'Analíticas', icon: BarChart3 },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

function getRoleLabel(role) {
  if (role === 'superAdmin') return 'Super Admin';
  if (role === 'admin') return 'Admin';
  if (role === 'analyst') return 'Analista';
  if (role === 'operator') return 'Operador';
  if (role === 'auditor') return 'Auditor';
  return role || 'Usuario';
}

export default function Sidebar({
  activeTab,
  onTabChange,
  alertCount,
  collapsed,
  setCollapsed,
}) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isLive, setIsLive, stats } = useTransactions();
  const { selectedBank, setSelectedBank, banks } = useBank();

  const [bankOpen, setBankOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  const ref = useRef(null);

  const bankList = banks.length
    ? banks
    : [
        {
          id: 'all',
          name: 'Todos los Bancos',
          color: '#6366F1',
        },
      ];

  const cur =
    bankList.find(bank => bank.id === selectedBank) ||
    bankList[0];

  useEffect(() => {
    const iv = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const handleClickOutside = event => {
      if (ref.current && !ref.current.contains(event.target)) {
        setBankOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <aside className={`sidebar ${collapsed ? 'sb-collapsed' : ''}`}>
      <div className="sb-brand">
        {!collapsed && (
          <>
            <img src="/logo.png" alt="TriDa" className="sb-logo" />

            <div className="sb-brand-text">
              <span className="sb-name">TriDa</span>
              <span className="sb-tag">Fraud Detection AI</span>
            </div>
          </>
        )}

        {collapsed && (
          <img src="/logo.png" alt="TriDa" className="sb-logo-sm" />
        )}

        <button
          className="sb-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Abrir barra lateral' : 'Cerrar barra lateral'}
        >
          {collapsed ? (
            <PanelLeftOpen size={16} />
          ) : (
            <PanelLeftClose size={16} />
          )}
        </button>
      </div>

      {!collapsed && (
        <div className="sb-bank" ref={ref}>
          <button
            className={`bank-btn ${bankOpen ? 'open' : ''}`}
            onClick={() => setBankOpen(!bankOpen)}
          >
            <Building2 size={14} strokeWidth={1.5} />

            <span
              className="bk-dot"
              style={{ background: cur?.color || '#6366F1' }}
            />

            <span className="bank-btn-name">
              {cur?.name || 'Todos los Bancos'}
            </span>

            <ChevronDown
              size={12}
              className={bankOpen ? 'chev-up' : ''}
            />
          </button>

          {bankOpen && (
            <div className="bank-dd">
              {bankList.map(bank => (
                <button
                  key={bank.id}
                  className={`bank-opt ${
                    selectedBank === bank.id ? 'active' : ''
                  }`}
                  onClick={() => {
                    setSelectedBank(bank.id);
                    setBankOpen(false);
                  }}
                >
                  <span
                    className="bk-dot"
                    style={{ background: bank.color || '#6366F1' }}
                  />

                  <span>{bank.name}</span>

                  {selectedBank === bank.id && (
                    <span className="bchk">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {collapsed && (
        <div className="sb-bank-mini">
          <div
            className="sb-bank-mini-dot"
            style={{ background: cur?.color || '#6366F1' }}
            title={cur?.name || 'Todos los Bancos'}
          />
        </div>
      )}

      <nav className="sb-nav">
        {NAV.map(navItem => {
          const Icon = navItem.icon;
          const isActive = activeTab === navItem.id;

          return (
            <button
              key={navItem.id}
              className={`nav-item ${isActive ? 'active' : ''} ${
                collapsed ? 'nav-collapsed' : ''
              }`}
              onClick={() => onTabChange(navItem.id)}
              title={collapsed ? navItem.label : ''}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />

              {!collapsed && <span>{navItem.label}</span>}

              {navItem.id === 'alerts' && alertCount > 0 && (
                <span
                  className={`nav-badge ${
                    collapsed ? 'nav-badge-sm' : ''
                  }`}
                >
                  {collapsed
                    ? alertCount > 9
                      ? '9+'
                      : alertCount
                    : alertCount > 99
                      ? '99+'
                      : alertCount}
                </span>
              )}

              {navItem.id === 'map' && isLive && !collapsed && (
                <span className="nav-live" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="sb-bottom">
        {!collapsed ? (
          <>
            <div className="sb-profile">
              <div className="sb-avatar">
                {user?.avatar || 'U'}
              </div>

              <div className="sb-who">
                <span className="sb-who-name">
                  {user?.name?.split(' ').slice(0, 2).join(' ') ||
                    'Usuario'}
                </span>

                <span className="sb-who-role">
                  {getRoleLabel(user?.role)}
                </span>
              </div>

              <button
                className="sb-logout-sm"
                onClick={logout}
                title="Salir"
              >
                <LogOut size={14} />
              </button>
            </div>

            <div className="sb-pills">
              <div className="sb-pill sb-pill-time">
                <Clock size={10} />

                <span>
                  {time.toLocaleTimeString('es-CO', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>

              <button
                className={`sb-pill sb-pill-live ${isLive ? 'on' : ''}`}
                onClick={() => setIsLive(!isLive)}
              >
                <span className="sb-live-dot-sm" />
                <span>{isLive ? 'LIVE' : 'OFF'}</span>
              </button>
            </div>

            <div className="sb-tiny-stats">
              <span>
                <b>{Number(stats?.total || 0).toLocaleString()}</b> TXN
              </span>

              <span>
                <b>{isLive ? '~5' : '0'}</b>/s
              </span>
            </div>

            <button className="sb-theme-btn" onClick={toggleTheme}>
              {theme === 'dark' ? (
                <Sun size={12} />
              ) : (
                <Moon size={12} />
              )}

              <span>{theme === 'dark' ? 'Claro' : 'Oscuro'}</span>
            </button>
          </>
        ) : (
          <>
            <div
              className="sb-avatar-mini"
              title={`${user?.name || 'Usuario'} · ${getRoleLabel(
                user?.role
              )}`}
            >
              {user?.avatar || 'U'}
            </div>

            <span className={`sb-live-mini ${isLive ? 'on' : ''}`}>
              ●
            </span>

            <button
              className="sb-logout-mini"
              onClick={logout}
              title="Salir"
            >
              <LogOut size={14} />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}