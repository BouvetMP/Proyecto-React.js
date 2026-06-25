import { Link, useOutletContext } from 'react-router-dom';
import { Activity, AlertTriangle, Clock, CreditCard, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useAuth, useDataStore, useTransactions } from '../store/Context';
import IntegrationStatus from '../components/IntegrationStatus';
import MetricCard from '../components/MetricCard';

const fmtCOP = value => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const { list, syncStatus } = useDataStore();
  const { transactions } = useTransactions();
  const { externalSignal } = useOutletContext();
  const myTransactions = transactions.slice(0, 8);
  const risky = myTransactions.filter(t => t.alertLevel === 'critical' || t.alertLevel === 'high');
  const total = myTransactions.reduce((sum, t) => sum + t.amount, 0);
  const alerts = list('alerts').slice(0, 4);

  return (
    <section className="dashboard-page dashboard-page--client">
      <div className="client-welcome">
        <div>
          <span><LockKeyhole size={15} /> Acceso estándar con token por rol</span>
          <h2>Hola, {user?.name}</h2>
          <p>Este panel muestra una versión simplificada para cliente/usuario estándar sin permisos administrativos.</p>
        </div>
        <code>{user?.token?.slice(0, 72)}...</code>
      </div>

      <div className="metric-grid metric-grid--client">
        <MetricCard icon={CreditCard} label="Mis movimientos" value={myTransactions.length} helper="últimas operaciones" color="#6366F1" />
        <MetricCard icon={Activity} label="Monto revisado" value={fmtCOP(total)} helper="simulación demo" color="#06B6D4" />
        <MetricCard icon={AlertTriangle} label="Alertas" value={risky.length} helper="alto o crítico" color="#EF4444" />
        <MetricCard icon={ShieldCheck} label="Estado de seguridad" value="Activo" helper="2FA recomendado" color="#10B981" />
      </div>

      <div className="client-grid">
        <article className="panel-card">
          <h3><Clock size={17} /> Últimas transacciones</h3>
          <div className="mini-list">
            {myTransactions.map(t => (
              <div key={t.id} className="mini-row">
                <div><strong>{t.type}</strong><span>{t.location.city} · {t.channel}</span></div>
                <div><b>{fmtCOP(t.amount)}</b><em className={`risk-${t.alertLevel}`}>{t.riskScore}%</em></div>
              </div>
            ))}
          </div>
        </article>
        <article className="panel-card">
          <h3><AlertTriangle size={17} /> Alertas disponibles</h3>
          <div className="mini-list">
            {alerts.map(a => (
              <div key={a.id} className="mini-row">
                <div><strong>{a.title}</strong><span>{a.transactionId}</span></div>
                <em className={`risk-${a.severity}`}>{a.status}</em>
              </div>
            ))}
          </div>
          <Link className="panel-link" to="/monitor/mapa">Ver monitoreo en vivo</Link>
        </article>
      </div>

      <IntegrationStatus externalSignal={externalSignal} syncStatus={syncStatus} />
    </section>
  );
}
