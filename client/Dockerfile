# ============================================
# Stage 1: Build React app
# ============================================
FROM node:20-alpine AS build

WORKDIR /app

# Copiar dependencias
COPY package.json package-lock.json* ./
RUN npm ci

# Copiar código fuente y construir
COPY . .
RUN npm run build

# ============================================
# Stage 2: Servir con Nginx
# ============================================
FROM nginx:1.27-alpine AS production

# Eliminar configuración por defecto
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuración personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos estáticos del build
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx corre como non-root en Alpine por defecto en esta config
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
