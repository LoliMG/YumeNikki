import React from 'react';
import Alert from 'react-bootstrap/Alert';
import UIModal from '../../../components/UI/UIModal/UIModal';
import UIButton from '../../../components/UI/UIButton/UIButton';
import { UIFormGroup, UIFormLabel, UIFormControl } from '../../../components/UI/UIForm/UIForm';
import TagBadge from '../../../components/TagBadge/TagBadge';

const PALETTE_COLORS = [
  '#f87171', // Rojo suave
  '#fb923c', // Naranja
  '#fbbf24', // Ámbar
  '#34d399', // Esmeralda
  '#38bdf8', // Celeste
  '#60a5fa', // Azul
  '#a78bfa', // Violeta
  '#c084fc', // Púrpura
  '#f472b6', // Rosa
  '#e8c987'  // Dorado lunar
];

const TagModal = ({
  isOpen,
  onClose,
  editingTag,
  tagForm,
  setTagForm,
  tagSaving,
  tagError,
  onSaveTag
}) => {
  return (
    <UIModal
      show={isOpen}
      onHide={onClose}
      title={editingTag ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
    >
      <form onSubmit={onSaveTag}>
        {tagError && <Alert variant="danger" className="mb-3">{tagError}</Alert>}

        <UIFormGroup>
          <UIFormLabel htmlFor="tag-name">Nombre de la etiqueta</UIFormLabel>
          <UIFormControl
            id="tag-name"
            value={tagForm.name}
            onChange={(e) => setTagForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ej. Viaje temporal"
            required
          />
        </UIFormGroup>

        <UIFormGroup>
          <UIFormLabel htmlFor="tag-initials">Iniciales (máximo 6 caracteres)</UIFormLabel>
          <UIFormControl
            id="tag-initials"
            value={tagForm.initials}
            onChange={(e) => setTagForm(prev => ({ ...prev, initials: e.target.value.toUpperCase() }))}
            maxLength={6}
            placeholder="Ej. VT"
            required
          />
        </UIFormGroup>

        <UIFormGroup>
          <UIFormLabel>Color de la pastilla</UIFormLabel>
          <div className="d-flex flex-wrap gap-2 mb-2">
            {PALETTE_COLORS.map(c => (
              <button
                key={c}
                type="button"
                className={`color-picker-dot ${tagForm.color === c ? 'active' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setTagForm(prev => ({ ...prev, color: c }))}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
          <UIFormControl
            type="color"
            value={tagForm.color}
            onChange={(e) => setTagForm(prev => ({ ...prev, color: e.target.value }))}
            className="form-control-color w-100"
          />
        </UIFormGroup>

        {/* Previsualización en vivo */}
        <div className="my-3 p-2 rounded bg-dark border border-secondary text-center">
          <span className="small text-muted d-block mb-1">Vista previa:</span>
          <TagBadge
            tag={{
              name: tagForm.name || 'Ejemplo',
              initials: tagForm.initials || 'EJ',
              color: tagForm.color
            }}
            size="md"
          />
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <UIButton variant="secondary" onClick={onClose} disabled={tagSaving}>
            Cancelar
          </UIButton>
          <UIButton variant="primary" type="submit" disabled={tagSaving}>
            {tagSaving ? 'Guardando...' : (editingTag ? 'Guardar Cambios' : 'Crear Etiqueta')}
          </UIButton>
        </div>
      </form>
    </UIModal>
  );
};

export default TagModal;
