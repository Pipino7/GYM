const prisma = require('../db/prisma');
const bcrypt = require('bcryptjs');

const seed = async () => {
  try {
    // 0. Crear roles si no existen
    const rolProfesor = await prisma.roles.upsert({
      where: { nombre: 'profesor' },
      update: {},
      create: { nombre: 'profesor' },
    });
    const rolAlumno = await prisma.roles.upsert({
      where: { nombre: 'alumno' },
      update: {},
      create: { nombre: 'alumno' },
    });
    console.log(`✅ Roles creados: profesor (id=${rolProfesor.id}), alumno (id=${rolAlumno.id})`);

    // 1. Crear profesora Camila Aguayo
    const passwordHash = await bcrypt.hash('admin123', 10);

    const profesora = await prisma.usuarios.upsert({
      where: { email: 'camila@gym.cl' },
      update: {},
      create: {
        email: 'camila@gym.cl',
        password_hash: passwordHash,
        nombre: 'Camila',
        apellido: 'Aguayo',
        rol_id: rolProfesor.id,
      },
    });

    console.log(`✅ Profesora creada: ${profesora.nombre} ${profesora.apellido} (${profesora.email})`);
    console.log(`   Contraseña: admin123`);

    // 2. Crear alumna de ejemplo
    const alumna = await prisma.students.create({
      data: {
        profesor_id: profesora.id,
        name: 'María López',
        contact: 'maria@email.com',
        goal: 'Ganar masa muscular en tren inferior',
        peso_kg: 62.5,
        estatura_cm: 165.0,
        status: 'active',
      },
    });

    console.log(`✅ Alumna de ejemplo creada: ${alumna.name}`);

    // 2b. Crear cuenta de acceso para la alumna
    const alumnaPasswordHash = await bcrypt.hash('alumna123', 10);
    const alumnaUsuario = await prisma.usuarios.upsert({
      where: { email: 'maria@gym.cl' },
      update: {},
      create: {
        email: 'maria@gym.cl',
        password_hash: alumnaPasswordHash,
        nombre: 'María',
        apellido: 'López',
        rol_id: rolAlumno.id,
      },
    });

    // Vincular la cuenta al perfil de alumna
    await prisma.students.update({
      where: { id: alumna.id },
      data: { usuario_id: alumnaUsuario.id },
    });

    console.log(`✅ Cuenta de alumna creada: maria@gym.cl / alumna123`);

    // 3. Crear pauta de ejemplo
    const pauta = await prisma.pautas.create({
      data: {
        profesor_id: profesora.id,
        titulo: 'Pauta de Entrenamiento Tren Inferior',
        mes: 'Febrero',
        anio: 2026,
        descripcion:
          'Entrena con foco en la conexion mente-musculo. Controla cada movimiento, especialmente la fase excentrica.',
        calentamiento:
          'Siempre realizar movilidad articular previo a la sesion de entrenamiento, ademas integrar ejercicios abdominales dinamicos. Plancha dinamica recomendada antes de comenzar.',
        ejercicios: {
          create: [
            {
              nombre: 'Sentadilla en barra smith para cuadriceps',
              series_repeticiones: '3 series | 10 a 12 rep | 2 min descanso',
              cargas_kg:
                'Serie 1: Carga que no te permita hacer mas de 12 rep\nSerie 2: Bajar la carga y mantener en Serie 3',
              observaciones:
                'Posicion paralela de los pies. Cuidar que las rodillas no se vayan hacia adentro. 90 grados de flexion de rodillas.',
              video_url: 'https://www.tiktok.com/@paulacworkout/video/7541534713123556614',
              orden: 0,
            },
            {
              nombre: 'Hip Thrust',
              series_repeticiones: '4 series | 10 a 12 y 8 a 10 rep | 2:30 min descanso',
              cargas_kg:
                'Serie 1: Carga elevada que te permita hacer entre 10 a 12 rep\nSerie 2: Mantener carga\nSeries 3 y 4: Bajar carga entre 8 a 12 rep',
              observaciones: 'La posicion de los pies va mas alejada de 90 grados.',
              video_url: 'https://www.instagram.com/reel/C7iLop6Oa3l/',
              orden: 1,
            },
            {
              nombre: 'Peso muerto con barra',
              series_repeticiones: '3 series | 10 a 12 rep | 2:30 min descanso',
              cargas_kg: 'Cargas moderadas',
              observaciones:
                'Realizar este ejercicio ubicado de forma lateral al espejo para corregir la postura. Si bien flexionamos la cadera, cuidado con la curvatura lumbar.',
              video_url: 'https://www.tiktok.com/@dioniso.tp/video/7302975414149103422',
              orden: 2,
            },
            {
              nombre: 'Abductor en maquina',
              series_repeticiones: '3 series | 10 a 12 rep | 2:30 min descanso',
              cargas_kg: 'Carga elevada que te permita hacer entre 10 a 12 rep',
              observaciones:
                'Puedes flexionar tu cadera siempre que mantengas el control de tu core. Mantener la posicion isometrica de 3 seg aprox y volver controlando el peso.',
              video_url: 'https://www.tiktok.com/@priscilla.bcivideo/7379621274839960864',
              orden: 3,
            },
            {
              nombre: 'Patada glutea en maquina o polea',
              series_repeticiones: '3 series | 10 a 12 rep | 1 min descanso',
              cargas_kg: 'Cargas moderadas a elevadas, dependiendo del core',
              observaciones:
                'En polea, evitar la curvatura lumbar, mantener la pierna de apoyo semiflexionada y cadera flectada.',
              video_url: 'https://www.tiktok.com/@maferlazo99/video/7470768427945031',
              orden: 4,
            },
          ],
        },
      },
      include: { ejercicios: true },
    });

    console.log(`✅ Pauta de ejemplo creada: "${pauta.titulo}" con ${pauta.ejercicios.length} ejercicios`);
    console.log(`   Descarga el PDF en: http://localhost:5000/api/pdf/${pauta.id}`);

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('   Login profesor: camila@gym.cl / admin123');
    console.log('   Login alumna:   maria@gym.cl / alumna123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seed:', error.message);
    process.exit(1);
  }
};

seed();
