import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useTransactions, useBank, useTheme } from '../store/Context';
import { BANKS, ALERT_LEVELS } from '../data/mockData';
import { Shield, AlertTriangle, Ban, Clock, DollarSign, Activity, Zap, Globe, Radio, Map } from 'lucide-react';
import Globe3D from 'react-globe.gl';
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/Dashboard.css';

const RC = { low: '#30D158', medium: '#FFD60A', high: '#FF9F0A', critical: '#FF453A' };
const fmt = n => { if(n>=1e9) return `$${(n/1e9).toFixed(1)}B`; if(n>=1e6) return `$${(n/1e6).toFixed(1)}M`; return new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0}).format(n); };
const altToZoom = a => Math.round(Math.max(3, Math.min(18, -Math.log2(Math.max(a, 0.001)) + 4.7)));

// Leaflet zoom tracker to auto-switch back to globe
function MapZoomTracker({ onZoomOut }) {
  useMapEvents({
    zoomend() {
      const z = this.getZoom();
      if (z < 3) {
        const c = this.getCenter();
        onZoomOut({ lat: c.lat, lng: c.lng });
      }
    },
  });
  return null;
}

export default function Dashboard() {
  const { transactions, isLive } = useTransactions();
  const { selectedBank } = useBank();
  const { theme } = useTheme();
  const [time, setTime] = useState(new Date());
  const [viewMode, setViewMode] = useState('globe');
  const [mapCenter, setMapCenter] = useState([10, -74]);
  const [mapZoom, setMapZoom] = useState(5);
  const globeRef = useRef();
  const wrapRef = useRef();
  const [dims, setDims] = useState({ w: 800, h: 600 });

  useEffect(() => { const iv = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(iv); }, []);

  // Responsive sizing
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setDims({ w: e.contentRect.width, h: e.contentRect.height }));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Initial globe POV — Colombia
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 4.711, lng: -74.07, altitude: 1.8 }, 3000);
    }
  }, []);

  // Auto-switch: globe → map when zoomed in
  useEffect(() => {
    if (viewMode !== 'globe') return;
    const iv = setInterval(() => {
      try {
        const pov = globeRef.current?.pointOfView();
        if (pov && pov.altitude < 0.15) {
          setMapCenter([pov.lat, pov.lng]);
          setMapZoom(altToZoom(pov.altitude));
          setViewMode('map');
        }
      } catch {
        // El globo puede no estar listo durante el primer render.
      }
    }, 400);
    return () => clearInterval(iv);
  }, [viewMode]);

  // Switch back from map to globe
  const handleMapZoomOut = useCallback((center) => {
    setMapCenter([center.lat, center.lng]);
    setViewMode('globe');
    setTimeout(() => {
      if (globeRef.current) {
        globeRef.current.pointOfView({ lat: center.lat, lng: center.lng, altitude: 1.8 }, 1500);
      }
    }, 100);
  }, []);

  // Manual toggle
  const toggleView = () => {
    if (viewMode === 'globe') {
      setViewMode('map');
      setMapCenter([10, -74]);
      setMapZoom(5);
    } else {
      setViewMode('globe');
      setTimeout(() => {
        if (globeRef.current) {
          globeRef.current.pointOfView({ lat: 10, lng: -74, altitude: 1.8 }, 1500);
        }
      }, 100);
    }
  };

  // Data
  const f = useMemo(() => selectedBank === 'all' ? transactions : transactions.filter(t => t.bank.id === selectedBank), [transactions, selectedBank]);
  const fs = useMemo(() => {
    const t = f.length, fr = f.filter(x => x.isFraud).length, bl = f.filter(x => x.status === 'blocked').length;
    const avg = t > 0 ? Math.round(f.reduce((s, x) => s + x.processingTime, 0) / t) : 0;
    const amt = f.reduce((s, x) => s + x.amount, 0);
    return { total: t, fraud: fr, blocked: bl, avg, amount: amt };
  }, [f]);
  const frp = fs.total > 0 ? ((fs.fraud / fs.total) * 100).toFixed(1) : '0.0';
  const rd = { low: 0, medium: 0, high: 0, critical: 0 };
  f.forEach(t => rd[t.alertLevel]++);
  const bc = {};
  BANKS.slice(1).forEach(b => bc[b.id] = 0);
  f.slice(0, 300).forEach(t => { if (bc[t.bank.id] !== undefined) bc[t.bank.id]++; });
  const alerts = f.filter(t => t.alertLevel === 'critical' || t.alertLevel === 'high').slice(0, 10);

  // Globe points
  const globePoints = useMemo(() => f.slice(0, 80).map(t => ({
    id: t.id, lat: t.location.lat, lng: t.location.lng,
    level: t.alertLevel, risk: t.riskScore,
    city: t.location.city, bank: t.bank.name, bankColor: t.bank.color,
    amount: t.amount, user: t.user, status: t.status,
    color: RC[t.alertLevel],
    size: t.alertLevel === 'critical' ? 0.45 : t.alertLevel === 'high' ? 0.3 : t.alertLevel === 'medium' ? 0.2 : 0.12,
  })), [f]);

  // Globe tooltip HTML
  const pointLabel = useCallback(d => {
    const lv = ALERT_LEVELS[d.level]?.label || d.level;
    return `<div style="font-family:Inter,-apple-system,sans-serif;background:rgba(8,8,14,0.85);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px 18px;min-width:190px;box-shadow:0 16px 48px rgba(0,0,0,0.5);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <span style="font-size:12px;font-weight:700;color:#f5f5f7;font-family:SF Mono,monospace;">${d.id}</span>
        <span style="font-size:10px;font-weight:700;color:${d.color};background:${d.color}18;padding:3px 10px;border-radius:20px;">${lv}</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:5px;">
        <div style="display:flex;justify-content:space-between;font-size:12px;"><span style="color:rgba(255,255,255,0.35);">Ciudad</span><span style="color:#f5f5f7;font-weight:600;">${d.city}</span></div>
        <div style="display:flex;justify-content:space-between;font-size:12px;"><span style="color:rgba(255,255,255,0.35);">Banco</span><span style="color:${d.bankColor};font-weight:600;">${d.bank}</span></div>
        <div style="display:flex;justify-content:space-between;font-size:12px;"><span style="color:rgba(255,255,255,0.35);">Monto</span><span style="color:#f5f5f7;font-weight:700;">${fmt(d.amount)}</span></div>
        <div style="display:flex;justify-content:space-between;font-size:12px;"><span style="color:rgba(255,255,255,0.35);">Riesgo</span><span style="color:${d.color};font-weight:800;">${d.risk}%</span></div>
        <div style="display:flex;justify-content:space-between;font-size:12px;"><span style="color:rgba(255,255,255,0.35);">Estado</span><span style="color:#f5f5f7;font-weight:600;">${d.status === 'blocked' ? '🚫 Bloqueada' : d.status === 'flagged' ? '⚠️ Marcada' : '✅ Aprobada'}</span></div>
      </div>
    </div>`;
  }, []);

  // Map tile URL
  const mapTile = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  // Map transaction points
  const mapPoints = useMemo(() => f.slice(0, 150).map(t => ({
    ...t, color: RC[t.alertLevel],
  })), [f]);

  return (
    <div className="dash">
      {/* ═══ Background Layer: Globe or Map ═══ */}
      <div className="dash-bg" ref={wrapRef}>
        {viewMode === 'globe' ? (
          <Globe3D
            ref={globeRef}
            width={dims.w}
            height={dims.h}
            backgroundColor="rgba(0,0,0,0)"
            globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
            bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
            showAtmosphere={true}
            atmosphereColor="#6366f1"
            atmosphereAltitude={0.18}
            atmosphereGlowRatio={0.12}
            pointsData={globePoints}
            pointLat="lat"
            pointLng="lng"
            pointColor="color"
            pointRadius="size"
            pointAltitude={0.01}
            pointLabel={pointLabel}
            autoRotate={true}
            autoRotateSpeed={0.2}
            enableZoom={true}
            enablePointerInteraction={true}
            pointerEventsFilter={() => true}
            pointsMerge={false}
          />
        ) : (
          <MapContainer center={mapCenter} zoom={mapZoom} className="dash-leaflet" zoomControl={false} attributionControl={false} minZoom={2} maxZoom={18}>
            <TileLayer url={mapTile} />
            <MapZoomTracker onZoomOut={handleMapZoomOut} />
            {mapPoints.map(t => {
              const c = RC[t.alertLevel];
              const r = t.alertLevel === 'critical' ? 8 : t.alertLevel === 'high' ? 6 : 4;
              return (
                <CircleMarker key={t.id} center={[t.location.lat, t.location.lng]} radius={r}
                  pathOptions={{ color: c, fillColor: c, fillOpacity: 0.7, weight: 1.5, opacity: 0.8 }}>
                  <Popup>
                    <div className="dmpop">
                      <div className="dmpop-h" style={{ borderLeftColor: c }}>
                        <strong>{t.id}</strong>
                        <span style={{ color: c }}>{t.riskScore}%</span>
                      </div>
                      <div className="dmpop-b">
                        <div className="dmpr"><span>Ciudad</span><strong>{t.location.city}</strong></div>
                        <div className="dmpr"><span>Banco</span><strong style={{ color: t.bank.color }}>{t.bank.name}</strong></div>
                        <div className="dmpr"><span>Monto</span><strong>{fmt(t.amount)}</strong></div>
                        <div className="dmpr"><span>Usuario</span><strong>{t.user}</strong></div>
                        <div className="dmpr"><span>Estado</span><strong style={{ color: c }}>{t.status === 'blocked' ? '🚫 Bloqueada' : t.status === 'flagged' ? '⚠️ Marcada' : '✅ Aprobada'}</strong></div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* ═══ Floating Glass Overlay ═══ */}
      <div className="dash-overlay">
        {/* Top Bar */}
        <div className="float-top">
          <div className="float-brand">
            <img src="/logo.png" alt="TriDa" className="float-logo" />
            <div>
              <h1>Panel de Control</h1>
              <p>Detección de Fraude con IA</p>
            </div>
          </div>
          <div className="float-controls">
            <button className="view-toggle" onClick={toggleView} title={viewMode === 'globe' ? 'Vista Mapa' : 'Vista Globo'}>
              {viewMode === 'globe' ? <Map size={16} /> : <Globe size={16} />}
              <span>{viewMode === 'globe' ? 'Mapa' : 'Globo'}</span>
            </button>
            {isLive && <div className="live-pill"><Radio size={12} /> LIVE</div>}
            <div className="float-clock">
              <Clock size={13} />
              {time.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="float-stats">
          {[
            { icon: Activity, label: 'Transacciones', value: fs.total.toLocaleString(), color: '#6366F1' },
            { icon: DollarSign, label: 'Monto Total', value: fmt(fs.amount), color: '#818CF8' },
            { icon: AlertTriangle, label: 'Fraude', value: `${fs.fraud} (${frp}%)`, color: '#FF453A' },
            { icon: Ban, label: 'Bloqueadas', value: fs.blocked.toString(), color: '#FF9F0A' },
            { icon: Shield, label: 'ML Precisión', value: '94.2%', color: '#30D158' },
            { icon: Zap, label: 'TXN/seg', value: isLive ? '~5' : '0', color: '#FFD60A' },
          ].map((s, i) => (
            <div key={i} className="glass-stat">
              <div className="gs-icon" style={{ background: `${s.color}18`, color: s.color }}>
                <s.icon size={16} strokeWidth={1.8} />
              </div>
              <div className="gs-info">
                <span className="gs-val">{s.value}</span>
                <span className="gs-lbl">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Alerts Panel */}
        <div className="float-alerts">
          <div className="fa-header">
            <AlertTriangle size={15} />
            <span>Alertas Recientes</span>
            <span className="fa-count">{alerts.length}</span>
          </div>
          <div className="fa-list">
            {alerts.length === 0 ? (
              <div className="fa-empty">Sin alertas activas</div>
            ) : alerts.map((t, i) => (
              <div key={t.id} className="fa-item" style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="fa-dot" style={{ background: RC[t.alertLevel], boxShadow: `0 0 8px ${RC[t.alertLevel]}50` }}></div>
                <div className="fa-body">
                  <div className="fa-r1">
                    <span className="fa-id">{t.id}</span>
                    <span className="fa-time">{new Date(t.timestamp).toLocaleTimeString('es-CO')}</span>
                  </div>
                  <div className="fa-r2">
                    <span>{t.location.city}</span>
                    <span style={{ color: t.bank.color }}>{t.bank.name}</span>
                  </div>
                  <div className="fa-r3">
                    <span className="fa-amt">{fmt(t.amount)}</span>
                    <span className="fa-risk" style={{ color: RC[t.alertLevel] }}>{t.riskScore}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Risk Summary */}
        <div className="float-risk">
          {Object.entries(rd).map(([k, v]) => {
            return (
              <div key={k} className="fr-item">
                <div className="fr-ring" style={{ borderColor: RC[k] }}>
                  <span style={{ color: RC[k] }}>{v}</span>
                </div>
                <span className="fr-label">{ALERT_LEVELS[k].label}</span>
              </div>
            );
          })}
        </div>

        {/* Globe hint (only in globe mode) */}
        {viewMode === 'globe' && (
          <div className="float-hint">
            Scroll para zoom · Arrastra para rotar · Zoom in para ver calles
          </div>
        )}
        {viewMode === 'map' && (
          <div className="float-hint">
            Zoom out para volver al globo 3D
          </div>
        )}
      </div>
    </div>
  );
}
