import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import { Droplet, Plus, Calendar, Trash2, Edit3 } from 'lucide-react';
import UIButton from '../../../components/UI/UIButton/UIButton';
import UIModal from '../../../components/UI/UIModal/UIModal';
import { UIFormGroup, UIFormLabel, UIFormControl } from '../../../components/UI/UIForm/UIForm';
import DeleteModal from '../../../components/UI/DeleteModal/DeleteModal';
import api from '../../../helpers/api';

const CycleManagerSection = () => {
  const [periods, setPeriods] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Modal de registro / edición
  const [showModal, setShowModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Modal de confirmación de eliminación
  const [deletingPeriod, setDeletingPeriod] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const fetchCycleData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cycle');
      if (res) {
        setPeriods(res.periods || []);
        setMetrics(res.metrics || null);
      }
    } catch (err) {
      console.error('Error al cargar datos del ciclo:', err);
      setErrorMsg('No se pudieron cargar los datos del ciclo menstrual.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCycleData();
  }, []);

  const openCreateModal = () => {
    setEditingPeriod(null);
    const today = new Date().toLocaleDateString('en-CA');
    setFormStartDate(today);
    setFormEndDate('');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (period) => {
    setEditingPeriod(period);
    setFormStartDate(period.start_date ? period.start_date.split('T')[0] : '');
    setFormEndDate(period.end_date ? period.end_date.split('T')[0] : '');
    setFormError('');
    setShowModal(true);
  };

  const handleSavePeriod = async (e) => {
    e.preventDefault();
    if (!formStartDate) {
      setFormError('La fecha de inicio es obligatoria.');
      return;
    }
    if (formEndDate && new Date(formEndDate) < new Date(formStartDate)) {
      setFormError('El último día de sangrado no puede ser anterior al inicio.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      if (editingPeriod) {
        const res = await api.put(`/cycle/period/${editingPeriod.id}`, {
          start_date: formStartDate,
          end_date: formEndDate || null
        });
        if (res.periods) {
          setPeriods(res.periods);
          setMetrics(res.metrics);
        }
      } else {
        const res = await api.post('/cycle/period', {
          start_date: formStartDate,
          end_date: formEndDate || null
        });
        if (res.periods) {
          setPeriods(res.periods);
          setMetrics(res.metrics);
        }
      }
      setShowModal(false);
    } catch (err) {
      setFormError(err.message || 'Error al guardar el periodo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPeriod) return;
    setDeletingLoading(true);
    try {
      const res = await api.delete(`/cycle/period/${deletingPeriod.id}`);
      if (res.periods) {
        setPeriods(res.periods);
        setMetrics(res.metrics);
      } else {
        setPeriods(prev => prev.filter(p => p.id !== deletingPeriod.id));
      }
      setDeletingPeriod(null);
    } catch (err) {
      console.error('Error al eliminar periodo:', err);
    } finally {
      setDeletingLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const [y, m, d] = dateStr.split('T')[0].split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="bg-surface border-subtle shadow-sm rounded-4 overflow-hidden">
      <Card.Header className="bg-surface-2 bg-opacity-40 border-bottom border-subtle py-3 px-4 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <Droplet size={18} className="text-danger" fill="currentColor" />
          <h2 className="h5 font-serif text-light m-0">Registro del Ciclo Menstrual</h2>
        </div>
        <UIButton variant="primary" size="sm" onClick={openCreateModal} className="d-flex align-items-center gap-1">
          <Plus size={16} />
          <span>Registrar Periodo</span>
        </UIButton>
      </Card.Header>

      <Card.Body className="p-3 p-md-4">
        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

        {/* Métricas dinámicas calculadas automáticamente */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="profile-info-item p-3 h-100">
              <span className="text-muted small d-block mb-1">Duración Media del Sangrado</span>
              <div className="d-flex align-items-baseline gap-2">
                <span className="h3 fw-bold text-danger mb-0">
                  {metrics?.avgBleedingDays != null ? `${metrics.avgBleedingDays} días` : '—'}
                </span>
              </div>
              <small className="text-muted d-block mt-1">
                {metrics?.avgBleedingDays != null
                  ? 'Calculado dinámicamente con las fechas introducidas'
                  : 'Anota la fecha de fin de sangrado para calcular la media'}
              </small>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="profile-info-item p-3 h-100">
              <span className="text-muted small d-block mb-1">Duración Media del Ciclo</span>
              <div className="d-flex align-items-baseline gap-2">
                <span className="h3 fw-bold text-warning mb-0">
                  {metrics?.avgCycleDays != null ? `${metrics.avgCycleDays} días` : '—'}
                </span>
              </div>
              <small className="text-muted d-block mt-1">
                {metrics?.avgCycleDays != null
                  ? 'Distancia media entre inicios sucesivos'
                  : 'Requiere al menos 2 periodos registrados'}
              </small>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="profile-info-item p-3 h-100">
              <span className="text-muted small d-block mb-1">Periodos Registrados</span>
              <div className="d-flex align-items-baseline gap-2">
                <span className="h3 fw-bold text-light mb-0">
                  {metrics?.totalPeriodsLogged || periods.length}
                </span>
              </div>
              <small className="text-muted d-block mt-1">
                Aparecerán marcados con una gota 🩸 en el calendario.
              </small>
            </div>
          </div>
        </div>

        {/* Historial de periodos */}
        <h3 className="h6 text-light mb-3 fw-bold d-flex align-items-center gap-2">
          <Calendar size={16} className="text-muted" />
          <span>Historial de Menstruaciones</span>
        </h3>

        {loading ? (
          <p className="text-muted small py-3">Cargando historial de periodos...</p>
        ) : periods.length === 0 ? (
          <div className="p-4 text-center rounded-3 bg-black bg-opacity-10 border border-subtle">
            <Droplet size={32} className="text-muted opacity-50 mb-2" />
            <p className="text-muted small mb-0">
              Aún no has registrado ningún periodo menstrual.
            </p>
            <p className="text-muted small">
              Haz clic en "Registrar Periodo" para comenzar tu seguimiento personalizado.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover variant="dark" className="align-middle bg-transparent mb-0">
              <thead>
                <tr className="border-subtle text-muted small">
                  <th>Fecha de Inicio</th>
                  <th>Último Día de Sangrado</th>
                  <th>Duración Sangrado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {periods.map(period => {
                  let bleedingDays = null;
                  if (period.start_date && period.end_date) {
                    const st = new Date(period.start_date);
                    const en = new Date(period.end_date);
                    bleedingDays = Math.round((en - st) / (1000 * 60 * 60 * 24)) + 1;
                  }

                  return (
                    <tr key={period.id} className="border-subtle">
                      <td className="fw-semibold text-light">
                        {formatDate(period.start_date)}
                      </td>
                      <td className="text-muted">
                        {period.end_date ? (
                          formatDate(period.end_date)
                        ) : (
                          <span className="badge bg-secondary text-light">Sin finalizar</span>
                        )}
                      </td>
                      <td>
                        {bleedingDays ? (
                          <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-25">
                            {bleedingDays} días
                          </span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-1">
                          <UIButton
                            variant="secondary"
                            size="sm"
                            className="p-1"
                            title="Editar periodo"
                            onClick={() => openEditModal(period)}
                          >
                            <Edit3 size={15} />
                          </UIButton>
                          <UIButton
                            variant="secondary"
                            size="sm"
                            className="p-1 text-danger"
                            title="Eliminar periodo"
                            onClick={() => setDeletingPeriod(period)}
                          >
                            <Trash2 size={15} />
                          </UIButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>

      {/* Modal Registrar / Editar Periodo */}
      <UIModal
        show={showModal}
        onHide={() => setShowModal(false)}
        title={editingPeriod ? 'Editar Periodo Menstrual' : 'Registrar Nuevo Periodo'}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <UIButton variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>
              Cancelar
            </UIButton>
            <UIButton variant="primary" onClick={handleSavePeriod} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </UIButton>
          </div>
        }
      >
        <form onSubmit={handleSavePeriod}>
          {formError && <Alert variant="danger" className="py-2 small">{formError}</Alert>}

          <UIFormGroup className="mb-3">
            <UIFormLabel htmlFor="period-start">Fecha de inicio del sangrado *</UIFormLabel>
            <UIFormControl
              id="period-start"
              type="date"
              value={formStartDate}
              onChange={(e) => setFormStartDate(e.target.value)}
              required
            />
            <small className="text-muted">El primer día en que comenzó la menstruación.</small>
          </UIFormGroup>

          <UIFormGroup className="mb-3">
            <UIFormLabel htmlFor="period-end">Último día de sangrado (opcional)</UIFormLabel>
            <UIFormControl
              id="period-end"
              type="date"
              value={formEndDate}
              min={formStartDate}
              onChange={(e) => setFormEndDate(e.target.value)}
            />
            <small className="text-muted">
              Puedes rellenarlo cuando termine tu ciclo para que se calcule la duración exacta.
            </small>
          </UIFormGroup>
        </form>
      </UIModal>

      {/* Modal Confirmar Eliminación */}
      <DeleteModal
        isOpen={Boolean(deletingPeriod)}
        onClose={() => setDeletingPeriod(null)}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar este periodo?"
        message={`¿Estás segura de eliminar el registro de menstruación del ${formatDate(deletingPeriod?.start_date)}? Las medias se recalcularán automáticamente.`}
        isLoading={deletingLoading}
      />
    </Card>
  );
};

export default CycleManagerSection;
