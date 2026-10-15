import React from 'react';
import Card from 'react-bootstrap/Card';
import {
  Sparkles,
  Eye,
  Moon,
  Zap,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { UIFormGroup, UIFormLabel, UIFormControl } from '../../../../components/UI/UIForm/UIForm';

const SPIRITUAL_TYPES = [
  { id: 'standard', label: 'Estándar', desc: 'Sueño cotidiano sin connotación especial' },
  { id: 'shadow_work', label: 'Trabajo de Sombra', desc: 'Enfrentamiento con miedos o partes reprimidas' },
  { id: 'premonition', label: 'Premonitorio', desc: 'Presentimiento o visión de futuro' },
  { id: 'spirit_visit', label: 'Visita / Guía', desc: 'Encuentro con ancestros, seres queridos o guías' },
  { id: 'astral_obe', label: 'Viaje Astral / OBE', desc: 'Experiencia extracorpórea o vibracional' },
  { id: 'healing', label: 'Sanación / Curativo', desc: 'Sensación de liberación emocional o física' },
  { id: 'recurring', label: 'Recurrente', desc: 'Patrón o escenario que vuelve a repetirse' }
];

const INDUCTION_OPTIONS = [
  { id: 'meditation', label: 'Meditación previa' },
  { id: 'herbal_tea', label: 'Infusión para soñar' },
  { id: 'mild_wild', label: 'Técnica MILD / WILD' },
  { id: 'digital_detox', label: 'Silencio digital' },
  { id: 'crystals', label: 'Cristales / Minerales' },
  { id: 'breathwork', label: 'Respiración consciente' },
  { id: 'reality_check', label: 'Chequeo de realidad en el día' }
];

const LUCIDITY_LEVELS = [
  { level: 1, label: '1 - Inconsciente', desc: 'Sin noción de estar soñando' },
  { level: 2, label: '2 - Pre-lúcido', desc: 'Dudas breves o sospecha fugaz' },
  { level: 3, label: '3 - Consciente', desc: 'Sabías que soñabas, pero sin alterar el curso' },
  { level: 4, label: '4 - Control Parcial', desc: 'Pudiste alterar tus decisiones o entorno' },
  { level: 5, label: '5 - Lúcido Creador', desc: 'Control absoluto del espacio, vuelo o manifestación' }
];

const CLARITY_LEVELS = [
  { level: 1, label: '1 - Borroso' },
  { level: 2, label: '2 - Difuso' },
  { level: 3, label: '3 - Claro' },
  { level: 4, label: '4 - Vívido' },
  { level: 5, label: '5 - Hiperrealista / Astral' }
];

const SpiritualSection = ({ formData, onChange, setFormData }) => {
  const selectedPractices = Array.isArray(formData.induction_practices)
    ? formData.induction_practices
    : [];

  const togglePractice = (practiceId) => {
    let updated;
    if (selectedPractices.includes(practiceId)) {
      updated = selectedPractices.filter(id => id !== practiceId);
    } else {
      updated = [...selectedPractices, practiceId];
    }
    setFormData(prev => ({
      ...prev,
      induction_practices: updated
    }));
  };

  return (
    <Card className="bg-surface border-subtle mb-4 shadow-sm rounded-4 overflow-hidden">
      <Card.Header className="bg-black bg-opacity-25 border-bottom border-subtle py-3 px-4 d-flex align-items-center gap-2">
        <Sparkles size={18} className="text-warning" />
        <h2 className="h5 font-serif text-light m-0">Dimensión Espiritual y Consciencia</h2>
      </Card.Header>

      <Card.Body className="p-3 p-md-4 d-flex flex-column gap-4">
        {/* 1. INCUBACIÓN / INTENCIÓN PREVIA */}
        <div className="p-3 rounded-3 bg-black bg-opacity-25 border border-subtle">
          <div className="d-flex align-items-center gap-2 mb-2">
            <Moon size={16} className="text-warning" />
            <span className="fw-bold text-light small text-uppercase tracking-wider">
              Incubación del Sueño (Antes de dormir)
            </span>
          </div>

          <UIFormGroup className="mb-2">
            <UIFormLabel htmlFor="target_intention">Intención sembrada o mantra nocturno</UIFormLabel>
            <UIFormControl
              id="target_intention"
              name="target_intention"
              placeholder="Ej. Pido claridad sobre mi vocación, Intención de reconocer que sueño, Encuentro con..."
              value={formData.target_intention || ''}
              onChange={onChange}
            />
          </UIFormGroup>

          <div className="form-check form-switch pt-1">
            <input
              className="form-check-input"
              type="checkbox"
              id="intention_met"
              name="intention_met"
              checked={Boolean(formData.intention_met)}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, intention_met: e.target.checked }));
              }}
              style={{ cursor: 'pointer' }}
            />
            <label className="form-check-label text-light small" htmlFor="intention_met" style={{ cursor: 'pointer' }}>
              ¿El sueño respondió o manifestó esta intención?
            </label>
          </div>
        </div>

        {/* 2. ESPECTRO DE CONSCIENCIA (LUCIDEZ Y VIVIDEZ) */}
        <div className="row g-3">
          {/* Lucidez */}
          <div className="col-12 col-md-6">
            <div className="p-3 rounded-3 bg-black bg-opacity-25 border border-subtle h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2">
                  <Eye size={16} className="text-primary" />
                  <span className="fw-bold text-light small text-uppercase">Nivel de Lucidez</span>
                </div>
                <span 
                  className="badge small font-sans"
                  style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.25)',
                    color: '#e9d5ff',
                    border: '1px solid rgba(167, 139, 250, 0.45)'
                  }}
                >
                  Nivel {formData.lucidity_level || 1}
                </span>
              </div>

              <div className="d-flex flex-column gap-1 mt-2">
                {LUCIDITY_LEVELS.map(l => {
                  const isSelected = Number(formData.lucidity_level || 1) === l.level;
                  return (
                    <button
                      key={l.level}
                      type="button"
                      className={`btn btn-sm text-start py-1 px-2 rounded-2 border d-flex align-items-center justify-content-between transition-all ${
                        isSelected
                          ? 'bg-primary bg-opacity-25 border-primary text-white fw-bold shadow-sm'
                          : 'bg-transparent border-transparent text-muted'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, lucidity_level: l.level }))}
                    >
                      <span className={`small ${isSelected ? 'text-white fw-semibold' : 'text-light text-opacity-75'}`}>
                        {l.label}
                      </span>
                      <small
                        className={`d-none d-sm-inline ${isSelected ? 'text-opacity-90' : 'text-muted'}`}
                        style={{ fontSize: '0.72rem', color: isSelected ? '#ddd6fe' : undefined }}
                      >
                        {l.desc}
                      </small>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Claridad / Vividez */}
          <div className="col-12 col-md-6">
            <div className="p-3 rounded-3 bg-black bg-opacity-25 border border-subtle h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2">
                  <Zap size={16} className="text-warning" />
                  <span className="fw-bold text-light small text-uppercase">Vividez Perceptual</span>
                </div>
                <span className="badge bg-info bg-opacity-20 small font-sans text-info border border-info border-opacity-30">
                  {CLARITY_LEVELS.find(c => c.level === Number(formData.clarity_level || 3))?.label}
                </span>
              </div>

              <div className="d-flex gap-1 mt-3">
                {CLARITY_LEVELS.map(c => (
                  <button
                    key={c.level}
                    type="button"
                    className={`btn btn-sm flex-fill py-2 rounded-2 border text-center ${Number(formData.clarity_level || 3) === c.level ? 'bg-info bg-opacity-25 border-info text-light fw-bold' : 'bg-surface-2 border-subtle text-muted'}`}
                    onClick={() => setFormData(prev => ({ ...prev, clarity_level: c.level }))}
                  >
                    {c.level}
                  </button>
                ))}
              </div>
              <small className="text-muted d-block mt-2" style={{ fontSize: '0.75rem' }}>
                De 1 (fragmentado o borroso) a 5 (más nítido y palpable que el estado de vigilia).
              </small>
            </div>
          </div>
        </div>

        {/* 3. TIPOLOGÍA SAGRADA */}
        <div>
          <UIFormLabel>Tipología Onírica Sagrada</UIFormLabel>
          <div className="d-flex flex-wrap gap-2 mt-1">
            {SPIRITUAL_TYPES.map(st => {
              const isSelected = (formData.spiritual_type || 'standard') === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-1 border text-start d-flex align-items-center gap-2 ${isSelected ? 'bg-warning text-dark border-warning fw-bold' : 'bg-surface-2 border-subtle text-light'}`}
                  onClick={() => setFormData(prev => ({ ...prev, spiritual_type: st.id }))}
                  title={st.desc}
                >
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. PRÁCTICAS DE INDUCCIÓN */}
        <div>
          <UIFormLabel>Prácticas de inducción previas al sueño</UIFormLabel>
          <div className="d-flex flex-wrap gap-2 mt-1">
            {INDUCTION_OPTIONS.map(opt => {
              const active = selectedPractices.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`btn btn-sm rounded-3 py-1 px-2 border d-flex align-items-center gap-1 ${active ? 'bg-primary bg-opacity-30 border-primary text-light fw-medium' : 'bg-black bg-opacity-25 border-subtle text-muted'}`}
                  onClick={() => togglePractice(opt.id)}
                >
                  {active && <CheckCircle2 size={13} className="text-primary" />}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. INTEGRACIÓN EN VIGILIA (SABIDURÍA Y ACCIÓN) */}
        <div className="p-3 rounded-3 bg-black bg-opacity-25 border border-subtle">
          <div className="d-flex align-items-center gap-2 mb-2">
            <Compass size={16} className="text-warning" />
            <span className="fw-bold text-light small text-uppercase tracking-wider">
              Integración en el Mundo Físico
            </span>
          </div>

          <UIFormGroup className="mb-3">
            <UIFormLabel htmlFor="subconscious_message">Mensaje o revelación del inconsciente</UIFormLabel>
            <UIFormControl
              id="subconscious_message"
              name="subconscious_message"
              placeholder="En una sola frase: ¿Qué mensaje clave te entrega este sueño a tu alma?"
              value={formData.subconscious_message || ''}
              onChange={onChange}
            />
          </UIFormGroup>

          <UIFormGroup className="mb-0">
            <UIFormLabel htmlFor="waking_action">Acción consciente o microritual en vigilia</UIFormLabel>
            <UIFormControl
              id="waking_action"
              name="waking_action"
              placeholder="Ej. Hoy llamaré a tal persona, prenderé una vela, daré un paseo descalzo, escribiré una carta..."
              value={formData.waking_action || ''}
              onChange={onChange}
            />
            <small className="text-muted" style={{ fontSize: '0.74rem' }}>
              Un sueño no anclado a una acción real es como una carta que nunca se abre.
            </small>
          </UIFormGroup>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SpiritualSection;
