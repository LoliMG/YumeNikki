import React, { useMemo } from 'react';
import Card from 'react-bootstrap/Card';
import { Feather, Calendar, Clock, Tag } from 'lucide-react';
import { UIFormGroup, UIFormLabel, UIFormControl } from '../../../../components/UI/UIForm/UIForm';
import TagBadge from '../../../../components/TagBadge/TagBadge';
import UITooltip from '../../../../components/UI/UITooltip/UITooltip';

const MetadataSection = ({ formData, onChange, tags, onTagSelect }) => {
  // Etiquetas disponibles (excluye archivadas salvo si ya están seleccionadas en este sueño)
  const availableTags = useMemo(() => {
    return tags.filter(t => !t.is_archived || String(t.id) === String(formData.tag_id));
  }, [tags, formData.tag_id]);

  // Etiqueta actualmente seleccionada
  const selectedTag = useMemo(() => {
    return tags.find(t => String(t.id) === String(formData.tag_id)) || null;
  }, [tags, formData.tag_id]);

  return (
    <Card className="bg-surface border-subtle mb-4 shadow-sm rounded-4 overflow-hidden">
      <Card.Header className="bg-black bg-opacity-25 border-bottom border-subtle py-3 px-4 d-flex align-items-center gap-2">
        <Feather size={18} className="text-warning" />
        <h2 className="h5 font-serif text-light m-0">1. Metadatos de la Noche</h2>
      </Card.Header>
      <Card.Body className="p-3 p-md-4">
        <div className="row g-3">
          {/* Título */}
          <div className="col-12 col-md-6">
            <UIFormGroup className="mb-0">
              <UIFormLabel htmlFor="dream-title">Título del sueño</UIFormLabel>
              <UIFormControl
                id="dream-title"
                name="title"
                value={formData.title}
                onChange={onChange}
                placeholder="Ej. El faro bajo la lluvia de plata"
              />
            </UIFormGroup>
          </div>

          {/* Fecha nocturna */}
          <div className="col-12 col-sm-6 col-md-3">
            <UIFormGroup className="mb-0">
              <UIFormLabel htmlFor="dream-date" className="d-flex align-items-center gap-1">
                <Calendar size={14} />
                <span>Fecha nocturna</span>
              </UIFormLabel>
              <UIFormControl
                id="dream-date"
                type="date"
                name="dream_date"
                value={formData.dream_date}
                onChange={onChange}
                required
              />
              <small className="text-muted d-block mt-1">
                Luna calculada a las 03:00.
              </small>
            </UIFormGroup>
          </div>

          {/* Hora ESTÁTICA */}
          <div className="col-12 col-sm-6 col-md-3">
            <UIFormGroup className="mb-0">
              <UIFormLabel htmlFor="dream-time" className="d-flex align-items-center gap-1">
                <Clock size={14} />
                <span>Hora estática</span>
              </UIFormLabel>
              <UIFormControl
                id="dream-time"
                type="time"
                name="dream_time"
                value={formData.dream_time}
                onChange={onChange}
                required
              />
              <small className="text-muted d-block mt-1">
                Hora fija de registro.
              </small>
            </UIFormGroup>
          </div>

          {/* PANEL DE SELECCIÓN DE TIPO DE SUEÑO / ETIQUETA */}
          <div className="col-12 mt-3">
            <div className="dream-tag-panel p-3 rounded-3 border border-subtle">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2 pb-2 border-bottom border-subtle">
                <div className="d-flex align-items-center gap-2">
                  <Tag size={16} className="text-warning" />
                  <span className="fw-semibold text-light">Tipo de Sueño</span>
                  <span className="small text-muted d-none d-sm-inline">
                    — Selecciona una etiqueta para clasificar la naturaleza del sueño
                  </span>
                </div>
                {selectedTag ? (
                  <div className="d-flex align-items-center gap-1 small text-muted">
                    <span>Seleccionada:</span>
                    <TagBadge tag={selectedTag} size="sm" />
                  </div>
                ) : (
                  <span className="small text-muted fst-italic">Sin etiqueta asignada</span>
                )}
              </div>

              <div className="dream-tag-selector d-flex flex-wrap gap-2 pt-1">
                {/* Opción Sin Etiqueta */}
                <UITooltip text="Sin etiqueta asignada" placement="top">
                  <button
                    type="button"
                    className={`tag-select-btn ${!formData.tag_id ? 'tag-select-active' : ''}`}
                    onClick={() => onTagSelect('')}
                    aria-label="Sin etiqueta asignada"
                    title="Sin etiqueta asignada"
                  >
                    <span className="tag-select-circle text-muted">∅</span>
                    <span className="tag-select-initials">Ninguna</span>
                  </button>
                </UITooltip>

                {/* Lista de etiquetas disponibles */}
                {availableTags.map(t => {
                  const isSelected = String(t.id) === String(formData.tag_id);
                  const fullTitle = t.is_archived ? `${t.name} (Archivada)` : t.name;
                  return (
                    <UITooltip key={t.id} text={fullTitle} placement="top">
                      <button
                        type="button"
                        className={`tag-select-btn ${isSelected ? 'tag-select-active' : ''}`}
                        style={{
                          '--tag-btn-color': t.color || '#a78bfa'
                        }}
                        onClick={() => onTagSelect(String(t.id))}
                        aria-label={`Etiqueta: ${fullTitle}`}
                        title={fullTitle}
                      >
                        <span
                          className="tag-select-color-indicator"
                          style={{ backgroundColor: t.color || '#a78bfa' }}
                        />
                        <span className="tag-select-initials">{t.initials}</span>
                        {isSelected && <span className="tag-select-check ms-1">✓</span>}
                      </button>
                    </UITooltip>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MetadataSection;
