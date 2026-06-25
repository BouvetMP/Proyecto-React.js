import { useState } from 'react';
import { USERS, BANKS, DEVICES } from '../data/mockData';
import { useTransactions, useBank } from '../store/Context';
import { Mail, Building, Shield, Smartphone, Monitor, Clock, Activity, ChevronRight } from 'lucide-react';
import '../styles/Users.css';

const RC = { low:'#34D399', medium:'#FBBF24', high:'#F97316', critical:'#EF4444' };
const rLvl = r => r<30?'low':r<60?'medium':r<80?'high':'critical';
const roleMap = { admin:{label:'Administrador',color:'#6366F1',bg:'rgba(99,102,241,0.1)'}, analyst:{label:'Analista de Fraude',color:'#06B6D4',bg:'rgba(6,182,212,0.1)'}, operator:{label:'Operador',color:'#10B981',bg:'rgba(16,185,129,0.1)'} };

function isMobile(type) {
  return type.includes('iPhone') || type.includes('Galaxy') || type.includes('Pixel') || type.includes('Redmi') || type.includes('Edge') || type.includes('Huawei');
}

export default function Users() {
  const { transactions } = useTransactions();
  const { selectedBank } = useBank();
  const [expanded, setExpanded] = useState(null);
  const [view, setView] = useState('users');

  const bankF = selectedBank === 'all' ? transactions : transactions.filter(t => t.bank.id === selectedBank);
  const list = USERS.map(u => {
    const bank = BANKS.find(b => b.id === u.bank);
    const dev = DEVICES.find(d => d.id === u.device);
    const cnt = bankF.filter(t => t.bank.id === u.bank).length;
    return { ...u, bank, dev, cnt, lvl: rLvl(u.risk) };
  });
  const fl = selectedBank === 'all' ? list : list.filter(u => u.bank?.id === selectedBank);
  const act = fl.filter(u => u.status === 'active').length;

  return (
    <div className="up">
      <div className="up-h">
        <div><h2>Usuarios y Dispositivos</h2><p>{fl.length} usuarios · {act} activos · {fl.length - act} inactivos</p></div>
        <div className="up-tabs">
          <button className={`up-tab ${view === 'users' ? 'act' : ''}`} onClick={() => setView('users')}>Usuarios</button>
          <button className={`up-tab ${view === 'devices' ? 'act' : ''}`} onClick={() => setView('devices')}>Dispositivos</button>
        </div>
      </div>

      {view === 'devices' ? (
        <div className="dv-sec">
          <h3>Dispositivos Registrados</h3>
          <div className="dv-grid">
            {DEVICES.map(d => {
              const users = fl.filter(u => u.dev?.id === d.id);
              return (
                <div key={d.id} className="dv-card">
                  <div className="dv-h">
                    <span className="dv-ico">{d.icon}</span>
                    <div><h4>{d.type}</h4><span className="dv-os">{d.os}</span></div>
                  </div>
                  <div className="dv-body">
                    <div className="dv-r"><span>Marca</span><strong>{d.brand}</strong></div>
                    <div className="dv-r"><span>Usuarios</span><strong>{users.length}</strong></div>
                    <div className="dv-r"><span>Estado</span><strong style={{ color: '#34D399' }}>● Activo</strong></div>
                    {users.length > 0 && (
                      <div className="dv-ut">
                        {users.map(u => <span key={u.id} className="dv-utg">{u.name.split(' ').slice(0, 2).join(' ')}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="ug">
          {fl.map(u => {
            const ri = roleMap[u.role] || roleMap.operator;
            const isExp = expanded === u.id;
            return (
              <div key={u.id} className={`uc ${u.status === 'inactive' ? 'uc-inact' : ''}`}>
                <div className="uc-h" onClick={() => setExpanded(isExp ? null : u.id)}>
                  <div className="uc-av" style={{ background: u.bank?.color || '#6366F1', opacity: u.status === 'inactive' ? 0.5 : 1 }}>{u.avatar}</div>
                  <div className="uc-nm">
                    <h4>{u.name}</h4>
                    <span className="uc-role" style={{ color: ri.color, background: ri.bg }}>{ri.label}</span>
                  </div>
                  <span className={`usi ${u.status}`}></span>
                  <ChevronRight size={16} className={`exp-i ${isExp ? 'exp-act' : ''}`} />
                </div>
                {isExp && (
                  <div className="uc-exp">
                    <div className="ud"><Mail size={13} /><span>{u.email}</span></div>
                    <div className="ud"><Building size={13} /><span style={{ color: u.bank?.color }}>{u.bank?.name}</span></div>
                    <div className="ud"><Shield size={13} /><span>Riesgo</span><span className="rbadge" style={{ background: `${RC[u.lvl]}15`, color: RC[u.lvl] }}>{u.risk}%</span></div>
                    <div className="ud"><Activity size={13} /><span>TXN</span><strong>{u.cnt}</strong></div>
                    <div className="ud"><Clock size={13} /><span>Último acceso</span><strong>{new Date(u.lastLogin).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}</strong></div>
                    <div className="ud"><span>📍</span><span>Sucursal</span><strong>{u.branch}</strong></div>
                    {u.dev && (
                      <div className="uc-dev">
                        <span className="sl">Dispositivo</span>
                        <div className="dev-c">
                          <span className="dev-ic">{isMobile(u.dev.type) ? <Smartphone size={14} /> : <Monitor size={14} />}</span>
                          <div className="dev-i"><span className="dev-t">{u.dev.type}</span><span className="dev-o">{u.dev.os}</span></div>
                          <span className="dev-b">{u.dev.brand}</span>
                        </div>
                      </div>
                    )}
                    <div className="ur-bar"><div className="ur-fill" style={{ width: `${u.risk}%`, background: RC[u.lvl] }}></div></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
