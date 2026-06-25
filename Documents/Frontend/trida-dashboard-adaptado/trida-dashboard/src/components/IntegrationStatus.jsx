import { Cloud, DatabaseZap } from 'lucide-react';
import { BACKEND_URL, EXTERNAL_API_URL } from '../services/api';

export default function IntegrationStatus({ externalSignal, syncStatus }) {
  return (
    <section className="integration-grid">
      <article className="integration-card">
        <div className="integration-card__icon"><Cloud size={18} /></div>
        <div>
          <span>API externa</span>
          <strong>{externalSignal?.source || 'Coingecko API externa'}</strong>
          <p>{externalSignal?.data?.asset || 'BTC/COP'} · {externalSignal?.data?.rate || 'Consultando...'}</p>
          <small>{EXTERNAL_API_URL}</small>
        </div>
      </article>
      <article className="integration-card">
        <div className="integration-card__icon"><DatabaseZap size={18} /></div>
        <div>
          <span>Backend del proyecto</span>
          <strong>{syncStatus?.backend === 'connected' ? 'Conectado' : 'Fallback local funcional'}</strong>
          <p>{syncStatus?.message || 'Preparando sincronización...'}</p>
          <small>{BACKEND_URL}</small>
        </div>
      </article>
    </section>
  );
}
