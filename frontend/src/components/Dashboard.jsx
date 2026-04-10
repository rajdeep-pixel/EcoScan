import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Dashboard({ reports }) {
  const total      = reports.length;
  const inProgress = reports.filter(r => r.status === 'in-progress').length;
  const cleaned    = reports.filter(r => r.status === 'cleaned').length;

  return (
    <header className="dashboard">
      <div className="dashboard__brand">
        <Trash2 size={20} color="#6366f1" />
        <span>Kernel</span>Panic
      </div>

      <div className="dashboard__stats">
        <div className="stat-card">
          <div className="stat-card__dot" style={{ background: '#ef4444' }} />
          <span>Reported</span>
          <span className="stat-card__num">{total}</span>
        </div>
        <div className="stat-card">
          <div className="stat-card__dot" style={{ background: '#f97316' }} />
          <span>In Progress</span>
          <span className="stat-card__num">{inProgress}</span>
        </div>
        <div className="stat-card">
          <div className="stat-card__dot" style={{ background: '#22c55e' }} />
          <span>Cleaned</span>
          <span className="stat-card__num">{cleaned}</span>
        </div>
      </div>
    </header>
  );
}
