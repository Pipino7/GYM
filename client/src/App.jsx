import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import PautasList from './pages/PautasList';
import PautaForm from './pages/PautaForm';
import PautaDetail from './pages/PautaDetail';
import StudentsList from './pages/StudentsList';
import StudentForm from './pages/StudentForm';
import StudentDetail from './pages/StudentDetail';
import WorkoutSession from './pages/WorkoutSession';
import ExerciseHistory from './pages/ExerciseHistory';
import StudentDashboard from './pages/StudentDashboard';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  const isAlumno = user?.rol === 'alumno';

  return (
    <Routes>
      {/* Ruta pública */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />

      {/* Dashboard del alumno */}
      {isAlumno ? (
        <>
          <Route path="/" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          {/* Rutas protegidas del profesor */}
          <Route path="/" element={<ProtectedRoute><PautasList /></ProtectedRoute>} />
          <Route path="/crear" element={<ProtectedRoute><PautaForm /></ProtectedRoute>} />
          <Route path="/editar/:id" element={<ProtectedRoute><PautaForm /></ProtectedRoute>} />
          <Route path="/pauta/:id" element={<ProtectedRoute><PautaDetail /></ProtectedRoute>} />

          <Route path="/alumnos" element={<ProtectedRoute><StudentsList /></ProtectedRoute>} />
          <Route path="/alumnos/crear" element={<ProtectedRoute><StudentForm /></ProtectedRoute>} />
          <Route path="/alumnos/editar/:id" element={<ProtectedRoute><StudentForm /></ProtectedRoute>} />
          <Route path="/alumnos/:id" element={<ProtectedRoute><StudentDetail /></ProtectedRoute>} />

          <Route path="/alumnos/:studentId/sesion/nueva" element={<ProtectedRoute><WorkoutSession /></ProtectedRoute>} />
          <Route path="/alumnos/:studentId/sesion/:logId" element={<ProtectedRoute><WorkoutSession /></ProtectedRoute>} />

          <Route path="/alumnos/:studentId/historial/:exerciseId" element={<ProtectedRoute><ExerciseHistory /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app">
      {isAuthenticated && <Navbar />}
      <main className={isAuthenticated ? 'main-content' : ''}>
        <AppRoutes />
      </main>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        theme="colored"
      />
    </div>
  );
}

export default App;
