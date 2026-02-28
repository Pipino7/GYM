# Pautas de Entrenamiento - CRUD PERN

Aplicación web para crear, gestionar y descargar en PDF pautas de entrenamiento.

## Stack Tecnológico (PERN)

- **PostgreSQL** - Base de datos relacional
- **Express.js** - Framework backend
- **React** - Frontend con Vite
- **Node.js** - Runtime del servidor

## Requisitos Previos

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v14+

## Instalación

### 1. Clonar y configurar la base de datos

Crea la base de datos en PostgreSQL:

```sql
CREATE DATABASE pautas_entrenamiento;
```

### 2. Configurar el backend

```bash
cd server
npm install
```

Edita el archivo `.env` con tus credenciales de PostgreSQL:

```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=pautas_entrenamiento
```

Inicializa las tablas:

```bash
npm run db:init
```

### 3. Configurar el frontend

```bash
cd client
npm install
```

## Ejecutar la aplicación

### Backend (terminal 1)

```bash
cd server
npm run dev
```

### Frontend (terminal 2)

```bash
cd client
npm run dev
```

La app estará disponible en: **http://localhost:3000**

## Funcionalidades

- **Crear** pautas de entrenamiento con calentamiento, descripción y ejercicios
- **Listar** todas las pautas creadas en tarjetas organizadas
- **Ver detalle** de cada pauta con tabla de ejercicios
- **Editar** pautas existentes
- **Eliminar** pautas con confirmación
- **Descargar PDF** de cada pauta con formato profesional

## Estructura del Proyecto

```
├── client/                  # Frontend React + Vite
│   ├── src/
│   │   ├── api/             # Configuración Axios
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Páginas principales
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
├── server/                  # Backend Express + Node
│   ├── src/
│   │   ├── database/        # Conexión y scripts DB
│   │   ├── routes/          # Rutas API REST
│   │   └── index.js
│   ├── .env
│   └── package.json
│
└── README.md
```

## API Endpoints

| Método | Ruta                          | Descripción                    |
| ------ | ----------------------------- | ------------------------------ |
| GET    | `/api/pautas`                 | Listar todas las pautas        |
| GET    | `/api/pautas/:id`             | Obtener pauta con ejercicios   |
| POST   | `/api/pautas`                 | Crear nueva pauta              |
| PUT    | `/api/pautas/:id`             | Actualizar pauta               |
| DELETE | `/api/pautas/:id`             | Eliminar pauta                 |
| GET    | `/api/ejercicios/pauta/:id`   | Listar ejercicios de una pauta |
| POST   | `/api/ejercicios`             | Crear ejercicio                |
| PUT    | `/api/ejercicios/:id`         | Actualizar ejercicio           |
| DELETE | `/api/ejercicios/:id`         | Eliminar ejercicio             |
| GET    | `/api/pdf/:pautaId`           | Descargar PDF de una pauta     |
