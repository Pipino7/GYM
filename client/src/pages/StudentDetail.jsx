import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaEdit,
  FaPlus,
  FaUser,
  FaDumbbell,
  FaArchive,
  FaTrash,
  FaFilePdf,
  FaClipboardList,
  FaChartLine,
  FaCheckCircle,
  FaKey,
  FaEnvelope,
  FaUserSlash,
} from 'react-icons/fa';
import {
  getStudent,
  getStudentAssignments,
  getPautas,
  createAssignment,
  archiveAssignment,
  deleteAssignment,
  downloadPDF,
  getStudentWorkoutLogs,
  createStudentAccount,
  removeStudentAccount,
} from '../api/api';
import ConfirmModal from '../components/ConfirmModal';

function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [pautas, setPautas] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedPautaId, setSelectedPautaId] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  // Account form state
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [accountForm, setAccountForm] = useState({ email: '', password: '' });
  const [accountLoading, setAccountLoading] = useState(false);
  const [deleteAccountTarget, setDeleteAccountTarget] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [studentRes, assignmentsRes, pautasRes, logsRes] = await Promise.all([
        getStudent(id),
        getStudentAssignments(id),
        getPautas(),
        getStudentWorkoutLogs(id),
      ]);
      setStudent(studentRes.data);
      setAssignments(assignmentsRes.data);
      setPautas(pautasRes.data);
      setWorkoutLogs(logsRes.data);
    } catch (error) {
      toast.error('Error al cargar datos del alumno');
      navigate('/alumnos');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedPautaId) {
      toast.warning('Selecciona una pauta');
      return;
    }

    setAssigning(true);
    try {
      await createAssignment({
        routineId: Number(selectedPautaId),
        studentId: Number(id),
        startsAt: startsAt || null,
      });
      toast.success('Pauta asignada correctamente');
      setShowAssignForm(false);
      setSelectedPautaId('');
      setStartsAt('');
      // Reload assignments
      const { data } = await getStudentAssignments(id);
      setAssignments(data);
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error('Esta pauta ya está asignada y activa para este alumno');
      } else {
        toast.error('Error al asignar la pauta');
      }
    } finally {
      setAssigning(false);
    }
  };

  const handleArchive = async (assignmentId) => {
    try {
      await archiveAssignment(assignmentId);
      toast.success('Asignación archivada');
      const { data } = await getStudentAssignments(id);
      setAssignments(data);
    } catch (error) {
      toast.error('Error al archivar la asignación');
    }
  };

  const handleDeleteAssignment = async () => {
    try {
      await deleteAssignment(deleteTarget);
      toast.success('Asignación eliminada');
      setAssignments(assignments.filter((a) => a.id !== deleteTarget));
    } catch (error) {
      toast.error('Error al eliminar la asignación');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDownloadPDF = async (pauta) => {
    try {
      const { data } = await downloadPDF(pauta.id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${pauta.titulo}_${pauta.mes}_${pauta.anio}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF descargado');
    } catch (error) {
      toast.error('Error al descargar el PDF');
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!accountForm.email.trim() || !accountForm.password.trim()) {
      toast.warning('Email y contraseña son requeridos');
      return;
    }
    setAccountLoading(true);
    try {
      const { data: updatedStudent } = await createStudentAccount(id, accountForm);
      setStudent(updatedStudent);
      setShowAccountForm(false);
      setAccountForm({ email: '', password: '' });
      toast.success('Cuenta creada exitosamente. El alumno ya puede iniciar sesión.');
    } catch (error) {
      const msg = error.response?.data?.error || 'Error al crear la cuenta';
      toast.error(msg);
    } finally {
      setAccountLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await removeStudentAccount(id);
      setStudent({ ...student, usuario_id: null, usuario: null });
      toast.success('Cuenta de acceso eliminada');
    } catch (error) {
      toast.error('Error al eliminar la cuenta');
    } finally {
      setDeleteAccountTarget(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando alumno...</div>;
  }

  if (!student) return null;

  const activeAssignments = assignments.filter((a) => a.status === 'active');
  const archivedAssignments = assignments.filter((a) => a.status !== 'active');

  // Unique exercises from workout logs for history links
  const allExercises = (() => {
    const map = new Map();
    workoutLogs.forEach((log) => {
      (log.exercise_logs || []).forEach((el) => {
        if (el.ejercicios && !map.has(el.ejercicios.id)) {
          map.set(el.ejercicios.id, el.ejercicios);
        }
      });
    });
    return Array.from(map.values());
  })();

  return (
    <>
      <div className="page-header">
        <h1>Detalle del Alumno</h1>
        <button className="btn btn--outline" onClick={() => navigate('/alumnos')}>
          <FaArrowLeft /> Volver
        </button>
      </div>

      {/* Student Info Card */}
      <div className="detail-container" style={{ marginBottom: '2rem' }}>
        <div className="detail-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <FaUser size={28} />
            <div>
              <h1>{student.name}</h1>
              <p>
                {student.contact && <span>{student.contact} · </span>}
                <span className={`badge badge--${student.status === 'active' ? 'success' : 'muted'}`}>
                  {student.status === 'active' ? 'Activo' : student.status}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="detail-body">
          <div className="detail-actions">
            <Link to={`/alumnos/editar/${student.id}`} className="btn btn--primary btn--sm">
              <FaEdit /> Editar
            </Link>
          </div>

          {student.goal && (
            <div className="detail-section">
              <h3>Objetivo</h3>
              <div className="detail-section__box">{student.goal}</div>
            </div>
          )}

          {(student.peso_kg || student.estatura_cm) && (
            <div className="detail-section">
              <h3>Datos Físicos</h3>
              <div className="detail-section__box">
                {student.peso_kg && <span>Peso: {Number(student.peso_kg)} kg</span>}
                {student.peso_kg && student.estatura_cm && ' — '}
                {student.estatura_cm && <span>Estatura: {Number(student.estatura_cm)} cm</span>}
              </div>
            </div>
          )}

          {/* Cuenta de acceso */}
          <div className="detail-section">
            <h3><FaKey style={{ marginRight: '0.4rem', fontSize: '0.9rem' }} /> Cuenta de Acceso</h3>
            {student.usuario ? (
              <div className="detail-section__box account-info">
                <div className="account-info__data">
                  <FaEnvelope style={{ color: 'var(--info)', marginRight: '0.4rem' }} />
                  <span>{student.usuario.email}</span>
                  <span className="badge badge--success" style={{ marginLeft: '0.75rem' }}>Activa</span>
                </div>
                <button
                  className="btn btn--danger btn--sm"
                  onClick={() => setDeleteAccountTarget(true)}
                  title="Eliminar cuenta"
                >
                  <FaUserSlash /> Eliminar cuenta
                </button>
              </div>
            ) : (
              <>
                {!showAccountForm ? (
                  <div className="detail-section__box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-light)' }}>Sin cuenta de acceso</span>
                    <button
                      className="btn btn--success btn--sm"
                      onClick={() => {
                        setAccountForm({ email: student.contact || '', password: '' });
                        setShowAccountForm(true);
                      }}
                    >
                      <FaKey /> Crear cuenta
                    </button>
                  </div>
                ) : (
                  <form className="account-form" onSubmit={handleCreateAccount}>
                    <div className="form-row" style={{ alignItems: 'flex-end' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Email (usuario) *</label>
                        <input
                          type="email"
                          value={accountForm.email}
                          onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                          placeholder="alumno@email.com"
                          required
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Contraseña *</label>
                        <input
                          type="text"
                          value={accountForm.password}
                          onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                          placeholder="Mínimo 6 caracteres"
                          required
                          minLength={6}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="btn btn--success btn--sm" disabled={accountLoading}>
                          {accountLoading ? 'Creando...' : 'Crear'}
                        </button>
                        <button
                          type="button"
                          className="btn btn--outline btn--sm"
                          onClick={() => setShowAccountForm(false)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                    <p className="account-form__hint">
                      El alumno podrá iniciar sesión con este email y contraseña para ver sus pautas y registrar su progreso.
                    </p>
                  </form>
                )}
              </>
            )}
          </div>

          <div className="detail-section">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
              Registrado el {new Date(student.created_at).toLocaleDateString('es-CL')}
            </p>
          </div>
        </div>
      </div>

      {/* Assignments Section */}
      <div className="detail-container">
        <div className="detail-body">
          <div className="ejercicios-section__header" style={{ marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
              <FaDumbbell style={{ marginRight: '0.5rem' }} />
              Pautas Asignadas ({activeAssignments.length} activas)
            </h3>
            <button
              className="btn btn--success btn--sm"
              onClick={() => setShowAssignForm(!showAssignForm)}
            >
              <FaPlus /> Asignar Pauta
            </button>
          </div>

          {/* Assign Form */}
          {showAssignForm && (
            <form className="assign-form" onSubmit={handleAssign}>
              <div className="form-row" style={{ alignItems: 'flex-end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Pauta a asignar</label>
                  <select
                    value={selectedPautaId}
                    onChange={(e) => setSelectedPautaId(e.target.value)}
                    required
                  >
                    <option value="">-- Seleccionar pauta --</option>
                    {pautas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.titulo} ({p.mes} {p.anio})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Fecha inicio (opcional)</label>
                  <input
                    type="date"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn btn--success btn--sm" disabled={assigning}>
                    {assigning ? 'Asignando...' : 'Asignar'}
                  </button>
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={() => setShowAssignForm(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Active Assignments */}
          {activeAssignments.length === 0 && !showAssignForm ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <FaDumbbell style={{ fontSize: '2rem', opacity: 0.3 }} />
              <p style={{ marginTop: '0.5rem' }}>Sin pautas asignadas activas</p>
            </div>
          ) : (
            <div className="assignments-list">
              {activeAssignments.map((a) => (
                <div key={a.id} className="assignment-card">
                  <div className="assignment-card__info">
                    <h4>{a.pautas.titulo}</h4>
                    <p>
                      {a.pautas.mes} {a.pautas.anio}
                      {a.starts_at && (
                        <span> · Inicio: {new Date(a.starts_at).toLocaleDateString('es-CL')}</span>
                      )}
                    </p>
                  </div>
                  <div className="assignment-card__actions">
                    <Link
                      to={`/alumnos/${id}/sesion/nueva?assignmentId=${a.id}`}
                      className="btn btn--success btn--sm"
                      title="Registrar sesión"
                    >
                      <FaClipboardList /> Registrar
                    </Link>
                    <Link to={`/pauta/${a.pautas.id}`} className="btn btn--info btn--sm" title="Ver pauta">
                      <FaEdit /> Ver
                    </Link>
                    <button
                      className="btn btn--success btn--sm"
                      onClick={() => handleDownloadPDF(a.pautas)}
                      title="Descargar PDF"
                    >
                      <FaFilePdf />
                    </button>
                    <button
                      className="btn btn--outline btn--sm"
                      onClick={() => handleArchive(a.id)}
                      title="Archivar"
                    >
                      <FaArchive />
                    </button>
                    <button
                      className="btn btn--danger btn--sm"
                      onClick={() => setDeleteTarget(a.id)}
                      title="Eliminar"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Archived Assignments */}
          {archivedAssignments.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ color: 'var(--text-light)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                Archivadas ({archivedAssignments.length})
              </h4>
              <div className="assignments-list">
                {archivedAssignments.map((a) => (
                  <div key={a.id} className="assignment-card assignment-card--archived">
                    <div className="assignment-card__info">
                      <h4>{a.pautas.titulo}</h4>
                      <p>
                        {a.pautas.mes} {a.pautas.anio}
                        <span className="badge badge--muted" style={{ marginLeft: '0.5rem' }}>
                          {a.status}
                        </span>
                      </p>
                    </div>
                    <div className="assignment-card__actions">
                      <button
                        className="btn btn--danger btn--sm"
                        onClick={() => setDeleteTarget(a.id)}
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="¿Eliminar asignación?"
          message="Esta acción eliminará la asignación de la pauta al alumno."
          onConfirm={handleDeleteAssignment}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {deleteAccountTarget && (
        <ConfirmModal
          title="¿Eliminar cuenta de acceso?"
          message="El alumno ya no podrá iniciar sesión. Sus datos y registros se mantienen."
          onConfirm={handleDeleteAccount}
          onCancel={() => setDeleteAccountTarget(false)}
        />
      )}

      {/* Workout Logs Section */}
      <div className="detail-container" style={{ marginTop: '2rem' }}>
        <div className="detail-body">
          <h3 style={{ color: 'var(--primary)', fontSize: '1.1rem', marginBottom: '1rem' }}>
            <FaClipboardList style={{ marginRight: '0.5rem' }} />
            Sesiones de Entrenamiento ({workoutLogs.length})
          </h3>

          {workoutLogs.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <FaClipboardList style={{ fontSize: '2rem', opacity: 0.3 }} />
              <p style={{ marginTop: '0.5rem' }}>Sin sesiones registradas aún</p>
            </div>
          ) : (
            <div className="assignments-list">
              {workoutLogs.map((log) => (
                <div key={log.id} className="assignment-card">
                  <div className="assignment-card__info">
                    <h4>
                      {log.assignment?.pautas?.titulo || 'Sesión'}
                      {log.completed && (
                        <FaCheckCircle style={{ color: 'var(--success)', marginLeft: '0.5rem', fontSize: '0.85rem' }} />
                      )}
                    </h4>
                    <p>
                      {new Date(log.date).toLocaleDateString('es-CL')}
                      <span style={{ marginLeft: '0.5rem' }}>
                        · {log.exercise_logs.length} registros
                      </span>
                      <span className={`badge badge--${log.completed ? 'success' : 'muted'}`} style={{ marginLeft: '0.5rem' }}>
                        {log.completed ? 'Completada' : 'Borrador'}
                      </span>
                    </p>
                  </div>
                  <div className="assignment-card__actions">
                    <Link
                      to={`/alumnos/${id}/sesion/${log.id}`}
                      className="btn btn--info btn--sm"
                    >
                      <FaEdit /> {log.completed ? 'Ver' : 'Editar'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Exercise History Quick Links */}
          {allExercises.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ color: 'var(--text-light)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                <FaChartLine style={{ marginRight: '0.3rem' }} />
                Ver historial por ejercicio
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {allExercises.map((ej) => (
                  <Link
                    key={ej.id}
                    to={`/alumnos/${id}/historial/${ej.id}`}
                    className="btn btn--outline btn--sm"
                  >
                    <FaChartLine /> {ej.nombre}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default StudentDetail;
