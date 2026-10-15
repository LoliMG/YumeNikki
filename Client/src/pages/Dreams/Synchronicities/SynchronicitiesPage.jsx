import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import {
  Sparkles,
  PlusCircle,
  Search,
  Calendar,
  Edit2,
  Trash2,
  ArrowRight
} from 'lucide-react';
import api from '../../../helpers/api';
import DreamsNav from '../components/DreamsNav/DreamsNav';
import UIButton from '../../../components/UI/UIButton/UIButton';
import { UIFormControl } from '../../../components/UI/UIForm/UIForm';
import TagBadge from '../../../components/TagBadge/TagBadge';
import DeleteModal from '../../../components/UI/DeleteModal/DeleteModal';
import './SynchronicitiesPage.css';

const SynchronicitiesPage = () => {
  const navigate = useNavigate();
  const [synchronicities, setSynchronicities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [deletingTarget, setDeletingTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSynchronicities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/synchronicities');
      setSynchronicities(res.synchronicities || []);
    } catch (err) {
      console.error('Error al cargar sincronías:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSynchronicities();
  }, []);

  const handleConfirmDelete = async () => {
    if (!deletingTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/synchronicities/${deletingTarget.id}`);
      setDeletingTarget(null);
      await fetchSynchronicities();
    } catch (err) {
      console.error('Error al eliminar sincronía:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('T')[0].split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const filtered = useMemo(() => {
    if (!search) return synchronicities;
    const q = search.toLowerCase();
    return synchronicities.filter(s =>
      s.title?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.dream_title?.toLowerCase().includes(q) ||
      s.tag_name?.toLowerCase().includes(q)
    );
  }, [synchronicities, search]);

  return (
    <div className="container-md py-3" style={{ maxWidth: 960 }}>
      {/* Pestañas de Navegación Onírica */}
      <DreamsNav />

      {/* Cabecera */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h2 font-serif fw-bold text-warning m-0">Sincronías Oníricas</h1>
          <p className="text-muted small m-0">Eventos de vigilia y coincidencias significativas vinculadas a tus sueños</p>
        </div>

        <UIButton
          variant="primary"
          onClick={() => navigate('/dreams/synchronicities/new')}
          className="d-flex align-items-center gap-2"
        >
          <PlusCircle size={17} />
          <span>Registrar sincronía</span>
        </UIButton>
      </div>

      {/* Buscador */}
      <Card className="bg-surface border-subtle mb-4 shadow-sm rounded-4">
        <Card.Body className="p-3">
          <div className="position-relative">
            <Search
              size={17}
              className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted pointer-events-none"
            />
            <UIFormControl
              type="text"
              placeholder="Buscar por título, relato de la sincronía o sueño origen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </Card.Body>
      </Card>

      {/* Listado de Sincronías */}
      {loading ? (
        <p className="text-center text-muted py-5">Cargando sincronías...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 text-muted bg-surface border-subtle rounded-4 p-4">
          <Sparkles size={40} className="text-warning mb-2 opacity-75" />
          <h3 className="h6 text-light mb-1">
            {synchronicities.length === 0 ? 'Aún no has registrado ninguna sincronía' : 'No se encontraron resultados'}
          </h3>
          <p className="small text-muted mb-3" style={{ maxWidth: 500, margin: '0 auto' }}>
            {synchronicities.length === 0
              ? 'Cuando un sueño se manifieste o tenga eco en tu vida diaria (encuentros, símbolos repetidos, presentimientos cumplidos), documenta aquí el evento físico para seguir el rastro entre tus dos mundos.'
              : 'Intenta con otro término de búsqueda.'}
          </p>
          {synchronicities.length === 0 && (
            <UIButton
              variant="primary"
              size="sm"
              onClick={() => navigate('/dreams/synchronicities/new')}
            >
              <PlusCircle size={15} className="me-1" />
              <span>Registrar mi primera sincronía</span>
            </UIButton>
          )}
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtered.map(s => {
            const daysDiff = Number(s.days_difference);
            return (
              <div key={s.id} className="sync-card bg-surface border-subtle rounded-4 p-3 p-md-4">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="sync-star-icon">
                      <Sparkles size={16} />
                    </span>
                    <h2 className="h5 text-light fw-bold m-0">{s.title}</h2>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-surface-2 border border-subtle text-muted small d-flex align-items-center gap-1">
                      <Calendar size={13} className="text-warning" />
                      <span>{formatDate(s.event_date)}</span>
                    </span>

                    <span className={`badge border small ${daysDiff === 0 ? 'bg-info bg-opacity-20 text-info border-info' : 'sync-badge-days'}`}>
                      {daysDiff === 0
                        ? 'Manifestado el mismo día'
                        : (daysDiff > 0 ? `+${daysDiff} días tras el sueño` : `${daysDiff} días antes`)}
                    </span>
                  </div>
                </div>

                {/* Tarjeta del sueño origen */}
                <div className="sync-origin-dream p-2 px-3 rounded-3 mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small">Sueño origen:</span>
                    {s.moon_phase_emoji && <span>{s.moon_phase_emoji}</span>}
                    <span className="text-light fw-medium small">
                      {s.dream_title || 'Sueño sin título'} ({formatDate(s.dream_date)})
                    </span>
                    {s.tag_name && (
                      <TagBadge
                        tag={{
                          name: s.tag_name,
                          initials: s.tag_initials,
                          color: s.tag_color
                        }}
                        size="sm"
                      />
                    )}
                  </div>

                  <Link
                    to={`/dreams/${s.dream_id}`}
                    className="text-warning text-decoration-none small d-flex align-items-center gap-1 text-hover-light"
                    title="Ver sueño completo"
                  >
                    <span>Ver sueño</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {/* Descripción del evento en vigilia */}
                <p className="sync-description text-muted small m-0 mb-3">
                  {s.description}
                </p>

                {/* Botones de acción */}
                <div className="d-flex align-items-center justify-content-end gap-2 pt-2 border-top border-subtle">
                  <UIButton
                    variant="secondary"
                    size="sm"
                    className="p-1 px-3 small d-flex align-items-center gap-1"
                    onClick={() => navigate(`/dreams/synchronicities/${s.id}/edit`)}
                    title="Editar sincronía"
                  >
                    <Edit2 size={13} />
                    <span>Editar</span>
                  </UIButton>

                  <UIButton
                    variant="danger"
                    size="sm"
                    className="p-1 px-3 small"
                    onClick={() => setDeletingTarget(s)}
                    title="Eliminar sincronía"
                  >
                    <Trash2 size={13} />
                  </UIButton>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      <DeleteModal
        isOpen={Boolean(deletingTarget)}
        onClose={() => setDeletingTarget(null)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar esta sincronía?"
        message={`¿Seguro que deseas eliminar el registro "${deletingTarget?.title}"? El sueño vinculado permanecerá intacto.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default SynchronicitiesPage;
