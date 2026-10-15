import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import { BookOpen } from 'lucide-react';
import UIButton from '../../../../components/UI/UIButton/UIButton';

const DreamEmptyState = ({ hasActiveFilters, onClearFilters }) => {
  const navigate = useNavigate();

  return (
    <Card className="bg-surface border-subtle text-center py-5 shadow-sm rounded-4">
      <Card.Body className="d-flex flex-column align-items-center">
        <BookOpen size={40} className="text-muted opacity-50 mb-3" aria-hidden="true" />
        <h2 className="h5 text-light mb-1">
          {hasActiveFilters
            ? 'No se encontraron sueños con los filtros seleccionados'
            : 'Tu diario de sueños aún está en blanco'}
        </h2>
        <p className="text-muted small mb-3">
          {hasActiveFilters
            ? 'Prueba a modificar los términos de búsqueda o reiniciar los filtros.'
            : 'Empieza a anotar las visiones de tus noches para descubrir sus patrones.'}
        </p>
        {hasActiveFilters ? (
          <UIButton variant="secondary" size="sm" onClick={onClearFilters}>
            Limpiar filtros
          </UIButton>
        ) : (
          <UIButton variant="primary" onClick={() => navigate('/dreams/new')}>
            + Registrar mi primer sueño
          </UIButton>
        )}
      </Card.Body>
    </Card>
  );
};

export default DreamEmptyState;
