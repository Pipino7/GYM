import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaEdit,
  FaFilePdf,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import { getPauta, downloadPDF } from '../api/api';

function PautaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pauta, setPauta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPauta();
  }, [id]);

  const loadPauta = async () => {
    try {
      const { data } = await getPauta(id);
      setPauta(data);
    } catch (error) {
      toast.error('Error al cargar la pauta');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const { data } = await downloadPDF(pauta.id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `${pauta.titulo}_${pauta.mes}_${pauta.anio}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF descargado');
    } catch (error) {
      toast.error('Error al descargar el PDF');
    }
  };

  if (loading) {
    return <div className="loading">Cargando pauta...</div>;
  }

  if (!pauta) return null;

  return (
    <>
      <div className="page-header">
        <h1>Detalle de Pauta</h1>
        <button className="btn btn--outline" onClick={() => navigate('/')}>
          <FaArrowLeft /> Volver
        </button>
      </div>

      <div className="detail-container">
        <div className="detail-header">
          <h1>{pauta.titulo}</h1>
          <p>
            {pauta.mes} {pauta.anio}
          </p>
        </div>

        <div className="detail-body">
          <div className="detail-actions">
            <Link to={`/editar/${pauta.id}`} className="btn btn--primary btn--sm">
              <FaEdit /> Editar
            </Link>
            <button
              className="btn btn--success btn--sm"
              onClick={handleDownloadPDF}
            >
              <FaFilePdf /> Descargar PDF
            </button>
          </div>

          {pauta.calentamiento && (
            <div className="detail-section">
              <h3>Calentamiento</h3>
              <div className="detail-section__box">{pauta.calentamiento}</div>
            </div>
          )}

          {pauta.descripcion && (
            <div className="detail-section">
              <h3>Descripción</h3>
              <div className="detail-section__box">{pauta.descripcion}</div>
            </div>
          )}

          <div className="detail-section">
            <h3>Desarrollo - Ejercicios ({pauta.ejercicios?.length || 0})</h3>

            {pauta.ejercicios && pauta.ejercicios.length > 0 ? (
              <div className="ejercicios-table-container">
                <table className="ejercicios-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Ejercicio</th>
                      <th>S / R / D</th>
                      <th>Cargas kg</th>
                      <th>Observaciones</th>
                      <th>Videos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pauta.ejercicios.map((ej, index) => (
                      <tr key={ej.id}>
                        <td>{index + 1}</td>
                        <td>{ej.nombre}</td>
                        <td>{ej.series_repeticiones}</td>
                        <td style={{ whiteSpace: 'pre-wrap' }}>
                          {ej.cargas_kg}
                        </td>
                        <td style={{ whiteSpace: 'pre-wrap' }}>
                          {ej.observaciones}
                        </td>
                        <td>
                          {ej.video_url && (
                            <a
                              href={ej.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="video-link"
                            >
                              <FaExternalLinkAlt size={10} /> Ver video
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>
                No hay ejercicios registrados
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default PautaDetail;
