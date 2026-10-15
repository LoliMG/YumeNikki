import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import { ArrowLeft, Save } from 'lucide-react';
import { AuthContext } from '../../../contexts/AuthContext';
import UIButton from '../../../components/UI/UIButton/UIButton';
import ConfirmModal from '../../../components/UI/ConfirmModal/ConfirmModal';
import DeleteModal from '../../../components/UI/DeleteModal/DeleteModal';
import Loader from '../../../components/UI/Loader/Loader';
import api from '../../../helpers/api';

import MetadataSection from './components/MetadataSection';
import ContentSection from './components/ContentSection';
import ElementsSection from './components/ElementsSection';
import ImagesSection from './components/ImagesSection';
import SpiritualSection from './components/SpiritualSection';
import './DreamForm.css';

const DreamForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const isEditMode = Boolean(id);
  const timezone = user?.timezone || 'Europe/Madrid';

  // Obtener fecha inicial
  const queryDate = searchParams.get('date');
  const getInitialDate = () => {
    if (queryDate) return queryDate;
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());
    } catch {
      return new Date().toLocaleDateString('en-CA');
    }
  };

  // Obtener hora estática inicial (solo al montar el formulario en modo creación)
  const getInitialTime = () => {
    try {
      const now = new Date();
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit'
      }).format(now);
    } catch {
      return '08:00';
    }
  };

  // Estado del formulario
  const [formData, setFormData] = useState({
    title: '',
    dream_date: getInitialDate(),
    dream_time: getInitialTime(),
    tag_id: '',
    content: '',
    symbolisms: '',
    characters: '',
    places: '',
    notes: '',
    lucidity_level: 1,
    clarity_level: 3,
    spiritual_type: 'standard',
    target_intention: '',
    intention_met: false,
    subconscious_message: '',
    waking_action: '',
    induction_practices: []
  });

  const [initialData, setInitialData] = useState(isEditMode ? null : formData);
  const [tags, setTags] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Modales
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [deleteImageTarget, setDeleteImageTarget] = useState(null);
  const [deletingImage, setDeletingImage] = useState(false);

  const fileInputRef = useRef(null);

  // Cargar etiquetas del usuario
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await api.get('/tags');
        setTags(res.tags || []);
      } catch (err) {
        console.error('Error al cargar etiquetas:', err);
      }
    };
    fetchTags();
  }, []);

  // Cargar datos del sueño si estamos en modo edición
  useEffect(() => {
    if (!isEditMode) return;

    const fetchDream = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/dreams/${id}`);
        const d = res.dream;
        if (d) {
          const formattedDate = typeof d.dream_date === 'string' ? d.dream_date.split('T')[0] : d.dream_date;
          const formattedTime = d.dream_time ? d.dream_time.substring(0, 5) : '08:00';

          const loaded = {
            title: d.title || '',
            dream_date: formattedDate,
            dream_time: formattedTime,
            tag_id: d.tag_id ? String(d.tag_id) : '',
            content: d.content || '',
            symbolisms: d.symbolisms || '',
            characters: d.characters || '',
            places: d.places || '',
            notes: d.notes || '',
            lucidity_level: d.lucidity_level || 1,
            clarity_level: d.clarity_level || 3,
            spiritual_type: d.spiritual_type || 'standard',
            target_intention: d.target_intention || '',
            intention_met: Boolean(d.intention_met),
            subconscious_message: d.subconscious_message || '',
            waking_action: d.waking_action || '',
            induction_practices: Array.isArray(d.induction_practices) ? d.induction_practices : []
          };

          setFormData(loaded);
          setInitialData(loaded);
          setExistingImages(d.images || []);
        }
      } catch (err) {
        setErrorMsg(err.message || 'No se pudo cargar el sueño.');
      } finally {
        setLoading(false);
      }
    };

    fetchDream();
  }, [id, isEditMode]);

  // Verificar si hay cambios sin guardar
  const isDirty = useMemo(() => {
    if (!initialData) return false;
    if (newImageFiles.length > 0) return true;
    return (
      formData.title !== initialData.title ||
      formData.dream_date !== initialData.dream_date ||
      formData.dream_time !== initialData.dream_time ||
      formData.tag_id !== initialData.tag_id ||
      formData.content !== initialData.content ||
      formData.symbolisms !== initialData.symbolisms ||
      formData.characters !== initialData.characters ||
      formData.places !== initialData.places ||
      formData.notes !== initialData.notes
    );
  }, [formData, initialData, newImageFiles]);

  // Aviso en evento beforeunload de navegador
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Manejador genérico de campos de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejador de selección de tipo de sueño / etiqueta
  const handleTagSelect = (tagId) => {
    setFormData(prev => ({ ...prev, tag_id: tagId }));
  };

  // Manejador de selección de nuevas imágenes
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    // Validar tipo y tamaño (máx 5MB)
    const validFiles = [];
    const validPreviews = [];

    for (const f of files) {
      if (!f.type.startsWith('image/')) {
        setErrorMsg('Solo se permiten archivos de imagen.');
        continue;
      }
      if (f.size > 5 * 1024 * 1024) {
        setErrorMsg('Cada imagen debe ocupar menos de 5MB.');
        continue;
      }
      validFiles.push(f);
      validPreviews.push(URL.createObjectURL(f));
    }

    setNewImageFiles(prev => [...prev, ...validFiles]);
    setNewImagePreviews(prev => [...prev, ...validPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Quitar imagen pendiente de subir
  const handleRemoveNewImage = (index) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Eliminar imagen existente en servidor
  const handleDeleteExistingImage = async () => {
    if (!deleteImageTarget || deletingImage) return;

    setDeletingImage(true);
    try {
      await api.delete(`/dreams/${id}/images/${deleteImageTarget.id}`);
      setExistingImages(prev => prev.filter(img => img.id !== deleteImageTarget.id));
      setDeleteImageTarget(null);
    } catch (err) {
      setErrorMsg(err.message || 'Error al eliminar la imagen.');
    } finally {
      setDeletingImage(false);
    }
  };

  // Guardar sueño
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');

    // Validación mínima: al menos título o contenido
    if (!formData.title.trim() && !formData.content.trim()) {
      setErrorMsg('Debes escribir al menos un título o el relato del sueño.');
      return;
    }

    setSaving(true);
    try {
      if (isEditMode) {
        // En edición: actualizar campos de texto
        await api.put(`/dreams/${id}`, {
          title: formData.title,
          dream_date: formData.dream_date,
          dream_time: formData.dream_time,
          tag_id: formData.tag_id ? Number(formData.tag_id) : null,
          content: formData.content,
          symbolisms: formData.symbolisms,
          characters: formData.characters,
          places: formData.places,
          notes: formData.notes,
          lucidity_level: formData.lucidity_level,
          clarity_level: formData.clarity_level,
          spiritual_type: formData.spiritual_type,
          target_intention: formData.target_intention,
          intention_met: formData.intention_met,
          subconscious_message: formData.subconscious_message,
          waking_action: formData.waking_action,
          induction_practices: formData.induction_practices
        });

        // Subir nuevas imágenes si las hay
        if (newImageFiles.length > 0) {
          const form = new FormData();
          newImageFiles.forEach(file => form.append('images', file));
          await api.postFormData(`/dreams/${id}/images`, form);
        }

        navigate(`/dreams/${id}`, { replace: true });
      } else {
        // En creación: multipart/form-data con todos los campos e imágenes
        const form = new FormData();
        form.append('title', formData.title);
        form.append('dream_date', formData.dream_date);
        form.append('dream_time', formData.dream_time);
        if (formData.tag_id) form.append('tag_id', formData.tag_id);
        form.append('content', formData.content);
        form.append('symbolisms', formData.symbolisms);
        form.append('characters', formData.characters);
        form.append('places', formData.places);
        form.append('notes', formData.notes);
        form.append('lucidity_level', formData.lucidity_level || 1);
        form.append('clarity_level', formData.clarity_level || 3);
        form.append('spiritual_type', formData.spiritual_type || 'standard');
        if (formData.target_intention) form.append('target_intention', formData.target_intention);
        form.append('intention_met', formData.intention_met ? 'true' : 'false');
        if (formData.subconscious_message) form.append('subconscious_message', formData.subconscious_message);
        if (formData.waking_action) form.append('waking_action', formData.waking_action);
        if (Array.isArray(formData.induction_practices) && formData.induction_practices.length > 0) {
          formData.induction_practices.forEach(p => form.append('induction_practices', p));
        }

        newImageFiles.forEach(file => form.append('images', file));

        const res = await api.postFormData('/dreams', form);
        const createdId = res.dream?.id || res.id;
        navigate(createdId ? `/dreams/${createdId}` : '/', { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar el sueño.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelClick = () => {
    if (isDirty) {
      setShowExitConfirm(true);
    } else {
      if (isEditMode) {
        navigate(`/dreams/${id}`);
      } else {
        navigate('/dreams');
      }
    }
  };

  if (loading) {
    return <Loader message="Cargando datos del sueño..." />;
  }

  return (
    <div className="container-md py-3" style={{ maxWidth: 860 }}>
      {/* Botón Volver y Cabecera */}
      <div className="d-flex align-items-center justify-content-between mb-3 mb-md-4">
        <div className="d-flex align-items-center gap-2 gap-md-3">
          <button
            type="button"
            onClick={handleCancelClick}
            className="btn btn-outline-secondary border-0 p-1 p-md-2 rounded-circle text-muted text-hover-light d-flex align-items-center justify-content-center"
            title="Volver"
            aria-label="Volver"
            style={{ width: 36, height: 36, background: 'rgba(255, 255, 255, 0.06)' }}
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="h3 font-serif fw-bold text-warning m-0">
            {isEditMode ? 'Editar Sueño' : 'Registrar Nuevo Sueño'}
          </h1>
        </div>

        {/* Guardar superior únicamente en escritorio para evitar duplicidad en móvil */}
        <div className="d-none d-md-block">
          <UIButton
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={saving}
            className="d-flex align-items-center gap-1"
          >
            <Save size={16} />
            <span>{saving ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Guardar Sueño')}</span>
          </UIButton>
        </div>
      </div>

      {errorMsg && (
        <Alert variant="danger" dismissible onClose={() => setErrorMsg('')} className="mb-4">
          {errorMsg}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* SECCIÓN 1: Metadatos Básicos */}
        <MetadataSection
          formData={formData}
          onChange={handleChange}
          tags={tags}
          onTagSelect={handleTagSelect}
        />

        {/* SECCIÓN 2: Relato del Sueño */}
        <ContentSection
          content={formData.content}
          onChange={handleChange}
        />

        {/* SECCIÓN 3 y 4: Elementos Oníricos y Notas */}
        <ElementsSection
          formData={formData}
          onChange={handleChange}
        />

        {/* SECCIÓN ESPIRITUAL: Consciencia, Incubación y Trascendencia */}
        <SpiritualSection
          formData={formData}
          onChange={handleChange}
          setFormData={setFormData}
        />

        {/* SECCIÓN 5: Ilustraciones y Bocetos */}
        <ImagesSection
          existingImages={existingImages}
          newImagePreviews={newImagePreviews}
          fileInputRef={fileInputRef}
          onFileSelect={handleFileSelect}
          onRemoveNewImage={handleRemoveNewImage}
          onDeleteExistingImage={(img) => setDeleteImageTarget(img)}
        />

        {/* Barra inferior de acciones */}
        <div className="d-flex justify-content-between align-items-center pt-2 pb-5">
          <UIButton
            variant="secondary"
            type="button"
            onClick={handleCancelClick}
            disabled={saving}
          >
            Cancelar
          </UIButton>

          <UIButton
            variant="primary"
            type="submit"
            disabled={saving}
            className="d-flex align-items-center gap-2 px-4"
          >
            <Save size={18} />
            <span>{saving ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Registrar Sueño')}</span>
          </UIButton>
        </div>
      </form>

      {/* Modal de confirmación al salir con cambios sin guardar */}
      <ConfirmModal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={() => {
          setShowExitConfirm(false);
          if (isEditMode) {
            navigate(`/dreams/${id}`);
          } else {
            navigate('/dreams');
          }
        }}
        title="¿Salir sin guardar?"
        message="Tienes cambios sin guardar en este sueño. Si sales ahora, se perderán todas las modificaciones."
        confirmText="Salir sin guardar"
        cancelText="Continuar editando"
      />

      {/* Modal de confirmación al eliminar imagen guardada */}
      <DeleteModal
        isOpen={Boolean(deleteImageTarget)}
        onClose={() => setDeleteImageTarget(null)}
        onConfirm={handleDeleteExistingImage}
        title="¿Eliminar esta ilustración?"
        message="La imagen se borrará físicamente del servidor y no podrá recuperarse."
        isLoading={deletingImage}
      />
    </div>
  );
};

export default DreamForm;
