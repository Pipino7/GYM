import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  FaDumbbell,
  FaClipboardList,
  FaChartLine,
  FaCheckCircle,
  FaUser,
  FaCalendarAlt,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import {
  getMyProfile,
  getMyAssignments,
  getMyWorkoutLogs,
  getMyProgress,
} from '../api/api';

function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detalle de pauta expandida
  const [expandedPauta, setExpandedPauta] = useState(null);

  // Historial por ejercicio
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileRes, assignmentsRes, logsRes] = await Promise.all([
        getMyProfile(),
        getMyAssignments(),
        getMyWorkoutLogs(),
      ]);
      setProfile(profileRes.data);
      setAssignments(assignmentsRes.data);
      setWorkoutLogs(logsRes.data);
    } catch (err) {
      toast.error('Error al cargar tus datos');
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async (exerciseId, exerciseName) => {
    if (selectedExercise?.id === exerciseId) {
      setSelectedExercise(null);
      return;
    }
    setSelectedExercise({ id: exerciseId, nombre: exerciseName });
    setProgressLoading(true);
    try {
      const { data } = await getMyProgress(exerciseId);
      setProgressData(data);
    } catch {
      toast.error('Error al cargar progreso');
    } finally {
      setProgressLoading(false);
    }
  };

  // Ejercicios únicos de los logs para links de progreso
  const allExercises = useMemo(() => {
    const map = new Map();
    workoutLogs.forEach((log) => {
      (log.exercise_logs || []).forEach((el) => {
        if (el.ejercicios && !map.has(el.ejercicios.id)) {
          map.set(el.ejercicios.id, el.ejercicios);
        }
      });
    });
    return Array.from(map.values());
  }, [workoutLogs]);

  // Stats
  const completedSessions = workoutLogs.filter((l) => l.completed).length;
  const totalSets = workoutLogs.reduce((sum, l) => sum + (l.exercise_logs?.length || 0), 0);

  if (loading) return <div className="loading">Cargando tu dashboard...</div>;

  return (
    <div className="student-dashboard">
      {/* Header */}
      <div className="sd-header">
        <div className="sd-header__info">
          <div className="sd-header__avatar"><FaUser /></div>
          <div>
            <h1>¡Hola, {user?.nombre}!</h1>
            {profile?.profesor && (
              <p className="sd-header__profesor">
                Profesor/a: <strong>{profile.profesor.nombre} {profile.profesor.apellido}</strong>
              </p>
            )}
          </div>
        </div>
        {(profile?.peso_kg || profile?.estatura_cm) && (
          <div className="sd-header__stats">
            {profile.peso_kg && <span className="sd-stat">{Number(profile.peso_kg)} kg</span>}
            {profile.estatura_cm && <span className="sd-stat">{Number(profile.estatura_cm)} cm</span>}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="sd-stats-row">
        <div className="sd-stat-card">
          <FaDumbbell className="sd-stat-card__icon" />
          <div className="sd-stat-card__value">{assignments.length}</div>
          <div className="sd-stat-card__label">Pautas activas</div>
        </div>
        <div className="sd-stat-card">
          <FaClipboardList className="sd-stat-card__icon" />
          <div className="sd-stat-card__value">{completedSessions}</div>
          <div className="sd-stat-card__label">Sesiones completadas</div>
        </div>
        <div className="sd-stat-card">
          <FaChartLine className="sd-stat-card__icon" />
          <div className="sd-stat-card__value">{totalSets}</div>
          <div className="sd-stat-card__label">Sets registrados</div>
        </div>
      </div>

      {/* Mis Pautas */}
      <div className="sd-section">
        <h2 className="sd-section__title">
          <FaDumbbell /> Mis Pautas Asignadas
        </h2>

        {assignments.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <FaDumbbell style={{ fontSize: '2rem', opacity: 0.3 }} />
            <p>Tu profesor/a aún no te ha asignado pautas</p>
          </div>
        ) : (
          <div className="sd-pautas-list">
            {assignments.map((a) => (
              <div key={a.id} className="sd-pauta-card">
                <div
                  className="sd-pauta-card__header"
                  onClick={() => setExpandedPauta(expandedPauta === a.id ? null : a.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <h3>{a.pautas.titulo}</h3>
                  <span className="sd-pauta-card__date">
                    <FaCalendarAlt /> {a.pautas.mes} {a.pautas.anio}
                  </span>
                </div>

                {expandedPauta === a.id && (
                  <div className="sd-pauta-card__body">
                    {a.pautas.descripcion && (
                      <p className="sd-pauta-card__desc">{a.pautas.descripcion}</p>
                    )}
                    {a.pautas.calentamiento && (
                      <div className="sd-pauta-card__warmup">
                        <strong>🔥 Calentamiento:</strong> {a.pautas.calentamiento}
                      </div>
                    )}
                    <div className="sd-exercises-list">
                      {(a.pautas.ejercicios || []).map((ej, idx) => (
                        <div key={ej.id} className="sd-exercise-item">
                          <div className="sd-exercise-item__number">{idx + 1}</div>
                          <div className="sd-exercise-item__info">
                            <h4>{ej.nombre}</h4>
                            {ej.series_repeticiones && (
                              <p className="sd-exercise-item__sets">{ej.series_repeticiones}</p>
                            )}
                            {ej.cargas_kg && (
                              <p className="sd-exercise-item__load">Carga: {ej.cargas_kg}</p>
                            )}
                            {ej.observaciones && (
                              <p className="sd-exercise-item__obs">{ej.observaciones}</p>
                            )}
                            {ej.video_url && (
                              <a
                                href={ej.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="sd-exercise-item__video"
                              >
                                🎬 Ver video
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial de sesiones */}
      <div className="sd-section">
        <h2 className="sd-section__title">
          <FaClipboardList /> Mis Sesiones
        </h2>

        {workoutLogs.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <FaClipboardList style={{ fontSize: '2rem', opacity: 0.3 }} />
            <p>Aún no tienes sesiones registradas</p>
          </div>
        ) : (
          <div className="sd-sessions-list">
            {workoutLogs.map((log) => (
              <div key={log.id} className="sd-session-card">
                <div className="sd-session-card__header">
                  <h4>
                    {log.assignment?.pautas?.titulo || 'Sesión'}
                    {log.completed && (
                      <FaCheckCircle style={{ color: 'var(--success)', marginLeft: '0.5rem', fontSize: '0.85rem' }} />
                    )}
                  </h4>
                  <span className="sd-session-card__date">
                    {new Date(log.date).toLocaleDateString('es-CL')}
                  </span>
                </div>
                <div className="sd-session-card__meta">
                  <span>{log.exercise_logs.length} registros</span>
                  <span className={`badge badge--${log.completed ? 'success' : 'muted'}`}>
                    {log.completed ? 'Completada' : 'Borrador'}
                  </span>
                </div>
                {log.notes && <p className="sd-session-card__notes">{log.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progreso por ejercicio */}
      {allExercises.length > 0 && (
        <div className="sd-section">
          <h2 className="sd-section__title">
            <FaChartLine /> Mi Progreso
          </h2>
          <div className="sd-progress-buttons">
            {allExercises.map((ej) => (
              <button
                key={ej.id}
                className={`btn btn--sm ${selectedExercise?.id === ej.id ? 'btn--primary' : 'btn--outline'}`}
                onClick={() => loadProgress(ej.id, ej.nombre)}
              >
                <FaChartLine /> {ej.nombre}
              </button>
            ))}
          </div>

          {selectedExercise && (
            <div className="sd-progress-detail">
              <h3>{selectedExercise.nombre}</h3>
              {progressLoading ? (
                <div className="loading">Cargando progreso...</div>
              ) : progressData.length === 0 ? (
                <p style={{ color: 'var(--text-light)' }}>Sin datos de progreso</p>
              ) : (
                <div className="ejercicios-table-container">
                  <table className="ejercicios-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Set</th>
                        <th>Reps</th>
                        <th>Peso (kg)</th>
                        <th>RPE</th>
                        <th>Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {progressData.map((e) => (
                        <tr key={e.id}>
                          <td>{new Date(e.workout_log.date).toLocaleDateString('es-CL')}</td>
                          <td>{e.set_number}</td>
                          <td>{e.reps_completed ?? '—'}</td>
                          <td>{e.weight_kg != null ? Number(e.weight_kg) : '—'}</td>
                          <td>{e.rpe ?? '—'}</td>
                          <td>{e.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {profile?.goal && (
        <div className="sd-section">
          <h2 className="sd-section__title"><FaUser /> Mi Objetivo</h2>
          <div className="detail-section__box">{profile.goal}</div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
