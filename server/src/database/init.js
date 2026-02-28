const pool = require('./db');

const initDB = async () => {
  try {
    // Crear tabla de pautas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pautas (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        mes VARCHAR(50) NOT NULL,
        anio INTEGER NOT NULL,
        descripcion TEXT,
        calentamiento TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Crear tabla de ejercicios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ejercicios (
        id SERIAL PRIMARY KEY,
        pauta_id INTEGER REFERENCES pautas(id) ON DELETE CASCADE,
        nombre VARCHAR(255) NOT NULL,
        series_repeticiones VARCHAR(255),
        cargas_kg TEXT,
        observaciones TEXT,
        video_url TEXT,
        orden INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Base de datos inicializada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    process.exit(1);
  }
};

initDB();
