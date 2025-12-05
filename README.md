# Yachay AI

Plataforma SaaS para la gestión integral de Revisiones Sistemáticas de Literatura (RSL). Esta fase inicial establece la arquitectura base, el sistema de diseño "Academic Glass" y la documentación necesaria para arrancar desarrollo académico-profesional.

## Stack tecnológico (Fase 0)

- [React 18](https://react.dev) con Vite
- [React Router](https://reactrouter.com) para enrutamiento declarativo
- [Tailwind CSS](https://tailwindcss.com) con tema personalizado "Academic Glass"
- [Lucide React](https://lucide.dev) para iconografía editorial
- [clsx](https://github.com/lukeed/clsx) para composición de clases utilitarias

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

- **Fase 0: Andamiaje completado.**
  - Configuración de Vite + React + Tailwind.
  - Directrices del sistema de diseño "Academic Glass" (tipografía, paleta, componentes base).
  - Layout principal con Sidebar flotante, Header y área de contenido (<Outlet />).
  - Enrutamiento base: `/` (Login), `/app` (Dashboard con layout), `*` (404).
  - Documentación y estructura modular lista para iterar features.

## Próximos pasos sugeridos

1. Definir Theme tokens adicionales (spacing, estados) y paleta extendida.
2. Implementar lógica de autenticación y estados reales en `AuthContext`.
3. Conectar servicios (API/Firebase) dentro de `/services` y `/features`.
4. Agregar pruebas y controles de calidad editorial para cada fase de RSL.
