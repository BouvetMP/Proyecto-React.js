import { useEffect, useMemo, useState } from 'react';
import {
  useAuth,
  useTransactions,
  usePermissions,
  useBank,
} from '../store/Context';
import { apiFetch } from '../services/api';
import {
  UserPlus,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Shield,
  ShieldOff,
  Save,
  X,
  User,
  Brain,
  Bell,
  Lock,
  KeyRound,
  Phone,
  Mail,
  Camera,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import '../styles/Settings.css';

const ROLES = [
  {
    id: 'superAdmin',
    label: 'Super Administrador',
    color: '#E040FB',
    desc: 'Control total del sistema',
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
    desc: 'Consulta y auditoría',
  },
];

const PERM_LABELS = {
  dashboard: 'Dashboard',
  map: 'Mapa en Vivo',
  transactions: 'Transacciones',
  alerts: 'Alertas',
  users: 'Usuarios',
  analytics: 'Analíticas',
  settings: 'Configuración',
  export: 'Exportar',
  manageUsers: 'Gestionar Usuarios',
  manageRoles: 'Gestionar Roles',
  assignBanks: 'Asignar Bancos',
  manageModel: 'Configurar Modelo IA',
};

const TABS = [
  { id: 'profile', label: 'Mi Perfil', icon: User },
  { id: 'users', label: 'Usuarios', icon: UserPlus },
  { id: 'model', label: 'Modelo IA', icon: Brain },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'roles', label: 'Roles y Permisos', icon: Lock },
];

function getInitials(name = '') {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase() || 'U'
  );
}

function getRoleInfo(role) {
  return ROLES.find(item => item.id === role) || ROLES[3];
}

function RIcon({ role }) {
  const r = getRoleInfo(role);

  if (role === 'superAdmin') {
    return <ShieldCheck size={15} color={r.color} />;
  }

  if (role === 'admin') {
    return <ShieldAlert size={15} color={r.color} />;
  }

  if (role === 'analyst') {
    return <Shield size={15} color={r.color} />;
  }

  return <ShieldOff size={15} color={r.color} />;
}

export default function Settings() {
  const { user } = useAuth();
  const { isLive } = useTransactions();
  const { permissions, updateRolePerm, hasPerm } = usePermissions();
  const { banks } = useBank();

  const [tab, setTab] = useState('profile');

  const [cfg, setCfg] = useState({
    notifications: true,
    autoBlock: true,
    riskThreshold: 80,
    emailAlerts: true,
    smsAlerts: false,
    pushAlerts: true,
    criticalAlerts: true,
    highAlerts: true,
    mediumAlerts: false,
    lowAlerts: false,
    sensitivity: 0.7,
    autoBlockThreshold: 90,
    whitelistEnabled: false,
    realtimeAnalysis: true,
  });

  const [roleUsers, setRoleUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');

  const [modal, setModal] = useState(false);
  const [nw, setNw] = useState({
    name: '',
    email: '',
    password: '',
    role: 'operator',
    status: 'active',
  });

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+57 300 123 4567',
    twoFA: true,
  });

  const [pwModal, setPwModal] = useState(false);
  const [pwData, setPwData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const canManageUsers = hasPerm(user?.role, 'manageUsers');
  const canManageRoles = hasPerm(user?.role, 'manageRoles');
  const canManageModel = hasPerm(user?.role, 'manageModel');

  const activeUsers = useMemo(() => {
    return roleUsers.filter(item => item.status === 'active').length;
  }, [roleUsers]);

  const loadSystemUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError('');

      const data = await apiFetch('/system-users?page=1&pageSize=300');

      setRoleUsers(data.items || []);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      setUsersError(err.message || 'Error cargando usuarios');
      setRoleUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (canManageUsers) {
      loadSystemUsers();
    }
  }, [canManageUsers]);

  useEffect(() => {
    setProfile(prev => ({
      ...prev,
      name: user?.name || '',
      email: user?.email || '',
    }));
  }, [user]);

  const toggle = key => {
    setCfg(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleStatus = async id => {
    const current = roleUsers.find(item => item.id === id);

    if (!current) return;

    const nextActive = current.status !== 'active';

    try {
      const data = await apiFetch(`/system-users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          active: nextActive,
        }),
      });

      setRoleUsers(prev =>
        prev.map(item => (item.id === id ? data.item : item))
      );
    } catch (err) {
      console.error('Error cambiando estado:', err);
      alert(err.message || 'No se pudo cambiar el estado');
    }
  };

  const changeRole = async (id, role) => {
    try {
      const data = await apiFetch(`/system-users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({
          role,
        }),
      });

      setRoleUsers(prev =>
        prev.map(item => (item.id === id ? data.item : item))
      );
    } catch (err) {
      console.error('Error cambiando rol:', err);
      alert(err.message || 'No se pudo cambiar el rol');
    }
  };

  const delUser = async id => {
    const ok = window.confirm(
      'La API actual no elimina usuarios. Se marcará como inactivo. ¿Continuar?'
    );

    if (!ok) return;

    try {
      const data = await apiFetch(`/system-users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          active: false,
        }),
      });

      setRoleUsers(prev =>
        prev.map(item => (item.id === id ? data.item : item))
      );
    } catch (err) {
      console.error('Error desactivando usuario:', err);
      alert(err.message || 'No se pudo desactivar el usuario');
    }
  };

  const addUser = async () => {
    if (!nw.name || !nw.email || !nw.password) {
      alert('Nombre, email y contraseña son requeridos');
      return;
    }

    try {
      const data = await apiFetch('/system-users', {
        method: 'POST',
        body: JSON.stringify({
          name: nw.name,
          email: nw.email,
          password: nw.password,
          role: nw.role,
        }),
      });

      setRoleUsers(prev => [data.item, ...prev]);

      setNw({
        name: '',
        email: '',
        password: '',
        role: 'operator',
        status: 'active',
      });

      setModal(false);
    } catch (err) {
      console.error('Error creando usuario:', err);
      alert(err.message || 'No se pudo crear el usuario');
    }
  };

  const currentRole = getRoleInfo(user?.role);

  return (
    <div className="sp">
      <div className="sp-h">
        <div>
          <h2>Configuración</h2>
          <p>Ajustes del sistema, perfil y permisos</p>
        </div>
      </div>

      <div className="sp-layout">
        <div className="sp-tabs">
          {TABS.map(tabItem => {
            const Icon = tabItem.icon;

            if (tabItem.id === 'users' && !canManageUsers) return null;
            if (tabItem.id === 'roles' && !canManageRoles) return null;
            if (tabItem.id === 'model' && !canManageModel) return null;

            return (
              <button
                key={tabItem.id}
                className={`sp-tab ${tab === tabItem.id ? 'active' : ''}`}
                onClick={() => setTab(tabItem.id)}
              >
                <Icon size={16} />
                <span>{tabItem.label}</span>
              </button>
            );
          })}
        </div>

        <div className="sp-content">
          {tab === 'profile' && (
            <div className="sp-section">
              <h3>
                <User size={16} /> Mi Perfil
              </h3>

              <div className="sprof-card">
                <div className="sprof-avatar-wrap">
                  <div className="sprof-avatar">
                    {user?.avatar || getInitials(user?.name)}
                  </div>

                  <button className="sprof-cam" title="Cambiar foto">
                    <Camera size={12} />
                  </button>
                </div>

                <div className="sprof-info">
                  <span
                    className="sprof-role-badge"
                    style={{
                      background: `${currentRole.color}18`,
                      color: currentRole.color,
                    }}
                  >
                    {currentRole.label}
                  </span>
                </div>
              </div>

              <div className="sprof-form">
                <div className="sfg">
                  <label>
                    <User size={12} /> Nombre
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={event =>
                      setProfile(prev => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="sfg">
                  <label>
                    <Mail size={12} /> Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={event =>
                      setProfile(prev => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="sfg">
                  <label>
                    <Phone size={12} /> Teléfono
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={event =>
                      setProfile(prev => ({
                        ...prev,
                        phone: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="sfg-row">
                  <span className="sfg-lbl">
                    <KeyRound size={12} /> Autenticación 2FA
                  </span>

                  <label className="tgl">
                    <input
                      type="checkbox"
                      checked={profile.twoFA}
                      onChange={() =>
                        setProfile(prev => ({
                          ...prev,
                          twoFA: !prev.twoFA,
                        }))
                      }
                    />
                    <span className="tgl-s" />
                  </label>
                </div>

                <button
                  className="sprof-pw-btn"
                  onClick={() => setPwModal(true)}
                >
                  <KeyRound size={14} /> Cambiar Contraseña
                </button>

                <button
                  className="sprof-save"
                  onClick={() =>
                    alert('Guardado de perfil pendiente de conectar a la API')
                  }
                >
                  <Save size={14} /> Guardar Cambios
                </button>
              </div>
            </div>
          )}

          {tab === 'users' && canManageUsers && (
            <div className="sp-section">
              <div className="srh">
                <h3>
                  <UserPlus size={16} /> Gestión de Usuarios
                </h3>

                <div className="srs">
                  <span className="srst">{activeUsers} activos</span>
                  <span className="srst">{roleUsers.length} total</span>
                </div>

                <button className="sadd-btn" onClick={() => setModal(true)}>
                  <UserPlus size={13} /> Nuevo Usuario
                </button>
              </div>

              {usersError && <div className="login-err">{usersError}</div>}

              {usersLoading ? (
                <p>Cargando usuarios...</p>
              ) : (
                <div className="srt-w">
                  <table className="srt">
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>

                    <tbody>
                      {roleUsers.map(item => {
                        const role = getRoleInfo(item.role);

                        return (
                          <tr
                            key={item.id}
                            className={
                              item.status === 'inactive' ? 'sri' : ''
                            }
                          >
                            <td>
                              <div className="st-u">
                                <span
                                  className="st-av"
                                  style={{
                                    background: role.color,
                                  }}
                                >
                                  {item.avatar || getInitials(item.name)}
                                </span>

                                <span>{item.name}</span>
                              </div>
                            </td>

                            <td>{item.email}</td>

                            <td>
                              <select
                                className="srl-sel"
                                value={item.role}
                                onChange={event =>
                                  changeRole(item.id, event.target.value)
                                }
                                style={{
                                  color: role.color,
                                }}
                              >
                                {ROLES.map(roleItem => (
                                  <option
                                    key={roleItem.id}
                                    value={roleItem.id}
                                  >
                                    {roleItem.label}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td>
                              <button
                                className={`sst-tgl ${item.status}`}
                                onClick={() => toggleStatus(item.id)}
                              >
                                {item.status === 'active' ? (
                                  <ToggleRight size={18} />
                                ) : (
                                  <ToggleLeft size={18} />
                                )}

                                <span>
                                  {item.status === 'active'
                                    ? 'Activo'
                                    : 'Inactivo'}
                                </span>
                              </button>
                            </td>

                            <td>
                              <button
                                className="sdel-btn"
                                onClick={() => delUser(item.id)}
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'model' && canManageModel && (
            <div className="sp-section">
              <h3>
                <Brain size={16} /> Configuración del Modelo de IA
              </h3>

              <div className="sm-grid">
                <div className="sm-card">
                  <div className="smc-head">
                    <span>Umbrales de Riesgo</span>
                  </div>

                  <div className="smc-body">
                    <div className="sm-row">
                      <div className="sm-info">
                        <span className="sm-l">Nivel Bajo</span>
                        <span className="sm-d">Riesgo 0-29%</span>
                      </div>
                      <div className="sm-bar">
                        <div
                          className="sm-fill"
                          style={{ width: '30%', background: '#34D399' }}
                        />
                      </div>
                      <span className="sm-v">0-29%</span>
                    </div>

                    <div className="sm-row">
                      <div className="sm-info">
                        <span className="sm-l">Nivel Medio</span>
                        <span className="sm-d">Riesgo 30-59%</span>
                      </div>
                      <div className="sm-bar">
                        <div
                          className="sm-fill"
                          style={{ width: '30%', background: '#FBBF24' }}
                        />
                      </div>
                      <span className="sm-v">30-59%</span>
                    </div>

                    <div className="sm-row">
                      <div className="sm-info">
                        <span className="sm-l">Nivel Alto</span>
                        <span className="sm-d">Riesgo 60-79%</span>
                      </div>
                      <div className="sm-bar">
                        <div
                          className="sm-fill"
                          style={{ width: '20%', background: '#F97316' }}
                        />
                      </div>
                      <span className="sm-v">60-79%</span>
                    </div>

                    <div className="sm-row">
                      <div className="sm-info">
                        <span className="sm-l">Nivel Crítico</span>
                        <span className="sm-d">Riesgo 80-100%</span>
                      </div>
                      <div className="sm-bar">
                        <div
                          className="sm-fill"
                          style={{ width: '20%', background: '#EF4444' }}
                        />
                      </div>
                      <span className="sm-v">80-100%</span>
                    </div>
                  </div>
                </div>

                <div className="sm-card">
                  <div className="smc-head">
                    <span>Configuración General</span>
                  </div>

                  <div className="smc-body">
                    <div className="si-row">
                      <div className="si-info">
                        <span className="si-l">Bloqueo Automático</span>
                        <span className="si-d">
                          Bloquear TXN con riesgo &gt;{' '}
                          {cfg.autoBlockThreshold}%
                        </span>
                      </div>

                      <label className="tgl">
                        <input
                          type="checkbox"
                          checked={cfg.autoBlock}
                          onChange={() => toggle('autoBlock')}
                        />
                        <span className="tgl-s" />
                      </label>
                    </div>

                    <div className="si-row">
                      <div className="si-info">
                        <span className="si-l">
                          Umbral de Auto-Bloqueo
                        </span>
                        <span className="si-d">
                          Porcentaje para bloquear automáticamente
                        </span>
                      </div>

                      <div className="si-range">
                        <input
                          type="range"
                          min="50"
                          max="100"
                          value={cfg.autoBlockThreshold}
                          onChange={event =>
                            setCfg(prev => ({
                              ...prev,
                              autoBlockThreshold: Number(event.target.value),
                            }))
                          }
                        />
                        <span>{cfg.autoBlockThreshold}%</span>
                      </div>
                    </div>

                    <div className="si-row">
                      <div className="si-info">
                        <span className="si-l">
                          Sensibilidad del Modelo
                        </span>
                        <span className="si-d">
                          Mayor sensibilidad = más alertas
                        </span>
                      </div>

                      <div className="si-range">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={cfg.sensitivity * 100}
                          onChange={event =>
                            setCfg(prev => ({
                              ...prev,
                              sensitivity: Number(event.target.value) / 100,
                            }))
                          }
                        />
                        <span>{Math.round(cfg.sensitivity * 100)}%</span>
                      </div>
                    </div>

                    <div className="si-row">
                      <div className="si-info">
                        <span className="si-l">
                          Análisis en Tiempo Real
                        </span>
                        <span className="si-d">
                          Procesar TXN en tiempo real
                        </span>
                      </div>

                      <label className="tgl">
                        <input
                          type="checkbox"
                          checked={cfg.realtimeAnalysis}
                          onChange={() => toggle('realtimeAnalysis')}
                        />
                        <span className="tgl-s" />
                      </label>
                    </div>

                    <div className="si-row">
                      <div className="si-info">
                        <span className="si-l">Estado LIVE</span>
                        <span className="si-d">
                          {isLive ? 'Activo' : 'Apagado'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="sp-section">
              <h3>
                <Bell size={16} /> Notificaciones y Reportes
              </h3>

              <div className="sn-grid">
                <div className="sn-card">
                  <div className="snc-head">
                    <span>Canales de Notificación</span>
                  </div>

                  <div className="snc-body">
                    {[
                      ['emailAlerts', 'Email', 'Alertas críticas por correo'],
                      ['smsAlerts', 'SMS', 'Alertas por mensaje de texto'],
                      ['pushAlerts', 'Push In-App', 'Notificaciones internas'],
                    ].map(([key, label, desc]) => (
                      <div key={key} className="si-row">
                        <div className="si-info">
                          <span className="si-l">{label}</span>
                          <span className="si-d">{desc}</span>
                        </div>

                        <label className="tgl">
                          <input
                            type="checkbox"
                            checked={cfg[key]}
                            onChange={() => toggle(key)}
                          />
                          <span className="tgl-s" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sn-card">
                  <div className="snc-head">
                    <span>Niveles de Alerta</span>
                  </div>

                  <div className="snc-body">
                    {[
                      ['criticalAlerts', 'Críticas', '#EF4444'],
                      ['highAlerts', 'Altas', '#F97316'],
                      ['mediumAlerts', 'Medias', '#FBBF24'],
                      ['lowAlerts', 'Bajas', '#34D399'],
                    ].map(([key, label, color]) => (
                      <div key={key} className="si-row">
                        <div className="si-info">
                          <span className="si-l" style={{ color }}>
                            {label}
                          </span>
                          <span className="si-d">
                            Activar notificaciones {label.toLowerCase()}
                          </span>
                        </div>

                        <label className="tgl">
                          <input
                            type="checkbox"
                            checked={cfg[key]}
                            onChange={() => toggle(key)}
                          />
                          <span className="tgl-s" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'roles' && canManageRoles && (
            <div className="sp-section">
              <h3>
                <Lock size={16} /> Roles y Permisos
              </h3>

              <p className="sp-desc">
                Configura qué secciones y acciones puede ver cada rol en el
                sistema.
              </p>

              <div className="sroles-grid">
                {ROLES.map(role => (
                  <div key={role.id} className="srole-card">
                    <div
                      className="src-header"
                      style={{ borderColor: role.color }}
                    >
                      <RIcon role={role.id} />

                      <div>
                        <span
                          className="src-name"
                          style={{ color: role.color }}
                        >
                          {role.label}
                        </span>

                        <span className="src-desc">{role.desc}</span>
                      </div>
                    </div>

                    <div className="src-perms">
                      {Object.entries(PERM_LABELS).map(([key, label]) => (
                        <div key={key} className="src-perm-row">
                          <span className="src-perm-lbl">{label}</span>

                          <label className="tgl">
                            <input
                              type="checkbox"
                              checked={permissions[role.id]?.[key] ?? false}
                              onChange={event =>
                                updateRolePerm(
                                  role.id,
                                  key,
                                  event.target.checked
                                )
                              }
                              disabled={role.id === 'superAdmin'}
                            />

                            <span className="tgl-s" />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="smo" onClick={() => setModal(false)}>
          <div className="smo-c" onClick={event => event.stopPropagation()}>
            <div className="smo-h">
              <h3>Nuevo Usuario</h3>

              <button className="smo-x" onClick={() => setModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="smo-b">
              <div className="sfg">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={nw.name}
                  onChange={event =>
                    setNw(prev => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="sfg">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="usuario@email.com"
                  value={nw.email}
                  onChange={event =>
                    setNw(prev => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="sfg">
                <label>Contraseña</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={nw.password}
                  onChange={event =>
                    setNw(prev => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="smo-row">
                <div className="sfg">
                  <label>Rol</label>
                  <select
                    value={nw.role}
                    onChange={event =>
                      setNw(prev => ({
                        ...prev,
                        role: event.target.value,
                      }))
                    }
                  >
                    {ROLES.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sfg">
                  <label>Banco</label>
                  <select disabled>
                    <option>
                      {banks?.length
                        ? 'Asignación pendiente'
                        : 'Sin bancos cargados'}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="smo-f">
              <button className="sbtn-can" onClick={() => setModal(false)}>
                Cancelar
              </button>

              <button className="sbtn-sav" onClick={addUser}>
                <Save size={13} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {pwModal && (
        <div className="smo" onClick={() => setPwModal(false)}>
          <div className="smo-c" onClick={event => event.stopPropagation()}>
            <div className="smo-h">
              <h3>
                <KeyRound size={15} /> Cambiar Contraseña
              </h3>

              <button className="smo-x" onClick={() => setPwModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="smo-b">
              <div className="sfg">
                <label>Contraseña actual</label>
                <input
                  type="password"
                  value={pwData.current}
                  onChange={event =>
                    setPwData(prev => ({
                      ...prev,
                      current: event.target.value,
                    }))
                  }
                  placeholder="••••••••"
                />
              </div>

              <div className="sfg">
                <label>Nueva contraseña</label>
                <input
                  type="password"
                  value={pwData.new}
                  onChange={event =>
                    setPwData(prev => ({
                      ...prev,
                      new: event.target.value,
                    }))
                  }
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="sfg">
                <label>Confirmar contraseña</label>
                <input
                  type="password"
                  value={pwData.confirm}
                  onChange={event =>
                    setPwData(prev => ({
                      ...prev,
                      confirm: event.target.value,
                    }))
                  }
                  placeholder="Repetir contraseña"
                />
              </div>
            </div>

            <div className="smo-f">
              <button
                className="sbtn-can"
                onClick={() => setPwModal(false)}
              >
                Cancelar
              </button>

              <button
                className="sbtn-sav"
                onClick={() => {
                  alert('Cambio de contraseña pendiente de conectar a la API');
                  setPwModal(false);
                }}
              >
                <Save size={13} /> Cambiar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}