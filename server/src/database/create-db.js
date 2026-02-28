const { Client } = require('pg');
require('dotenv').config();

const createDatabase = async () => {
  const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: 'postgres', // Conectar a la base de datos por defecto
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // Verificar si la base de datos ya existe
    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_DATABASE]
    );

    if (res.rows.length > 0) {
      console.log(`✅ La base de datos '${process.env.DB_DATABASE}' ya existe`);
    } else {
      // Crear la base de datos
      await client.query(`CREATE DATABASE ${process.env.DB_DATABASE}`);
      console.log(`✅ Base de datos '${process.env.DB_DATABASE}' creada correctamente`);
    }

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nPosibles soluciones:');
    console.error('1. Verifica que PostgreSQL esté corriendo');
    console.error('2. Verifica que el usuario y password sean correctos');
    console.error('3. Verifica que PostgreSQL esté escuchando en localhost:5432');
    process.exit(1);
  }
};

createDatabase();
