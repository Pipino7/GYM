const pool = require('./db');

const seed = async () => {
  try {
    // Insertar pauta de ejemplo
    const pautaResult = await pool.query(
      `INSERT INTO pautas (titulo, mes, anio, descripcion, calentamiento)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        'Pauta de Entrenamiento Tren Inferior',
        'Febrero',
        2026,
        'Entrena con foco en la conexion mente-musculo. Controla cada movimiento, especialmente la fase excentrica.',
        'Siempre realizar movilidad articular previo a la sesion de entrenamiento, ademas integrar ejercicios abdominales dinamicos. Plancha dinamica recomendada antes de comenzar.',
      ]
    );
    const pauta = pautaResult.rows[0];

    const ejercicios = [
      {
        nombre: 'Sentadilla en barra smith para cuadriceps',
        series_repeticiones: '3 series | 10 a 12 rep | 2 min descanso',
        cargas_kg:
          'Serie 1: Carga que no te permita hacer mas de 12 rep\nSerie 2: Bajar la carga y mantener en Serie 3',
        observaciones:
          'Posicion paralela de los pies. Cuidar que las rodillas no se vayan hacia adentro. 90 grados de flexion de rodillas.',
        video_url: 'https://www.tiktok.com/@paulacworkout/video/7541534713123556614',
      },
      {
        nombre: 'Hip Thrust',
        series_repeticiones: '4 series | 10 a 12 y 8 a 10 rep | 2:30 min descanso',
        cargas_kg:
          'Serie 1: Carga elevada que te permita hacer entre 10 a 12 rep\nSerie 2: Mantener carga\nSeries 3 y 4: Bajar carga entre 8 a 12 rep',
        observaciones: 'La posicion de los pies va mas alejada de 90 grados.',
        video_url: 'https://www.instagram.com/reel/C7iLop6Oa3l/',
      },
      {
        nombre: 'Peso muerto con barra',
        series_repeticiones: '3 series | 10 a 12 rep | 2:30 min descanso',
        cargas_kg: 'Cargas moderadas',
        observaciones:
          'Realizar este ejercicio ubicado de forma lateral al espejo para corregir la postura. Si bien flexionamos la cadera, cuidado con la curvatura lumbar.',
        video_url: 'https://www.tiktok.com/@dioniso.tp/video/7302975414149103422',
      },
      {
        nombre: 'Abductor en maquina',
        series_repeticiones: '3 series | 10 a 12 rep | 2:30 min descanso',
        cargas_kg: 'Carga elevada que te permita hacer entre 10 a 12 rep',
        observaciones:
          'Puedes flexionar tu cadera siempre que mantengas el control de tu core. Mantener la posicion isometrica de 3 seg aprox y volver controlando el peso.',
        video_url: 'https://www.tiktok.com/@priscilla.bcivideo/7379621274839960864',
      },
      {
        nombre: 'Patada glutea en maquina o polea',
        series_repeticiones: '3 series | 10 a 12 rep | 1 min descanso',
        cargas_kg: 'Cargas moderadas a elevadas, dependiendo del core',
        observaciones:
          'En polea, evitar la curvatura lumbar, mantener la pierna de apoyo semiflexionada y cadera flectada.',
        video_url: 'https://www.tiktok.com/@maferlazo99/video/7470768427945031',
      },
    ];

    for (let i = 0; i < ejercicios.length; i++) {
      const ej = ejercicios[i];
      await pool.query(
        `INSERT INTO ejercicios (pauta_id, nombre, series_repeticiones, cargas_kg, observaciones, video_url, orden)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [pauta.id, ej.nombre, ej.series_repeticiones, ej.cargas_kg, ej.observaciones, ej.video_url, i]
      );
    }

    console.log(`✅ Pauta de ejemplo creada con ID: ${pauta.id}`);
    console.log(`   Descarga el PDF en: http://localhost:5000/api/pdf/${pauta.id}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear la pauta de ejemplo:', error.message);
    process.exit(1);
  }
};

seed();
