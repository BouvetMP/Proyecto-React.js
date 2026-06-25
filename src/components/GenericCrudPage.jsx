import { useMemo, useState } from 'react';
import { Edit3, Plus, Search, Trash2 } from 'lucide-react';
import { useDataStore } from '../store/Context';
import CrudModal from './CrudModal';

const fmt = value => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'number') {
    if (value > 1000) return new Intl.NumberFormat('es-CO').format(value);
    return value.toString();
  }
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'object') return value.name || JSON.stringify(value);
  return String(value);
};

export default function GenericCrudPage({ resource, config }) {
  const { list, createItem, updateItem, deleteItem, syncStatus } = useDataStore();
  const rows = list(resource);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState({ open: false, mode: 'create', item: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(row => JSON.stringify(row).toLowerCase().includes(q));
  }, [rows, query]);

  const openCreate = () => setModal({ open: true, mode: 'create', item: null });
  const openEdit = (item) => setModal({ open: true, mode: 'edit', item });
  const closeModal = () => setModal({ open: false, mode: 'create', item: null });

  const save = async (payload) => {
    if (modal.mode === 'edit' && modal.item?.id) await updateItem(resource, modal.item.id, payload);
    else await createItem(resource, payload);
    closeModal();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteItem(resource, deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <section className="crud-page">
      <div className="crud-hero">
        <div>
          <span className="crud-hero__tag">Interfaz CRUD · Store global + backend</span>
          <h2>{config.label}</h2>
          <p>{config.description}</p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreate}><Plus size={16} /> Crear {config.singular}</button>
      </div>

      <div className="crud-toolbar">
        <label className="search-box">
          <Search size={16} />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder={`Buscar en ${config.label.toLowerCase()}...`} />
        </label>
        <div className={`sync-inline sync-inline--${syncStatus.backend}`}>
          <span /> {syncStatus.message}
        </div>
      </div>

      <div className="crud-table-wrap">
        <table className="crud-table">
          <thead>
            <tr>
              <th>ID</th>
              {config.columns.map(col => <th key={col}>{col}</th>)}
              <th>Actualizado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id}>
                <td><code>{item.id}</code></td>
                {config.columns.map(col => (
                  <td key={col}>
                    <span className={`cell-value cell-${col}`}>{fmt(item[col])}</span>
                  </td>
                ))}
                <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => openEdit(item)} className="btn-icon edit" title="Modificar con ventana emergente"><Edit3 size={15} /></button>
                    <button type="button" onClick={() => setDeleteTarget(item)} className="btn-icon danger" title="Eliminar con ventana emergente"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={config.columns.length + 3} className="empty-row">No hay datos para mostrar.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <CrudModal
        open={modal.open}
        mode={modal.mode}
        config={config}
        item={modal.item}
        onClose={closeModal}
        onSave={save}
      />

      {deleteTarget && (
        <div className="modal-backdrop" onMouseDown={() => setDeleteTarget(null)}>
          <section className="confirm-modal" onMouseDown={event => event.stopPropagation()} role="dialog" aria-modal="true">
            <h2>Eliminar {config.singular}</h2>
            <p>Esta acción eliminará <strong>{deleteTarget.id}</strong> del store global y enviará la solicitud DELETE al backend configurado.</p>
            <div className="confirm-modal__actions">
              <button type="button" className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button type="button" className="btn-danger" onClick={confirmDelete}><Trash2 size={15} /> Eliminar</button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
