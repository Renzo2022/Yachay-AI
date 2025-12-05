import { useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Bot, Loader2, AlertTriangle, Check, X, Clock } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import { runScreeningAgent } from '../../services/aiService.js';
import { addIncludedStudy, saveScreeningResults } from '../../services/projectService.js';
import { useProjects } from '../../context/ProjectContext.jsx';

const DECISION_STYLES = {
  include: 'border-green-500/50 bg-green-500/5',
  exclude: 'border-red-500/50 bg-red-500/5',
  maybe: 'border-amber-400/60 bg-amber-500/5',
  pending: 'border-white/10 bg-white/5',
  error: 'border-red-500/60 bg-red-500/10',
};

const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

function Phase3Page() {
  const { project } = useOutletContext() ?? {};
  const { loadProjects } = useProjects();

  const [results, setResults] = useState({});
  const resultsRef = useRef({});
  const [isRunning, setIsRunning] = useState(false);
  const [queueStatus, setQueueStatus] = useState({ processed: 0, total: 0 });
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const candidates = project?.candidates ?? [];

  useEffect(() => {
    if (!project) return;
    const base = {};
    const previous = {};

    (project.screening_results ?? []).forEach((item) => {
      if (item?.paper?.id) {
        previous[item.paper.id] = item;
      }
    });

    candidates.forEach((paper) => {
      base[paper.id] = previous[paper.id] ?? {
        paper,
        status: 'pending',
      };
    });

    setResults(base);
    resultsRef.current = base;
    setQueueStatus({ processed: 0, total: candidates.length });
  }, [project?.id, candidates]);

  const orderedResults = useMemo(
    () => candidates.map((paper) => results[paper.id] ?? { paper, status: 'pending' }),
    [candidates, results]
  );

  const updateResult = (paperId, patch) => {
    setResults((prev) => {
      const next = {
        ...prev,
        [paperId]: {
          ...(prev[paperId] ?? {}),
          ...patch,
        },
      };
      resultsRef.current = next;
      return next;
    });
  };

  const handleScreening = async () => {
    if (!project?.id) {
      setErrorMessage('No se encontró el proyecto.');
      return;
    }
    if (candidates.length === 0) {
      setErrorMessage('Aún no hay candidatos seleccionados en la fase anterior.');
      return;
    }

    setIsRunning(true);
    setStatusMessage('Iniciando cribado con IA...');
    setErrorMessage('');
    setQueueStatus({ processed: 0, total: candidates.length });

    const batches = chunkArray(candidates, 3);
    let processed = 0;

    try {
      for (const batch of batches) {
        await Promise.all(
          batch.map(async (paper) => {
            updateResult(paper.id, { paper, status: 'processing', error: '' });

            try {
              const aiResponse = await runScreeningAgent(paper, project?.picoData ?? {});
              updateResult(paper.id, {
                status: 'completed',
                aiDecision: aiResponse.decision,
                aiConfidence: aiResponse.confidence,
                reason: aiResponse.reason,
              });
            } catch (error) {
              console.error('Screening error', error);
              updateResult(paper.id, {
                status: 'error',
                error: error.message ?? 'Error al procesar este paper.',
              });
            } finally {
              processed += 1;
              setQueueStatus({ processed, total: candidates.length });
            }
          })
        );
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      await saveScreeningResults(project.id, Object.values(resultsRef.current));
      await loadProjects();
      setStatusMessage('Cribado completado. Revisa las sugerencias y confirma.');
    } catch (error) {
      console.error(error);
      setErrorMessage('Ocurrió un error durante el cribado automático.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleManualDecision = async (entry, decision) => {
    if (!project?.id || !entry?.paper) return;
    updateResult(entry.paper.id, { manualDecision: decision });

    if (decision === 'include') {
      try {
        await addIncludedStudy(project.id, entry.paper);
        await loadProjects();
        setStatusMessage(`El estudio "${entry.paper.title}" fue incluido manualmente.`);
      } catch (error) {
        console.error(error);
        setErrorMessage('No pudimos guardar el estudio incluido. Intenta nuevamente.');
      }
    }
  };

  const progressPercent =
    queueStatus.total === 0 ? 0 : Math.round((queueStatus.processed / queueStatus.total) * 100);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Fase 3 · Cribado</p>
          <h1 className="text-4xl font-display text-white">Agente de cribado inteligente</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Evalúa cada paper frente a tus criterios PICO y acelera la toma de decisiones editoriales.
          </p>
        </div>
        <Button
          onClick={handleScreening}
          disabled={isRunning || candidates.length === 0}
          className="h-12 min-w-[220px] justify-center text-base"
        >
          {isRunning ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Procesando…
            </>
          ) : (
            <>
              <Bot size={18} className="mr-2" />
              🤖 Iniciar Cribado Automático
            </>
          )}
        </Button>
      </header>

      <section className="glass-panel space-y-4 border border-white/10 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Progreso</p>
            <div className="mt-2 h-2 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-primary-indigo transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-ink-muted">
              {queueStatus.processed} / {queueStatus.total} procesados
            </p>
          </div>
          <div className="text-sm text-ink-muted">
            {statusMessage && <p className="text-primary-indigo">{statusMessage}</p>}
            {errorMessage && (
              <p className="mt-2 flex items-center gap-2 text-red-300">
                <AlertTriangle size={14} />
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      </section>

      {candidates.length === 0 ? (
        <div className="glass-panel border border-dashed border-white/20 px-8 py-16 text-center text-ink-muted">
          Aún no hay candidatos para evaluar. Completa la fase de búsqueda para continuar.
        </div>
      ) : (
        <section className="grid gap-6">
          {orderedResults.map((entry) => {
            const finalDecision = entry.manualDecision ?? entry.aiDecision ?? 'pending';
            const cardStyle = DECISION_STYLES[entry.status === 'error' ? 'error' : finalDecision] ?? DECISION_STYLES.pending;
            return (
              <Card key={entry.paper.id} className={`${cardStyle} border-2`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">
                      {entry.paper.year ?? 'Sin año'} · {entry.paper.venue ?? 'Sin revista'} · {entry.paper.source ?? 'Fuente'}
                    </p>
                    <h3 className="mt-2 text-2xl font-display text-white">{entry.paper.title}</h3>
                    <p className="text-sm text-ink-muted">{entry.paper.authors}</p>
                  </div>
                  <div className="text-right text-sm text-ink-muted">
                    <p>
                      IA: <span className="font-semibold text-white">{entry.aiDecision ?? 'Pendiente'}</span>
                    </p>
                    <p>
                      Confianza: <span className="font-semibold text-white">{entry.aiConfidence ?? '--'}%</span>
                    </p>
                    {entry.reason && <p className="text-xs text-ink-muted">“{entry.reason}”</p>}
                    {entry.status === 'processing' && (
                      <p className="mt-1 flex items-center justify-end gap-2 text-xs text-primary-indigo">
                        <Loader2 size={14} className="animate-spin" />
                        Evaluando…
                      </p>
                    )}
                    {entry.status === 'error' && (
                      <p className="mt-1 flex items-center gap-2 text-xs text-red-300">
                        <AlertTriangle size={12} />
                        {entry.error}
                      </p>
                    )}
                  </div>
                </div>
                <p className="mt-4 text-sm text-ink-muted line-clamp-4">{entry.paper.abstract || 'Resumen no disponible.'}</p>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1 text-xs text-ink-muted">
                    <Clock size={14} />
                    {entry.manualDecision ? 'Decisión confirmada' : 'Pendiente de confirmación'}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      className="gap-2 border border-white/10 px-4 py-2 text-sm text-green-300 hover:text-white"
                      onClick={() => handleManualDecision(entry, 'include')}
                    >
                      <Check size={16} />
                      Confirmar inclusión
                    </Button>
                    <Button
                      variant="ghost"
                      className="gap-2 border border-white/10 px-4 py-2 text-sm text-red-300 hover:text-white"
                      onClick={() => handleManualDecision(entry, 'exclude')}
                    >
                      <X size={16} />
                      Marcar como excluido
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default Phase3Page;
