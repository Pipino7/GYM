#!/bin/sh
# ============================================
# Docker Entrypoint — GYM Server
# Ejecuta migraciones y seed antes de iniciar
# ============================================
set -e

echo "⏳ Esperando a que PostgreSQL esté listo..."

# Esperar hasta que PostgreSQL acepte conexiones
until node -e "
  const { Client } = require('pg');
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  c.connect().then(() => { c.end(); process.exit(0); }).catch(() => process.exit(1));
" 2>/dev/null; do
  echo "   PostgreSQL no está listo, reintentando en 2s..."
  sleep 2
done

echo "✅ PostgreSQL conectado"

# Ejecutar migraciones (crear tablas si no existen)
echo "📦 Ejecutando migraciones..."
node src/database/migrate.js

# Ejecutar seed solo si no hay usuarios
echo "🌱 Verificando seed..."
node src/database/seed-if-empty.js

# Iniciar la aplicación
echo "🚀 Iniciando servidor..."
exec "$@"
