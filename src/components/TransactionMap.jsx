import { useEffect, useRef, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTransactions, useTheme, useBank } from '../store/Context';
import { ALERT_LEVELS } from '../data/mockData';
import '../styles/TransactionMap.css';

const RC = { low: '#30D158', medium: '#FFD60A', high: '#FF9F0A', critical: '#FF453A' };
const fmtCOP = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

function MapUpdater() { const m = useMap(); useEffect(() => { m.invalidateSize(); }, [m]); return null; }

function Pulse({ lat, lng, color, size }) {
  const map = useMap();
  const ref = useRef(null);
  useEffect(() => {
    if (!map) return;
    const icon = L.divIcon({
      className: 'pulse-m',
      html: `<div class="p-ring" style="--c:${color};--s:${size}px"><div class="p-inner"></div><div class="p-outer"></div></div>`,
      iconSize: [size * 2, size * 2], iconAnchor: [size, size],
    });
    const mk = L.marker([lat, lng], { icon, interactive: false }).addTo(map);
    ref.current = mk;
    const t = setTimeout(() => { map.removeLayer(mk); }, 3500);
    return () => { clearTimeout(t); if (ref.current) map.removeLayer(ref.current); };
  }, [map, lat, lng, color, size]);
  return null;
}

export default function TransactionMap() {
  const { transactions } = useTransactions();
  const { theme } = useTheme();
  const { selectedBank } = useBank();
  const [pulses, setPulses] = useState([]);
  const prevRef = useRef(0);

  const tile = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';

  const txns = useMemo(() => {
    let t = transactions;
    if (selectedBank !== 'all') t = t.filter(x => x.bank.id === selectedBank);
    return t.slice(0, 150);
  }, [transactions, selectedBank]);

  useEffect(() => {
    if (txns.length > prevRef.current) {
      const diff = txns.slice(0, txns.length - prevRef.current);
      const np = diff.slice(0, 6).map((t, i) => ({
        id: `${t.id}-p-${Date.now()}-${i}`, lat: t.location.lat, lng: t.location.lng,
        color: RC[t.alertLevel], size: t.alertLevel === 'critical' ? 24 : t.alertLevel === 'high' ? 18 : 14,
      }));
      setPulses(prev => [...np, ...prev].slice(0, 40));
    }
    prevRef.current = txns.length;
  }, [txns]);

  const st = useMemo(() => ({
    total: txns.length,
    crit: txns.filter(t => t.alertLevel === 'critical').length,
    high: txns.filter(t => t.alertLevel === 'high').length,
    app: txns.filter(t => t.status === 'approved').length,
    blk: txns.filter(t => t.status === 'blocked').length,
  }), [txns]);

  return (
    <div className="mp">
      <div className="mp-header">
        <div>
          <h1>Mapa Global</h1>
          <p>Transacciones en tiempo real alrededor del mundo</p>
        </div>
        <div className="mp-legend">
          {Object.entries(ALERT_LEVELS).map(([k, v]) => (
            <div key={k} className="mp-leg-item">
              <span className="mp-leg-dot" style={{ background: RC[k], boxShadow: `0 0 8px ${RC[k]}` }}></span>
              <span>{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mp-map">
        <MapContainer center={[10, -50]} zoom={3} className="lmap" zoomControl={false} attributionControl={false} minZoom={2} maxZoom={18}>
          <TileLayer url={tile} />
          <MapUpdater />
          {pulses.map(p => <Pulse key={p.id} lat={p.lat} lng={p.lng} color={p.color} size={p.size} />)}
          {txns.map(t => {
            const c = RC[t.alertLevel]; const recent = txns.indexOf(t) < 5;
            const r = t.alertLevel === 'critical' ? 8 : t.alertLevel === 'high' ? 5 : t.alertLevel === 'medium' ? 4 : 3;
            return (
              <CircleMarker key={t.id} center={[t.location.lat, t.location.lng]} radius={r}
                pathOptions={{ color: c, fillColor: c, fillOpacity: recent ? 0.9 : 0.5, weight: recent ? 2.5 : 1, opacity: recent ? 1 : 0.6 }}>
                <Popup>
                  <div className="mpop">
                    <div className="mpop-h" style={{ borderLeftColor: c }}><strong>{t.id}</strong><span style={{ color: c }}>{t.riskScore}%</span></div>
                    <div className="mpop-b">
                      <div className="mpr"><span>Usuario</span><strong>{t.user}</strong></div>
                      <div className="mpr"><span>Banco</span><strong style={{ color: t.bank.color }}>{t.bank.name}</strong></div>
                      <div className="mpr"><span>Tipo</span><strong>{t.type}</strong></div>
                      <div className="mpr"><span>Monto</span><strong>{fmtCOP(t.amount)}</strong></div>
                      <div className="mpr"><span>Ciudad</span><strong>{t.location.city}</strong></div>
                      <div className="mpr"><span>Canal</span><strong>{t.channel}</strong></div>
                      <div className="mpr"><span>Estado</span><strong style={{ color: c }}>{t.status === 'blocked' ? '🚫 Bloqueada' : t.status === 'flagged' ? '⚠️ Marcada' : '✅ Aprobada'}</strong></div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        <div className="mp-overlay-stats">
          <div className="mp-os"><span className="mp-os-v">{st.total}</span><span className="mp-os-l">Activas</span></div>
          <div className="mp-os"><span className="mp-os-v" style={{ color: '#FF453A' }}>{st.crit}</span><span className="mp-os-l">Críticas</span></div>
          <div className="mp-os"><span className="mp-os-v" style={{ color: '#FF9F0A' }}>{st.high}</span><span className="mp-os-l">Altas</span></div>
          <div className="mp-os"><span className="mp-os-v" style={{ color: '#30D158' }}>{st.app}</span><span className="mp-os-l">Aprobadas</span></div>
        </div>
      </div>
    </div>
  );
}
