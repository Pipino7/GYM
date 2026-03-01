import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaDumbbell, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

function LoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        if (!form.nombre.trim() || !form.apellido.trim()) {
          toast.warning('Nombre y apellido son requeridos');
          setLoading(false);
          return;
        }
        await register({
          email: form.email,
          password: form.password,
          nombre: form.nombre,
          apellido: form.apellido,
        });
        toast.success('Cuenta creada exitosamente');
      } else {
        await login(form.email, form.password);
        toast.success('Bienvenido/a');
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Error de autenticación';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <FaDumbbell className="login-card__icon" />
          <h1>Pautas de Entrenamiento</h1>
          <p>{isRegister ? 'Crear cuenta de profesor' : 'Iniciar sesión como profesor o alumno'}</p>
        </div>

        <form className="login-card__form" onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  placeholder="Camila"
                  required={isRegister}
                />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input
                  type="text"
                  value={form.apellido}
                  onChange={(e) => handleChange('apellido', e.target.value)}
                  placeholder="Aguayo"
                  required={isRegister}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="camila@gym.cl"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary login-card__submit"
            disabled={loading}
          >
            {isRegister ? <FaUserPlus /> : <FaSignInAlt />}
            {loading
              ? 'Cargando...'
              : isRegister
              ? 'Crear cuenta'
              : 'Iniciar sesión'}
          </button>
        </form>

        <div className="login-card__toggle">
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
