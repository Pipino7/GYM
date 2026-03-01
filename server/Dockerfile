# ============================================
# Stage 1: Dependencies (cached layer)
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copiar solo archivos de dependencias para aprovechar cache de Docker
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm ci --omit=dev && \
    npx prisma generate

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-alpine AS production

# Seguridad: crear usuario no-root
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# Copiar dependencias desde stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma

# Copiar código fuente
COPY . .

# Dar permisos de ejecución al entrypoint
RUN chmod +x docker-entrypoint.sh && \
    chown -R appuser:appgroup /app

# El usuario no-root
USER appuser

EXPOSE 5000

# Healthcheck: verificar que la API responda
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "src/index.js"]
