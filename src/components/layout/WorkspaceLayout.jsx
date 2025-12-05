import { NavLink, Outlet, useParams } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { Sparkles, Search, Filter, ClipboardList, Layers, PenLine, Upload, Loader2 } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext.jsx';

const phases = [
  {
    key: 'phase-1',
    label: 'Planificación',
    icon: Sparkles,
    description: 'Generador PICO',
    available: true,
    to: (projectId) => `/workspace/${projectId}`,
  },
  {
    key: 'phase-2',
    label: 'Búsqueda',
    icon: Search,
    description: 'Motores + estrategia',
    available: true,
    to: (projectId) => `/workspace/${projectId}/phase-2`,
  },
  {
    key: 'phase-3',
    label: 'Cribado',
    icon: Filter,
    description: 'Agente de cribado',
    available: true,
    to: (projectId) => `/workspace/${projectId}/phase-3`,
  },
  {
    key: 'phase-4',
    label: 'Extracción',
    icon: ClipboardList,
    description: 'Formularios y campos',
  },
  {
    key: 'phase-5',
    label: 'Extracción de datos',
    icon: Layers,
    description: 'Matrices + RAG',
    available: true,
    to: (projectId) => `/workspace/${projectId}/phase-5`,
  },
  {
    key: 'phase-6',
    label: 'Redacción',
    icon: PenLine,
    description: 'Manuscrito académico',
  },
  {
    key: 'phase-7',
    label: 'Publicación',
    icon: Upload,
    description: 'Traducción y difusión',
  },
];

function WorkspaceLayout() {
  const { projectId } = useParams();
  const { projects, projectsLoading, selectProject } = useProjects();

  const project = useMemo(() => projects.find((item) => item.id === projectId), [projects, projectId]);

  useEffect(() => {
    if (projectId) {
      selectProject(projectId);
    }
  }, [projectId, selectProject]);

  if (projectsLoading && !project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-academic-bg">
        <div className="glass-panel flex items-center gap-3 px-6 py-4 text-ink-muted">
          <Loader2 size={18} className="animate-spin text-primary-indigo" />
          Cargando workspace...
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-academic-bg text-center text-ink-muted">
        <p className="text-xs uppercase tracking-[0.4em]">Workspace</p>
        <h1 className="mt-4 text-4xl font-display text-white">Proyecto no encontrado</h1>
        <p className="mt-2 text-sm text-ink-muted/80">Verifica que el proyecto exista o regresa al dashboard.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-academic-bg/95 text-ink-strong">
      <aside className="sticky top-0 flex h-screen w-80 flex-col gap-6 border-r border-white/5 bg-academic-bg/80 px-6 py-10">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Workspace</p>
          <h1 className="mt-2 text-2xl font-display text-white">{project.title}</h1>
          <p className="text-sm text-ink-muted line-clamp-2">{project.description || 'Sin descripción disponible.'}</p>
        </div>
        <nav className="space-y-2">
          {phases.map(({ key, label, icon: Icon, description, available, to }) => {
            if (available) {
              return (
                <NavLink
                  key={key}
                  to={to(projectId)}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition',
                      isActive
                        ? 'border-primary-indigo/40 bg-primary-indigo/20 text-white'
                        : 'border-white/5 text-ink-muted hover:border-primary-indigo/40 hover:text-ink-strong',
                    ].join(' ')
                  }
                >
                  <Icon size={18} />
                  <div>
                    <p className="font-semibold">{label}</p>
                    <span className="text-xs text-ink-muted">{description}</span>
                  </div>
                </NavLink>
              );
            }
            return (
              <div
                key={key}
                className="flex items-center gap-3 rounded-2xl border border-dashed border-white/10 px-4 py-3 text-sm text-ink-muted/60"
              >
                <Icon size={18} />
                <div>
                  <p className="font-semibold">{label}</p>
                  <span className="text-xs text-ink-muted/60">Disponible pronto</span>
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 px-8 py-10">
        <Outlet context={{ project }} />
      </div>
    </div>
  );
}

export default WorkspaceLayout;
