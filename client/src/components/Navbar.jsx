import { Link, useLocation } from 'react-router-dom';
import { FaDumbbell, FaPlus, FaUsers, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAlumno = user?.rol === 'alumno';
  const isAlumnos = location.pathname.startsWith('/alumnos');

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__logo">
        <FaDumbbell className="navbar__logo-icon" />
        <span>{isAlumno ? 'Mi Entrenamiento' : 'Pautas de Entrenamiento'}</span>
      </Link>
      <div className="navbar__links">
        {!isAlumno && (
          <>
            <Link to="/" className={`navbar__link ${!isAlumnos ? 'navbar__link--active' : ''}`}>
              <FaDumbbell /> <span>Pautas</span>
            </Link>
            <Link to="/alumnos" className={`navbar__link ${isAlumnos ? 'navbar__link--active' : ''}`}>
              <FaUsers /> <span>Alumnos</span>
            </Link>
            <Link to={isAlumnos ? '/alumnos/crear' : '/crear'} className="navbar__link navbar__link--cta">
              <FaPlus /> <span>{isAlumnos ? 'Nuevo Alumno' : 'Nueva Pauta'}</span>
            </Link>
          </>
        )}
        {user && (
          <div className="navbar__user">
            <span className="navbar__user-name">
              <FaUser style={{ fontSize: '0.75rem' }} /> {user.nombre} {user.apellido}
              {isAlumno && <span className="badge badge--info" style={{ marginLeft: '0.4rem', fontSize: '0.65rem' }}>Alumno</span>}
            </span>
            <button className="navbar__link navbar__link--logout" onClick={logout} title="Cerrar sesión">
              <FaSignOutAlt />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
