/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';

export default function CrudModal({ open, mode = 'create', config, item, onClose, onSave }) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (!open) return;
    const base = {};
    config.fields.forEach(field => {
      base[field.name] = item?.[field.name] ?? field.defaultValue ?? (field.type === 'number' ? 0 : field.type === 'color' ? '#6366F1' : '');
    });
    setForm(base);
  }, [open, item, config]);

  if (!open) return null;

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field.name]: field.type === 'number' ? Number(value) : value }));
  };

  const submit = (event) => {
    event.preventDefault();
    onSave({ ...item, ...form });
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="crud-modal" onMouseDown={event => event.stopPropagation()} role="dialog" aria-modal="true">
        <header className="crud-modal__header">
          <div>
            <span>{mode === 'edit' ? 'Modificar' : 'Crear'} {config.singular}</span>
            <h2>{config.label}</h2>
          </div>
          <button type="button" onClick={onClose} className="modal-close"><X size={18} /></button>
        </header>

        <form onSubmit={submit} className="crud-modal__form">
          {config.fields.map(field => (
            <label key={field.name} className="form-field">
              <span>{field.label}</span>
              {field.type === 'select' ? (
                <select value={form[field.name] ?? ''} required={field.required} onChange={event => update(field, event.target.value)}>
                  <option value="">Selecciona...</option>
                  {field.options.map(option => <option value={option} key={option}>{option}</option>)}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea value={form[field.name] ?? ''} required={field.required} onChange={event => update(field, event.target.value)} />
              ) : (
                <input type={field.type || 'text'} value={form[field.name] ?? ''} required={field.required} onChange={event => update(field, event.target.value)} />
              )}
            </label>
          ))}

          <footer className="crud-modal__footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary"><Save size={16} /> Guardar</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
