import axios from 'axios';

// ⚠️  Cambia esta IP por la de tu computador en la red local.
// En la app web está en localhost:5000, pero el celular necesita la IP real.
// Corre `ipconfig` (Windows) o `ifconfig` (Mac/Linux) para encontrarla.
export const API_BASE_URL = 'http://192.168.1.83:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// === STUDENTS ===
export const getStudents = () => api.get('/students');
export const getStudent = (id) => api.get(`/students/${id}`);
export const getStudentAssignments = (id) => api.get(`/students/${id}/assignments`);

// === WORKOUT LOGS ===
export const createWorkoutLog = (data) => api.post('/workout-logs', data);
export const getWorkoutLog = (id) => api.get(`/workout-logs/${id}`);
export const getStudentWorkouts = (studentId) =>
  api.get(`/workout-logs/student/${studentId}`);
export const updateWorkoutLog = (id, data) => api.patch(`/workout-logs/${id}`, data);
export const deleteWorkoutLog = (id) => api.delete(`/workout-logs/${id}`);

// === EXERCISE LOGS ===
export const logSet = (workoutLogId, data) =>
  api.post(`/workout-logs/${workoutLogId}/exercises`, data);
export const updateSet = (logId, data) =>
  api.patch(`/workout-logs/exercises/${logId}`, data);
export const deleteSet = (logId) =>
  api.delete(`/workout-logs/exercises/${logId}`);

// === PROGRESS ===
export const getExerciseProgress = (studentId, exerciseId) =>
  api.get(`/workout-logs/student/${studentId}/progress/${exerciseId}`);

// === PAUTAS ===
export const getEjercicios = (pautaId) => api.get(`/ejercicios/pauta/${pautaId}`);

export default api;
