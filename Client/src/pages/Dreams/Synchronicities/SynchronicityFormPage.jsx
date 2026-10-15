import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import { 
  Sparkles, 
  ArrowLeft, 
  Search, 
  Calendar, 
  Clock, 
  BookOpen, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import api from '../../../helpers/api';
import UIButton from '../../../components/UI/UIButton/UIButton';
import { UIFormGroup, UIFormLabel, UIFormControl } from '../../../components/UI/UIForm/UIForm';
import TagBadge from '../../../components/TagBadge/TagBadge';
import Loader from '../../../components/UI/Loader/Loader';
import './SynchronicityFormPage.css';

const SynchronicityFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const preselectedDreamId = searchParams.get('dreamId');

  const isEditing = Boolean(id);

  // Estados del formulario
  const [selectedDream, setSelectedDream] = useState(null);
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Estados de control
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Selector y buscador de sueños
  const [availableDreams, setAvailableDreams] = useState([]);
  const [dreamSearch, setDreamSearch] = useState('');
  const [filterLucidOnly, setFilterLucidOnly] = useState(false);
  const [selectedTagFilter, setSelectedTagFilter] = useState('');
  const [showDreamPicker, setShowDreamPicker] = useState(!preselectedDreamId && !isEditing);

  // Cargar datos iniciales: sueños y si está en edición, la sincronía
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Cargar lista completa de sueños del usuario
        const dreamsRes = await api.get('/dreams');
        const dreamsList = dreamsRes.dreams || [];
        setAvailableDreams(dreamsList);

        if (isEditing) {
          const syncRes = await api.get(`/synchronicities/${id}`);
          const sync = syncRes.synchronicity;
          if (sync) {
            setTitle(sync.title || '');
            setDescription(sync.description || '');
            if (sync.event_date) {
              setEventDate(sync.event_date.split('T')[0]);
            }
            // Encontrar el sueño vinculado
            const matchedDream = dreamsList.find(d => Number(d.id) === Number(sync.dream_id));
            if (matchedDream) {
              setSelectedDream(matchedDream);
            } else {
              setSelectedDream({
                id: sync.dream_id,
                title: sync.dream_title || 'Sueño vinculado',
                dream_date: sync.dream_date,
                content: sync.dream_content,
                tag_name: sync.tag_name,
                tag_color: sync.tag_color,
                tag_initials: sync.tag_initials,
                moon_phase_emoji: sync.moon_phase_emoji
              });
            }
            setShowDreamPicker(false);
          }
        } else if (preselectedDreamId) {
          const matchedDream = dreamsList.find(d => Number(d.id) === Number(preselectedDreamId));
          if (matchedDream) {
            setSelectedDream(matchedDream);
            setShowDreamPicker(false);
          } else {
            setShowDreamPicker(true);
          }
        } else {
          setShowDreamPicker(true);
        }
      } catch (err) {
        console.error('Error al cargar datos para sincronía:', err);
        setError('No se pudo cargar la información requerida. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditing, preselectedDreamId]);

  // Lista única de etiquetas para el filtro rápido
  const availableTags = useMemo(() => {
    const tagsMap = new Map();
    for (const d of availableDreams) {
      if (d.tag_id && d.tag_name) {
        tagsMap.set(d.tag_id, {
          id: d.tag_id,
          name: d.tag_name,
          color: d.tag_color,
          initials: d.tag_initials
        });
      }
    }
    return Array.from(tagsMap.values());
  }, [availableDreams]);

  // Filtrado reactivo de sueños
  const filteredDreams = useMemo(() => {
    let list = availableDreams;

    if (dreamSearch.trim()) {
      const q = dreamSearch.toLowerCase().trim();
      list = list.filter(d => 
        (d.title && d.title.toLowerCase().includes(q)) ||
        (d.content && d.content.toLowerCase().includes(q)) ||
        (d.dream_date && d.dream_date.includes(q)) ||
        (d.tag_name && d.tag_name.toLowerCase().includes(q))
      );
    }

    if (filterLucidOnly) {
      list = list.filter(d => Boolean(d.is_lucid));
    }

    if (selectedTagFilter) {
      list = list.filter(d => String(d.tag_id) === String(selectedTagFilter));
    }

    return list;
  }, [availableDreams, dreamSearch, filterLucidOnly, selectedTagFilter]);

  // Cálculo de diferencia de días entre el sueño y el evento en vigilia
  const daysDifferenceText = useMemo(() => {
    if (!selectedDream?.dream_date || !eventDate) return null;
    try {
      const dreamD = new Date(selectedDream.dream_date);
      const eventD = new Date(eventDate);
      const diffTime = eventD.getTime() - dreamD.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

      if (diffDays === 0) {
        return 'Ocurrió el mismo día del sueño';
      } else if (diffDays > 0) {
        return `Ocurrió ${diffDays} ${diffDays === 1 ? 'día' : 'días'} después del sueño`;
      } else {
        return `Ocurrió ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'día' : 'días'} antes del sueño`;
      }
    } catch {
      return null;
    }
  }, [selectedDream, eventDate]);

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDream) {
      setError('Por favor selecciona el sueño que originó o inspiró esta sincronía.');
      setShowDreamPicker(true);
      return;
    }
    if (!title.trim()) {
      setError('Por favor escribe un título descriptivo para la sincronía.');
      return;
    }
    if (!description.trim()) {
      setError('Por favor detalla qué ocurrió en tu vida cotidiana.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        dream_id: Number(selectedDream.id),
        event_date: eventDate,
        title: title.trim(),
        description: description.trim()
      };

      if (isEditing) {
        await api.put(`/synchronicities/${id}`, payload);
      } else {
        await api.post('/synchronicities', payload);
      }

      // Volver a la lista de sincronías o al sueño
      if (preselectedDreamId) {
        navigate(`/dreams/${preselectedDreamId}`);
      } else {
        navigate('/dreams/synchronicities');
      }
    } catch (err) {
      console.error('Error al guardar sincronía:', err);
      setError(err.message || 'Error al guardar la sincronía. Por favor revisa los datos.');
      setSaving(false);
    }
  };

  const handleSelectDream = (dream) => {
    setSelectedDream(dream);
    setShowDreamPicker(false);
    setError('');
  };

  if (loading) {
    return <Loader message="Cargando sincronía..." />;
  }

  return (
    <div className="sync-form-container py-4">
      {/* Botón Volver */}
      <div className="mb-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-link text-decoration-none text-muted p-0 d-inline-flex align-items-center gap-2 small hover-text-light"
        >
          <ArrowLeft size={16} />
          <span>Volver</span>
        </button>
      </div>

      <Card className="bg-surface border border-subtle rounded-4 shadow-lg overflow-hidden">
        {/* Cabecera */}
        <div className="p-4 border-bottom border-subtle bg-surface-2 bg-opacity-50">
          <div className="d-flex align-items-center gap-3">
            <div className="p-3 rounded-circle bg-warning bg-opacity-10 text-warning flex-shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="h4 font-serif text-light mb-1">
                {isEditing ? 'Editar Sincronía Onírica' : 'Registrar Sincronía en Vigilia'}
              </h1>
              <p className="text-muted small mb-0">
                Conecta las visiones de la noche con coincidencias, déjà vus o sucesos significativos en tu vida despierta.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card.Body className="p-4 d-flex flex-column gap-4">
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small rounded-3 m-0">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* SECCIÓN 1: SUEÑO ORIGEN */}
            <div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <UIFormLabel className="h6 mb-0 d-flex align-items-center gap-2" required>
                  <BookOpen size={16} className="text-warning" />
                  <span>1. Sueño Origen Vinculado</span>
                </UIFormLabel>
                {selectedDream && !showDreamPicker && (
                  <UIButton
                    variant="outline-secondary"
                    size="sm"
                    className="py-1 px-2 small"
                    onClick={() => setShowDreamPicker(true)}
                  >
                    Cambiar sueño
                  </UIButton>
                )}
              </div>

              {/* Sueño Seleccionado (Tarjeta de previsualización) */}
              {selectedDream && !showDreamPicker ? (
                <div className="sync-selected-dream-card p-3 rounded-3 position-relative">
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-2">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50 small">
                        Sueño #{selectedDream.id}
                      </span>
                      <span className="small text-muted d-flex align-items-center gap-1">
                        <Calendar size={13} />
                        {selectedDream.dream_date}
                      </span>
                      {selectedDream.moon_phase_emoji && (
                        <span title="Fase lunar">{selectedDream.moon_phase_emoji}</span>
                      )}
                      {selectedDream.tag_name && (
                        <TagBadge
                          name={selectedDream.tag_name}
                          color={selectedDream.tag_color}
                          initials={selectedDream.tag_initials}
                          size="sm"
                        />
                      )}
                      {selectedDream.is_lucid && (
                        <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-50 small">
                          Lúcido ✨
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="h6 font-serif text-light fw-bold mb-1">
                    {selectedDream.title || 'Sueño sin título'}
                  </h3>

                  {selectedDream.content && (
                    <p className="text-muted small mb-0 line-clamp-2">
                      {selectedDream.content}
                    </p>
                  )}
                </div>
              ) : null}

              {/* Panel de Búsqueda y Selección de Sueños */}
              {showDreamPicker && (
                <div className="sync-dream-picker-card p-3 rounded-3">
                  <div className="mb-3">
                    <span className="small text-muted d-block mb-2">
                      {availableDreams.length === 0
                        ? 'No tienes sueños registrados aún.'
                        : 'Busca y selecciona el sueño que resonó con este momento:'}
                    </span>

                    {/* Barra de búsqueda interactiva */}
                    <div className="input-group mb-2">
                      <span className="input-group-text bg-surface-2 border-subtle text-muted">
                        <Search size={16} />
                      </span>
                      <UIFormControl
                        placeholder="Buscar por título, relato, fecha (AAAA-MM-DD) o etiqueta..."
                        value={dreamSearch}
                        onChange={(e) => setDreamSearch(e.target.value)}
                        className="border-start-0"
                        autoFocus
                      />
                      {dreamSearch && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary border-subtle"
                          onClick={() => setDreamSearch('')}
                          title="Limpiar búsqueda"
                        >
                          <RotateCcw size={14} />
                        </button>
                      )}
                    </div>

                    {/* Filtros rápidos: Lúcido y Etiquetas */}
                    <div className="d-flex align-items-center gap-2 flex-wrap pt-1">
                      <button
                        type="button"
                        className={`badge border text-decoration-none py-1 px-2 ${
                          filterLucidOnly ? 'bg-primary text-white border-primary' : 'bg-surface-2 text-muted border-subtle'
                        }`}
                        onClick={() => setFilterLucidOnly(prev => !prev)}
                      >
                        ✨ Solo lúcidos
                      </button>

                      {availableTags.map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          className={`badge border text-decoration-none py-1 px-2 ${
                            selectedTagFilter === String(tag.id)
                              ? 'bg-warning text-dark border-warning'
                              : 'bg-surface-2 text-muted border-subtle'
                          }`}
                          onClick={() => setSelectedTagFilter(prev => prev === String(tag.id) ? '' : String(tag.id))}
                        >
                          <span
                            className="d-inline-block rounded-circle me-1"
                            style={{ width: 6, height: 6, backgroundColor: tag.color || '#a78bfa' }}
                          />
                          {tag.name}
                        </button>
                      ))}

                      {(dreamSearch || filterLucidOnly || selectedTagFilter) && (
                        <button
                          type="button"
                          className="btn btn-link text-muted small p-0 ms-auto text-decoration-none"
                          onClick={() => {
                            setDreamSearch('');
                            setFilterLucidOnly(false);
                            setSelectedTagFilter('');
                          }}
                        >
                          Restablecer filtros
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lista con scroll de sueños encontrados */}
                  {availableDreams.length === 0 ? (
                    <div className="text-center py-4 text-muted small">
                      <BookOpen size={28} className="d-block mx-auto mb-2 opacity-50" />
                      <p className="mb-2">Aún no tienes sueños guardados en tu diario.</p>
                      <Link to="/dreams/new" className="btn btn-sm btn-primary">
                        Registrar un sueño primero
                      </Link>
                    </div>
                  ) : filteredDreams.length === 0 ? (
                    <div className="text-center py-4 text-muted small">
                      <Search size={24} className="d-block mx-auto mb-2 opacity-50" />
                      <p className="mb-0">No se encontraron sueños que coincidan con los filtros.</p>
                    </div>
                  ) : (
                    <div className="sync-dream-list-scroll d-flex flex-column gap-2">
                      <span className="small text-muted px-1" style={{ fontSize: '0.75rem' }}>
                        Mostrando {filteredDreams.length} de {availableDreams.length} sueños
                      </span>
                      {filteredDreams.map(dream => {
                        const isCurrent = selectedDream?.id === dream.id;
                        return (
                          <div
                            key={dream.id}
                            className={`sync-dream-item ${isCurrent ? 'is-selected' : ''}`}
                            onClick={() => handleSelectDream(dream)}
                          >
                            <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                <span className="small text-warning fw-semibold d-flex align-items-center gap-1">
                                  <Calendar size={13} />
                                  {dream.dream_date}
                                </span>
                                {dream.moon_phase_emoji && <span>{dream.moon_phase_emoji}</span>}
                                {dream.tag_name && (
                                  <TagBadge
                                    name={dream.tag_name}
                                    color={dream.tag_color}
                                    initials={dream.tag_initials}
                                    size="sm"
                                  />
                                )}
                                {dream.is_lucid && (
                                  <span className="badge bg-primary bg-opacity-25 text-primary small">
                                    Lúcido
                                  </span>
                                )}
                              </div>
                              <span className="small text-muted d-none d-sm-inline">
                                #{dream.id}
                              </span>
                            </div>

                            <h4 className="h6 text-light font-serif mb-1 fw-semibold">
                              {dream.title || 'Sueño sin título'}
                            </h4>

                            {dream.content && (
                              <p className="text-muted small mb-0 text-truncate">
                                {dream.content}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {selectedDream && (
                    <div className="d-flex justify-content-end mt-3 pt-2 border-top border-subtle">
                      <UIButton
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowDreamPicker(false)}
                      >
                        Mantener sueño seleccionado
                      </UIButton>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SECCIÓN 2: FECHA DEL EVENTO EN VIGILIA */}
            <UIFormGroup>
              <div className="d-flex align-items-center justify-content-between mb-1">
                <UIFormLabel htmlFor="eventDate" className="mb-0" required>
                  2. Fecha del Suceso en Vigilia
                </UIFormLabel>
                <button
                  type="button"
                  className="btn btn-link text-warning p-0 small text-decoration-none"
                  onClick={() => setEventDate(new Date().toISOString().split('T')[0])}
                >
                  Hoy
                </button>
              </div>
              <UIFormControl
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
              {daysDifferenceText && (
                <div className="mt-2">
                  <span className="sync-diff-badge d-inline-flex align-items-center gap-1">
                    <Clock size={12} />
                    <span>{daysDifferenceText}</span>
                  </span>
                </div>
              )}
            </UIFormGroup>

            {/* SECCIÓN 3: TÍTULO DE LA SINCRONÍA */}
            <UIFormGroup>
              <UIFormLabel htmlFor="syncTitle" required>
                3. Título de la Sincronía
              </UIFormLabel>
              <UIFormControl
                id="syncTitle"
                placeholder="Ej. Encuentro inesperado con la persona soñada, El amuleto en el escaparate..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
              />
            </UIFormGroup>

            {/* SECCIÓN 4: RELATO DEL SUCESO */}
            <UIFormGroup className="mb-0">
              <UIFormLabel htmlFor="syncDescription" required>
                4. Relato de la Experiencia en Vigilia
              </UIFormLabel>
              <UIFormControl
                id="syncDescription"
                as="textarea"
                rows={5}
                placeholder="Describe qué ocurrió en el mundo real despierto, cómo se relaciona con el sueño, tus sensaciones o intuiciones..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </UIFormGroup>
          </Card.Body>

          {/* Pie con botones de acción */}
          <div className="p-4 border-top border-subtle d-flex justify-content-between align-items-center">
            <UIButton
              variant="secondary"
              type="button"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Cancelar
            </UIButton>

            <UIButton
              variant="primary"
              type="submit"
              disabled={saving || !selectedDream || !title.trim() || !description.trim()}
              className="d-flex align-items-center gap-2"
            >
              <Sparkles size={16} />
              <span>{saving ? 'Guardando...' : (isEditing ? 'Actualizar Sincronía' : 'Guardar Sincronía')}</span>
            </UIButton>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SynchronicityFormPage;
