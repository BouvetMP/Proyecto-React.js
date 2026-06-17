import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/api';
import { Mail, Shield, Smartphone, Monitor, Clock, Activity, ChevronRight, RefreshCcw,} from 'lucide-react';
import '../styles/Users.css';

const ROLE_MAP = {
  superAdmin: {
    label: 'Super Administrador',
    color: '#E040FB',
    bg: 'rgba(224,64,251,0.1)',
  },
  admin: {
    label: 'Administrador',
    color: '#6366F1',
    bg: 'rgba(99,102,241,0.1)',
  },
  analyst: {
    label: 'Analista de Fraude',
    color: '#06B6D4',
    bg: 'rgba(6,182,212,0.1)',
  },
  operator: {
    label: 'Operador',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.1)',
  },
  auditor: {
    label: 'Auditor',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
  },
};

function isMobile(type = '') {
  const t = String(type).toLowerCase();

  return (
    t.includes('smartphone') ||
    t.includes('phone') ||
    t.includes('móvil') ||
    t.includes('movil') ||
    t.includes('tablet') ||
    t.includes('android') ||
    t.includes('ios') ||
    t.includes('iphone') ||
    t.includes('galaxy') ||
    t.includes('pixel') ||
    t.includes('redmi') ||
    t.includes('huawei')
  );
}

function formatDate(value) {
  if (!value) return 'Sin registro';

  try {
    return new Date(value).toLocaleString('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return 'Sin registro';
  }
}

export default function Users() {
  const [expanded, setExpanded] = useState(null);
  const [view, setView] = useState('users');

  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      setError('');

      const data = await apiFetch('/system-users?page=1&pageSize=300');

      setUsers(data.items || []);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      setError(err.message || 'Error cargando usuarios');
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadDevices = async () => {
    try {
      setLoadingDevices(true);

      const data = await apiFetch('/devices?page=1&pageSize=300');

      setDevices(data.items || []);
    } catch (err) {
      console.error('Error cargando dispositivos:', err);
      setDevices([]);
    } finally {
      setLoadingDevices(false);
    }
  };

  const reloadAll = async () => {
    await Promise.all([loadUsers(), loadDevices()]);
  };

  useEffect(() => {
    reloadAll();
  }, []);

  const activeUsers = useMemo(() => {
    return users.filter(user => user.status === 'active').length;
  }, [users]);

  const inactiveUsers = users.length - activeUsers;

  const usersByRole = useMemo(() => {
    return users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
  }, [users]);

  return (
    <div className="up">
      <div className="up-h">
        <div>
          <h2>Usuarios y Dispositivos</h2>
          <p>
            {users.length} usuarios · {activeUsers} activos · {inactiveUsers}{' '}
            inactivos
          </p>
        </div>

        <div className="up-tabs">
          <button
            className={`up-tab ${view === 'users' ? 'act' : ''}`}
            onClick={() => setView('users')}
          >
            Usuarios
          </button>

          <button
            className={`up-tab ${view === 'devices' ? 'act' : ''}`}
            onClick={() => setView('devices')}
          >
            Dispositivos
          </button>

          <button className="up-tab" onClick={reloadAll} title="Recargar">
            <RefreshCcw size={14} />
          </button>
        </div>
      </div>

      {error && <div className="login-err">{error}</div>}

      {view === 'devices' ? (
        <div className="dv-sec">
          <h3>Dispositivos Registrados</h3>

          {loadingDevices ? (
            <p>Cargando dispositivos...</p>
          ) : (
            <div className="dv-grid">
              {devices.map(device => (
                <div key={device.id} className="dv-card">
                  <div className="dv-h">
                    <span className="dv-ico">
                      {device.icon || (isMobile(device.type) ? '📱' : '💻')}
                    </span>

                    <div>
                      <h4>{device.type || 'Dispositivo'}</h4>
                      <span className="dv-os">
                        {device.os || 'Sistema no registrado'}
                      </span>
                    </div>
                  </div>

                  <div className="dv-body">
                    <div className="dv-r">
                      <span>Cliente</span>
                      <strong>{device.clientName || 'Sin cliente'}</strong>
                    </div>

                    <div className="dv-r">
                      <span>Navegador</span>
                      <strong>{device.browser || 'N/A'}</strong>
                    </div>

                    <div className="dv-r">
                      <span>Primer uso</span>
                      <strong>{formatDate(device.firstUsedAt)}</strong>
                    </div>

                    <div className="dv-r">
                      <span>Último uso</span>
                      <strong>{formatDate(device.lastUsedAt)}</strong>
                    </div>

                    <div className="dv-r">
                      <span>Estado</span>
                      <strong style={{ color: '#34D399' }}>● Activo</strong>
                    </div>

                    {device.uniqueIdentifier && (
                      <div className="dv-ut">
                        <span className="dv-utg">
                          {String(device.uniqueIdentifier).slice(0, 18)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="ug">
          {loadingUsers ? (
            <p>Cargando usuarios...</p>
          ) : (
            users.map(user => {
              const roleInfo = ROLE_MAP[user.role] || ROLE_MAP.operator;
              const isExpanded = expanded === user.id;

              return (
                <div
                  key={user.id}
                  className={`uc ${
                    user.status === 'inactive' ? 'uc-inact' : ''
                  }`}
                >
                  <div
                    className="uc-h"
                    onClick={() => setExpanded(isExpanded ? null : user.id)}
                  >
                    <div
                      className="uc-av"
                      style={{
                        background: roleInfo.color,
                        opacity: user.status === 'inactive' ? 0.5 : 1,
                      }}
                    >
                      {user.avatar || 'U'}
                    </div>

                    <div className="uc-nm">
                      <h4>{user.name}</h4>

                      <span
                        className="uc-role"
                        style={{
                          color: roleInfo.color,
                          background: roleInfo.bg,
                        }}
                      >
                        {roleInfo.label}
                      </span>
                    </div>

                    <span className={`usi ${user.status}`} />

                    <ChevronRight
                      size={16}
                      className={`exp-i ${isExpanded ? 'exp-act' : ''}`}
                    />
                  </div>

                  {isExpanded && (
                    <div className="uc-exp">
                      <div className="ud">
                        <Mail size={13} />
                        <span>{user.email}</span>
                      </div>

                      <div className="ud">
                        <Shield size={13} />
                        <span>Rol</span>
                        <strong style={{ color: roleInfo.color }}>
                          {roleInfo.label}
                        </strong>
                      </div>

                      <div className="ud">
                        <Activity size={13} />
                        <span>Usuarios con este rol</span>
                        <strong>{usersByRole[user.role] || 0}</strong>
                      </div>

                      <div className="ud">
                        <Clock size={13} />
                        <span>Último acceso</span>
                        <strong>{formatDate(user.lastLogin)}</strong>
                      </div>

                      <div className="ud">
                        <span>●</span>
                        <span>Estado</span>
                        <strong
                          style={{
                            color:
                              user.status === 'active' ? '#34D399' : '#EF4444',
                          }}
                        >
                          {user.status === 'active' ? 'Activo' : 'Inactivo'}
                        </strong>
                      </div>

                      <div className="uc-dev">
                        <span className="sl">Permisos activos</span>

                        <div className="dev-c">
                          <span className="dev-ic">
                            {isMobile(user.role) ? (
                              <Smartphone size={14} />
                            ) : (
                              <Monitor size={14} />
                            )}
                          </span>

                          <div className="dev-i">
                            <span className="dev-t">
                              {Object.entries(user.permissions || {})
                                .filter(([, value]) => value)
                                .map(([key]) => key)
                                .slice(0, 4)
                                .join(', ') || 'Sin permisos'}
                            </span>

                            <span className="dev-o">
                              {user.dbRole || user.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}