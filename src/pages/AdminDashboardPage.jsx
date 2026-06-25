import { Link, useOutletContext } from 'react-router-dom';
import { Activity, AlertTriangle, Banknote, Bot, Database, ShieldCheck, UsersRound } from 'lucide-react';
import { useAuth, useDataStore, useTransactions } from '../store/Context';
import { resourceConfig } from '../data/initialDb';
import IntegrationStatus from '../components/IntegrationStatus';
import MetricCard from '../components/MetricCard';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { db, syncStatus } = useDataStore();
  const { stats } = useTransactions();
  const { externalSignal } = useOutletContext();

  const cards = [
    { icon: Activity, label: 'TXN en vivo', value: stats.total.toLocaleString('es-CO'), helper: `${stats.flagged} marcadas`, color: '#6366F1' },
    { icon: AlertTriangle, label: 'Fraude detectado', value: stats.fraudulent.toLocaleString('es-CO'), helper: `${stats.blocked} bloqueadas`, color: '#EF4444' },
    { icon: UsersRound, label: 'Usuarios DB', value: db.users.length, helper: 'CRUD activo', color: '#06B6D4' },
    { icon: Banknote, label: 'Bancos', value: db.banks.length, helper: 'conectados', color: '#F59E0B' },
    { icon: Bot, label: 'Modelos IA', value: db.models.length, helper: 'productivo/staging', color: '#10B981' },
    { icon: Database, label: 'Tablas CRUD', value: Object.keys(resourceConfig).length, helper: 'mínimo requerido: 8', color: '#8B5CF6' },
  ];

  return (
    <section className="dashboard-page dashboard-page--admin">
      <div className="token-panel">
        <div>
          <span><ShieldCheck size={15} /> Token generado para administrador</span>
          <h2>{user?.role} · {user?.email}</h2>
          <p>El token demo se guarda en el store de autenticación y viaja como Bearer Token en las llamadas al backend.</p>
        </div>
        <code>{user?.token}</code>
      </div>

      <div className="metric-grid">
        {cards.map(card => <MetricCard key={card.label} {...card} />)}
      </div>

      <IntegrationStatus externalSignal={externalSignal} syncStatus={syncStatus} />

      <div className="quick-grid">
        {Object.entries(resourceConfig).map(([key, config]) => (
          <Link key={key} to={config.route} className="quick-card">
            <span>{config.label}</span>
            <strong>{db[key]?.length || 0} registros</strong>
            <p>{config.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
