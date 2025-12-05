import { X, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';

function CreateProjectModal({ open, form, onChange, onSubmit, onClose, isSubmitting, error }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-lg space-y-6 border border-white/10 p-8">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Nuevo Proyecto</p>
            <h2 className="text-3xl font-display text-white">Registrar revisión</h2>
            <p className="mt-2 text-sm text-ink-muted">Define el título y propósito editorial para iniciar la trazabilidad.</p>
          </div>
          <button onClick={onClose} className="rounded-full border border-white/10 p-2 text-ink-muted hover:text-white" aria-label="Cerrar">
            <X size={18} />
          </button>
        </header>

        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="space-y-2 text-sm">
            <span className="text-ink-muted">Título de la revisión</span>
            <Input
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="Impacto de la IA en Educación Superior"
              required
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-ink-muted">Descripción breve</span>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={4}
              placeholder="Objetivo, pregunta de investigación o alcance de la revisión."
              className="input-editorial w-full rounded-3xl border border-white/15 bg-transparent px-4 py-3 text-sm"
            />
          </label>

          {error && <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}

          <div className="flex items-center justify-end gap-3">
            <button type="button" className="text-sm text-ink-muted hover:text-white" onClick={onClose}>
              Cancelar
            </button>
            <Button type="submit" className="min-w-[160px] justify-center" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={16} />
                  Creando...
                </>
              ) : (
                '+ Crear proyecto'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProjectModal;
