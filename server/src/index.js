const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { authMiddleware, requireProfesor, requireAlumno } = require('./middleware/auth');

const authRoutes = require('./routes/auth.routes');
const pautasRoutes = require('./routes/pautas.routes');
const ejerciciosRoutes = require('./routes/ejercicios.routes');
const pdfRoutes = require('./routes/pdf.routes');
const studentsRoutes = require('./routes/students.routes');
const assignmentsRoutes = require('./routes/assignments.routes');
const workoutLogsRoutes = require('./routes/workout-logs.routes');
const studentDashboardRoutes = require('./routes/student-dashboard.routes');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Middlewares
app.use(cors({
  origin: isProduction ? false : '*', // En producción Nginx maneja el proxy, no necesita CORS
}));
app.use(express.json({ limit: '10mb' }));

// Trust proxy (detrás de Nginx)
if (isProduction) {
  app.set('trust proxy', 1);
}

// Rutas públicas (auth)
app.use('/api/auth', authRoutes);

// Rutas protegidas (requieren autenticación)
app.use('/api/pautas', authMiddleware, requireProfesor, pautasRoutes);
app.use('/api/ejercicios', authMiddleware, requireProfesor, ejerciciosRoutes);
app.use('/api/pdf', authMiddleware, requireProfesor, pdfRoutes);
app.use('/api/students', authMiddleware, requireProfesor, studentsRoutes);
app.use('/api/assignments', authMiddleware, requireProfesor, assignmentsRoutes);
app.use('/api/workout-logs', authMiddleware, workoutLogsRoutes);

// Rutas del dashboard del alumno
app.use('/api/my', authMiddleware, requireAlumno, studentDashboardRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor(process.uptime()),
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

// ---- Graceful Shutdown ----
const shutdown = (signal) => {
  console.log(`\n⚡ ${signal} recibido. Cerrando servidor...`);
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
  // Forzar cierre después de 10s si no termina
  setTimeout(() => {
    console.error('⚠️ Forzando cierre después de 10s');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
