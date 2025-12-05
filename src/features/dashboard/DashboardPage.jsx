import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderPlus, Trash2, Clock3, Layers3, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useProjects } from '../../context/ProjectContext.jsx';
import { createProject, deleteProject } from '../../services/projectService.js';
import CreateProjectModal from './CreateProjectModal.jsx';

function DashboardPage() {
  const { currentUser } = useAuth();
  const { projects, projectsLoading, loadProjects, selectProject } = useProjects();
  const navigate = useNavigate();

  const [isModalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  const formattedProjects = useMemo(
    () =>
      projects.map((project) => {
        const createdAt = project.createdAt?.toDate?.() ?? null;
        const createdLabel = createdAt
          ? createdAt.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'Sincr. pendiente';
        return { ...project, createdLabel };
      }),
    [projects]
  );

  const handleOpenModal = () => {
    setForm({ title: '', description: '' });
    setFormError('');
    setModalOpen(true);
  };

  const handleCreateProject = async (event) => {
    event.preventDefault();
    if (!currentUser?.uid) return;
    setIsSubmitting(true);
    setFormError('');
    try {
      await createProject(currentUser.uid, form);
      await loadProjects();
      setModalOpen(false);
    } catch (error) {
      console.error(error);
      setFormError('No pudimos crear el proyecto. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!projectId) return;
    setDeletingId(projectId);
    try {
      await deleteProject(projectId);
      await loadProjects();
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCardClick = (projectId) => {
    selectProject(projectId);
    navigate(`/workspace/${projectId}`);
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Dashboard</p>
          <h1 className="text-4xl font-display text-white">
            {greeting}, {currentUser?.displayName ?? currentUser?.email ?? 'Investigador'}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">Administra tus revisiones sistemáticas y controla el avance editorial.</p>
        </div>
        <Button className="h-12 min-w-[220px] justify-center text-base" onClick={handleOpenModal}>
          <FolderPlus size={18} className="mr-2" />
          Nuevo Proyecto
        </Button>
      </section>

      {projectsLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="glass-panel flex items-center gap-3 px-6 py-4 text-ink-muted">
            <Loader2 size={18} className="animate-spin text-primary-indigo" />
            Cargando proyectos...
          </div>
        </div>
      ) : formattedProjects.length === 0 ? (
        <div className="glass-panel flex flex-col items-center justify-center border border-dashed border-white/20 px-10 py-16 text-center text-ink-muted">
          <Layers3 size={48} className="text-primary-indigo" />
          <h2 className="mt-6 text-3xl font-display text-white">Aún no tienes proyectos</h2>
          <p className="mt-3 max-w-md text-sm">
            Organiza tus revisiones sistemáticas. Cada proyecto guarda fases, bitácoras y flujo editorial completo.
          </p>
          <Button className="mt-8" onClick={handleOpenModal}>
            <FolderPlus size={16} className="mr-2" /> Crear primer proyecto
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {formattedProjects.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer border border-white/10 transition hover:border-primary-indigo/50"
              onClick={() => handleCardClick(project.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">{project.createdLabel}</p>
                  <h3 className="mt-2 text-2xl font-display text-white">{project.title}</h3>
                </div>
                <button
                  className="rounded-full border border-white/10 p-2 text-ink-muted transition hover:text-primary-indigo"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeleteProject(project.id);
                  }}
                  aria-label="Eliminar proyecto"
                  disabled={deletingId === project.id}
                >
                  {deletingId === project.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                </button>
              </div>
              <p className="mt-4 line-clamp-3 text-sm text-ink-muted">{project.description || 'Sin descripción'}</p>
              <div className="mt-6 flex items-center justify-between text-sm">
                <span className="rounded-full bg-white/5 px-4 py-1 text-ink-muted">
                  Estado: <span className="text-white">{project.status}</span>
                </span>
                <span className="flex items-center gap-2 text-ink-muted">
                  <Clock3 size={16} />
                  Fase {project.currentPhase}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateProjectModal
        open={isModalOpen}
        form={form}
        onChange={(event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))}
        onSubmit={handleCreateProject}
        onClose={() => setModalOpen(false)}
        isSubmitting={isSubmitting}
        error={formError}
      />
    </div>
  );
}

export default DashboardPage;
