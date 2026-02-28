import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { getStudent, createStudent, updateStudent } from '../api/api';

function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    contact: '',
    goal: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadStudent();
    }
  }, [id]);

  const loadStudent = async () => {
    try {
      const { data } = await getStudent(id);
      setForm({
        name: data.name || '',
        contact: data.contact || '',
        goal: data.goal || '',
        status: data.status || 'active',
      });
    } catch (error) {
      toast.error('Error al cargar el alumno');
      navigate('/alumnos');
    }
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.warning('El nombre es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        contact: form.contact.trim() || null,
        goal: form.goal.trim() || null,
        status: form.status,
      };

      if (isEditing) {
        await updateStudent(id, payload);
        toast.success('Alumno actualizado correctamente');
      } else {
        await createStudent(payload);
        toast.success('Alumno creado correctamente');
      }
      navigate('/alumnos');
    } catch (error) {
      toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} el alumno`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>{isEditing ? 'Editar Alumno' : 'Nuevo Alumno'}</h1>
        <button className="btn btn--outline" onClick={() => navigate('/alumnos')}>
          <FaArrowLeft /> Volver
        </button>
      </div>

      <form className="form-container" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre completo *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ej: María López"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Contacto</label>
            <input
              type="text"
              value={form.contact}
              onChange={(e) => handleChange('contact', e.target.value)}
              placeholder="Email, teléfono o Instagram"
            />
          </div>
          <div className="form-group">
            <label>Estado</label>
            <select value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Objetivo</label>
          <textarea
            value={form.goal}
            onChange={(e) => handleChange('goal', e.target.value)}
            placeholder="Ej: Ganar masa muscular, bajar de peso, mejorar resistencia..."
            rows={3}
          />
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            <FaSave /> {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar Alumno'}
          </button>
          <button type="button" className="btn btn--outline" onClick={() => navigate('/alumnos')}>
            Cancelar
          </button>
        </div>
      </form>
    </>
  );
}

export default StudentForm;
