import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaChartLine } from 'react-icons/fa';
import { getExerciseProgress, getStudent } from '../api/api';

/**
 * ExerciseHistory — Shows all logged sets for a given exercise + student.
 * Route: /alumnos/:studentId/historial/:exerciseId
 */
function ExerciseHistory() {
  const { studentId, exerciseId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    loadData();
  }, [studentId, exerciseId]);

  const loadData = async () => {
    try {
      const [studentRes, progressRes] = await Promise.all([
        getStudent(studentId),
        getExerciseProgress(studentId, exerciseId, {
          ...(from && { from }),
          ...(to && { to }),
        }),
      ]);
      setStudent(studentRes.data);
      setEntries(progressRes.data);
    } catch (err) {
      toast.error('Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    setLoading(true);
    getExerciseProgress(studentId, exerciseId, {
      ...(from && { from }),
      ...(to && { to }),
    })
      .then(({ data }) => setEntries(data))
      .catch(() => toast.error('Error al filtrar'))
      .finally(() => setLoading(false));
  };

  // ─── Chart data (best set per date = max weight) ─────────
  const chartData = useMemo(() => {
    const byDate = {};
    entries.forEach((e) => {
      const d = new Date(e.workout_log.date).toLocaleDateString('es-CL');
      const w = e.weight_kg != null ? Number(e.weight_kg) : 0;
      if (!byDate[d] || w > byDate[d]) byDate[d] = w;
    });
    return Object.entries(byDate).map(([date, weight]) => ({ date, weight }));
  }, [entries]);

  const exerciseName = entries.length > 0 ? entries[0].ejercicios.nombre : `Ejercicio #${exerciseId}`;

  if (loading) return <div className="loading">Cargando historial...</div>;

  return (
    <>
      <div className="page-header">
        <h1>
          <FaChartLine style={{ marginRight: '0.5rem' }} />
          Historial: {exerciseName}
        </h1>
        <button className="btn btn--outline" onClick={() => navigate(`/alumnos/${studentId}`)}>
          <FaArrowLeft /> Volver
        </button>
      </div>

      {student && (
        <p style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>
          Alumno: <strong>{student.name}</strong>
        </p>
      )}

      {/* Date filter */}
      <form className="history-filter" onSubmit={handleFilter}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Desde</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Hasta</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <button type="submit" className="btn btn--primary btn--sm" style={{ alignSelf: 'flex-end' }}>
          Filtrar
        </button>
      </form>

      {entries.length === 0 ? (
        <div className="empty-state" style={{ padding: '3rem' }}>
          <FaChartLine style={{ fontSize: '2rem', opacity: 0.3 }} />
          <p style={{ marginTop: '0.5rem' }}>No hay registros para este ejercicio</p>
        </div>
      ) : (
        <>
          {/* Simple SVG line chart */}
          {chartData.length >= 2 && <ProgressChart data={chartData} />}

          {/* Data table */}
          <div className="detail-container" style={{ marginTop: '1.5rem' }}>
            <div className="detail-body">
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
                    {entries.map((e) => (
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
            </div>
          </div>
        </>
      )}
    </>
  );
}

/**
 * ProgressChart — Lightweight pure-SVG line chart. No external deps.
 */
function ProgressChart({ data }) {
  const W = 700;
  const H = 220;
  const PX = 50;
  const PY = 24;
  const CW = W - PX * 2;
  const CH = H - PY * 2;

  const weights = data.map((d) => d.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  const points = data.map((d, i) => {
    const x = PX + (i / (data.length - 1)) * CW;
    const y = PY + CH - ((d.weight - minW) / range) * CH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  return (
    <div className="detail-container" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '1rem' }}>
        Progreso de peso (mejor set por sesión)
      </h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="progress-chart" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = PY + CH - frac * CH;
          const val = (minW + frac * range).toFixed(1);
          return (
            <g key={frac}>
              <line x1={PX} y1={y} x2={PX + CW} y2={y} stroke="#e5e5ea" strokeWidth="0.5" />
              <text x={PX - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#7f8c8d">
                {val}
              </text>
            </g>
          );
        })}

        {/* Line */}
        <path d={linePath} fill="none" stroke="#3498db" strokeWidth="2.5" strokeLinejoin="round" />

        {/* Dots + labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#3498db" stroke="#fff" strokeWidth="2" />
            <text x={p.x} y={H - 4} textAnchor="middle" fontSize="7.5" fill="#7f8c8d"
              transform={`rotate(-35, ${p.x}, ${H - 4})`}>
              {p.date}
            </text>
          </g>
        ))}

        {/* Y axis label */}
        <text x="12" y={H / 2} textAnchor="middle" fontSize="9" fill="#7f8c8d"
          transform={`rotate(-90, 12, ${H / 2})`}>
          kg
        </text>
      </svg>
    </div>
  );
}

export default ExerciseHistory;
