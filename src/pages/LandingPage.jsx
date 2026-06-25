import { Link } from 'react-router-dom';
import { Activity, Bot, DatabaseZap, LockKeyhole, ShieldCheck, UsersRound } from 'lucide-react';
import '../styles/Landing.css';

const features = [
  { icon: Activity, title: 'Monitoreo en tiempo real', text: 'TriDa analiza transacciones bancarias, riesgo, ciudad, canal y dispositivo.' },
  { icon: Bot, title: 'IA antifraude', text: 'Modelos predictivos y reglas detectan patrones anómalos antes de aprobar operaciones.' },
  { icon: DatabaseZap, title: 'CRUD + backend', text: 'El panel administra datos con store global y conexión preparada al backend del proyecto.' },
  { icon: LockKeyhole, title: 'Roles y token', text: 'Administrador, analista, operador y cliente reciben token demo por rol.' },
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <Link to="/" className="landing-brand"><img src="/logo.png" alt="TriDa" /> <span>TriDa</span></Link>
        <div>
          <Link to="/login">Login</Link>
          <Link to="/registro" className="landing-nav__cta">Registro</Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero__content">
          <span className="landing-kicker"><ShieldCheck size={16} /> Sistema de Monitoreo con IA</span>
          <h1>Detecta fraude transaccional antes de que afecte a tus clientes.</h1>
          <p>Aplicación React para bancos y fintechs: dashboard administrador, dashboard cliente, roles, token, rutas, store global, conexión API externa y servicios listos para backend.</p>
          <div className="landing-actions">
            <Link to="/login" className="btn-primary">Entrar al sistema</Link>
            <Link to="/registro" className="btn-secondary">Crear usuario</Link>
          </div>
          <div className="landing-demo-users">
            <UsersRound size={16} /> Demo: admin@trida.co / admin123 · analyst@trida.co / analyst123 · operator@trida.co / operator123
          </div>
        </div>
        <div className="landing-hero__visual">
          <img src="/logo.png" alt="TriDa logo" />
          <div className="risk-orbit orbit-a">94.2% precisión</div>
          <div className="risk-orbit orbit-b">Riesgo crítico</div>
          <div className="risk-orbit orbit-c">Token JWT demo</div>
        </div>
      </section>

      <section className="landing-features">
        {features.map(feature => {
          const Icon = feature.icon;
          return (
            <article key={feature.title}>
              <Icon size={22} />
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
