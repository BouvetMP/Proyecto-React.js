import { Bell, RefreshCcw, Shield, UserRound } from 'lucide-react';
import { useAuth } from '../store/Context';

const ROLE_LABELS = {
  superAdmin: 'Super Administrador',
  admin: 'Administrador',
  analyst: 'Analista',
  operator: 'Operador',
  client: 'Cliente estándar',
};

export default function Header({ title, subtitle, alertCount = 0, onRefresh, syncStatus }) {
  const { user } = useAuth();

  return (
    <header className="app-header">
      <div className="app-header__title">
        <span className="app-header__eyebrow"><Shield size={14} /> TriDa Fraud AI</span>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="app-header__actions">
        <div className={`sync-pill sync-pill--${syncStatus?.backend || 'pending'}`} title={syncStatus?.message}>
          <span />
          {syncStatus?.backend === 'connected' ? 'Backend conectado' : syncStatus?.backend === 'fallback' ? 'Modo local' : 'Conectando'}
        </div>
        <button className="icon-action" type="button" onClick={onRefresh} title="Refrescar API externa y estado backend">
          <RefreshCcw size={16} />
        </button>
        <div className="bell-pill" title="Alertas críticas">
          <Bell size={16} />
          <strong>{alertCount}</strong>
        </div>
        <div className="user-chip">
          <div className="user-chip__avatar"><UserRound size={16} /></div>
          <div>
            <strong>{user?.name || 'Usuario TriDa'}</strong>
            <span>{ROLE_LABELS[user?.role] || user?.role || 'Sin rol'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
