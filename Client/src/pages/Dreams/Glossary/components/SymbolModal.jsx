import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Sparkles } from 'lucide-react';
import UIButton from '../../../../components/UI/UIButton/UIButton';
import { UIFormGroup, UIFormLabel, UIFormControl } from '../../../../components/UI/UIForm/UIForm';

const ARCHETYPE_SUGGESTIONS = [
  'Sombra',
  'Transformación',
  'Ánima / Ánimus',
  'Guía / Sabiduría',
  'Sanación',
  'Miedo / Bloqueo',
  'Renacimiento',
  'Portal / Umbral',
  'Elemento Sagrado'
];

const SymbolModal = ({ isOpen, onClose, editingSymbol, onSave, isSaving }) => {
  const [symbolName, setSymbolName] = useState('');
  const [archetype, setArchetype] = useState('');
  const [personalMeaning, setPersonalMeaning] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingSymbol) {
      setSymbolName(editingSymbol.symbol_name || '');
      setArchetype(editingSymbol.archetype || '');
      setPersonalMeaning(editingSymbol.personal_meaning || '');
    } else {
      setSymbolName('');
      setArchetype('');
      setPersonalMeaning('');
    }
    setError('');
  }, [editingSymbol, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symbolName.trim()) {
      setError('El nombre del símbolo es obligatorio.');
      return;
    }
    if (!personalMeaning.trim()) {
      setError('Escribe qué significa este símbolo para ti.');
      return;
    }

    try {
      await onSave({
        symbol_name: symbolName.trim(),
        archetype: archetype.trim() || null,
        personal_meaning: personalMeaning.trim()
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar el símbolo.');
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered contentClassName="bg-surface border border-subtle rounded-4 shadow-lg">
      <Modal.Header closeButton closeVariant="white" className="border-bottom border-subtle">
        <Modal.Title className="font-serif text-warning d-flex align-items-center gap-2 h5 m-0">
          <Sparkles size={18} />
          <span>{editingSymbol ? 'Editar Símbolo Onírico' : 'Nuevo Símbolo Onírico'}</span>
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body className="p-4 d-flex flex-column gap-3">
          {error && <div className="alert alert-danger py-2 small mb-0">{error}</div>}

          <UIFormGroup>
            <UIFormLabel htmlFor="symbolName" required>Símbolo o Imagen recurrente</UIFormLabel>
            <UIFormControl
              id="symbolName"
              placeholder="Ej. Agua cristalina, Llave dorada, Serpiente, Escalera..."
              value={symbolName}
              onChange={(e) => setSymbolName(e.target.value)}
              autoFocus
            />
          </UIFormGroup>

          <UIFormGroup>
            <UIFormLabel htmlFor="archetype">Arquetipo o Categoría (Opcional)</UIFormLabel>
            <UIFormControl
              id="archetype"
              placeholder="Ej. Sombra, Transformación, Guía..."
              value={archetype}
              onChange={(e) => setArchetype(e.target.value)}
            />
            {/* Sugerencias rápidas */}
            <div className="d-flex flex-wrap gap-1 mt-2">
              {ARCHETYPE_SUGGESTIONS.map(sug => (
                <button
                  key={sug}
                  type="button"
                  className={`badge border text-decoration-none py-1 px-2 ${archetype === sug ? 'bg-warning text-dark border-warning' : 'bg-surface-2 text-muted border-subtle'}`}
                  onClick={() => setArchetype(sug)}
                  style={{ cursor: 'pointer', fontSize: '0.7rem' }}
                >
                  {sug}
                </button>
              ))}
            </div>
          </UIFormGroup>

          <UIFormGroup>
            <UIFormLabel htmlFor="personalMeaning" required>Significado Íntimo y Personal</UIFormLabel>
            <textarea
              id="personalMeaning"
              rows={4}
              className="form-control bg-dark bg-opacity-50 border-subtle text-light"
              placeholder="¿Qué evoca este símbolo en tu vida real? ¿Cómo resuena en tu mente o en tus emociones cuando aparece en tus sueños?"
              value={personalMeaning}
              onChange={(e) => setPersonalMeaning(e.target.value)}
              required
            />
            <small className="text-muted" style={{ fontSize: '0.74rem' }}>
              Los símbolos oníricos son únicos para cada soñador; este significado es tu propia enciclopedia viva.
            </small>
          </UIFormGroup>
        </Modal.Body>
        <Modal.Footer className="border-top border-subtle">
          <UIButton variant="secondary" type="button" onClick={onClose} disabled={isSaving}>
            Cancelar
          </UIButton>
          <UIButton variant="primary" type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando...' : (editingSymbol ? 'Guardar Cambios' : 'Añadir al Glosario')}
          </UIButton>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default SymbolModal;
