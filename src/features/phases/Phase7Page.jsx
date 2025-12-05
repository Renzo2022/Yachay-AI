import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileDown, Loader2, Info, ClipboardCheck } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { EXTRACTION_FIELDS } from '../../services/aiService.js';
import { generateReportDocx } from '../../services/reportService.js';

function Phase7Page() {
  const { project } = useOutletContext() ?? {};
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const extractionMatrix = project?.extraction_matrix ?? [];
  const picoData = project?.picoData ?? {};
  const candidates = project?.candidates ?? [];
  const screeningResults = project?.screening_results ?? [];
  const includedStudies = project?.included_studies ?? [];
  const discussionText = project?.discussion_text ?? '';

  const summary = useMemo(
    () => ({
      title: project?.title ?? 'Proyecto sin título',
      pico: picoData?.question ?? 'Pregunta no definida',
      totalCandidates: candidates.length,
      included: includedStudies.length,
      excluded: screeningResults.filter((item) => item.manualDecision === 'exclude').length,
      matrixRows: extractionMatrix.length,
    }),
    [project?.title, picoData, candidates, includedStudies, screeningResults, extractionMatrix]
  );

  const handleDownload = async () => {
    if (!project?.id) return;
    setIsDownloading(true);
    setStatusMessage('Generando documento…');
    setErrorMessage('');
    try {
      await generateReportDocx({
        project,
        picoData,
        candidates,
        screeningResults,
        extractionMatrix,
        discussionText,
        fields: EXTRACTION_FIELDS,
      });
      setStatusMessage('Documento descargado.');
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message ?? 'No pudimos generar el archivo.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Fase 7 · Reporte final</p>
          <h1 className="text-4xl font-display text-white">Exportación del manuscrito</h1>
          <p className="mt-2 text-sm text-ink-muted">Compila toda la evidencia en un DOCX listo para enviar.</p>
        </div>
        <Button
          className="h-12 min-w-[260px] justify-center gap-2 text-base"
          onClick={handleDownload}
          disabled={isDownloading || extractionMatrix.length === 0}
        >
          {isDownloading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Preparando…
            </>
          ) : (
            <>
              <FileDown size={18} />
              📄 Descargar Manuscrito (.docx)
            </>
          )}
        </Button>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <Card className="space-y-5 border border-white/10 p-6">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="text-primary-indigo" />
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Resumen</p>
              <h2 className="text-2xl font-display text-white">{summary.title}</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Pregunta PICO</p>
              <p className="mt-2 text-sm text-white/90">{summary.pico}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Estudios incluidos</p>
              <p className="mt-2 text-3xl font-display text-white">{summary.included}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Registros evaluados</p>
              <p className="mt-2 text-3xl font-display text-white">{summary.totalCandidates}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Variables extraídas</p>
              <p className="mt-2 text-3xl font-display text-white">{EXTRACTION_FIELDS.length}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-ink-muted">
            <p>
              <strong>Matriz:</strong> {summary.matrixRows} filas procesadas con IA.
            </p>
            <p>
              <strong>Discusión:</strong> {discussionText ? 'Disponible' : 'Pendiente (fase 6)'}.
            </p>
          </div>
        </Card>

        <Card className="space-y-4 border border-white/10 p-6">
          <div className="flex items-center gap-3">
            <Info className="text-primary-indigo" size={18} />
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Contenido del informe</p>
              <h2 className="text-xl font-display text-white">Estructura final</h2>
            </div>
          </div>
          <ul className="space-y-3 text-sm text-ink-muted">
            <li>• Portada con título, autor y fecha.</li>
            <li>• Introducción con la pregunta PICO y criterios.</li>
            <li>• Métodos: fuentes consultadas y flujo de búsqueda.</li>
            <li>• Resultados: resumen del cribado y tabla de extracción completa.</li>
            <li>• Discusión: texto generado/ajustado en la fase 6.</li>
          </ul>
          {(statusMessage || errorMessage) && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
              {statusMessage && <p className="text-primary-indigo">{statusMessage}</p>}
              {errorMessage && <p className="text-red-300">{errorMessage}</p>}
            </div>
          )}
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-2 border border-white/10 p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Discusión</p>
          <p className="text-2xl font-display text-white">{discussionText ? 'Lista' : 'Pendiente'}</p>
          <p className="text-sm text-ink-muted">Generada automáticamente en la fase 6.</p>
        </Card>
        <Card className="space-y-2 border border-white/10 p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Cribado</p>
          <p className="text-2xl font-display text-white">
            {summary.included}/{summary.totalCandidates}
          </p>
          <p className="text-sm text-ink-muted">Estudios incluidos tras el agente de cribado.</p>
        </Card>
        <Card className="space-y-2 border border-white/10 p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Exportes</p>
          <p className="text-2xl font-display text-white">DOCX</p>
          <p className="text-sm text-ink-muted">Documento compatible con Microsoft Word y Google Docs.</p>
        </Card>
      </section>
    </div>
  );
}

export default Phase7Page;
