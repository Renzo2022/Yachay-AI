import { useParams } from 'react-router-dom';

function WorkspacePlaceholder() {
  const { projectId } = useParams();

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center text-ink-muted">
      <p className="text-xs uppercase tracking-[0.4em] text-ink-muted/70">Workspace</p>
      <h1 className="mt-4 text-4xl font-display text-white">Proyecto #{projectId}</h1>
      <p className="mt-3 max-w-xl text-sm">
        Aquí aparecerá el workspace detallado de la revisión sistemática. Este placeholder confirma que la navegación y el enrutamiento
        funcionan correctamente.
      </p>
    </div>
  );
}

export default WorkspacePlaceholder;
