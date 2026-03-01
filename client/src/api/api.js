import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
});

// Auto-attach token from localStorage on init
const savedToken = localStorage.getItem('token');
if (savedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}

// Interceptor: if 401, remove token (session expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// === PAUTAS ===
export const getPautas = () => api.get('/pautas');
export const getPauta = (id) => api.get(`/pautas/${id}`);
export const createPauta = (data) => api.post('/pautas', data);
export const updatePauta = (id, data) => api.put(`/pautas/${id}`, data);
export const deletePauta = (id) => api.delete(`/pautas/${id}`);

// === EJERCICIOS ===
export const getEjercicios = (pautaId) => api.get(`/ejercicios/pauta/${pautaId}`);
export const createEjercicio = (data) => api.post('/ejercicios', data);
export const updateEjercicio = (id, data) => api.put(`/ejercicios/${id}`, data);
export const deleteEjercicio = (id) => api.delete(`/ejercicios/${id}`);

// === PDF ===
export const downloadPDF = (pautaId) =>
  api.get(`/pdf/${pautaId}`, { responseType: 'blob' });

// === STUDENTS ===
export const getStudents = () => api.get('/students');
export const getStudent = (id) => api.get(`/students/${id}`);
export const createStudent = (data) => api.post('/students', data);
export const updateStudent = (id, data) => api.patch(`/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/students/${id}`);
export const getStudentAssignments = (id) => api.get(`/students/${id}/assignments`);

// === STUDENT ACCOUNT (profesor crea cuenta para alumno) ===
export const createStudentAccount = (studentId, data) => api.post(`/students/${studentId}/account`, data);
export const removeStudentAccount = (studentId) => api.delete(`/students/${studentId}/account`);

// === STUDENT DASHBOARD (alumno logueado) ===
export const getMyProfile = () => api.get('/my/profile');
export const getMyAssignments = () => api.get('/my/assignments');
export const getMyWorkoutLogs = () => api.get('/my/workout-logs');
export const getMyProgress = (exerciseId) => api.get(`/my/progress/${exerciseId}`);

// === ASSIGNMENTS ===
export const createAssignment = (data) => api.post('/assignments', data);
export const archiveAssignment = (id) => api.patch(`/assignments/${id}/archive`);
export const deleteAssignment = (id) => api.delete(`/assignments/${id}`);

// === WORKOUT LOGS ===
export const createWorkoutLog = (data) => api.post('/workout-logs', data);
export const getWorkoutLog = (id) => api.get(`/workout-logs/${id}`);
export const getStudentWorkoutLogs = (studentId) => api.get(`/workout-logs/student/${studentId}`);
export const updateWorkoutLog = (id, data) => api.patch(`/workout-logs/${id}`, data);
export const deleteWorkoutLog = (id) => api.delete(`/workout-logs/${id}`);

// === EXERCISE LOGS ===
export const bulkSaveExerciseLogs = (workoutLogId, data) =>
  api.put(`/workout-logs/${workoutLogId}/exercises/bulk`, data);
export const getExerciseProgress = (studentId, exerciseId, params = {}) =>
  api.get(`/workout-logs/student/${studentId}/progress/${exerciseId}`, { params });

export default api;
