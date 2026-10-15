import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import './UIPagination.css';

const UIPagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 12,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 15, 25]
}) => {
  if (totalPages <= 1 && totalItems <= (itemsPerPageOptions[0] || 10)) {
    return null;
  }

  // Generar lista inteligente de números de página
  const getPageNumbers = () => {
    const pages = [];
    const delta = 1; // Páginas a mostrar a cada lado de la actual

    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);

    if (left > 2) {
      pages.push('...');
    }

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < totalPages - 1) {
      pages.push('...');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="ui-pagination-container d-flex flex-wrap align-items-center justify-content-between gap-3 pt-3">
      {/* Resumen de elementos mostrados */}
      <div className="ui-pagination-summary text-muted small">
        Mostrando <span className="text-light fw-medium">{startItem} - {endItem}</span> de{' '}
        <span className="text-light fw-medium">{totalItems}</span> sueños
      </div>

      {/* Controles de navegación */}
      <nav aria-label="Navegación de páginas" className="d-flex align-items-center gap-1">
        {/* Ir a la primera página */}
        <button
          type="button"
          className="ui-pagination-btn ui-pagination-nav"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          title="Primera página"
          aria-label="Primera página"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Página anterior */}
        <button
          type="button"
          className="ui-pagination-btn ui-pagination-nav"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          title="Página anterior"
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Números de página */}
        <div className="d-flex align-items-center gap-1 mx-1">
          {getPageNumbers().map((item, idx) => {
            if (item === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="ui-pagination-ellipsis text-muted px-1">
                  …
                </span>
              );
            }

            const isCurrent = item === currentPage;
            return (
              <button
                key={`page-${item}`}
                type="button"
                className={`ui-pagination-btn ${isCurrent ? 'active' : ''}`}
                onClick={() => onPageChange(item)}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={`Página ${item}`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Página siguiente */}
        <button
          type="button"
          className="ui-pagination-btn ui-pagination-nav"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          title="Página siguiente"
          aria-label="Página siguiente"
        >
          <ChevronRight size={16} />
        </button>

        {/* Ir a la última página */}
        <button
          type="button"
          className="ui-pagination-btn ui-pagination-nav"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          title="Última página"
          aria-label="Última página"
        >
          <ChevronsRight size={16} />
        </button>
      </nav>

      {/* Selector de cantidad por página (opcional) */}
      {onItemsPerPageChange && (
        <div className="ui-pagination-limit d-flex align-items-center gap-2">
          <label htmlFor="items-per-page" className="text-muted small m-0">
            Por pág:
          </label>
          <select
            id="items-per-page"
            className="form-select form-select-sm ui-pagination-select"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          >
            {itemsPerPageOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default UIPagination;
