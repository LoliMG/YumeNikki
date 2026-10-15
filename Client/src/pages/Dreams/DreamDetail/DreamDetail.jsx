import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import UIButton from '../../../components/UI/UIButton/UIButton';
import TagBadge from '../../../components/TagBadge/TagBadge';
import MoonBadge from '../../../components/MoonBadge/MoonBadge';
import DeleteModal from '../../../components/UI/DeleteModal/DeleteModal';
import Loader from '../../../components/UI/Loader/Loader';
import api, { getImageUrl } from '../../../helpers/api';
import {
  Calendar,
  Clock,
  Edit3,
  Trash2,
  ArrowLeft,
  Sparkles,
  Users,
  MapPin,
  FileText,
  ImageIcon,
  Maximize2,
  PlusCircle,
  Eye,
  Zap,
  Moon,
  Compass,
  CheckCircle2
} from 'lucide-react';
import './DreamDetail.css';

const DreamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dream, setDream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Sincronías vinculadas
  const [synchronicities, setSynchronicities] = useState([]);

  const fetchSynchronicities = useCallback(async () => {
    try {
      const res = await api.get(`/synchronicities/dream/${id}`);
      setSynchronicities(res.synchronicities || []);
    } catch (err) {
      console.error('Error al cargar sincronías del sueño:', err);
    }
  }, [id]);

  useEffect(() => {
    let isCancelled = false;

    const fetchDream = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/dreams/${id}`);
        if (!isCancelled && res.dream) {
          setDream(res.dream);
        }
      } catch (err) {
        if (!isCancelled) {
          setErrorMsg(err.message || 'No se pudo encontrar el sueño.');
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchDream();
    fetchSynchronicities();

    return () => {
      isCancelled = true;
    };
  }, [id, fetchSynchronicities]);

  const handleDeleteConfirm = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await api.delete(`/dreams/${id}`);
      navigate('/dreams');
    } catch (err) {
      setErrorMsg(err.message || 'Error al eliminar el sueño.');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <Loader message="Abriendo página del diario..." />;
  }

  if (errorMsg || !dream) {
    return (
      <div className="py-4 text-center">
        <Alert variant="danger" className="mb-3">
          {errorMsg || 'Sueño no encontrado.'}
        </Alert>
        <UIButton variant="secondary" onClick={() => navigate('/dreams')}>
          Volver a la lista de sueños
        </UIButton>
      </div>
    );
  }

  // Formato de fecha largo en español
  const formattedDate = (() => {
    try {
      const datePart = typeof dream.dream_date === 'string' ? dream.dream_date.split('T')[0] : dream.dream_date;
      const [year, month, day] = datePart.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dream.dream_date;
    }
  })();

  const displayTime = dream.dream_time ? dream.dream_time.substring(0, 5) : '08:00';

  const tagObj = dream.tag_name ? {
    name: dream.tag_name,
    initials: dream.tag_initials,
    color: dream.tag_color
  } : null;

  return (
    <div className="container-md py-3" style={{ maxWidth: 860 }}>
      {/* Barra de navegación superior */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <UIButton
          variant="secondary"
          size="sm"
          onClick={() => navigate('/dreams')}
          className="d-flex align-items-center gap-1"
        >
          <ArrowLeft size={16} />
          <span>Volver</span>
        </UIButton>

        <div className="d-flex align-items-center gap-2">
          <UIButton
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/dreams/${id}/edit`)}
            className="d-flex align-items-center gap-1"
          >
            <Edit3 size={15} />
            <span>Editar</span>
          </UIButton>
          <UIButton
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="d-flex align-items-center gap-1"
          >
            <Trash2 size={15} />
            <span>Eliminar</span>
          </UIButton>
        </div>
      </div>

      {/* Encabezado principal del sueño */}
      <Card className="bg-surface border-subtle mb-4 shadow-sm rounded-4 overflow-hidden">
        <Card.Body className="p-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
            {/* Metadatos: fecha, hora estática y etiqueta */}
            <div className="d-flex flex-wrap align-items-center gap-3">
              <span className="d-flex align-items-center gap-1 text-muted text-capitalize small">
                <Calendar size={15} />
                <span>{formattedDate}</span>
              </span>
              <span className="d-flex align-items-center gap-1 text-muted small">
                <Clock size={15} />
                <span>{displayTime}</span>
              </span>
              {tagObj && <TagBadge tag={tagObj} size="md" />}
            </div>

            {/* Ficha Lunar y Zodíaco */}
            <MoonBadge
              phaseName={dream.moon_phase_name}
              phaseEmoji={dream.moon_phase_emoji}
              zodiacSign={dream.moon_zodiac_sign}
              zodiacSymbol={dream.moon_zodiac_symbol}
              showText={true}
              size="md"
            />
          </div>

          <h1 className="display-6 font-serif fw-bold text-warning mb-4">
            {dream.title || 'Sueño sin título'}
          </h1>

          {/* Relato del sueño */}
          {dream.content ? (
            <div className="mb-2">
              {dream.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="mb-3 fs-6 lh-lg text-light font-sans">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-muted fst-italic">Sin relato redactado para este sueño.</p>
          )}
        </Card.Body>
      </Card>

      {/* Elementos Oníricos (Simbolismos, Personajes, Lugares) */}
      {(dream.symbolisms || dream.characters || dream.places) && (
        <div className="row g-3 mb-4">
          {dream.characters && (
            <div className="col-12 col-md-4">
              <Card className="bg-surface border-subtle h-100 shadow-sm rounded-4 overflow-hidden">
                <Card.Header className="bg-black bg-opacity-25 border-bottom border-subtle py-2 px-3 d-flex align-items-center gap-2">
                  <Users size={16} className="text-warning" />
                  <h2 className="h6 font-serif text-light m-0">Personajes</h2>
                </Card.Header>
                <Card.Body className="p-3">
                  <p className="m-0 small text-light" style={{ whiteSpace: 'pre-wrap' }}>{dream.characters}</p>
                </Card.Body>
              </Card>
            </div>
          )}

          {dream.places && (
            <div className="col-12 col-md-4">
              <Card className="bg-surface border-subtle h-100 shadow-sm rounded-4 overflow-hidden">
                <Card.Header className="bg-black bg-opacity-25 border-bottom border-subtle py-2 px-3 d-flex align-items-center gap-2">
                  <MapPin size={16} className="text-warning" />
                  <h2 className="h6 font-serif text-light m-0">Lugares</h2>
                </Card.Header>
                <Card.Body className="p-3">
                  <p className="m-0 small text-light" style={{ whiteSpace: 'pre-wrap' }}>{dream.places}</p>
                </Card.Body>
              </Card>
            </div>
          )}

          {dream.symbolisms && (
            <div className="col-12 col-md-4">
              <Card className="bg-surface border-subtle h-100 shadow-sm rounded-4 overflow-hidden">
                <Card.Header className="bg-black bg-opacity-25 border-bottom border-subtle py-2 px-3 d-flex align-items-center gap-2">
                  <Sparkles size={16} className="text-warning" />
                  <h2 className="h6 font-serif text-light m-0">Simbolismos</h2>
                </Card.Header>
                <Card.Body className="p-3">
                  <p className="m-0 small text-light" style={{ whiteSpace: 'pre-wrap' }}>{dream.symbolisms}</p>
                </Card.Body>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Notas y Reflexiones */}
      {dream.notes && (
        <Card className="bg-surface border-subtle mb-4 shadow-sm rounded-4 overflow-hidden">
          <Card.Header className="bg-black bg-opacity-25 border-bottom border-subtle py-2 px-3 d-flex align-items-center gap-2">
            <FileText size={16} className="text-warning" />
            <h2 className="h6 font-serif text-light m-0">Notas y Reflexiones</h2>
          </Card.Header>
          <Card.Body className="p-3 p-md-4">
            <p className="m-0 small text-light fst-italic" style={{ whiteSpace: 'pre-wrap' }}>{dream.notes}</p>
          </Card.Body>
        </Card>
      )}

      {/* DIMENSIÓN ESPIRITUAL Y CONSCIENCIA */}
      {(dream.target_intention || dream.subconscious_message || dream.waking_action || (dream.lucidity_level && dream.lucidity_level > 1) || (dream.spiritual_type && dream.spiritual_type !== 'standard') || (dream.induction_practices && dream.induction_practices.length > 0)) && (
        <Card className="bg-surface border-subtle mb-4 shadow-sm rounded-4 overflow-hidden">
          <Card.Header className="bg-black bg-opacity-25 border-bottom border-subtle py-2 px-3 d-flex align-items-center gap-2">
            <Sparkles size={16} className="text-warning" />
            <h2 className="h6 font-serif text-light m-0">Dimensión Espiritual & Consciencia</h2>
          </Card.Header>
          <Card.Body className="p-3 p-md-4 d-flex flex-column gap-3">
            {/* Badges de Consciencia y Tipología */}
            <div className="d-flex flex-wrap align-items-center gap-2">
              {dream.spiritual_type && dream.spiritual_type !== 'standard' && (
                <span className="badge bg-warning bg-opacity-20 text-warning border border-warning border-opacity-30 small px-3 py-2">
                  ✨ {dream.spiritual_type === 'shadow_work' ? 'Trabajo de Sombra' :
                       dream.spiritual_type === 'premonition' ? 'Premonitorio' :
                       dream.spiritual_type === 'spirit_visit' ? 'Visita / Guía' :
                       dream.spiritual_type === 'astral_obe' ? 'Viaje Astral / OBE' :
                       dream.spiritual_type === 'healing' ? 'Sanación / Curativo' :
                       dream.spiritual_type === 'recurring' ? 'Recurrente' : dream.spiritual_type}
                </span>
              )}

              <span className="badge bg-surface-2 border border-subtle text-light small px-3 py-2 d-flex align-items-center gap-1">
                <Eye size={13} className="text-warning" />
                <span>Lucidez: Nivel {dream.lucidity_level || 1} / 5</span>
              </span>

              <span className="badge bg-surface-2 border border-subtle text-light small px-3 py-2 d-flex align-items-center gap-1">
                <Zap size={13} className="text-info" />
                <span>Vividez: Nivel {dream.clarity_level || 3} / 5</span>
              </span>
            </div>

            {/* Incubación previa */}
            {dream.target_intention && (
              <div className="p-3 rounded-3 bg-black bg-opacity-25 border border-subtle">
                <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                  <span className="text-muted small fw-bold text-uppercase d-flex align-items-center gap-1">
                    <Moon size={14} className="text-warning" />
                    <span>Intención sembrada al acostarse:</span>
                  </span>
                  {dream.intention_met && (
                    <span className="badge bg-success bg-opacity-20 text-success border border-success border-opacity-30 small d-flex align-items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>Respondida en el sueño</span>
                    </span>
                  )}
                </div>
                <p className="m-0 text-light small fst-italic">"{dream.target_intention}"</p>
              </div>
            )}

            {/* Prácticas de inducción */}
            {dream.induction_practices && dream.induction_practices.length > 0 && (
              <div className="d-flex flex-wrap align-items-center gap-1 pt-1">
                <span className="text-muted small me-2">Inducción previa:</span>
                {dream.induction_practices.map(p => (
                  <span key={p} className="badge bg-primary bg-opacity-20 text-primary border border-primary border-opacity-25 small">
                    {p === 'meditation' ? 'Meditación' :
                     p === 'herbal_tea' ? 'Infusión' :
                     p === 'mild_wild' ? 'Técnica MILD/WILD' :
                     p === 'digital_detox' ? 'Silencio digital' :
                     p === 'crystals' ? 'Cristales' :
                     p === 'breathwork' ? 'Respiración' : p}
                  </span>
                ))}
              </div>
            )}

            {/* Mensaje del alma */}
            {dream.subconscious_message && (
              <div className="p-3 rounded-3 border border-warning border-opacity-30 bg-warning bg-opacity-10">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <Sparkles size={15} className="text-warning" />
                  <span className="fw-bold text-warning small text-uppercase">Mensaje del Inconsciente</span>
                </div>
                <p className="m-0 text-light small fw-medium">
                  "{dream.subconscious_message}"
                </p>
              </div>
            )}

            {/* Acción en vigilia */}
            {dream.waking_action && (
              <div className="p-3 rounded-3 bg-black bg-opacity-25 border border-subtle">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <Compass size={15} className="text-info" />
                  <span className="fw-bold text-info small text-uppercase">Acción o Ritual en Vigilia</span>
                </div>
                <p className="m-0 text-light small">
                  {dream.waking_action}
                </p>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* SECCIÓN SINCRONÍAS VINCULADAS */}
      <Card className="bg-surface border-subtle mb-4 shadow-sm rounded-4 overflow-hidden">
        <Card.Header className="bg-black bg-opacity-25 border-bottom border-subtle py-2 px-3 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <Sparkles size={16} className="text-warning" />
            <h2 className="h6 font-serif text-light m-0">Sincronías y Ecos en Vigilia ({synchronicities.length})</h2>
          </div>
          <UIButton
            variant="primary"
            size="sm"
            onClick={() => navigate(`/dreams/synchronicities/new?dreamId=${dream.id}`)}
            className="d-flex align-items-center gap-1 py-1 px-2"
          >
            <PlusCircle size={14} />
            <span>Registrar sincronía</span>
          </UIButton>
        </Card.Header>
        <Card.Body className="p-3 p-md-4">
          {synchronicities.length === 0 ? (
            <p className="text-muted small fst-italic m-0">
              Aún no has registrado coincidencias o eventos en la vida real derivados de este sueño. Si algo de este sueño se manifiesta en tu día a día, pulsa en "Registrar sincronía".
            </p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {synchronicities.map(s => {
                const diff = Number(s.days_difference);
                return (
                  <div key={s.id} className="p-3 rounded-3 bg-black bg-opacity-25 border border-subtle d-flex flex-column gap-2">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold text-light small">{s.title}</span>
                        <span className={`badge border small ${diff === 0 ? 'bg-info bg-opacity-20 text-info border-info' : 'sync-badge-days'}`}>
                          {diff === 0 ? 'Mismo día' : (diff > 0 ? `+${diff} días tras el sueño` : `${diff} días antes`)}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small">{s.event_date ? s.event_date.split('T')[0] : ''}</span>
                        <UIButton
                          variant="secondary"
                          size="sm"
                          className="p-1 px-2 small d-flex align-items-center"
                          onClick={() => navigate(`/dreams/synchronicities/${s.id}/edit`)}
                          title="Editar sincronía"
                        >
                          <Edit3 size={12} />
                        </UIButton>
                      </div>
                    </div>
                    <p className="m-0 text-muted small" style={{ whiteSpace: 'pre-line' }}>{s.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Galería de imágenes */}
      {dream.images && dream.images.length > 0 && (
        <Card className="bg-surface border-subtle mb-4 shadow-sm rounded-4 overflow-hidden">
          <Card.Header className="bg-black bg-opacity-25 border-bottom border-subtle py-2 px-3 d-flex align-items-center gap-2">
            <ImageIcon size={16} className="text-warning" />
            <h2 className="h6 font-serif text-light m-0">Ilustraciones del Sueño</h2>
          </Card.Header>
          <Card.Body className="p-3 p-md-4">
            <div className="dream-detail-gallery">
              {dream.images.map(img => (
                <div
                  key={img.id}
                  className="dream-gallery-item"
                  onClick={() => setPreviewImage(img)}
                  role="button"
                  tabIndex={0}
                  aria-label="Ver imagen ampliada"
                >
                  <img src={getImageUrl(img.file_path)} alt={img.original_name || 'Ilustración del sueño'} />
                  <div className="dream-gallery-overlay">
                    <Maximize2 size={20} />
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Modal visor de imagen a pantalla completa */}
      <Modal
        show={Boolean(previewImage)}
        onHide={() => setPreviewImage(null)}
        centered
        size="lg"
        contentClassName="bg-dark border border-secondary"
      >
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title className="h6 text-light m-0">
            {previewImage?.original_name || 'Ilustración del sueño'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 text-center bg-black">
          {previewImage && (
            <img
              src={getImageUrl(previewImage.file_path)}
              alt={previewImage.original_name}
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }}
            />
          )}
        </Modal.Body>
      </Modal>



      {/* Modal para eliminar sueño */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar este sueño de tu diario?"
        message="Esta acción borrará de forma permanente el sueño y todas sus ilustraciones asociadas. No se puede deshacer."
        isLoading={deleting}
      />
    </div>
  );
};

export default DreamDetail;
