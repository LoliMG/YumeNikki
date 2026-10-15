import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import UIButton from '../../../../components/UI/UIButton/UIButton';
import { UIFormControl } from '../../../../components/UI/UIForm/UIForm';
import TagBadge from '../../../../components/TagBadge/TagBadge';
import MoonBadge from '../../../../components/MoonBadge/MoonBadge';
import DeleteModal from '../../../../components/UI/DeleteModal/DeleteModal';
import { calculateMoonForDate } from '../../../../helpers/moonHelper';
import api from '../../../../helpers/api';
import { PlusCircle, Clock, FileText, Trash2, Edit3, Check, X, Moon, ChevronRight, Droplet } from 'lucide-react';
import './DayPanel.css';

const DayPanel = ({
  selectedDate,
  dreams = [],
  timezone = 'Europe/Madrid',
  isBleeding = false,
  trackCycle = false,
  onBleedingToggle,
  onDayNotesChange
}) => {
  const navigate = useNavigate();

  // Luna y signo de la fecha seleccionada
  const moonInfo = useMemo(() => {
    if (!selectedDate) return null;
    return calculateMoonForDate(selectedDate, timezone);
  }, [selectedDate, timezone]);

  // Formato legible de la fecha en español: Ej: "Lunes, 13 de octubre de 2026"
  const formattedDateTitle = useMemo(() => {
    if (!selectedDate) return '';
    try {
      const [year, month, day] = selectedDate.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // Formatear hora de creación de la nota en la zona horaria del usuario
  const formatNoteTime = (createdAt) => {
    if (!createdAt) return '';
    try {
      const d = new Date(createdAt);
      return new Intl.DateTimeFormat('es-ES', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit'
      }).format(d);
    } catch {
      return '';
    }
  };

  // Sueños de esta fecha ordenados por hora estática de menor a mayor
  const dayDreams = useMemo(() => {
    if (!dreams || !selectedDate) return [];
    return dreams
      .filter(d => {
        const dateStr = typeof d.dream_date === 'string' ? d.dream_date.split('T')[0] : d.dream_date;
        return dateStr === selectedDate;
      })
      .sort((a, b) => (a.dream_time || '00:00').localeCompare(b.dream_time || '00:00'));
  }, [dreams, selectedDate]);

  // Estado de Notas del día
  const [dayNotes, setDayNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteContent, setEditNoteContent] = useState('');
  const [deleteNoteId, setDeleteNoteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Cargar notas del día cuando cambia la fecha seleccionada
  useEffect(() => {
    if (!selectedDate) return;
    let isCancelled = false;

    const fetchNotes = async () => {
      setLoadingNotes(true);
      try {
        const res = await api.get(`/day-notes?date=${selectedDate}`);
        if (!isCancelled && res.notes) {
          setDayNotes(res.notes);
        }
      } catch (err) {
        console.error('Error al cargar notas del día:', err);
      } finally {
        if (!isCancelled) setLoadingNotes(false);
      }
    };

    fetchNotes();
    setIsAddingNote(false);
    setEditingNoteId(null);

    return () => {
      isCancelled = true;
    };
  }, [selectedDate]);

  // Crear nueva nota del día
  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim() || actionLoading) return;

    setActionLoading(true);
    try {
      const res = await api.post('/day-notes', {
        note_date: selectedDate,
        content: newNoteContent.trim()
      });
      if (res.note) {
        setDayNotes(prev => [res.note, ...prev]);
        setNewNoteContent('');
        setIsAddingNote(false);
        if (onDayNotesChange) onDayNotesChange();
      }
    } catch (err) {
      console.error('Error al crear nota:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Guardar edición de nota
  const handleUpdateNote = async (id) => {
    if (!editNoteContent.trim() || actionLoading) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/day-notes/${id}`, {
        content: editNoteContent.trim()
      });
      if (res.note) {
        setDayNotes(prev => prev.map(n => (n.id === id ? res.note : n)));
        setEditingNoteId(null);
        setEditNoteContent('');
        if (onDayNotesChange) onDayNotesChange();
      }
    } catch (err) {
      console.error('Error al editar nota:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Confirmar y eliminar nota
  const handleDeleteNoteConfirm = async () => {
    if (!deleteNoteId || actionLoading) return;

    setActionLoading(true);
    try {
      await api.delete(`/day-notes/${deleteNoteId}`);
      setDayNotes(prev => prev.filter(n => n.id !== deleteNoteId));
      setDeleteNoteId(null);
      if (onDayNotesChange) onDayNotesChange();
    } catch (err) {
      console.error('Error al eliminar nota:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Alternar sangrado / menstruación en la fecha activa
  const [bleedingLoading, setBleedingLoading] = useState(false);
  const handleToggleBleeding = async () => {
    if (!selectedDate || bleedingLoading) return;
    setBleedingLoading(true);
    try {
      await api.post('/cycle/toggle-date', {
        date: selectedDate,
        isBleeding: !isBleeding
      });
      if (onBleedingToggle) onBleedingToggle();
      if (onDayNotesChange) onDayNotesChange();
    } catch (err) {
      console.error('Error al alternar sangrado:', err);
    } finally {
      setBleedingLoading(false);
    }
  };

  return (
    <Card className="day-panel-card h-100 mb-0 shadow-sm border border-subtle rounded-4 bg-surface">
      <Card.Body className="d-flex flex-column gap-3 p-3 p-md-4">
        {/* Cabecera del día */}
        <div className="border-bottom border-subtle pb-3">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="small text-muted text-capitalize fw-semibold">{formattedDateTitle}</span>
            {moonInfo && (
              <MoonBadge
                phaseName={moonInfo.phaseName}
                phaseEmoji={moonInfo.phaseEmoji}
                zodiacSign={moonInfo.zodiacSign}
                zodiacSymbol={moonInfo.zodiacSymbol}
                showText={true}
                size="sm"
              />
            )}
          </div>

          {trackCycle && (
            <div className="d-flex align-items-center justify-content-between my-2 p-2 rounded bg-black bg-opacity-25 border border-subtle">
              <div className="d-flex align-items-center gap-2">
                <Droplet
                  size={15}
                  className={isBleeding ? "text-danger" : "text-muted"}
                  fill={isBleeding ? "currentColor" : "none"}
                />
                <span className="small text-light">
                  {isBleeding ? 'Menstruación activa hoy' : 'Sin menstruación hoy'}
                </span>
              </div>
              <UIButton
                variant={isBleeding ? "danger" : "outline-secondary"}
                size="sm"
                className="py-1 px-2 small"
                onClick={handleToggleBleeding}
                disabled={bleedingLoading}
              >
                {isBleeding ? 'Quitar marca' : 'Marcar sangrado'}
              </UIButton>
            </div>
          )}

          <div className="d-flex align-items-center justify-content-between mt-2">
            <h2 className="day-panel-title h4 mb-0">Sueños de la Noche</h2>
            <UIButton
              variant="primary"
              size="sm"
              onClick={() => navigate(`/dreams/new?date=${selectedDate}`)}
              className="d-flex align-items-center gap-1"
            >
              <PlusCircle size={15} />
              <span>Registrar sueño</span>
            </UIButton>
          </div>
        </div>

        {/* Lista de sueños registrados */}
        <div>
          {dayDreams.length === 0 ? (
            <div className="text-center py-4">
              <Moon size={32} className="text-muted mb-2 opacity-50" />
              <p className="text-muted small mb-0">No registraste ningún sueño en esta fecha.</p>
              <UIButton
                variant="primary"
                size="sm"
                className="mt-3 d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold shadow-sm"
                onClick={() => navigate(`/dreams/new?date=${selectedDate}`)}
              >
                <PlusCircle size={15} />
                <span>Añadir sueño ahora</span>
              </UIButton>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {dayDreams.map(dream => {
                const tagObj = dream.tag_name ? {
                  name: dream.tag_name,
                  initials: dream.tag_initials,
                  color: dream.tag_color
                } : null;

                const displayTime = dream.dream_time ? dream.dream_time.substring(0, 5) : '08:00';

                return (
                  <div
                    key={dream.id}
                    className="day-panel-dream-item"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/dreams/${dream.id}`)}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <span className="small text-muted fw-semibold d-flex align-items-center gap-1">
                          <Clock size={12} />
                          {displayTime}
                        </span>
                        {tagObj && <TagBadge tag={tagObj} size="sm" />}
                      </div>
                      <ChevronRight size={16} className="text-muted" />
                    </div>

                    <h3 className="day-panel-dream-item-title h5">
                      {dream.title || 'Sueño sin título'}
                    </h3>

                    {dream.content && (
                      <p className="small text-muted mb-0 lh-sm">
                        {dream.content.length > 120
                          ? `${dream.content.substring(0, 120)}...`
                          : dream.content}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <hr className="border-secondary opacity-25 my-1" />

        {/* Sección de Notas del día */}
        <div>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center gap-2">
              <FileText size={16} className="text-warning" />
              <h3 className="h6 fw-bold text-light mb-0">Notas del Día</h3>
            </div>
            {!isAddingNote && (
              <UIButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsAddingNote(true);
                  setNewNoteContent('');
                }}
              >
                + Añadir nota
              </UIButton>
            )}
          </div>

          {/* Formulario para añadir nueva nota */}
          {isAddingNote && (
            <form onSubmit={handleCreateNote} className="mb-3 p-2 rounded bg-dark border border-secondary">
              <UIFormControl
                as="textarea"
                rows={2}
                placeholder="Anota sensaciones o sucesos del día..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                autoFocus
              />
              <div className="d-flex justify-content-end gap-2 mt-2">
                <UIButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddingNote(false)}
                  disabled={actionLoading}
                >
                  Cancelar
                </UIButton>
                <UIButton
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={!newNoteContent.trim() || actionLoading}
                >
                  Guardar nota
                </UIButton>
              </div>
            </form>
          )}

          {/* Listado de notas */}
          {loadingNotes ? (
            <p className="text-muted small py-2 m-0">Cargando notas...</p>
          ) : dayNotes.length === 0 && !isAddingNote ? (
            <p className="text-muted small py-2 m-0 fst-italic">
              Sin notas diurnas para esta fecha.
            </p>
          ) : (
            <div className="d-flex flex-column gap-2 mt-1">
              {dayNotes.map(note => (
                <div key={note.id} className="day-panel-note-item">
                  {editingNoteId === note.id ? (
                    <div>
                      <UIFormControl
                        as="textarea"
                        rows={2}
                        value={editNoteContent}
                        onChange={(e) => setEditNoteContent(e.target.value)}
                        autoFocus
                      />
                      <div className="d-flex justify-content-end gap-2 mt-2">
                        <UIButton
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingNoteId(null)}
                          disabled={actionLoading}
                        >
                          <X size={14} />
                        </UIButton>
                        <UIButton
                          variant="primary"
                          size="sm"
                          onClick={() => handleUpdateNote(note.id)}
                          disabled={!editNoteContent.trim() || actionLoading}
                        >
                          <Check size={14} />
                        </UIButton>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div className="d-flex align-items-start gap-2 flex-grow-1">
                        <FileText size={14} className="text-warning mt-1 flex-shrink-0 opacity-75" />
                        <div className="flex-grow-1">
                          <p className="day-panel-note-text m-0">{note.content}</p>
                          {note.created_at && (
                            <div className="d-flex align-items-center gap-1 text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                              <Clock size={11} className="opacity-75" />
                              <span>{formatNoteTime(note.created_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="d-flex gap-1 flex-shrink-0">
                        <UIButton
                          variant="secondary"
                          size="sm"
                          className="p-1"
                          onClick={() => {
                            setEditingNoteId(note.id);
                            setEditNoteContent(note.content);
                          }}
                          aria-label="Editar nota"
                        >
                          <Edit3 size={13} />
                        </UIButton>
                        <UIButton
                          variant="danger"
                          size="sm"
                          className="p-1"
                          onClick={() => setDeleteNoteId(note.id)}
                          aria-label="Eliminar nota"
                        >
                          <Trash2 size={13} />
                        </UIButton>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card.Body>

      {/* Modal de confirmación de eliminación de nota */}
      <DeleteModal
        isOpen={Boolean(deleteNoteId)}
        onClose={() => setDeleteNoteId(null)}
        onConfirm={handleDeleteNoteConfirm}
        onDelete={handleDeleteNoteConfirm}
        title="¿Eliminar nota del día?"
        message="Esta nota será eliminada permanentemente. ¿Deseas continuar?"
        isLoading={actionLoading}
      />
    </Card>
  );
};

export default DayPanel;
