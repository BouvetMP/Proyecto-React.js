/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDataStore, useTransactions } from '../store/Context';
import { getExternalMarketSignal } from '../services/api';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/AppShell.css';
import '../styles/Crud.css';

const routeCopy = {
  '/admin': ['Dashboard administrador', 'Vista ejecutiva para monitorear fraude, roles, backend y datos críticos.'],
  '/cliente': ['Dashboard cliente', 'Resumen estándar con actividad, alertas y recomendaciones de seguridad.'],
  '/admin/usuarios': ['Gestión de usuarios', 'CRUD con modal para usuarios guardados en el store global.'],
  '/admin/transacciones': ['Gestión de transacciones', 'CRUD con modal para movimientos transaccionales del proyecto.'],
  '/admin/alertas': ['Gestión de alertas', 'CRUD con modal para casos detectados por IA.'],
  '/admin/bancos': ['Gestión de bancos', 'CRUD con modal para entidades financieras conectadas.'],
  '/admin/dispositivos': ['Gestión de dispositivos', 'CRUD con modal para dispositivos y reputación.'],
  '/admin/reglas': ['Gestión de reglas antifraude', 'CRUD con modal para reglas del motor de decisión.'],
  '/admin/modelos': ['Gestión de modelos IA', 'CRUD con modal para modelos predictivos.'],
  '/admin/auditoria': ['Auditoría', 'CRUD con modal para eventos de trazabilidad.'],
  '/monitor/mapa': ['Mapa mundi 3D', 'Globo mundial original con transacciones, alertas y cambio a mapa al hacer zoom.'],
  '/monitor/mapa-2d': ['Mapa 2D en vivo', 'Geolocalización de transacciones y riesgos en tiempo real.'],
  '/monitor/analiticas': ['Analíticas', 'Indicadores y tendencias del sistema TriDa.'],
  '/monitor/configuracion': ['Configuración', 'Ajustes de seguridad, permisos y modelo IA.'],
};

export default function AppShell() {
  const location = useLocation();
  const { transactions } = useTransactions();
  const { syncStatus } = useDataStore();
  const [externalSignal, setExternalSignal] = useState(null);

  const alertCount = useMemo(() => transactions.filter(t => t.alertLevel === 'critical' || t.alertLevel === 'high').length, [transactions]);
  const [title, subtitle] = routeCopy[location.pathname] || ['TriDa', 'Sistema de monitoreo de transacciones con IA'];

  const refreshIntegrations = async () => {
    const signal = await getExternalMarketSignal();
    setExternalSignal(signal);
  };

  useEffect(() => {
    refreshIntegrations();
  }, []);

  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-shell__body">
        <Header title={title} subtitle={subtitle} alertCount={alertCount} onRefresh={refreshIntegrations} syncStatus={syncStatus} />
        <main className="route-content">
          <Outlet context={{ externalSignal, refreshIntegrations }} />
        </main>
        <Footer />
      </div>
    </div>
  );
}
