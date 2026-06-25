import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useTheme } from '../store/Context';
import { SECURITY_QUESTIONS } from '../data/mockData';
import { Sun, Moon, Eye, EyeOff, KeyRound, ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import '../styles/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [mode, setMode] = useState('login'); // login | recover-step1 | recover-step2 | recover-step3
  const [secQ1, setSecQ1] = useState(0);
  const [secA1, setSecA1] = useState('');
  const [secQ2, setSecQ2] = useState(1);
  const [secA2, setSecA2] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [expectedCode, setExpectedCode] = useState('');
  const [newPw, setNewPw] = useState('');
  const [success, setSuccess] = useState('');
  const { login, verifySecurity, resetPassword } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const submit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 700));
    const res = login(email, password);
    if (!res.ok) setError(res.error);
    setLoading(false);
  };

  const fill = (e, p) => { setEmail(e); setPassword(p); };

  const handleRecoverStep1 = e => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Ingresa tu correo electrónico'); return; }
    setMode('recover-step2');
  };

  const handleRecoverStep2 = e => {
    e.preventDefault();
    setError('');
    const res = verifySecurity(email, secQ1, secA1, secQ2, secA2);
    if (res.ok) { setExpectedCode(res.code); setMode('recover-step3'); }
    else setError(res.error);
  };

  const handleRecoverStep3 = e => {
    e.preventDefault();
    setError('');
    if (verifyCode === expectedCode) {
      resetPassword(email, newPw);
      setSuccess('Contraseña actualizada exitosamente');
      setTimeout(() => { setMode('login'); setSuccess(''); setPassword(newPw); }, 2000);
    } else {
      setError('Código de verificación incorrecto');
    }
  };

  const goBack = () => { setMode('login'); setError(''); setSuccess(''); };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="orb o1"></div>
        <div className="orb o2"></div>
        <div className="orb o3"></div>
        <div className="grid-ov"></div>
      </div>
      <button className="login-theme-toggle" onClick={toggleTheme}>
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="login-container">
        <div className="login-card">

          {/* ── Login Form ── */}
          {mode === 'login' && (
            <>
              <div className="login-header">
                <img src="/logo.png" alt="TriDa" className="login-logo" />
                <h1>TriDa</h1>
                <p className="login-subtitle">Monitor de Transacciones con IA</p>
                <p className="login-tagline">Detección de Fraude en Tiempo Real</p>
              </div>
              <form onSubmit={submit}>
                <div className="fg">
                  <label>Correo electrónico</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@trida.co" required />
                </div>
                <div className="fg">
                  <label>Contraseña</label>
                  <div className="pw-wrap">
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="pw-input" />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {error && <div className="login-err">{error}</div>}
                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? <span className="spinner"></span> : 'Iniciar Sesión'}
                </button>
                <button type="button" className="recover-link" onClick={() => setMode('recover-step1')}>
                  <KeyRound size={14} /> ¿Olvidaste tu contraseña?
                </button>
              </form>
              <div className="login-demo">
                <p className="demo-title">Credenciales de prueba</p>
                <div className="demo-creds">
                  <div className="dc" onClick={() => fill('admin@trida.co', 'admin123')}>
                    <span className="dr" style={{ background: 'rgba(99,102,241,0.15)', color: '#818CF8' }}>Administrador</span>
                    <span>admin@trida.co / admin123</span>
                  </div>
                  <div className="dc" onClick={() => fill('analyst@trida.co', 'analyst123')}>
                    <span className="dr" style={{ background: 'rgba(6,182,212,0.15)', color: '#22D3EE' }}>Analyst</span>
                    <span>analyst@trida.co / analyst123</span>
                  </div>
                  <div className="dc" onClick={() => fill('operator@trida.co', 'operator123')}>
                    <span className="dr" style={{ background: 'rgba(16,185,129,0.15)', color: '#34D399' }}>Operator</span>
                    <span>operator@trida.co / operator123</span>
                  </div>
                  <div className="dc" onClick={() => fill('cliente@trida.co', 'cliente123')}>
                    <span className="dr" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>Cliente</span>
                    <span>cliente@trida.co / cliente123</span>
                  </div>
                </div>
                <p className="login-register-link">¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link></p>
              </div>
            </>
          )}

          {/* ── Recovery Step 1: Email ── */}
          {mode === 'recover-step1' && (
            <form onSubmit={handleRecoverStep1}>
              <button type="button" className="back-btn" onClick={goBack}><ArrowLeft size={16} /> Volver</button>
              <div className="login-header recovery-header">
                <KeyRound size={36} strokeWidth={1.5} color="#6366f1" />
                <h1>Recuperar Clave</h1>
                <p className="login-subtitle">Ingresa tu correo electrónico registrado</p>
              </div>
              <div className="fg">
                <label><Mail size={13} /> Correo electrónico</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@trida.co" required />
              </div>
              {error && <div className="login-err">{error}</div>}
              <button type="submit" className="login-btn">Continuar</button>
            </form>
          )}

          {/* ── Recovery Step 2: Security Questions ── */}
          {mode === 'recover-step2' && (
            <form onSubmit={handleRecoverStep2}>
              <button type="button" className="back-btn" onClick={() => { setMode('recover-step1'); setError(''); }}><ArrowLeft size={16} /> Volver</button>
              <div className="login-header recovery-header">
                <ShieldCheck size={36} strokeWidth={1.5} color="#6366f1" />
                <h1>Verificación de Seguridad</h1>
                <p className="login-subtitle">Responde tus preguntas de seguridad para {email}</p>
              </div>
              <div className="fg">
                <label>Pregunta de seguridad 1</label>
                <select value={secQ1} onChange={e => setSecQ1(+e.target.value)}>
                  {SECURITY_QUESTIONS.map((q, i) => <option key={i} value={i}>{q}</option>)}
                </select>
              </div>
              <div className="fg">
                <label>Respuesta 1</label>
                <input type="text" value={secA1} onChange={e => setSecA1(e.target.value)} placeholder="Tu respuesta" required />
              </div>
              <div className="fg">
                <label>Pregunta de seguridad 2</label>
                <select value={secQ2} onChange={e => setSecQ2(+e.target.value)}>
                  {SECURITY_QUESTIONS.map((q, i) => <option key={i} value={i}>{q}</option>)}
                </select>
              </div>
              <div className="fg">
                <label>Respuesta 2</label>
                <input type="text" value={secA2} onChange={e => setSecA2(e.target.value)} placeholder="Tu respuesta" required />
              </div>
              {error && <div className="login-err">{error}</div>}
              <button type="submit" className="login-btn">Verificar</button>
            </form>
          )}

          {/* ── Recovery Step 3: Code + New Password ── */}
          {mode === 'recover-step3' && (
            <form onSubmit={handleRecoverStep3}>
              <button type="button" className="back-btn" onClick={goBack}><ArrowLeft size={16} /> Volver al login</button>
              <div className="login-header recovery-header">
                <KeyRound size={36} strokeWidth={1.5} color="#30D158" />
                <h1>Nueva Contraseña</h1>
                <p className="login-subtitle">Código enviado a {email} (demo: {expectedCode})</p>
              </div>
              <div className="fg">
                <label>Código de verificación</label>
                <input type="text" value={verifyCode} onChange={e => setVerifyCode(e.target.value)} placeholder="000000" required maxLength={6} />
              </div>
              <div className="fg">
                <label>Nueva contraseña</label>
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} />
              </div>
              {error && <div className="login-err">{error}</div>}
              {success && <div className="login-success">{success}</div>}
              <button type="submit" className="login-btn" disabled={!!success}>Cambiar Contraseña</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
