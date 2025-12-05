import { useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { UploadCloud, Zap, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import { extractTextFromPDF } from '../../services/pdfService.js';
import { EXTRACTION_FIELDS, runExtractionAgent } from '../../services/aiService.js';
import { saveExtractionMatrix } from '../../services/projectService.js';
import { useProjects } from '../../context/ProjectContext.jsx';

const createEmptyRow = (paper) => ({
  paper,
  fields: EXTRACTION_FIELDS.reduce((acc, field) => {
    acc[field] = {
      value: '',
      status: 'idle',
    };
    return acc;
  }, {}),
  lastUpdated: null,
  error: null,
});

const hydrateMatrix = (project) => {
  const included = project?.included_studies ?? [];
  const savedMatrix = project?.extraction_matrix ?? [];
  const savedMap = savedMatrix.reduce((acc, entry) => {
    acc[entry.paperId] = entry;
    return acc;
  }, {});

  const base = {};
  included.forEach((paper) => {
    const saved = savedMap[paper.id];
    if (!saved) {
      base[paper.id] = createEmptyRow(paper);
      return;
    }
    const row = createEmptyRow(paper);
    EXTRACTION_FIELDS.forEach((field) => {
      const storedValue = saved.data?.[field];
      if (storedValue) {
        row.fields[field] = {
          value: storedValue,
          status: 'done',
        };
      }
    });
    row.lastUpdated = saved.lastUpdated ?? null;
    base[paper.id] = row;
  });

  return base;
};

const serializeMatrix = (matrix) =>
  Object.values(matrix).map((row) => ({
    paperId: row.paper.id,
    paperTitle: row.paper.title,
    data: EXTRACTION_FIELDS.reduce((acc, field) => {
      acc[field] = row.fields[field]?.value ?? '';
      return acc;
    }, {}),
    lastUpdated: row.lastUpdated ?? null,
  }));

function Phase5Page() {
  const { project } = useOutletContext() ?? {};
  const { loadProjects } = useProjects();
  const includedStudies = project?.included_studies ?? [];

  const [matrix, setMatrix] = useState(() => hydrateMatrix(project));
  const matrixRef = useRef(matrix);
  const [processingPaperId, setProcessingPaperId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const hydrated = hydrateMatrix(project);
    matrixRef.current = hydrated;
    setMatrix(hydrated);
  }, [project]);

  const updateMatrix = (updater) => {
    let nextState;
    setMatrix((prev) => {
      nextState = typeof updater === 'function' ? updater(prev) : updater;
      matrixRef.current = nextState;
      return nextState;
    });
    return nextState;
  };

  const orderedRows = useMemo(
    () => includedStudies.map((paper) => matrix[paper.id] ?? createEmptyRow(paper)),
    [includedStudies, matrix]
  );

  const persistMatrix = async (state) => {
    if (!project?.id) return;
    const payload = serializeMatrix(state);
    await saveExtractionMatrix(project.id, payload);
    await loadProjects();
  };

  const markRowLoading = (paper) => {
    updateMatrix((prev) => {
      const next = { ...prev };
      const baseRow = next[paper.id] ?? createEmptyRow(paper);
      const nextFields = { ...baseRow.fields };
      EXTRACTION_FIELDS.forEach((field) => {
        nextFields[field] = {
          value: baseRow.fields[field]?.value ?? '',
          status: 'loading',
        };
      });
      next[paper.id] = {
        ...baseRow,
        paper,
        fields: nextFields,
        error: null,
      };
      return next;
    });
  };

  const markRowError = (paper, message) => {
    updateMatrix((prev) => {
      const next = { ...prev };
      const baseRow = next[paper.id] ?? createEmptyRow(paper);
      next[paper.id] = {
        ...baseRow,
        paper,
        error: message,
        fields: { ...baseRow.fields },
      };
      return next;
    });
  };

  const handleExtraction = async (paper, textProducer) => {
    if (!project?.id) return;
    setProcessingPaperId(paper.id);
    setStatusMessage(`Extrayendo datos de "${paper.title}"`);
    setErrorMessage('');
    markRowLoading(paper);

    try {
      const text = await textProducer();
      const extraction = await runExtractionAgent(text, EXTRACTION_FIELDS);

      const updatedState = updateMatrix((prev) => {
        const next = { ...prev };
        const baseRow = next[paper.id] ?? createEmptyRow(paper);
        const nextFields = { ...baseRow.fields };
        EXTRACTION_FIELDS.forEach((field) => {
          nextFields[field] = {
            value: extraction[field] ?? 'No reportado',
            status: 'done',
          };
        });
        next[paper.id] = {
          ...baseRow,
          paper,
          fields: nextFields,
          lastUpdated: new Date().toISOString(),
          error: null,
        };
        return next;
      });

      await persistMatrix(updatedState);
      setStatusMessage(`Datos extraídos para "${paper.title}".`);
    } catch (error) {
      console.error(error);
      const message = error.message ?? 'No pudimos extraer datos de este documento.';
      setErrorMessage(message);
      markRowError(paper, message);
    } finally {
      setProcessingPaperId(null);
    }
  };

  const handlePdfUpload = async (paper, event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setErrorMessage('Sólo se aceptan archivos PDF.');
      return;
    }
    await handleExtraction(paper, () => extractTextFromPDF(file));
  };

  const handleAutoExtraction = async (paper) => {
    if (!paper?.url) {
      setErrorMessage('Este estudio no tiene una URL Open Access registrada.');
      return;
    }

    await handleExtraction(paper, async () => {
      const response = await fetch(paper.url);
      if (!response.ok) {
        throw new Error('No pudimos descargar el PDF desde la URL proporcionada.');
      }
      const blob = await response.blob();
      if (blob.type && !blob.type.includes('pdf')) {
        throw new Error('La URL descargada no es un PDF válido.');
      }
      const file = new File([blob], `${paper.id}.pdf`, { type: 'application/pdf' });
      return extractTextFromPDF(file);
    });
  };

  const handleManualSave = async () => {
    try {
      await persistMatrix(matrixRef.current);
      setStatusMessage('Matriz guardada manualmente.');
      setErrorMessage('');
    } catch (error) {
      console.error(error);
      setErrorMessage('No pudimos guardar la matriz. Intenta nuevamente.');
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Fase 5 · Extracción</p>
          <h1 className="text-4xl font-display text-white">Matriz de datos con RAG</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Carga los PDFs de tus estudios incluidos o usa las URLs Open Access para completar automáticamente la matriz.
          </p>
        </div>
        <Button variant="ghost" onClick={handleManualSave} className="gap-2">
          <CheckCircle2 size={18} />
          Guardar matriz
        </Button>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1fr,2fr]">
        <Card className="space-y-4 border border-white/10">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Cola de trabajo</p>
            <h2 className="text-2xl font-display text-white">Estudios incluidos</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Adjunta PDFs o usa las fuentes abiertas para extraer los campos clave de tu revisión.
            </p>
          </div>
          <div className="space-y-3">
            {includedStudies.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/20 px-4 py-6 text-sm text-ink-muted">
                No hay estudios incluidos todavía. Completa la fase de cribado para continuar.
              </p>
            ) : (
              includedStudies.map((paper) => (
                <div
                  key={paper.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-ink-muted"
                >
                  <p className="text-base font-semibold text-white">{paper.title}</p>
                  <p className="text-xs">{paper.authors}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs text-ink-muted hover:text-white">
                      <UploadCloud size={14} />
                      <span>📂 Subir PDF</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(event) => handlePdfUpload(paper, event)}
                      />
                    </label>
                    {paper.openAccess && paper.url && (
                      <Button
                        variant="ghost"
                        className="gap-2 border border-white/10 text-xs"
                        onClick={() => handleAutoExtraction(paper)}
                        disabled={processingPaperId === paper.id}
                      >
                        {processingPaperId === paper.id ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Extrayendo…
                          </>
                        ) : (
                          <>
                            <Zap size={14} />
                            ⚡ Auto-Extraer (Web)
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  {matrix[paper.id]?.lastUpdated && (
                    <p className="mt-2 text-xs text-ink-muted">
                      Última extracción: {new Date(matrix[paper.id].lastUpdated).toLocaleString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
          {(statusMessage || errorMessage) && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
              {statusMessage && <p className="text-primary-indigo">{statusMessage}</p>}
              {errorMessage && (
                <p className="mt-2 flex items-center gap-2 text-red-300">
                  <AlertTriangle size={14} />
                  {errorMessage}
                </p>
              )}
            </div>
          )}
        </Card>

        <Card className="space-y-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Matriz de datos</p>
              <h2 className="text-2xl font-display text-white">Resultados estructurados</h2>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-ink-muted">
              {EXTRACTION_FIELDS.length} campos
            </span>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-[0.3em] text-ink-muted">
                  <th className="px-4 py-2">Estudio</th>
                  {EXTRACTION_FIELDS.map((field) => (
                    <th key={field} className="px-4 py-2">
                      {field}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orderedRows.length === 0 ? (
                  <tr>
                    <td colSpan={EXTRACTION_FIELDS.length + 1} className="px-4 py-6 text-center text-ink-muted">
                      Sin datos por mostrar.
                    </td>
                  </tr>
                ) : (
                  orderedRows.map((row) => (
                    <tr key={row.paper.id} className="border-t border-white/5">
                      <td className="px-4 py-3 align-top text-ink-muted">
                        <p className="font-semibold text-white">{row.paper.title}</p>
                        <p className="text-xs">{row.paper.authors}</p>
                        {row.error && (
                          <p className="mt-2 flex items-center gap-2 text-xs text-red-300">
                            <AlertTriangle size={12} />
                            {row.error}
                          </p>
                        )}
                      </td>
                      {EXTRACTION_FIELDS.map((field) => {
                        const cell = row.fields[field] ?? { value: '', status: 'idle' };
                        return (
                          <td key={field} className="px-4 py-3 align-top text-sm text-white/90">
                            {cell.status === 'loading' ? (
                              <span className="inline-flex items-center gap-2 text-primary-indigo">
                                <Loader2 size={14} className="animate-spin" />
                                Analizando…
                              </span>
                            ) : cell.value ? (
                              cell.value
                            ) : (
                              <span className="text-ink-muted">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}

export default Phase5Page;
