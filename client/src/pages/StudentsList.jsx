import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEdit, FaTrash, FaPlus, FaUsers, FaUser } from 'react-icons/fa';
import { getStudents, deleteStudent } from '../api/api';
import ConfirmModal from '../components/ConfirmModal';

function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const { data } = await getStudents();
      setStudents(data);
    } catch (error) {
      toast.error('Error al cargar los alumnos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStudent(deleteId);
      setStudents(students.filter((s) => s.id !== deleteId));
      toast.success('Alumno eliminado correctamente');
    } catch (error) {
      toast.error('Error al eliminar el alumno');
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return <div className="loading">Cargando alumnos...</div>;
  }

  return (
    <>
      <div className="page-header">
        <h1>Mis Alumnos</h1>
        <Link to="/alumnos/crear" className="btn btn--success">
          <FaPlus /> Nuevo Alumno
        </Link>
      </div>

      {students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">
            <FaUsers />
          </div>
          <h2>No hay alumnos registrados</h2>
          <p>Agrega tu primer alumno para comenzar a asignar pautas</p>
          <Link to="/alumnos/crear" className="btn btn--primary">
            <FaPlus /> Agregar primer alumno
          </Link>
        </div>
      ) : (
        <div className="students-grid">
          {students.map((student) => (
            <div key={student.id} className="student-card">
              <div className="student-card__avatar">
                <FaUser />
              </div>
              <div className="student-card__info">
                <h3 className="student-card__name">{student.name}</h3>
                {student.contact && (
                  <p className="student-card__contact">{student.contact}</p>
                )}
                {student.goal && (
                  <p className="student-card__goal">{student.goal}</p>
                )}
                <div className="student-card__meta">
                  <span className={`badge badge--${student.status === 'active' ? 'success' : 'muted'}`}>
                    {student.status === 'active' ? 'Activo' : student.status}
                  </span>
                  <span className="student-card__date">
                    Desde {new Date(student.created_at).toLocaleDateString('es-CL')}
                  </span>
                </div>
              </div>
              <div className="student-card__actions">
                <Link
                  to={`/alumnos/${student.id}`}
                  className="btn btn--info btn--sm"
                  title="Ver detalle"
                >
                  <FaEye /> Ver
                </Link>
                <Link
                  to={`/alumnos/editar/${student.id}`}
                  className="btn btn--primary btn--sm"
                  title="Editar"
                >
                  <FaEdit />
                </Link>
                <button
                  className="btn btn--danger btn--sm"
                  onClick={() => setDeleteId(student.id)}
                  title="Eliminar"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          title="¿Eliminar alumno?"
          message="Esta acción no se puede deshacer. Se eliminarán todas sus asignaciones de pautas."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  );
}

export default StudentsList;
