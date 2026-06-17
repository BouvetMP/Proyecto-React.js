import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useTransactions, useBank, useTheme } from '../store/Context';
import {
  Shield,
  AlertTriangle,
  Ban,
  Clock,
  DollarSign,
  Activity,
  Zap,
  Globe,
  Radio,
  Map,
} from 'lucide-react';
import Globe3D from 'react-globe.gl';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/Dashboard.css';

const RC = {
  low: '#30D158',
  medium: '#FFD60A',
  high: '#FF9F0A',
  critical: '#FF453A',
};

const ALERT_LABELS = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
  critical: 'Crítico',
};

const fmt = value => {
  const n = Number(value || 0);

  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(n);
};

const altToZoom = altitude => {
  return Math.round(
    Math.max(3, Math.min(18, -Math.log2(Math.max(altitude, 0.001)) + 4.7))
  );
};

function MapZoomTracker({ onZoomOut }) {
  useMapEvents({
    zoomend(event) {
      const map = event.target;
      const zoom = map.getZoom();

      if (zoom < 3) {
        const center = map.getCenter();

        onZoomOut({
          lat: center.lat,
          lng: center.lng,
        });
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
  const [dims, setDims] = useState({ w: 800, h: 600 });

  const globeRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const element = wrapRef.current;

    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setDims({
        w: entry.contentRect.width,
        h: entry.contentRect.height,
      });
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointOfView(
        {
          lat: 4.711,
          lng: -74.07,
          altitude: 1.8,
        },
        3000
      );
    }
  }, []);

  useEffect(() => {
    if (viewMode !== 'globe') return;

    const interval = setInterval(() => {
      try {
        const pov = globeRef.current?.pointOfView();

        if (pov && pov.altitude < 0.15) {
          setMapCenter([pov.lat, pov.lng]);
          setMapZoom(altToZoom(pov.altitude));
          setViewMode('map');
        }
      } catch {
        // Ignorar errores internos del globo
      }
    }, 400);

    return () => clearInterval(interval);
  }, [viewMode]);

  const handleMapZoomOut = useCallback(center => {
    setMapCenter([center.lat, center.lng]);
    setViewMode('globe');

    setTimeout(() => {
      if (globeRef.current) {
        globeRef.current.pointOfView(
          {
            lat: center.lat,
            lng: center.lng,
            altitude: 1.8,
          },
          1500
        );
      }
    }, 100);
  }, []);

  const toggleView = () => {
    if (viewMode === 'globe') {
      setViewMode('map');
      setMapCenter([10, -74]);
      setMapZoom(5);
      return;
    }

    setViewMode('globe');

    setTimeout(() => {
      if (globeRef.current) {
        globeRef.current.pointOfView(
          {
            lat: 10,
            lng: -74,
            altitude: 1.8,
          },
          1500
        );
      }
    }, 100);
  };

  const filteredTransactions = useMemo(() => {
    if (selectedBank === 'all') return transactions;

    return transactions.filter(transaction => {
      return transaction.bank?.id === selectedBank;
    });
  }, [transactions, selectedBank]);

  const dashboardStats = useMemo(() => {
    const total = filteredTransactions.length;

    const fraud = filteredTransactions.filter(item => item.isFraud).length;

    const blocked = filteredTransactions.filter(item => {
      return item.status === 'blocked';
    }).length;

    const avg =
      total > 0
        ? Math.round(
            filteredTransactions.reduce((sum, item) => {
              return sum + Number(item.processingTime || 0);
            }, 0) / total
          )
        : 0;

    const amount = filteredTransactions.reduce((sum, item) => {
      return sum + Number(item.amount || 0);
    }, 0);

    return {
      total,
      fraud,
      blocked,
      avg,
      amount,
    };
  }, [filteredTransactions]);

  const fraudPercentage =
    dashboardStats.total > 0
      ? ((dashboardStats.fraud / dashboardStats.total) * 100).toFixed(1)
      : '0.0';

  const riskDistribution = useMemo(() => {
    const distribution = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    filteredTransactions.forEach(transaction => {
      const level = transaction.alertLevel || 'low';

      if (distribution[level] !== undefined) {
        distribution[level]++;
      }
    });

    return distribution;
  }, [filteredTransactions]);

  const alerts = useMemo(() => {
    return filteredTransactions
      .filter(transaction => {
        return (
          transaction.alertLevel === 'critical' ||
          transaction.alertLevel === 'high'
        );
      })
      .slice(0, 100);
  }, [filteredTransactions]);

  const globePoints = useMemo(() => {
    return filteredTransactions
      .filter(transaction => {
        return (
          transaction.location?.lat !== null &&
          transaction.location?.lng !== null &&
          transaction.location?.lat !== undefined &&
          transaction.location?.lng !== undefined
        );
      })
      .slice(0, 80)
      .map(transaction => {
        const level = transaction.alertLevel || 'low';

        return {
          id: transaction.id,
          lat: Number(transaction.location.lat),
          lng: Number(transaction.location.lng),
          level,
          risk: transaction.riskScore ?? 0,
          city: transaction.location.city || 'Sin ciudad',
          bank: transaction.bank?.name || 'Sin banco',
          bankColor: transaction.bank?.color || '#6366F1',
          amount: transaction.amount,
          user: transaction.user,
          status: transaction.status,
          color: RC[level] || RC.low,
          size:
            level === 'critical'
              ? 0.45
              : level === 'high'
                ? 0.3
                : level === 'medium'
                  ? 0.2
                  : 0.12,
        };
      });
  }, [filteredTransactions]);

  const pointLabel = useCallback(data => {
    const levelLabel = ALERT_LABELS[data.level] || data.level;

    return `
      <div style="font-family:Inter,-apple-system,sans-serif;background:rgba(8,8,14,0.85);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px 18px;min-width:190px;box-shadow:0 16px 48px rgba(0,0,0,0.5);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <span style="font-size:12px;font-weight:700;color:#f5f5f7;font-family:SF Mono,monospace;">${data.id}</span>
          <span style="font-size:10px;font-weight:700;color:${data.color};background:${data.color}18;padding:3px 10px;border-radius:20px;">${levelLabel}</span>
        </div>

        <div style="display:flex;flex-direction:column;gap:5px;">
          <div style="display:flex;justify-content:space-between;font-size:12px;">
            <span style="color:rgba(255,255,255,0.35);">Ciudad</span>
            <span style="color:#f5f5f7;font-weight:600;">${data.city}</span>
          </div>

          <div style="display:flex;justify-content:space-between;font-size:12px;">
            <span style="color:rgba(255,255,255,0.35);">Banco</span>
            <span style="color:${data.bankColor};font-weight:600;">${data.bank}</span>
          </div>

          <div style="display:flex;justify-content:space-between;font-size:12px;">
            <span style="color:rgba(255,255,255,0.35);">Monto</span>
            <span style="color:#f5f5f7;font-weight:700;">${fmt(data.amount)}</span>
          </div>

          <div style="display:flex;justify-content:space-between;font-size:12px;">
            <span style="color:rgba(255,255,255,0.35);">Riesgo</span>
            <span style="color:${data.color};font-weight:800;">${data.risk}%</span>
          </div>

          <div style="display:flex;justify-content:space-between;font-size:12px;">
            <span style="color:rgba(255,255,255,0.35);">Estado</span>
            <span style="color:#f5f5f7;font-weight:600;">
              ${
                data.status === 'blocked'
                  ? '🚫 Bloqueada'
                  : data.status === 'flagged'
                    ? '⚠️ Marcada'
                    : '✅ Aprobada'
              }
            </span>
          </div>
        </div>
      </div>
    `;
  }, []);

  const mapTile =
    theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const mapPoints = useMemo(() => {
    return filteredTransactions
      .filter(transaction => {
        return (
          transaction.location?.lat !== null &&
          transaction.location?.lng !== null &&
          transaction.location?.lat !== undefined &&
          transaction.location?.lng !== undefined
        );
      })
      .slice(0, 150)
      .map(transaction => {
        const level = transaction.alertLevel || 'low';

        return {
          ...transaction,
          color: RC[level] || RC.low,
        };
      });
  }, [filteredTransactions]);

  return (
    <div className="dash">
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
            showAtmosphere
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
            autoRotate
            autoRotateSpeed={0.2}
            enableZoom
            enablePointerInteraction
            pointerEventsFilter={() => true}
            pointsMerge={false}
          />
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="dash-leaflet"
            zoomControl={false}
            attributionControl={false}
            minZoom={2}
            maxZoom={18}
          >
            <TileLayer url={mapTile} />

            <MapZoomTracker onZoomOut={handleMapZoomOut} />

            {mapPoints.map(transaction => {
              const color = transaction.color;
              const level = transaction.alertLevel || 'low';

              const radius =
                level === 'critical' ? 8 : level === 'high' ? 6 : 4;

              return (
                <CircleMarker
                  key={transaction.id}
                  center={[
                    Number(transaction.location.lat),
                    Number(transaction.location.lng),
                  ]}
                  radius={radius}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.7,
                    weight: 1.5,
                    opacity: 0.8,
                  }}
                >
                  <Popup>
                    <div className="dmpop">
                      <div
                        className="dmpop-h"
                        style={{ borderLeftColor: color }}
                      >
                        <strong>{transaction.id}</strong>
                        <span style={{ color }}>
                          {transaction.riskScore ?? 0}%
                        </span>
                      </div>

                      <div className="dmpop-b">
                        <div className="dmpr">
                          <span>Ciudad</span>
                          <strong>
                            {transaction.location?.city || 'Sin ciudad'}
                          </strong>
                        </div>

                        <div className="dmpr">
                          <span>Banco</span>
                          <strong
                            style={{
                              color: transaction.bank?.color || '#6366F1',
                            }}
                          >
                            {transaction.bank?.name || 'Sin banco'}
                          </strong>
                        </div>

                        <div className="dmpr">
                          <span>Monto</span>
                          <strong>{fmt(transaction.amount)}</strong>
                        </div>

                        <div className="dmpr">
                          <span>Usuario</span>
                          <strong>{transaction.user || 'Sin usuario'}</strong>
                        </div>

                        <div className="dmpr">
                          <span>Estado</span>
                          <strong style={{ color }}>
                            {transaction.status === 'blocked'
                              ? '🚫 Bloqueada'
                              : transaction.status === 'flagged'
                                ? '⚠️ Marcada'
                                : '✅ Aprobada'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        )}
      </div>

      <div className="dash-overlay">
        <div className="float-top">
          <div className="float-brand">
            <img src="/logo.png" alt="TriDa" className="float-logo" />

            <div>
              <h1>Panel de Control</h1>
              <p>Detección de Fraude con IA</p>
            </div>
          </div>

          <div className="float-controls">
            <button
              className="view-toggle"
              onClick={toggleView}
              title={viewMode === 'globe' ? 'Vista Mapa' : 'Vista Globo'}
            >
              {viewMode === 'globe' ? <Map size={16} /> : <Globe size={16} />}
              <span>{viewMode === 'globe' ? 'Mapa' : 'Globo'}</span>
            </button>

            {isLive && (
              <div className="live-pill">
                <Radio size={12} /> LIVE
              </div>
            )}

            <div className="float-clock">
              <Clock size={13} />
              {time.toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </div>
          </div>
        </div>

        <div className="float-stats">
          {[
            {
              icon: Activity,
              label: 'Transacciones',
              value: dashboardStats.total.toLocaleString(),
              color: '#6366F1',
            },
            {
              icon: DollarSign,
              label: 'Monto Total',
              value: fmt(dashboardStats.amount),
              color: '#818CF8',
            },
            {
              icon: AlertTriangle,
              label: 'Fraude',
              value: `${dashboardStats.fraud} (${fraudPercentage}%)`,
              color: '#FF453A',
            },
            {
              icon: Ban,
              label: 'Bloqueadas',
              value: dashboardStats.blocked.toString(),
              color: '#FF9F0A',
            },
            {
              icon: Shield,
              label: 'ML Precisión',
              value: '94.2%',
              color: '#30D158',
            },
            {
              icon: Zap,
              label: 'TXN/seg',
              value: isLive ? '~5' : '0',
              color: '#FFD60A',
            },
          ].map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div key={index} className="glass-stat">
                <div
                  className="gs-icon"
                  style={{
                    background: `${stat.color}18`,
                    color: stat.color,
                  }}
                >
                  <Icon size={16} strokeWidth={1.8} />
                </div>

                <div className="gs-info">
                  <span className="gs-val">{stat.value}</span>
                  <span className="gs-lbl">{stat.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="float-alerts">
          <div className="fa-header">
            <AlertTriangle size={15} />
            <span>Alertas Recientes</span>
            <span className="fa-count">{alerts.length}</span>
          </div>

          <div className="fa-list">
            {alerts.length === 0 ? (
              <div className="fa-empty">Sin alertas activas</div>
            ) : (
              alerts.map((transaction, index) => {
                const level = transaction.alertLevel || 'low';
                const color = RC[level] || RC.low;

                return (
                  <div
                    key={transaction.id}
                    className="fa-item"
                    style={{
                      animationDelay: `${index * 0.04}s`,
                    }}
                  >
                    <div
                      className="fa-dot"
                      style={{
                        background: color,
                        boxShadow: `0 0 8px ${color}50`,
                      }}
                    />

                    <div className="fa-body">
                      <div className="fa-r1">
                        <span className="fa-id">{transaction.id}</span>
                        <span className="fa-time">
                          {new Date(transaction.timestamp).toLocaleTimeString(
                            'es-CO'
                          )}
                        </span>
                      </div>

                      <div className="fa-r2">
                        <span>
                          {transaction.location?.city || 'Sin ciudad'}
                        </span>

                        <span
                          style={{
                            color: transaction.bank?.color || '#6366F1',
                          }}
                        >
                          {transaction.bank?.name || 'Sin banco'}
                        </span>
                      </div>

                      <div className="fa-r3">
                        <span className="fa-amt">
                          {fmt(transaction.amount)}
                        </span>

                        <span
                          className="fa-risk"
                          style={{
                            color,
                          }}
                        >
                          {transaction.riskScore ?? 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="float-risk">
          {Object.entries(riskDistribution).map(([level, value]) => {
            return (
              <div key={level} className="fr-item">
                <div
                  className="fr-ring"
                  style={{
                    borderColor: RC[level],
                  }}
                >
                  <span
                    style={{
                      color: RC[level],
                    }}
                  >
                    {value}
                  </span>
                </div>

                <span className="fr-label">
                  {ALERT_LABELS[level] || level}
                </span>
              </div>
            );
          })}
        </div>

        {viewMode === 'globe' && (
          <div className="float-hint">
            Scroll para zoom · Arrastra para rotar · Zoom in para ver calles
          </div>
        )}

        {viewMode === 'map' && (
          <div className="float-hint">Zoom out para volver al globo 3D</div>
        )}
      </div>
    </div>
  );
}