import { useState } from 'react';
import { useAuth, usePermissions } from '../store/Context';
import { ROLES, USERS, BANKS } from '../data/mockData';
import { UserPlus, Trash2, ShieldCheck, ShieldAlert, Shield, ShieldOff, Save, X, User, Brain, Bell, Lock, KeyRound, Phone, Mail, Camera, ToggleLeft, ToggleRight } from 'lucide-react';
import '../styles/Settings.css';

const PERM_LABELS = {
  dashboard: 'Dashboard', map: 'Mapa en Vivo', transactions: 'Transacciones',
  alerts: 'Alertas', users: 'Usuarios', analytics: 'Analíticas', settings: 'Configuración',
  export: 'Exportar', manageUsers: 'Gestionar Usuarios', manageRoles: 'Gestionar Roles',
  assignBanks: 'Asignar Bancos', manageModel: 'Configurar Modelo IA',
};

const TABS = [
  { id: 'profile', label: 'Mi Perfil', icon: User },
  { id: 'users', label: 'Usuarios', icon: UserPlus },
  { id: 'model', label: 'Modelo IA', icon: Brain },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'roles', label: 'Roles y Permisos', icon: Lock },
];

function RIcon({ role }) {
  const r = ROLES.find(x => x.id === role);
  if (role === 'superAdmin') return <ShieldCheck size={15} color={r?.color || '#E040FB'} />;
  if (role === 'admin') return <ShieldAlert size={15} color={r?.color || '#6366F1'} />;
  if (role === 'analyst') return <Shield size={15} color={r?.color || '#06B6D4'} />;
  return <ShieldOff size={15} color={r?.color || '#10B981'} />;
}

export default function Settings() {
  const { user } = useAuth();
  const { permissions, updateRolePerm, hasPerm } = usePermissions();
  const [tab, setTab] = useState('profile');
  const [cfg, setCfg] = useState({ notifications: true, autoBlock: true, riskThreshold: 80, emailAlerts: true, smsAlerts: false, pushAlerts: true, criticalAlerts: true, highAlerts: true, mediumAlerts: false, lowAlerts: false, sensitivity: 0.7, autoBlockThreshold: 90, whitelistEnabled: false, realtimeAnalysis: true });
  const [roleUsers, setRoleUsers] = useState(USERS);
  const [modal, setModal] = useState(false);
  const [nw, setNw] = useState({ name: '', email: '', role: 'operator', bank: 'bancolombia', status: 'active' });
  // Profile edit
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', phone: '+57 300 123 4567', twoFA: true });
  const [pwModal, setPwModal] = useState(false);
  const [pwData, setPwData] = useState({ current: '', new: '', confirm: '' });

  const toggle = k => setCfg(p => ({ ...p, [k]: !p[k] }));
  const toggleStatus = id => setRoleUsers(p => p.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
  const delUser = id => setRoleUsers(p => p.filter(u => u.id !== id));
  const changeRole = (id, r) => setRoleUsers(p => p.map(u => u.id === id ? { ...u, role: r } : u));
  const addUser = () => {
    if (!nw.name || !nw.email) return;
    const id = `u${Date.now()}`;
    const av = nw.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    setRoleUsers(p => [...p, { ...nw, id, avatar: av, risk: 0, txns: 0, device: 'd1', phone: '', twoFA: false, assignedBanks: [nw.bank] }]);
    setNw({ name: '', email: '', role: 'operator', bank: 'bancolombia', status: 'active' });
    setModal(false);
  };

  const canManageUsers = hasPerm(user?.role, 'manageUsers');
  const canManageRoles = hasPerm(user?.role, 'manageRoles');
  const canManageModel = hasPerm(user?.role, 'manageModel');
  const act = roleUsers.filter(u => u.status === 'active').length;

  return (
    <div className="sp">
      <div className="sp-h"><div><h2>Configuración</h2><p>Ajustes del sistema, perfil y permisos</p></div></div>

      <div className="sp-layout">
        {/* Tab Navigation */}
        <div className="sp-tabs">
          {TABS.map(t => {
            const Icon = t.icon;
            // Hide tabs based on permissions
            if (t.id === 'users' && !canManageUsers) return null;
            if (t.id === 'roles' && !canManageRoles) return null;
            if (t.id === 'model' && !canManageModel) return null;
            return (
              <button key={t.id} className={`sp-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                <Icon size={16} /> <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="sp-content">
          {/* ═══ MI PERFIL ═══ */}
          {tab === 'profile' && (
            <div className="sp-section">
              <h3><User size={16} /> Mi Perfil</h3>
              <div className="sprof-card">
                <div className="sprof-avatar-wrap">
                  <div className="sprof-avatar">{user?.avatar}</div>
                  <button className="sprof-cam" title="Cambiar foto"><Camera size={12} /></button>
                </div>
                <div className="sprof-info">
                  <span className="sprof-role-badge" style={{ background: `${ROLES.find(r=>r.id===user?.role)?.color || '#6366f1'}18`, color: ROLES.find(r=>r.id===user?.role)?.color || '#6366f1' }}>
                    {ROLES.find(r=>r.id===user?.role)?.label || user?.role}
                  </span>
                </div>
              </div>
              <div className="sprof-form">
                <div className="sfg"><label><User size={12} /> Nombre</label><input type="text" value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))} /></div>
                <div className="sfg"><label><Mail size={12} /> Email</label><input type="email" value={profile.email} onChange={e => setProfile(p => ({...p, email: e.target.value}))} /></div>
                <div className="sfg"><label><Phone size={12} /> Teléfono</label><input type="tel" value={profile.phone} onChange={e => setProfile(p => ({...p, phone: e.target.value}))} /></div>
                <div className="sfg-row">
                  <span className="sfg-lbl"><KeyRound size={12} /> Autenticación 2FA</span>
                  <label className="tgl"><input type="checkbox" checked={profile.twoFA} onChange={() => setProfile(p => ({...p, twoFA: !p.twoFA}))} /><span className="tgl-s"></span></label>
                </div>
                <button className="sprof-pw-btn" onClick={() => setPwModal(true)}><KeyRound size={14} /> Cambiar Contraseña</button>
                <button className="sprof-save"><Save size={14} /> Guardar Cambios</button>
              </div>
            </div>
          )}

          {/* ═══ USUARIOS ═══ */}
          {tab === 'users' && canManageUsers && (
            <div className="sp-section">
              <div className="srh">
                <h3><UserPlus size={16} /> Gestión de Usuarios</h3>
                <div className="srs"><span className="srst">{act} activos</span><span className="srst">{roleUsers.length} total</span></div>
                <button className="sadd-btn" onClick={() => setModal(true)}><UserPlus size={13} /> Nuevo Usuario</button>
              </div>
              <div className="srt-w"><table className="srt"><thead><tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Banco</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
                {roleUsers.map(u => {
                  const bank = BANKS.find(b => b.id === u.bank);
                  return (
                    <tr key={u.id} className={u.status === 'inactive' ? 'sri' : ''}>
                      <td><div className="st-u"><span className="st-av" style={{background: bank?.color || '#6366F1'}}>{u.avatar}</span><span>{u.name}</span></div></td>
                      <td>{u.email}</td>
                      <td><select className="srl-sel" value={u.role} onChange={e => changeRole(u.id, e.target.value)} style={{color: ROLES.find(r => r.id === u.role)?.color}}>
                        {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                      </select></td>
                      <td><span className="sbt-sm" style={{background: `${bank?.color}20`, color: bank?.color}}>{bank?.name || u.bank}</span></td>
                      <td><button className={`sst-tgl ${u.status}`} onClick={() => toggleStatus(u.id)}>{u.status === 'active' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}<span>{u.status === 'active' ? 'Activo' : 'Inactivo'}</span></button></td>
                      <td><button className="sdel-btn" onClick={() => delUser(u.id)}><Trash2 size={13} /></button></td>
                    </tr>
                  );
                })}
              </tbody></table></div>
            </div>
          )}

          {/* ═══ MODELO IA ═══ */}
          {tab === 'model' && canManageModel && (
            <div className="sp-section">
              <h3><Brain size={16} /> Configuración del Modelo de IA</h3>
              <div className="sm-grid">
                <div className="sm-card">
                  <div className="smc-head"><span>Umbrales de Riesgo</span></div>
                  <div className="smc-body">
                    <div className="sm-row"><div className="sm-info"><span className="sm-l">Nivel Bajo</span><span className="sm-d">Riesgo 0-27%</span></div><div className="sm-bar"><div className="sm-fill" style={{width:'28%',background:'#34D399'}}></div></div><span className="sm-v">0-27%</span></div>
                    <div className="sm-row"><div className="sm-info"><span className="sm-l">Nivel Medio</span><span className="sm-d">Riesgo 28-59%</span></div><div className="sm-bar"><div className="sm-fill" style={{width:'32%',background:'#FBBF24'}}></div></div><span className="sm-v">28-59%</span></div>
                    <div className="sm-row"><div className="sm-info"><span className="sm-l">Nivel Alto</span><span className="sm-d">Riesgo 60-79%</span></div><div className="sm-bar"><div className="sm-fill" style={{width:'20%',background:'#F97316'}}></div></div><span className="sm-v">60-79%</span></div>
                    <div className="sm-row"><div className="sm-info"><span className="sm-l">Nivel Crítico</span><span className="sm-d">Riesgo 80-100%</span></div><div className="sm-bar"><div className="sm-fill" style={{width:'20%',background:'#EF4444'}}></div></div><span className="sm-v">80-100%</span></div>
                  </div>
                </div>
                <div className="sm-card">
                  <div className="smc-head"><span>Configuración General</span></div>
                  <div className="smc-body">
                    <div className="si-row"><div className="si-info"><span className="si-l">Bloqueo Automático</span><span className="si-d">Bloquear TXN con riesgo {'>'} {cfg.autoBlockThreshold}%</span></div><label className="tgl"><input type="checkbox" checked={cfg.autoBlock} onChange={() => toggle('autoBlock')} /><span className="tgl-s"></span></label></div>
                    <div className="si-row"><div className="si-info"><span className="si-l">Umbral de Auto-Bloqueo</span><span className="si-d">Porcentaje para bloquear automáticamente</span></div><div className="si-range"><input type="range" min="50" max="100" value={cfg.autoBlockThreshold} onChange={e => setCfg(p => ({...p, autoBlockThreshold: +e.target.value}))} /><span>{cfg.autoBlockThreshold}%</span></div></div>
                    <div className="si-row"><div className="si-info"><span className="si-l">Sensibilidad del Modelo</span><span className="si-d">Mayor sensibilidad = más alertas</span></div><div className="si-range"><input type="range" min="0" max="100" value={cfg.sensitivity * 100} onChange={e => setCfg(p => ({...p, sensitivity: +e.target.value / 100}))} /><span>{Math.round(cfg.sensitivity * 100)}%</span></div></div>
                    <div className="si-row"><div className="si-info"><span className="si-l">Análisis en Tiempo Real</span><span className="si-d">Procesar TXN en tiempo real</span></div><label className="tgl"><input type="checkbox" checked={cfg.realtimeAnalysis} onChange={() => toggle('realtimeAnalysis')} /><span className="tgl-s"></span></label></div>
                    <div className="si-row"><div className="si-info"><span className="si-l">Whitelist</span><span className="si-d">Excluir usuarios/bancos de confianza</span></div><label className="tgl"><input type="checkbox" checked={cfg.whitelistEnabled} onChange={() => toggle('whitelistEnabled')} /><span className="tgl-s"></span></label></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ NOTIFICACIONES ═══ */}
          {tab === 'notifications' && (
            <div className="sp-section">
              <h3><Bell size={16} /> Notificaciones y Reportes</h3>
              <div className="sn-grid">
                <div className="sn-card">
                  <div className="snc-head"><span>Canales de Notificación</span></div>
                  <div className="snc-body">
                    <div className="si-row"><div className="si-info"><span className="si-l">Email</span><span className="si-d">Alertas críticas por correo electrónico</span></div><label className="tgl"><input type="checkbox" checked={cfg.emailAlerts} onChange={() => toggle('emailAlerts')} /><span className="tgl-s"></span></label></div>
                    <div className="si-row"><div className="si-info"><span className="si-l">SMS</span><span className="si-d">Alertas por mensaje de texto</span></div><label className="tgl"><input type="checkbox" checked={cfg.smsAlerts} onChange={() => toggle('smsAlerts')} /><span className="tgl-s"></span></label></div>
                    <div className="si-row"><div className="si-info"><span className="si-l">Push In-App</span><span className="si-d">Notificaciones en el dashboard</span></div><label className="tgl"><input type="checkbox" checked={cfg.pushAlerts} onChange={() => toggle('pushAlerts')} /><span className="tgl-s"></span></label></div>
                  </div>
                </div>
                <div className="sn-card">
                  <div className="snc-head"><span>Niveles de Alerta</span></div>
                  <div className="snc-body">
                    <div className="si-row"><div className="si-info"><span className="si-l" style={{color:'#EF4444'}}>Críticas</span><span className="si-d">Transacciones de alto riesgo</span></div><label className="tgl"><input type="checkbox" checked={cfg.criticalAlerts} onChange={() => toggle('criticalAlerts')} /><span className="tgl-s"></span></label></div>
                    <div className="si-row"><div className="si-info"><span className="si-l" style={{color:'#F97316'}}>Altas</span><span className="si-d">Transacciones sospechosas</span></div><label className="tgl"><input type="checkbox" checked={cfg.highAlerts} onChange={() => toggle('highAlerts')} /><span className="tgl-s"></span></label></div>
                    <div className="si-row"><div className="si-info"><span className="si-l" style={{color:'#FBBF24'}}>Medias</span><span className="si-d">Actividad inusual</span></div><label className="tgl"><input type="checkbox" checked={cfg.mediumAlerts} onChange={() => toggle('mediumAlerts')} /><span className="tgl-s"></span></label></div>
                    <div className="si-row"><div className="si-info"><span className="si-l" style={{color:'#34D399'}}>Bajas</span><span className="si-d">Transacciones normales</span></div><label className="tgl"><input type="checkbox" checked={cfg.lowAlerts} onChange={() => toggle('lowAlerts')} /><span className="tgl-s"></span></label></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ ROLES Y PERMISOS ═══ */}
          {tab === 'roles' && canManageRoles && (
            <div className="sp-section">
              <h3><Lock size={16} /> Roles y Permisos</h3>
              <p className="sp-desc">Configura qué secciones y acciones puede ver cada rol en el sistema.</p>
              <div className="sroles-grid">
                {ROLES.map(role => (
                  <div key={role.id} className="srole-card">
                    <div className="src-header" style={{ borderColor: role.color }}>
                      <RIcon role={role.id} />
                      <div>
                        <span className="src-name" style={{ color: role.color }}>{role.label}</span>
                        <span className="src-desc">{role.desc}</span>
                      </div>
                    </div>
                    <div className="src-perms">
                      {Object.entries(PERM_LABELS).map(([key, label]) => (
                        <div key={key} className="src-perm-row">
                          <span className="src-perm-lbl">{label}</span>
                          <label className="tgl">
                            <input type="checkbox"
                              checked={permissions[role.id]?.[key] ?? false}
                              onChange={e => updateRolePerm(role.id, key, e.target.checked)}
                              disabled={role.id === 'superAdmin'}
                            />
                            <span className="tgl-s"></span>
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

      {/* Add User Modal */}
      {modal && (
        <div className="smo" onClick={() => setModal(false)}>
          <div className="smo-c" onClick={e => e.stopPropagation()}>
            <div className="smo-h"><h3>Nuevo Usuario</h3><button className="smo-x" onClick={() => setModal(false)}><X size={16} /></button></div>
            <div className="smo-b">
              <div className="sfg"><label>Nombre Completo</label><input type="text" placeholder="Ej: Juan Pérez" value={nw.name} onChange={e => setNw(p => ({...p, name: e.target.value}))} /></div>
              <div className="sfg"><label>Email</label><input type="email" placeholder="usuario@email.com" value={nw.email} onChange={e => setNw(p => ({...p, email: e.target.value}))} /></div>
              <div className="smo-row">
                <div className="sfg"><label>Rol</label><select value={nw.role} onChange={e => setNw(p => ({...p, role: e.target.value}))}>{ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}</select></div>
                <div className="sfg"><label>Banco</label><select value={nw.bank} onChange={e => setNw(p => ({...p, bank: e.target.value}))}>{BANKS.slice(1).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
              </div>
            </div>
            <div className="smo-f"><button className="sbtn-can" onClick={() => setModal(false)}>Cancelar</button><button className="sbtn-sav" onClick={addUser}><Save size={13} /> Guardar</button></div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {pwModal && (
        <div className="smo" onClick={() => setPwModal(false)}>
          <div className="smo-c" onClick={e => e.stopPropagation()}>
            <div className="smo-h"><h3><KeyRound size={15} /> Cambiar Contraseña</h3><button className="smo-x" onClick={() => setPwModal(false)}><X size={16} /></button></div>
            <div className="smo-b">
              <div className="sfg"><label>Contraseña actual</label><input type="password" value={pwData.current} onChange={e => setPwData(p => ({...p, current: e.target.value}))} placeholder="••••••••" /></div>
              <div className="sfg"><label>Nueva contraseña</label><input type="password" value={pwData.new} onChange={e => setPwData(p => ({...p, new: e.target.value}))} placeholder="Mínimo 6 caracteres" /></div>
              <div className="sfg"><label>Confirmar contraseña</label><input type="password" value={pwData.confirm} onChange={e => setPwData(p => ({...p, confirm: e.target.value}))} placeholder="Repetir contraseña" /></div>
            </div>
            <div className="smo-f"><button className="sbtn-can" onClick={() => setPwModal(false)}>Cancelar</button><button className="sbtn-sav" onClick={() => { setPwModal(false); }}><Save size={13} /> Cambiar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
