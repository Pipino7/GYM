#!/bin/bash
# ============================================
# Deploy Script — GYM Training App
# DigitalOcean Droplet (2GB RAM)
# IP: 165.22.164.114
# ============================================
# Uso: ssh root@165.22.164.114 'bash -s' < deploy.sh
# ============================================
set -euo pipefail

APP_DIR="/opt/gym-app"
REPO_URL="https://github.com/Pipino7/GYM.git"
BRANCH="main"

echo "============================================"
echo "🚀 Deploy GYM Training App"
echo "   Servidor: $(hostname) - $(curl -s ifconfig.me)"
echo "   Fecha: $(date)"
echo "============================================"

# ---- 1. Actualizar sistema ----
echo ""
echo "📦 [1/6] Actualizando sistema..."
apt-get update -qq
apt-get upgrade -y -qq

# ---- 2. Instalar Docker si no existe ----
if ! command -v docker &> /dev/null; then
  echo "🐳 [2/6] Instalando Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
  echo "✅ Docker instalado: $(docker --version)"
else
  echo "✅ [2/6] Docker ya instalado: $(docker --version)"
fi

# Verificar Docker Compose (viene incluido en Docker moderno)
if ! docker compose version &> /dev/null; then
  echo "❌ Docker Compose no disponible. Instala una versión reciente de Docker."
  exit 1
fi
echo "   Docker Compose: $(docker compose version --short)"

# ---- 3. Configurar firewall ----
echo ""
echo "🔒 [3/6] Configurando firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
echo "✅ Firewall configurado (SSH + HTTP + HTTPS)"

# ---- 4. Clonar/actualizar repositorio ----
echo ""
echo "📥 [4/6] Obteniendo código fuente..."
if [ -d "$APP_DIR" ]; then
  cd "$APP_DIR"
  git fetch origin
  git reset --hard "origin/$BRANCH"
  echo "✅ Repositorio actualizado"
else
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
  echo "✅ Repositorio clonado"
fi

# ---- 5. Configurar variables de entorno ----
echo ""
echo "⚙️  [5/6] Configurando entorno..."
if [ ! -f ".env" ]; then
  # Generar secretos aleatorios
  DB_PASS=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)
  JWT_SEC=$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 48)

  cat > .env <<EOF
# Generado automáticamente — $(date)
DB_USER=postgres
DB_PASSWORD=${DB_PASS}
DB_DATABASE=pautas_entrenamiento
JWT_SECRET=${JWT_SEC}
EOF
  echo "✅ Archivo .env creado con secretos aleatorios"
  echo "   ⚠️  GUARDA ESTOS DATOS:"
  echo "   DB_PASSWORD=$DB_PASS"
  echo "   JWT_SECRET=$JWT_SEC"
else
  echo "✅ Archivo .env ya existe, manteniendo configuración actual"
fi

# ---- 6. Build y levantar servicios ----
echo ""
echo "🐳 [6/6] Construyendo y levantando contenedores..."
docker compose down --remove-orphans 2>/dev/null || true
docker compose build --no-cache
docker compose up -d

# Esperar a que los servicios estén healthy
echo ""
echo "⏳ Esperando que los servicios estén listos..."
sleep 10

# Verificar estado
echo ""
echo "============================================"
echo "📊 Estado de los servicios:"
echo "============================================"
docker compose ps

echo ""
echo "============================================"
echo "🧪 Verificación de salud:"
echo "============================================"
if curl -sf http://localhost/api/health > /dev/null 2>&1; then
  echo "✅ API respondiendo correctamente"
  curl -s http://localhost/api/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost/api/health
else
  echo "⚠️  API aún iniciando, espera unos segundos..."
  echo "   Verifica con: docker compose logs -f server"
fi

echo ""
echo "============================================"
echo "🎉 ¡Deploy completado!"
echo "============================================"
echo ""
echo "   🌐 App: http://165.22.164.114"
echo "   📡 API: http://165.22.164.114/api/health"
echo ""
echo "   👩‍🏫 Login profesor: camila@gym.cl / admin123"
echo "   👩‍🎓 Login alumna:   maria@gym.cl / alumna123"
echo ""
echo "   📋 Comandos útiles:"
echo "   docker compose logs -f          → Ver logs"
echo "   docker compose restart server   → Reiniciar API"
echo "   docker compose down             → Detener todo"
echo "   docker compose up -d --build    → Rebuild y levantar"
echo "============================================"
