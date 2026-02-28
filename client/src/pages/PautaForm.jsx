import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSave, FaArrowLeft, FaPlus } from 'react-icons/fa';
import { getPauta, createPauta, updatePauta } from '../api/api';
import EjercicioForm, { emptyEjercicio } from '../components/EjercicioForm';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function PautaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    titulo: '',
    mes: MESES[new Date().getMonth()],
    anio: new Date().getFullYear(),
    descripcion: '',
    calentamiento: '',
  });

  const [ejercicios, setEjercicios] = useState([{ ...emptyEjercicio }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadPauta();
    }
  }, [id]);

  const loadPauta = async () => {
    try {
      const { data } = await getPauta(id);
      setForm({
        titulo: data.titulo,
        mes: data.mes,
        anio: data.anio,
        descripcion: data.descripcion || '',
        calentamiento: data.calentamiento || '',
      });
      if (data.ejercicios && data.ejercicios.length > 0) {
        setEjercicios(
          data.ejercicios.map((ej) => ({
            nombre: ej.nombre || '',
            series_repeticiones: ej.series_repeticiones || '',
            cargas_kg: ej.cargas_kg || '',
            observaciones: ej.observaciones || '',
            video_url: ej.video_url || '',
          }))
        );
      }
    } catch (error) {
      toast.error('Error al cargar la pauta');
      navigate('/');
    }
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleEjercicioChange = (index, updatedEjercicio) => {
    const newEjercicios = [...ejercicios];
    newEjercicios[index] = updatedEjercicio;
    setEjercicios(newEjercicios);
  };

  const addEjercicio = () => {
    setEjercicios([...ejercicios, { ...emptyEjercicio }]);
  };

  const removeEjercicio = (index) => {
    if (ejercicios.length === 1) {
      toast.warning('Debe haber al menos un ejercicio');
      return;
    }
    setEjercicios(ejercicios.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.titulo.trim()) {
      toast.warning('El título es obligatorio');
      return;
    }

    const validEjercicios = ejercicios.filter((ej) => ej.nombre.trim());
    if (validEjercicios.length === 0) {
      toast.warning('Agrega al menos un ejercicio con nombre');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        ejercicios: validEjercicios,
      };

      if (isEditing) {
        await updatePauta(id, payload);
        toast.success('Pauta actualizada correctamente');
      } else {
        await createPauta(payload);
        toast.success('Pauta creada correctamente');
      }
      navigate('/');
    } catch (error) {
      toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} la pauta`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>{isEditing ? 'Editar Pauta' : 'Crear Nueva Pauta'}</h1>
        <button className="btn btn--outline" onClick={() => navigate('/')}>
          <FaArrowLeft /> Volver
        </button>
      </div>

      <form className="form-container" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título de la pauta *</label>
          <input
            type="text"
            value={form.titulo}
            onChange={(e) => handleChange('titulo', e.target.value)}
            placeholder="Ej: Pauta de Entrenamiento Tren Inferior"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Mes</label>
            <select value={form.mes} onChange={(e) => handleChange('mes', e.target.value)}>
              {MESES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Año</label>
            <input
              type="number"
              value={form.anio}
              onChange={(e) => handleChange('anio', parseInt(e.target.value))}
              min={2020}
              max={2040}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Calentamiento</label>
          <textarea
            value={form.calentamiento}
            onChange={(e) => handleChange('calentamiento', e.target.value)}
            placeholder="Siempre realizar movilidad articular previo a la sesión de entrenamiento, además integrar ejercicios abdominales dinámicos..."
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>Descripción general</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => handleChange('descripcion', e.target.value)}
            placeholder="Notas o indicaciones generales de la pauta..."
            rows={3}
          />
        </div>

        {/* Sección de ejercicios */}
        <div className="ejercicios-section">
          <div className="ejercicios-section__header">
            <h3>Ejercicios ({ejercicios.length})</h3>
            <button type="button" className="btn btn--success btn--sm" onClick={addEjercicio}>
              <FaPlus /> Agregar Ejercicio
            </button>
          </div>

          {ejercicios.map((ej, index) => (
            <EjercicioForm
              key={index}
              ejercicio={ej}
              index={index}
              onChange={handleEjercicioChange}
              onRemove={removeEjercicio}
            />
          ))}
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            <FaSave /> {loading ? 'Guardando...' : isEditing ? 'Actualizar Pauta' : 'Guardar Pauta'}
          </button>
          <button type="button" className="btn btn--outline" onClick={() => navigate('/')}>
            Cancelar
          </button>
        </div>
      </form>
    </>
  );
}

export default PautaForm;
