import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import PautasList from './pages/PautasList';
import PautaForm from './pages/PautaForm';
import PautaDetail from './pages/PautaDetail';
import StudentsList from './pages/StudentsList';
import StudentForm from './pages/StudentForm';
import StudentDetail from './pages/StudentDetail';
import WorkoutSession from './pages/WorkoutSession';
import ExerciseHistory from './pages/ExerciseHistory';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Pautas */}
            <Route path="/" element={<PautasList />} />
            <Route path="/crear" element={<PautaForm />} />
            <Route path="/editar/:id" element={<PautaForm />} />
            <Route path="/pauta/:id" element={<PautaDetail />} />

            {/* Alumnos */}
            <Route path="/alumnos" element={<StudentsList />} />
            <Route path="/alumnos/crear" element={<StudentForm />} />
            <Route path="/alumnos/editar/:id" element={<StudentForm />} />
            <Route path="/alumnos/:id" element={<StudentDetail />} />

            {/* Workout Sessions */}
            <Route path="/alumnos/:studentId/sesion/nueva" element={<WorkoutSession />} />
            <Route path="/alumnos/:studentId/sesion/:logId" element={<WorkoutSession />} />

            {/* Exercise History */}
            <Route path="/alumnos/:studentId/historial/:exerciseId" element={<ExerciseHistory />} />
          </Routes>
        </main>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          theme="colored"
        />
      </div>
    </Router>
  );
}

export default App;
