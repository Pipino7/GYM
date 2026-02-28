import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEdit, FaTrash, FaFilePdf, FaPlus, FaDumbbell, FaListUl } from 'react-icons/fa';
import { getPautas, deletePauta, downloadPDF } from '../api/api';
import ConfirmModal from '../components/ConfirmModal';

function PautasList() {
  const [pautas, setPautas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadPautas();
  }, []);

  const loadPautas = async () => {
    try {
      const { data } = await getPautas();
      setPautas(data);
    } catch (error) {
      toast.error('Error al cargar las pautas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePauta(deleteId);
      setPautas(pautas.filter((p) => p.id !== deleteId));
      toast.success('Pauta eliminada correctamente');
    } catch (error) {
      toast.error('Error al eliminar la pauta');
    } finally {
      setDeleteId(null);
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
      toast.success('PDF descargado correctamente');
    } catch (error) {
      toast.error('Error al descargar el PDF');
    }
  };

  if (loading) {
    return <div className="loading">Cargando pautas...</div>;
  }

  return (
    <>
      <div className="page-header">
        <h1>Mis Pautas de Entrenamiento</h1>
        <Link to="/crear" className="btn btn--success">
          <FaPlus /> Crear Pauta
        </Link>
      </div>

      {pautas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">
            <FaDumbbell />
          </div>
          <h2>No hay pautas creadas</h2>
          <p>Crea tu primera pauta de entrenamiento para comenzar</p>
          <Link to="/crear" className="btn btn--primary">
            <FaPlus /> Crear primera pauta
          </Link>
        </div>
      ) : (
        <div className="pautas-grid">
          {pautas.map((pauta) => (
            <div key={pauta.id} className="pauta-card">
              <div className="pauta-card__header">
                <h3 className="pauta-card__title">{pauta.titulo}</h3>
                <span className="pauta-card__date">
                  {pauta.mes} {pauta.anio}
                </span>
              </div>
              <div className="pauta-card__body">
                {pauta.descripcion && (
                  <p className="pauta-card__description">{pauta.descripcion}</p>
                )}
                <div className="pauta-card__stats">
                  <FaListUl />
                  <span>
                    Creada el{' '}
                    {new Date(pauta.created_at).toLocaleDateString('es-CL')}
                  </span>
                </div>
                <div className="pauta-card__actions">
                  <Link
                    to={`/pauta/${pauta.id}`}
                    className="btn btn--info btn--sm"
                    title="Ver detalle"
                  >
                    <FaEye /> Ver
                  </Link>
                  <Link
                    to={`/editar/${pauta.id}`}
                    className="btn btn--primary btn--sm"
                    title="Editar"
                  >
                    <FaEdit /> Editar
                  </Link>
                  <button
                    className="btn btn--success btn--sm"
                    onClick={() => handleDownloadPDF(pauta)}
                    title="Descargar PDF"
                  >
                    <FaFilePdf /> PDF
                  </button>
                  <button
                    className="btn btn--danger btn--sm"
                    onClick={() => setDeleteId(pauta.id)}
                    title="Eliminar"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          title="¿Eliminar pauta?"
          message="Esta acción no se puede deshacer. Se eliminarán todos los ejercicios asociados."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  );
}

export default PautasList;
