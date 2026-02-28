const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pautasRoutes = require('./routes/pautas.routes');
const ejerciciosRoutes = require('./routes/ejercicios.routes');
const pdfRoutes = require('./routes/pdf.routes');
const studentsRoutes = require('./routes/students.routes');
const assignmentsRoutes = require('./routes/assignments.routes');
const workoutLogsRoutes = require('./routes/workout-logs.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/pautas', pautasRoutes);
app.use('/api/ejercicios', ejerciciosRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/workout-logs', workoutLogsRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
