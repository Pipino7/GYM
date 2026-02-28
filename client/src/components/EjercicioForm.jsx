import { FaTrash } from 'react-icons/fa';

const emptyEjercicio = {
  nombre: '',
  series_repeticiones: '',
  cargas_kg: '',
  observaciones: '',
  video_url: '',
};

function EjercicioForm({ ejercicio, index, onChange, onRemove }) {
  const handleChange = (field, value) => {
    onChange(index, { ...ejercicio, [field]: value });
  };

  return (
    <div className="ejercicio-item">
      <div className="ejercicio-item__number">{index + 1}</div>
      <button
        type="button"
        className="ejercicio-item__remove"
        onClick={() => onRemove(index)}
        title="Eliminar ejercicio"
      >
        <FaTrash size={12} />
      </button>

      <div className="form-row" style={{ marginTop: '0.5rem' }}>
        <div className="form-group">
          <label>Ejercicio</label>
          <input
            type="text"
            value={ejercicio.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            placeholder="Ej: Sentadilla en barra smith"
            required
          />
        </div>
        <div className="form-group">
          <label>Series / Repeticiones / Descanso</label>
          <input
            type="text"
            value={ejercicio.series_repeticiones}
            onChange={(e) => handleChange('series_repeticiones', e.target.value)}
            placeholder="Ej: 3 series, 10 a 12 rep, 2 min descanso"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Cargas (kg)</label>
        <textarea
          value={ejercicio.cargas_kg}
          onChange={(e) => handleChange('cargas_kg', e.target.value)}
          placeholder="Ej: Serie 1: Carga elevada entre 10 a 12 rep&#10;Serie 2: Bajar la carga y mantener"
          rows={2}
        />
      </div>

      <div className="form-group">
        <label>Observaciones</label>
        <textarea
          value={ejercicio.observaciones}
          onChange={(e) => handleChange('observaciones', e.target.value)}
          placeholder="Instrucciones de forma, posición, postura..."
          rows={2}
        />
      </div>

      <div className="form-group">
        <label>URL de Video</label>
        <input
          type="url"
          value={ejercicio.video_url}
          onChange={(e) => handleChange('video_url', e.target.value)}
          placeholder="https://www.tiktok.com/... o https://www.instagram.com/..."
        />
      </div>
    </div>
  );
}

export { emptyEjercicio };
export default EjercicioForm;
