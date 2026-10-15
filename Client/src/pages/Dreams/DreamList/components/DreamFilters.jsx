import React, { useState } from 'react';
import Card from 'react-bootstrap/Card';
import { Search, Filter, RotateCcw } from 'lucide-react';
import UIButton from '../../../../components/UI/UIButton/UIButton';
import { UIFormControl, UIFormLabel } from '../../../../components/UI/UIForm/UIForm';
import UIDropdown from '../../../../components/UI/UIDropdown/UIDropdown';

const DreamFilters = ({
  search,
  setSearch,
  selectedTagId,
  setSelectedTagId,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  character,
  setCharacter,
  place,
  setPlace,
  symbolism,
  setSymbolism,
  tags = [],
  onClearFilters,
  hasActiveFilters
}) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <Card className="bg-surface border-subtle mb-4 shadow-sm rounded-4">
      <Card.Body className="p-3">
        <div className="d-flex gap-2">
          <div className="input-group flex-grow-1">
            <span className="input-group-text bg-dark border-secondary text-muted">
              <Search size={16} aria-hidden="true" />
            </span>
            <UIFormControl
              placeholder="Buscar en títulos, relatos, notas, personajes, lugares o símbolos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <UIButton
            variant={showFilters || hasActiveFilters ? 'primary' : 'secondary'}
            onClick={() => setShowFilters(prev => !prev)}
            className="d-flex align-items-center gap-1 px-3"
            aria-expanded={showFilters}
          >
            <Filter size={16} aria-hidden="true" />
            <span className="d-none d-sm-inline">Filtros</span>
            {hasActiveFilters && <span className="badge bg-warning text-dark ms-1">•</span>}
          </UIButton>

          {hasActiveFilters && (
            <UIButton
              variant="secondary"
              onClick={onClearFilters}
              className="d-flex align-items-center gap-1 p-2"
              title="Limpiar filtros"
            >
              <RotateCcw size={16} aria-hidden="true" />
            </UIButton>
          )}
        </div>

        {/* Panel de filtros avanzados expandible */}
        {showFilters && (
          <div className="dream-advanced-filters mt-3 pt-3 border-top border-secondary">
            <div className="row g-3">
              {/* Filtro por etiqueta */}
              <div className="col-12 col-md-4">
                <UIFormLabel className="small mb-1">Filtrar por etiqueta</UIFormLabel>
                <UIDropdown
                  options={[
                    { value: '', label: 'Todas las etiquetas' },
                    ...tags.map(t => ({
                      value: String(t.id),
                      label: `${t.name} (${t.initials})`,
                      color: t.color
                    }))
                  ]}
                  value={selectedTagId}
                  onChange={(val) => setSelectedTagId(val)}
                  placeholder="Todas las etiquetas"
                  size="sm"
                />
              </div>

              {/* Filtro por rango de fechas */}
              <div className="col-12 col-md-4">
                <UIFormLabel className="small mb-1">Desde fecha</UIFormLabel>
                <UIFormControl
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  size="sm"
                />
              </div>

              <div className="col-12 col-md-4">
                <UIFormLabel className="small mb-1">Hasta fecha</UIFormLabel>
                <UIFormControl
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  size="sm"
                />
              </div>

              {/* Filtros específicos por elementos */}
              <div className="col-12 col-md-4">
                <UIFormLabel className="small mb-1">Personaje</UIFormLabel>
                <UIFormControl
                  placeholder="Ej. sombra, abuela..."
                  value={character}
                  onChange={(e) => setCharacter(e.target.value)}
                  size="sm"
                />
              </div>

              <div className="col-12 col-md-4">
                <UIFormLabel className="small mb-1">Lugar</UIFormLabel>
                <UIFormControl
                  placeholder="Ej. playa, laberinto..."
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  size="sm"
                />
              </div>

              <div className="col-12 col-md-4">
                <UIFormLabel className="small mb-1">Simbolismo</UIFormLabel>
                <UIFormControl
                  placeholder="Ej. reloj, agua, llaves..."
                  value={symbolism}
                  onChange={(e) => setSymbolism(e.target.value)}
                  size="sm"
                />
              </div>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default DreamFilters;
