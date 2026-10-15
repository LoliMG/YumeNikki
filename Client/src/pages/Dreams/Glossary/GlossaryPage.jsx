import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { 
  Sparkles, 
  Tag as TagIcon, 
  PlusCircle, 
  Search, 
  Edit2, 
  Trash2, 
  BookOpen, 
  Compass 
} from 'lucide-react';
import api from '../../../helpers/api';
import DreamsNav from '../components/DreamsNav/DreamsNav';
import UIButton from '../../../components/UI/UIButton/UIButton';
import { UIFormControl } from '../../../components/UI/UIForm/UIForm';
import DeleteModal from '../../../components/UI/DeleteModal/DeleteModal';

// Componentes de gestión de etiquetas
import TagsManagerSection from '../../Profile/components/TagsManagerSection';
import TagModal from '../../Profile/components/TagModal';

import SymbolModal from './components/SymbolModal';
import './GlossaryPage.css';

const GlossaryPage = () => {
  const [activeTab, setActiveTab] = useState('symbols'); // 'symbols' | 'tags'

  // --- SÍMBOLOS ---
  const [symbols, setSymbols] = useState([]);
  const [symbolsLoading, setSymbolsLoading] = useState(true);
  const [symbolSearch, setSymbolSearch] = useState('');
  const [selectedArchetype, setSelectedArchetype] = useState('ALL');
  const [showSymbolModal, setShowSymbolModal] = useState(false);
  const [editingSymbol, setEditingSymbol] = useState(null);
  const [symbolSaving, setSymbolSaving] = useState(false);
  const [deletingSymbolTarget, setDeletingSymbolTarget] = useState(null);
  const [symbolDeleteLoading, setSymbolDeleteLoading] = useState(false);

  // --- ETIQUETAS ---
  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [tagForm, setTagForm] = useState({ name: '', initials: '', color: '#a78bfa' });
  const [tagSaving, setTagSaving] = useState(false);
  const [tagError, setTagError] = useState('');
  const [deletingTagTarget, setDeletingTagTarget] = useState(null);
  const [tagDeleteLoading, setTagDeleteLoading] = useState(false);

  // Cargar símbolos
  const fetchSymbols = async () => {
    setSymbolsLoading(true);
    try {
      const res = await api.get('/glossary');
      setSymbols(res.symbols || []);
    } catch (err) {
      console.error('Error al cargar glosario:', err);
    } finally {
      setSymbolsLoading(false);
    }
  };

  // Cargar etiquetas (sin archivado)
  const fetchTags = async () => {
    setTagsLoading(true);
    try {
      const res = await api.get('/tags');
      setTags(res.tags || []);
    } catch (err) {
      console.error('Error al cargar etiquetas:', err);
    } finally {
      setTagsLoading(false);
    }
  };

  useEffect(() => {
    fetchSymbols();
    fetchTags();
  }, []);

  // Guardar símbolo (crear o editar)
  const handleSaveSymbol = async (data) => {
    setSymbolSaving(true);
    try {
      if (editingSymbol) {
        await api.put(`/glossary/${editingSymbol.id}`, data);
      } else {
        await api.post('/glossary', data);
      }
      await fetchSymbols();
    } finally {
      setSymbolSaving(false);
    }
  };

  // Confirmar borrado de símbolo
  const handleConfirmDeleteSymbol = async () => {
    if (!deletingSymbolTarget) return;
    setSymbolDeleteLoading(true);
    try {
      await api.delete(`/glossary/${deletingSymbolTarget.id}`);
      setDeletingSymbolTarget(null);
      await fetchSymbols();
    } catch (err) {
      console.error('Error al eliminar símbolo:', err);
    } finally {
      setSymbolDeleteLoading(false);
    }
  };

  // --- Handlers para Etiquetas ---
  const openTagModal = (tagToEdit = null) => {
    setTagError('');
    if (tagToEdit) {
      setEditingTag(tagToEdit);
      setTagForm({
        name: tagToEdit.name,
        initials: tagToEdit.initials,
        color: tagToEdit.color
      });
    } else {
      setEditingTag(null);
      setTagForm({ name: '', initials: '', color: '#a78bfa' });
    }
    setShowTagModal(true);
  };

  const handleSaveTag = async (e) => {
    e.preventDefault();
    setTagSaving(true);
    setTagError('');
    try {
      if (editingTag) {
        await api.put(`/tags/${editingTag.id}`, tagForm);
      } else {
        await api.post('/tags', tagForm);
      }
      setShowTagModal(false);
      await fetchTags();
    } catch (err) {
      setTagError(err.message || 'Error al guardar la etiqueta.');
    } finally {
      setTagSaving(false);
    }
  };

  const handleStartDeleteTag = async (tag) => {
    setTagDeleteLoading(true);
    try {
      const res = await api.get(`/tags/${tag.id}/usage`);
      setDeletingTagTarget({
        ...tag,
        usageCount: res.usageCount || 0
      });
    } catch (err) {
      console.error('Error al verificar uso de etiqueta:', err);
      setDeletingTagTarget({ ...tag, usageCount: 0 });
    } finally {
      setTagDeleteLoading(false);
    }
  };

  const handleConfirmDeleteTag = async () => {
    if (!deletingTagTarget) return;
    setTagDeleteLoading(true);
    try {
      await api.delete(`/tags/${deletingTagTarget.id}`);
      setDeletingTagTarget(null);
      await fetchTags();
    } catch (err) {
      console.error('Error al eliminar etiqueta:', err);
    } finally {
      setTagDeleteLoading(false);
    }
  };

  // Filtrado de símbolos
  const filteredSymbols = useMemo(() => {
    return symbols.filter(s => {
      const matchesSearch = !symbolSearch || 
        s.symbol_name.toLowerCase().includes(symbolSearch.toLowerCase()) ||
        (s.personal_meaning && s.personal_meaning.toLowerCase().includes(symbolSearch.toLowerCase())) ||
        (s.archetype && s.archetype.toLowerCase().includes(symbolSearch.toLowerCase()));
      
      const matchesArchetype = selectedArchetype === 'ALL' || s.archetype === selectedArchetype;
      return matchesSearch && matchesArchetype;
    });
  }, [symbols, symbolSearch, selectedArchetype]);

  const uniqueArchetypes = useMemo(() => {
    const set = new Set();
    symbols.forEach(s => {
      if (s.archetype) set.add(s.archetype);
    });
    return Array.from(set);
  }, [symbols]);

  return (
    <div className="container-md py-3" style={{ maxWidth: 960 }}>
      {/* Pestañas de Navegación Onírica */}
      <DreamsNav />

      {/* Cabecera de la Página */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h2 font-serif fw-bold text-warning m-0">Glosario & Etiquetas</h1>
          <p className="text-muted small m-0">Tu enciclopedia personal de arquetipos, símbolos oníricos y taxonomía</p>
        </div>

        {activeTab === 'symbols' ? (
          <UIButton
            variant="primary"
            onClick={() => {
              setEditingSymbol(null);
              setShowSymbolModal(true);
            }}
            className="d-flex align-items-center gap-2"
          >
            <PlusCircle size={17} />
            <span>Nuevo símbolo</span>
          </UIButton>
        ) : (
          <UIButton
            variant="primary"
            onClick={() => openTagModal(null)}
            className="d-flex align-items-center gap-2"
          >
            <PlusCircle size={17} />
            <span>Nueva etiqueta</span>
          </UIButton>
        )}
      </div>

      {/* Selector de subpestañas */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="profile-tabs mb-4"
      >
        {/* SUBPESTAÑA 1: SÍMBOLOS Y ARQUETIPOS */}
        <Tab
          eventKey="symbols"
          title={
            <span className="d-flex align-items-center gap-2">
              <Sparkles size={16} />
              <span>Símbolos y Arquetipos ({symbols.length})</span>
            </span>
          }
        >
          {/* Buscador y Filtros de Arquetipos */}
          <Card className="bg-surface border-subtle mb-4 shadow-sm rounded-4">
            <Card.Body className="p-3">
              <div className="row g-2 align-items-center">
                <div className="col-12 col-md-7">
                  <div className="position-relative">
                    <Search
                      size={17}
                      className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted pointer-events-none"
                    />
                    <UIFormControl
                      type="text"
                      placeholder="Buscar por símbolo, arquetipo o significado..."
                      value={symbolSearch}
                      onChange={(e) => setSymbolSearch(e.target.value)}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>

                <div className="col-12 col-md-5">
                  <div className="d-flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                    <button
                      type="button"
                      className={`badge border text-decoration-none py-2 px-3 ${selectedArchetype === 'ALL' ? 'bg-warning text-dark border-warning' : 'bg-surface-2 text-muted border-subtle'}`}
                      onClick={() => setSelectedArchetype('ALL')}
                      style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Todos
                    </button>
                    {uniqueArchetypes.map(arc => (
                      <button
                        key={arc}
                        type="button"
                        className={`badge border text-decoration-none py-2 px-3 ${selectedArchetype === arc ? 'bg-warning text-dark border-warning' : 'bg-surface-2 text-muted border-subtle'}`}
                        onClick={() => setSelectedArchetype(arc)}
                        style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        {arc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Listado de Símbolos */}
          {symbolsLoading ? (
            <p className="text-center text-muted py-5">Cargando glosario onírico...</p>
          ) : filteredSymbols.length === 0 ? (
            <div className="text-center py-5 text-muted bg-surface border-subtle rounded-4 p-4">
              <Compass size={36} className="text-warning mb-2 opacity-75" />
              <h3 className="h6 text-light mb-1">
                {symbols.length === 0 ? 'Aún no tienes símbolos registrados' : 'No se encontraron símbolos'}
              </h3>
              <p className="small text-muted mb-3" style={{ maxWidth: 440, margin: '0 auto' }}>
                {symbols.length === 0 
                  ? 'Registra aquellas imágenes recurrentes (agua, animales, puertas, espejos) para definir qué significado tienen para tu inconsciente.'
                  : 'Intenta con otro término de búsqueda o selecciona "Todos".'}
              </p>
              {symbols.length === 0 && (
                <UIButton
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setEditingSymbol(null);
                    setShowSymbolModal(true);
                  }}
                >
                  <PlusCircle size={15} className="me-1" />
                  <span>Crear mi primer símbolo</span>
                </UIButton>
              )}
            </div>
          ) : (
            <div className="row g-3">
              {filteredSymbols.map(s => (
                <div key={s.id} className="col-12 col-md-6">
                  <div className="symbol-card bg-surface border-subtle rounded-4 p-3 h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <span className="symbol-icon-badge">
                            <Sparkles size={15} />
                          </span>
                          <h2 className="h6 text-light fw-bold m-0">{s.symbol_name}</h2>
                        </div>
                        {s.archetype && (
                          <span className="badge bg-warning bg-opacity-15 text-warning border border-warning border-opacity-25 small">
                            {s.archetype}
                          </span>
                        )}
                      </div>

                      <p className="symbol-meaning text-muted small mb-3">
                        {s.personal_meaning}
                      </p>
                    </div>

                    <div className="d-flex align-items-center justify-content-between pt-2 border-top border-subtle">
                      <Link
                        to={`/dreams?symbolism=${encodeURIComponent(s.symbol_name)}`}
                        className="text-decoration-none small text-warning d-flex align-items-center gap-1 opacity-80 text-hover-light"
                        title="Ver sueños con este simbolismo"
                      >
                        <BookOpen size={13} />
                        <span>{s.dream_appearances_count || 0} sueños</span>
                      </Link>

                      <div className="d-flex align-items-center gap-1">
                        <UIButton
                          variant="secondary"
                          size="sm"
                          className="p-1 px-2 small d-flex align-items-center gap-1"
                          onClick={() => {
                            setEditingSymbol(s);
                            setShowSymbolModal(true);
                          }}
                          title="Editar símbolo"
                        >
                          <Edit2 size={13} />
                          <span>Editar</span>
                        </UIButton>

                        <UIButton
                          variant="danger"
                          size="sm"
                          className="p-1 px-2 small"
                          onClick={() => setDeletingSymbolTarget(s)}
                          title="Eliminar símbolo"
                        >
                          <Trash2 size={13} />
                        </UIButton>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Tab>

        {/* SUBPESTAÑA 2: GESTIÓN DE ETIQUETAS */}
        <Tab
          eventKey="tags"
          title={
            <span className="d-flex align-items-center gap-2">
              <TagIcon size={16} />
              <span>Etiquetas Oníricas ({tags.length})</span>
            </span>
          }
        >
          <div className="mb-3 text-muted small">
            Las etiquetas clasifican tus sueños principales con colores y siglas identificativas para las estadísticas y el calendario.
          </div>

          <TagsManagerSection
            tags={tags}
            tagsLoading={tagsLoading}
            onOpenTagModal={openTagModal}
            onStartDeleteTag={handleStartDeleteTag}
          />
        </Tab>
      </Tabs>

      {/* Modal Símbolo */}
      <SymbolModal
        isOpen={showSymbolModal}
        onClose={() => setShowSymbolModal(false)}
        editingSymbol={editingSymbol}
        onSave={handleSaveSymbol}
        isSaving={symbolSaving}
      />

      {/* Modal Confirmar Eliminación de Símbolo */}
      <DeleteModal
        isOpen={Boolean(deletingSymbolTarget)}
        onClose={() => setDeletingSymbolTarget(null)}
        onConfirm={handleConfirmDeleteSymbol}
        title="¿Eliminar símbolo del glosario?"
        message={`¿Seguro que deseas eliminar "${deletingSymbolTarget?.symbol_name}"? Tus sueños no se borrarán, pero se retirará la definición personal de tu enciclopedia.`}
        isLoading={symbolDeleteLoading}
      />

      {/* Modal Crear / Editar Etiqueta */}
      <TagModal
        isOpen={showTagModal}
        onClose={() => setShowTagModal(false)}
        editingTag={editingTag}
        tagForm={tagForm}
        setTagForm={setTagForm}
        tagSaving={tagSaving}
        tagError={tagError}
        onSaveTag={handleSaveTag}
      />

      {/* Modal confirmar borrado de etiqueta */}
      <DeleteModal
        isOpen={Boolean(deletingTagTarget)}
        onClose={() => setDeletingTagTarget(null)}
        onConfirm={handleConfirmDeleteTag}
        title={`¿Eliminar etiqueta "${deletingTagTarget?.name}"?`}
        message={
          deletingTagTarget?.usageCount > 0
            ? `Esta etiqueta está en uso en ${deletingTagTarget.usageCount} sueño(s). Si la eliminas, se desvinculará de ellos y se borrará definitivamente.`
            : `¿Seguro que deseas eliminar permanentemente la etiqueta "${deletingTagTarget?.name}"?`
        }
        isLoading={tagDeleteLoading}
      />
    </div>
  );
};

export default GlossaryPage;
