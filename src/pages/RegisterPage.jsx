import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { getRoleHome, useAuth, useTheme } from '../store/Context';
import '../styles/Register.css';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({ name: '', email: '', password: '', city: '', securityAnswer: '', role: 'client' });
  const [error, setError] = useState('');

  if (user) return <Navigate to={getRoleHome(user.role)} replace />;

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    setError('');
    const result = register(form);
    if (!result.ok) setError(result.error);
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <Link to="/" className="register-back"><ArrowLeft size={16} /> Volver a landing</Link>
        <div className="register-head">
          <img src="/logo.png" alt="TriDa" />
          <div>
            <span><UserPlus size={15} /> Registro de usuario</span>
            <h1>Crear cuenta TriDa</h1>
            <p>El registro crea un usuario cliente por defecto y genera token demo de sesión.</p>
          </div>
        </div>

        <form onSubmit={submit} className="register-form">
          <label><span>Nombre completo</span><input value={form.name} onChange={e => update('name', e.target.value)} required placeholder="Ej: Daniela Pérez" /></label>
          <label><span>Correo</span><input type="email" value={form.email} onChange={e => update('email', e.target.value)} required placeholder="usuario@correo.com" /></label>
          <label><span>Contraseña</span><input type="password" minLength={6} value={form.password} onChange={e => update('password', e.target.value)} required placeholder="Mínimo 6 caracteres" /></label>
          <label><span>Ciudad</span><input value={form.city} onChange={e => update('city', e.target.value)} required placeholder="Bogotá" /></label>
          <label><span>Respuesta de seguridad</span><input value={form.securityAnswer} onChange={e => update('securityAnswer', e.target.value)} required placeholder="Tu respuesta" /></label>
          <label><span>Rol inicial</span><select value={form.role} onChange={e => update('role', e.target.value)}><option value="client">Cliente estándar</option><option value="operator">Operador demo</option><option value="analyst">Analista demo</option></select></label>
          {error && <div className="register-error">{error}</div>}
          <button className="btn-primary" type="submit">Registrarme</button>
        </form>
        <button type="button" className="theme-inline" onClick={toggleTheme}>Tema actual: {theme === 'dark' ? 'oscuro' : 'claro'}</button>
        <p className="register-login">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </div>
    </div>
  );
}
