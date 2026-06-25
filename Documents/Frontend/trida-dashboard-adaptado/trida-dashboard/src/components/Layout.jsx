import { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import TransactionMap from './TransactionMap';
import Transactions from './Transactions';
import Alerts from './Alerts';
import Users from './Users';
import Analytics from './Analytics';
import Settings from './Settings';
import { useTransactions } from '../store/Context';
import '../styles/Layout.css';

export default function Layout() {
  const [tab, setTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const { transactions } = useTransactions();
  const alertCount = transactions.filter(t => t.alertLevel === 'critical' || t.alertLevel === 'high').length;

  const pages = {
    dashboard: Dashboard,
    map: TransactionMap,
    transactions: Transactions,
    alerts: Alerts,
    users: Users,
    analytics: Analytics,
    settings: Settings,
  };
  const Page = pages[tab] || Dashboard;

  return (
    <div className="app-layout">
      <Sidebar activeTab={tab} onTabChange={setTab} alertCount={alertCount} collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className={`main-content ${collapsed ? 'mc-collapsed' : ''}`}>
        <Page />
      </main>
    </div>
  );
}
