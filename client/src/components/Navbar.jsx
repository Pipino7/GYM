import { Link, useLocation } from 'react-router-dom';
import { FaDumbbell, FaPlus, FaUsers } from 'react-icons/fa';

function Navbar() {
  const location = useLocation();
  const isAlumnos = location.pathname.startsWith('/alumnos');

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__logo">
        <FaDumbbell className="navbar__logo-icon" />
        <span>Pautas de Entrenamiento</span>
      </Link>
      <div className="navbar__links">
        <Link to="/" className={`navbar__link ${!isAlumnos ? 'navbar__link--active' : ''}`}>
          <FaDumbbell /> Pautas
        </Link>
        <Link to="/alumnos" className={`navbar__link ${isAlumnos ? 'navbar__link--active' : ''}`}>
          <FaUsers /> Alumnos
        </Link>
        <Link to={isAlumnos ? '/alumnos/crear' : '/crear'} className="navbar__link navbar__link--cta">
          <FaPlus /> {isAlumnos ? 'Nuevo Alumno' : 'Nueva Pauta'}
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
