# 🌀 Kinesia - Gestión de Consultorio de Kinesiología

Aplicación Fullstack MERN desarrollada para la gestión de turnos y pacientes en un consultorio de kinesiología.


## 🚀 Demo

🔗 [https://kinesia.vercel.app](https://kinesia.vercel.app) — *(pendiente de deploy)*

---

## 📦 Estructura del Proyecto
```text
consultorio-app/
│ 
├── backend/                          # Lógica del servidor (API)
│   │
│   ├── config/
│   │   └── db.js                     # Configuración y conexión a MongoDB Atlas
│   │
│   ├── controllers/
│   │   ├── clienteController.js      # Lógica para operaciones de clientes/pacientes
│   │   └── turnoController.js        # Lógica para turnos
│   │
│   ├── models/
│   │   ├── clienteModel.js           # Modelo Mongoose para clientes
│   │   │
│   │   └── turnoModel.js             # Modelo Mongoose para turnos
│   │
│   ├── routes/
│   │   ├── clienteRoutes.js          # Rutas del CRUD de clientes
│   │   └── turnoRoutes.js            # Rutas del CRUD de turnos
│   │
│   ├── utils/
│   │   └── helpers.js                # Funciones reutilizables (helpers)
│   │
│   ├── .env                          # Variables de entorno (Mongo URI, etc.)
│   ├── .gitignore                    # Ignora .env, node_modules, etc.
│   ├── package.json                  # Dependencias del backend
│   └── server.js                     # Punto de entrada del servidor Express
│
├── frontend/                         # Aplicación cliente (React + Vite + TypeScript)
│   │
│   ├── public/
│   │   └── vite.svg                  # Icono por defecto del template Vite
│   │
│   ├── src/
│   │   ├── assets/                   # Archivos de imagen usados en la app
│   │   │   ├── imagen1.jpeg
│   │   │   ├── imagen2.jpeg
│   │   │   ├── portada.jpeg
│   │   │   ├── quiensomos1.jpeg
│   │   │   ├── quiensomos2.jpeg
│   │   │   └── quiensomos3.jpeg
│   │   │
│   │   ├── components/               # Componentes reutilizables 
│   │   │   └── (vacío por ahora)
│   │   │
│   │   ├── pages/                    # Vistas/páginas completas
│   │   │   └── PanelProfesional.tsx  # Página del profesional (edición de pacientes)
│   │   │
│   │   ├── App.tsx                   # Componente raíz de la app
│   │   ├── counter.ts                # Default del template (puede borrarse)
│   │   ├── main.tsx                  # Punto de entrada de React
│   │   ├── style.css                 # Estilos principales
│   │   ├── typescript.svg            # Ícono del template (puede eliminarse)
│   │   └── vite-env.d.ts             # Tipado para Vite
│   │
│   ├── .gitignore                    # Ignora archivos de entorno, etc.
│   ├── index.html                    # HTML base de la app
│   ├── package.json                  # Dependencias del frontend
│   ├── tsconfig.json                 # Configuración de TypeScript
│   └── vite.config.ts                # Configuración de Vite
│
├── package.json                      # Script raíz con concurrently para ambos entornos
└── package-lock.json                 # Lockfile raíz
└── README.md
└── LICENSE

```text
---

## 🛠️ Tecnologías usadas

- **Frontend:** React + Vite + TypeScript
- **Backend:** Node.js + Express
- **Base de datos:** MongoDB Atlas
- **Otros:** concurrently, nodemon, Vercel (frontend), Render (backend)

---

## 📋 Funcionalidades

- Registro de pacientes (nombre, apellido, obra social, profesional)
- Registro y edición de turnos
- Diagnóstico editable por profesional
- Guardado automático en MongoDB Atlas
- Panel profesional de control

---

## 🚀 Cómo iniciar localmente

```bash
git clone https://github.com/santiagocossu/kinesia-app
cd consultorio-app
npm install
npm run dev