import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaSave,
  FaCheckCircle,
  FaPlus,
  FaTrash,
  FaDumbbell,
} from 'react-icons/fa';
import {
  getWorkoutLog,
  createWorkoutLog,
  bulkSaveExerciseLogs,
  getStudentAssignments,
} from '../api/api';

/**
 * WorkoutSession — Register / edit a workout session.
 *
 * Routes:
 *   /alumnos/:studentId/sesion/nueva?assignmentId=X   → create new log then edit
 *   /alumnos/:studentId/sesion/:logId                  → edit existing log
 */
function WorkoutSession() {
  const { studentId, logId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workoutLog, setWorkoutLog] = useState(null);
  const [exercises, setExercises] = useState([]); // from pauta template
  const [formData, setFormData] = useState({}); // { [exerciseId]: [{ setNumber, reps, weight, rpe, notes }] }
  const [sessionNotes, setSessionNotes] = useState('');

  // ─── Load data ───────────────────────────────────────────
  useEffect(() => {
    if (logId && logId !== 'nueva') {
      loadExistingSession(logId);
    } else {
      createNewSession();
    }
  }, [logId]);

  const loadExistingSession = async (id) => {
    try {
      const { data } = await getWorkoutLog(id);
      setWorkoutLog(data);
      setSessionNotes(data.notes || '');

      const templateExercises = data.assignment?.pautas?.ejercicios || [];
      setExercises(templateExercises);

      // Build formData from existing exercise_logs
      const fd = {};
      templateExercises.forEach((ej) => {
        const logs = data.exercise_logs.filter((l) => l.exercise_id === ej.id);
        if (logs.length > 0) {
          fd[ej.id] = logs.map((l) => ({
            setNumber: l.set_number,
            reps: l.reps_completed ?? '',
            weight: l.weight_kg != null ? Number(l.weight_kg) : '',
            rpe: l.rpe ?? '',
            notes: l.notes || '',
          }));
        } else {
          fd[ej.id] = [{ setNumber: 1, reps: '', weight: '', rpe: '', notes: '' }];
        }
      });
      setFormData(fd);
    } catch (error) {
      toast.error('Error al cargar la sesión');
      navigate(`/alumnos/${studentId}`);
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    const params = new URLSearchParams(window.location.search);
    const assignmentId = params.get('assignmentId');

    if (!assignmentId) {
      toast.error('Falta el ID de asignación');
      navigate(`/alumnos/${studentId}`);
      return;
    }

    try {
      const { data: log } = await createWorkoutLog({
        studentId: Number(studentId),
        assignmentId: Number(assignmentId),
      });

      // Redirect to the created session
      navigate(`/alumnos/${studentId}/sesion/${log.id}`, { replace: true });
    } catch (err) {
      toast.error('Error al crear la sesión');
      navigate(`/alumnos/${studentId}`);
    }
  };

  // ─── Form helpers ────────────────────────────────────────

  const updateSet = (exerciseId, setIdx, field, value) => {
    setFormData((prev) => {
      const sets = [...(prev[exerciseId] || [])];
      sets[setIdx] = { ...sets[setIdx], [field]: value };
      return { ...prev, [exerciseId]: sets };
    });
  };

  const addSet = (exerciseId) => {
    setFormData((prev) => {
      const sets = [...(prev[exerciseId] || [])];
      sets.push({
        setNumber: sets.length + 1,
        reps: '',
        weight: '',
        rpe: '',
        notes: '',
      });
      return { ...prev, [exerciseId]: sets };
    });
  };

  const removeSet = (exerciseId, setIdx) => {
    setFormData((prev) => {
      const sets = [...(prev[exerciseId] || [])];
      sets.splice(setIdx, 1);
      // Re-number
      sets.forEach((s, i) => (s.setNumber = i + 1));
      return { ...prev, [exerciseId]: sets.length > 0 ? sets : [{ setNumber: 1, reps: '', weight: '', rpe: '', notes: '' }] };
    });
  };

  // ─── Save ────────────────────────────────────────────────

  const buildSetsPayload = () => {
    const allSets = [];
    Object.entries(formData).forEach(([exerciseId, sets]) => {
      sets.forEach((s) => {
        // Only include sets that have data
        if (s.reps !== '' || s.weight !== '' || s.rpe !== '') {
          allSets.push({
            exerciseId: Number(exerciseId),
            setNumber: s.setNumber,
            repsCompleted: s.reps !== '' ? Number(s.reps) : null,
            weightKg: s.weight !== '' ? Number(s.weight) : null,
            rpe: s.rpe !== '' ? Number(s.rpe) : null,
            notes: s.notes || null,
          });
        }
      });
    });
    return allSets;
  };

  const handleSave = async (complete = false) => {
    if (!workoutLog) return;
    setSaving(true);

    try {
      const sets = buildSetsPayload();
      await bulkSaveExerciseLogs(workoutLog.id, {
        sets,
        notes: sessionNotes || null,
        completed: complete,
      });
      toast.success(complete ? 'Sesión completada' : 'Borrador guardado');
      if (complete) {
        navigate(`/alumnos/${studentId}`);
      }
    } catch (err) {
      const details = err.response?.data?.details;
      if (details) {
        toast.error(details.join(', '));
      } else {
        toast.error('Error al guardar');
      }
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────

  if (loading) {
    return <div className="loading">Cargando sesión...</div>;
  }

  if (!workoutLog) return null;

  const pautaTitle = workoutLog.assignment?.pautas?.titulo || 'Pauta';
  const isCompleted = workoutLog.completed;

  return (
    <>
      <div className="page-header">
        <h1>
          <FaDumbbell style={{ marginRight: '0.5rem' }} />
          {isCompleted ? 'Sesión Completada' : 'Registrar Sesión'}
        </h1>
        <button className="btn btn--outline" onClick={() => navigate(`/alumnos/${studentId}`)}>
          <FaArrowLeft /> Volver
        </button>
      </div>

      {/* Session info */}
      <div className="detail-container" style={{ marginBottom: '1.5rem' }}>
        <div className="detail-header" style={{ padding: '1.25rem 2rem' }}>
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>{pautaTitle}</h2>
          <p style={{ margin: 0, opacity: 0.85, fontSize: '0.85rem' }}>
            Fecha: {new Date(workoutLog.date).toLocaleDateString('es-CL')}
            {isCompleted && <span className="badge badge--success" style={{ marginLeft: '0.75rem' }}>Completada</span>}
          </p>
        </div>
      </div>

      {/* Exercises form */}
      <div className="form-container">
        {exercises.map((ej) => (
          <div key={ej.id} className="workout-exercise-block">
            <div className="workout-exercise-block__header">
              <h3>{ej.nombre}</h3>
              {ej.series_repeticiones && (
                <span className="workout-exercise-block__target">
                  Objetivo: {ej.series_repeticiones}
                </span>
              )}
              {ej.cargas_kg && (
                <span className="workout-exercise-block__target" style={{ color: 'var(--success)' }}>
                  Cargas: {ej.cargas_kg}
                </span>
              )}
            </div>

            {/* Sets table */}
            <div className="sets-table-wrap">
              <table className="sets-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>Set</th>
                    <th>Reps</th>
                    <th>Peso (kg)</th>
                    <th>RPE</th>
                    <th>Notas</th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {(formData[ej.id] || []).map((s, idx) => (
                    <tr key={idx}>
                      <td className="sets-table__num">{s.setNumber}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          placeholder="—"
                          value={s.reps}
                          onChange={(e) => updateSet(ej.id, idx, 'reps', e.target.value)}
                          disabled={isCompleted}
                          className="sets-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="—"
                          value={s.weight}
                          onChange={(e) => updateSet(ej.id, idx, 'weight', e.target.value)}
                          disabled={isCompleted}
                          className="sets-input"
                        />
                      </td>
                      <td>
                        <select
                          value={s.rpe}
                          onChange={(e) => updateSet(ej.id, idx, 'rpe', e.target.value)}
                          disabled={isCompleted}
                          className="sets-input sets-input--rpe"
                        >
                          <option value="">—</option>
                          {[1,2,3,4,5,6,7,8,9,10].map((v) => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="..."
                          value={s.notes}
                          onChange={(e) => updateSet(ej.id, idx, 'notes', e.target.value)}
                          disabled={isCompleted}
                          className="sets-input sets-input--notes"
                        />
                      </td>
                      <td>
                        {!isCompleted && (formData[ej.id] || []).length > 1 && (
                          <button
                            type="button"
                            className="btn btn--danger btn--icon btn--sm"
                            onClick={() => removeSet(ej.id, idx)}
                            title="Quitar set"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!isCompleted && (
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => addSet(ej.id)}
                style={{ marginTop: '0.5rem' }}
              >
                <FaPlus /> Agregar set
              </button>
            )}
          </div>
        ))}

        {/* Session notes */}
        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <label>Observaciones generales de la sesión</label>
          <textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="¿Cómo te sentiste hoy? Observaciones generales..."
            disabled={isCompleted}
            rows={3}
          />
        </div>

        {/* Action buttons */}
        {!isCompleted && (
          <div className="workout-actions">
            <button
              className="btn btn--primary"
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              <FaSave /> {saving ? 'Guardando...' : 'Guardar borrador'}
            </button>
            <button
              className="btn btn--success"
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              <FaCheckCircle /> Completar sesión
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default WorkoutSession;
