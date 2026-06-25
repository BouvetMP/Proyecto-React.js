export default function MetricCard({ icon: Icon, label, value, helper, color = '#6366F1' }) {
  return (
    <article className="metric-card">
      <div className="metric-card__icon" style={{ color, background: `${color}18` }}>
        {Icon && <Icon size={20} />}
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {helper && <small>{helper}</small>}
      </div>
    </article>
  );
}
