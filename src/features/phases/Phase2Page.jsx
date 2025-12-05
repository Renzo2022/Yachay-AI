import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Loader2, AlertTriangle, CheckCircle2, Bookmark, ExternalLink, Sparkles } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Card from '../../components/ui/Card.jsx';
import { searchAllSources } from '../../services/academicService.js';
import { updateProject } from '../../services/projectService.js';
import { useProjects } from '../../context/ProjectContext.jsx';

function Phase2Page() {
  const { project } = useOutletContext() ?? {};
  const { loadProjects } = useProjects();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedMap, setSelectedMap] = useState({});
  const [warnings, setWarnings] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setQuery(project?.picoData?.question ?? project?.title ?? '');
    if (project?.candidates?.length) {
      const map = {};
      project.candidates.forEach((paper) => {
        map[paper.id] = paper;
      });
      setSelectedMap(map);
    } else {
      setSelectedMap({});
    }
  }, [project]);

  const selectedList = useMemo(() => Object.values(selectedMap), [selectedMap]);

  const handleSearch = async (event) => {
    event?.preventDefault();
    if (!query.trim()) {
      setError('Ingresa una pregunta o tema de búsqueda.');
      return;
    }
    setIsSearching(true);
    setError('');
    setSuccess('');
    setWarnings([]);
    try {
      const response = await searchAllSources(query.trim());
      setResults(response.items);
      setWarnings(response.warnings);
      if (response.items.length === 0) {
        setError('No encontramos resultados para esta búsqueda.');
      }
    } catch (err) {
      setError(err.message ?? 'No pudimos realizar la búsqueda.');
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSelect = (paper) => {
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (next[paper.id]) {
        delete next[paper.id];
      } else {
        next[paper.id] = paper;
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!project?.id) return;
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateProject(project.id, { candidates: selectedList });
      await loadProjects();
      setSuccess('Selección guardada correctamente.');
    } catch (err) {
      setError('No pudimos guardar la selección. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Fase 2 · Búsqueda</p>
          <h1 className="text-4xl font-display text-white">Buscador Académico</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Consulta Semantic Scholar y PubMed en paralelo. Selecciona los papers candidatos para tu revisión.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Guardando…
              </>
            ) : (
              <>
                <Bookmark size={16} className="mr-2" />
                Guardar selección ({selectedList.length})
              </>
            )}
          </Button>
        </div>
      </header>

      <form className="glass-panel flex flex-col gap-3 border border-white/10 p-6" onSubmit={handleSearch}>
        <label className="text-xs uppercase tracking-[0.4em] text-ink-muted">Pregunta base</label>
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="¿Cuál es el impacto del dengue en comunidades rurales?"
            className="flex-1 text-base"
          />
          <Button type="submit" disabled={isSearching} className="justify-center md:w-40">
            {isSearching ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Buscando…
              </>
            ) : (
              <>
                <Search size={16} className="mr-2" />
                Buscar
              </>
            )}
          </Button>
        </div>
        {error && (
          <p className="flex items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <AlertTriangle size={16} />
            {error}
          </p>
        )}
        {success && (
          <p className="flex items-center gap-2 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-100">
            <CheckCircle2 size={16} />
            {success}
          </p>
        )}
        {warnings.map((warning) => (
          <p
            key={warning}
            className="flex items-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
          >
            <AlertTriangle size={16} />
            {warning}
          </p>
        ))}
      </form>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          {isSearching && results.length === 0 ? (
            <div className="flex items-center justify-center rounded-3xl border border-white/10 px-6 py-16 text-ink-muted">
              <Loader2 size={24} className="mr-3 animate-spin text-primary-indigo" />
              Buscando fuentes académicas...
            </div>
          ) : results.length === 0 ? (
            <div className="glass-panel flex flex-col items-center gap-4 border border-dashed border-white/20 px-6 py-16 text-center text-ink-muted">
              <Sparkles size={32} className="text-primary-indigo" />
              <p className="max-w-md text-sm">
                No hay resultados aún. Escribe una pregunta PICO o tema específico y presiona “Buscar”.
              </p>
            </div>
          ) : (
            results.map((paper) => {
              const isSelected = Boolean(selectedMap[paper.id]);
              return (
                <Card key={`${paper.source}-${paper.id}`} className="space-y-3 border border-white/10">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">
                        {paper.year || 'Sin año'} · {paper.venue || 'Sin revista'}
                      </p>
                      <h3 className="mt-2 text-2xl font-display text-white">{paper.title}</h3>
                      <p className="text-sm text-ink-muted">{paper.authors}</p>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          paper.source === 'Semantic' ? 'bg-primary-indigo/20 text-primary-indigo' : 'bg-amber-500/20 text-amber-200'
                        }`}
                      >
                        {paper.source}
                      </span>
                      {paper.openAccess && (
                        <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-100">Open Access</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-ink-muted line-clamp-4">{paper.abstract || 'Resumen no disponible.'}</p>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-3 text-xs text-primary-indigo">
                      {paper.url && (
                        <a
                          href={paper.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary-indigo hover:text-white"
                        >
                          <ExternalLink size={14} />
                          Ver fuente
                        </a>
                      )}
                    </div>
                    <Button
                      variant={isSelected ? 'ghost' : 'primary'}
                      className="min-w-[140px] justify-center"
                      onClick={() => toggleSelect(paper)}
                    >
                      {isSelected ? 'Quitar' : 'Seleccionar'}
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <aside className="glass-panel space-y-4 border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Candidatos</p>
              <h2 className="text-2xl font-display text-white">Seleccionados</h2>
            </div>
            <div className="text-3xl font-display text-primary-indigo">{selectedList.length}</div>
          </div>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {selectedList.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/20 px-4 py-6 text-sm text-ink-muted">
                Aún no seleccionas artículos. Úsalos para la siguiente fase de cribado.
              </p>
            ) : (
              selectedList.map((paper) => (
                <div key={paper.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white line-clamp-2">{paper.title}</p>
                  <p className="text-xs text-ink-muted">{paper.authors}</p>
                  <button
                    className="mt-2 text-xs text-red-300 hover:text-red-100"
                    onClick={() => toggleSelect(paper)}
                    type="button"
                  >
                    Quitar
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}

export default Phase2Page;
