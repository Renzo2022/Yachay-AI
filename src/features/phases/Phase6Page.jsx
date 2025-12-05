import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Loader2, Sparkles, PenSquare } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { EXTRACTION_FIELDS, runDiscussionAgent } from '../../services/aiService.js';
import { saveDiscussionText } from '../../services/projectService.js';
import { useProjects } from '../../context/ProjectContext.jsx';

const PIE_COLORS = ['#5663FF', '#F5C06D', '#3AC9A8', '#F178B6', '#59A8F6', '#9F7AEA'];

function Phase6Page() {
  const { project } = useOutletContext() ?? {};
  const { loadProjects } = useProjects();
  const extractionMatrix = project?.extraction_matrix ?? [];
  const includedStudies = project?.included_studies ?? [];

  const [discussion, setDiscussion] = useState(project?.discussion_text ?? '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setDiscussion(project?.discussion_text ?? '');
  }, [project?.discussion_text]);

  const yearDistribution = useMemo(() => {
    const counts = includedStudies.reduce((acc, study) => {
      const year = study.year ?? 'Sin año';
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => (a.year > b.year ? 1 : -1));
  }, [includedStudies]);

  const preferredPieField = useMemo(() => {
    const fieldHasData = (field) =>
      extractionMatrix.some((entry) => {
        const value = entry.data?.[field];
        return value && value !== 'No reportado';
      });
    if (fieldHasData('País')) return 'País';
    if (fieldHasData('Metodología')) return 'Metodología';
    return 'País';
  }, [extractionMatrix]);

  const pieData = useMemo(() => {
    const counts = extractionMatrix.reduce((acc, entry) => {
      const value = entry.data?.[preferredPieField];
      if (!value || value === 'No reportado') return acc;
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([label, value]) => ({ label, value }));
  }, [extractionMatrix, preferredPieField]);

  const handleGenerateDiscussion = async () => {
    if (!project?.id) return;
    setIsGenerating(true);
    setStatusMessage('Generando discusión con IA...');
    setErrorMessage('');
    try {
      const text = await runDiscussionAgent(extractionMatrix);
      setDiscussion(text);
      await saveDiscussionText(project.id, text);
      await loadProjects();
      setStatusMessage('Discusión generada y guardada.');
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message ?? 'No pudimos generar la discusión.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Fase 6 · Síntesis</p>
          <h1 className="text-4xl font-display text-white">Visualización y discusión</h1>
          <p className="mt-2 text-sm text-ink-muted">Explora patrones y genera automáticamente la narrativa académica.</p>
        </div>
        <Button
          onClick={handleGenerateDiscussion}
          disabled={isGenerating || extractionMatrix.length === 0}
          className="h-12 min-w-[220px] justify-center gap-2 text-base"
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generando…
            </>
          ) : (
            <>
              <Sparkles size={18} />
              ✨ Generar Discusión con IA
            </>
          )}
        </Button>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Distribución temporal</p>
              <h2 className="text-2xl font-display text-white">Estudios por año</h2>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-ink-muted">
              {includedStudies.length} estudios
            </span>
          </div>
          {yearDistribution.length === 0 ? (
            <p className="mt-6 text-center text-sm text-ink-muted">Aún no hay datos suficientes.</p>
          ) : (
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="year" stroke="#B9C2DE" />
                  <YAxis allowDecimals={false} stroke="#B9C2DE" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#5663FF" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Categorías</p>
              <h2 className="text-2xl font-display text-white">Distribución por {preferredPieField}</h2>
            </div>
          </div>
          {pieData.length === 0 ? (
            <p className="mt-6 text-center text-sm text-ink-muted">Aún no hay datos suficientes.</p>
          ) : (
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={60} outerRadius={90} label>
                    {pieData.map((entry, index) => (
                      <Cell key={entry.label} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </section>

      <Card className="space-y-4 border border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Discusión académica</p>
            <h2 className="text-2xl font-display text-white">Conclusiones asistidas por IA</h2>
          </div>
          <PenSquare className="text-primary-indigo" size={20} />
        </div>
        <textarea
          className="h-48 w-full rounded-3xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-primary-indigo focus:ring-1 focus:ring-primary-indigo"
          value={discussion}
          onChange={(event) => setDiscussion(event.target.value)}
          placeholder="La discusión generada aparecerá aquí…"
        />
        {statusMessage && <p className="text-sm text-primary-indigo">{statusMessage}</p>}
        {errorMessage && <p className="text-sm text-red-300">{errorMessage}</p>}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            onClick={async () => {
              if (!project?.id) return;
              setStatusMessage('Guardando discusión…');
              setErrorMessage('');
              try {
                await saveDiscussionText(project.id, discussion);
                await loadProjects();
                setStatusMessage('Discusión guardada.');
              } catch (error) {
                console.error(error);
                setErrorMessage('No pudimos guardar la discusión.');
              }
            }}
          >
            Guardar cambios
          </Button>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3 border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Campos extraídos</p>
          <p className="text-3xl font-display text-white">{EXTRACTION_FIELDS.length}</p>
          <p className="text-sm text-ink-muted">Variables en la matriz RAG listas para análisis comparativo.</p>
        </Card>
        <Card className="space-y-3 border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Estudios incluidos</p>
          <p className="text-3xl font-display text-white">{includedStudies.length}</p>
          <p className="text-sm text-ink-muted">Documentos validados tras cribado inteligente.</p>
        </Card>
      </section>
    </div>
  );
}

export default Phase6Page;
