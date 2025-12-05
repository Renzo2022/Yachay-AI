# Yachay AI

Plataforma SaaS para la gestión integral de Revisiones Sistemáticas de Literatura (RSL). Esta fase inicial establece la arquitectura base, el sistema de diseño "Academic Glass" y la documentación necesaria para arrancar desarrollo académico-profesional.

## Stack tecnológico (Fase 0-1)

- [React 18](https://react.dev) con Vite
- [React Router](https://reactrouter.com) para enrutamiento declarativo
- [Tailwind CSS](https://tailwindcss.com) con tema personalizado "Academic Glass"
- [Lucide React](https://lucide.dev) para iconografía editorial
- [clsx](https://github.com/lukeed/clsx) para composición de clases utilitarias
- [Firebase](https://firebase.google.com/) (Auth + Firestore)

## Estructura de proyecto

```
/src
  /assets           # Fuentes, imágenes y branding
  /components
    /layout         # MainLayout, Sidebar, TopBar
    /ui             # Button, Card, Input (base)
  /config           # Archivos de configuración (placeholder)
  /context          # ThemeContext, AuthContext
  /features         # auth, dashboard, phases (futuro)
  /hooks            # Hooks compartidos
  /pages            # Login, Dashboard, NotFound
  /routes           # Configuración adicional de rutas (placeholder)
  /services         # Clients/API (placeholder)
  /styles           # globals.css + tema Academic Glass
  /utils            # Helpers reutilizables
```

## Scripts

```bash
npm install
npm run dev    # Entorno de desarrollo (Vite)
npm run build  # Build de producción
npm run preview
```

## Instalación rápida

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar servidor de desarrollo
npm run dev
# Abre http://localhost:5173
```

## Estado del desarrollo

- **Fase 0-1: Andamiaje + Autenticación.**
  - Configuración de Vite + React + Tailwind.
  - Directrices del sistema de diseño "Academic Glass" (tipografía, paleta, componentes base).
  - Layout principal con Sidebar flotante, Header y área de contenido (<Outlet />).
  - Enrutamiento base + rutas protegidas con React Router.
  - Integración de Firebase (Auth + Firestore) y contexto de autenticación con persistencia.
  - Documentación y estructura modular lista para iterar features.

## Configuración de Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. Habilita Authentication (Email/Password y Google) y Firestore.
3. En la raíz del proyecto crea un archivo `.env.local` basado en `.env.example`:

```
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

4. Ejecuta `npm run dev` y verifica que la autenticación funcione.

## Próximos pasos sugeridos

1. Definir Theme tokens adicionales (spacing, estados) y paleta extendida.
2. Implementar features de RSL conectando Firestore/Storage en `/features`.
3. Agregar pruebas e2e/unidad para flujos críticos.
4. Integrar gestión de roles y auditoría de actividades dentro del dashboard.
