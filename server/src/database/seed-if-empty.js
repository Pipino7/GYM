/**
 * seed-if-empty.js — Solo ejecuta el seed si la DB no tiene usuarios
 * Evita duplicar datos en cada reinicio del contenedor
 */
const prisma = require('../db/prisma');

const seedIfEmpty = async () => {
  try {
    const count = await prisma.usuarios.count();

    if (count > 0) {
      console.log(`✅ Base de datos ya tiene ${count} usuario(s), saltando seed`);
      process.exit(0);
    }

    console.log('🌱 Base de datos vacía, ejecutando seed...');
    // Importar y ejecutar el seed
    require('./seed');
  } catch (error) {
    console.error('❌ Error verificando seed:', error.message);
    process.exit(1);
  }
};

seedIfEmpty();
