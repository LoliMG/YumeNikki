import React from 'react';
import Card from 'react-bootstrap/Card';
import TagBadge from '../../../../components/TagBadge/TagBadge';
import { BookOpen, Flame, Tag } from 'lucide-react';
import './MonthSummaryCard.css';

const MonthSummaryCard = ({ summary, loading = false }) => {
  return (
    <Card className="month-summary-card shadow-sm border border-subtle rounded-4 h-100 mb-0 bg-surface">
      <Card.Body className="p-3 p-md-4 d-flex flex-column justify-content-between">
        <h3 className="font-serif text-light h5 mb-3 d-flex align-items-center gap-2">
          <span>Resumen de este mes</span>
        </h3>

        <div className="row g-2 g-md-3">
          {/* Total Sueños */}
          <div className="col-4">
            <div className="summary-item p-2 p-sm-3 rounded-3 bg-surface-2 border border-subtle d-flex flex-column justify-content-between h-100">
              <div className="d-flex align-items-center justify-content-between gap-1 mb-2">
                <span className="summary-item-label text-muted small fw-semibold text-truncate" title="Sueños registrados este mes">
                  Sueños
                </span>
                <div className="summary-icon-box text-info bg-info bg-opacity-10 flex-shrink-0">
                  <BookOpen size={15} aria-hidden="true" />
                </div>
              </div>
              <div className="d-flex align-items-baseline gap-1 mt-auto">
                <span className="summary-item-value text-light fw-bold font-sans">
                  {loading ? '—' : (summary?.dreamCount || 0)}
                </span>
                <span className="summary-item-unit text-muted small d-none d-sm-inline">
                  totales
                </span>
              </div>
            </div>
          </div>

          {/* Racha actual */}
          <div className="col-4">
            <div className="summary-item p-2 p-sm-3 rounded-3 bg-surface-2 border border-subtle d-flex flex-column justify-content-between h-100">
              <div className="d-flex align-items-center justify-content-between gap-1 mb-2">
                <span className="summary-item-label text-muted small fw-semibold text-truncate" title="Racha de días registrados">
                  Racha
                </span>
                <div className="summary-icon-box text-warning bg-warning bg-opacity-10 flex-shrink-0">
                  <Flame size={15} aria-hidden="true" />
                </div>
              </div>
              <div className="d-flex align-items-baseline gap-1 mt-auto">
                <span className="summary-item-value text-light fw-bold font-sans">
                  {loading ? '—' : (summary?.streak || 0)}
                </span>
                <span className="summary-item-unit text-muted small">
                  {summary?.streak === 1 ? 'día' : 'días'}
                </span>
              </div>
            </div>
          </div>

          {/* Etiqueta más frecuente */}
          <div className="col-4">
            <div className="summary-item p-2 p-sm-3 rounded-3 bg-surface-2 border border-subtle d-flex flex-column justify-content-between h-100">
              <div className="d-flex align-items-center justify-content-between gap-1 mb-2">
                <span className="summary-item-label text-muted small fw-semibold text-truncate" title="Etiqueta más frecuente">
                  Frecuente
                </span>
                <div className="summary-icon-box text-primary bg-primary bg-opacity-10 flex-shrink-0">
                  <Tag size={15} aria-hidden="true" />
                </div>
              </div>
              <div className="d-flex align-items-center gap-1 mt-auto overflow-hidden" style={{ minHeight: '1.75rem' }}>
                {loading ? (
                  <span className="text-muted small">—</span>
                ) : summary?.topTag ? (
                  <div className="d-flex align-items-center gap-1 text-truncate">
                    <TagBadge tag={summary.topTag} size="sm" />
                  </div>
                ) : (
                  <span className="text-muted small text-truncate">Ninguna</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MonthSummaryCard;
