import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Sparkles, Loader2, Save } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import { generatePICO } from '../../services/aiService.js';
import { updateProject } from '../../services/projectService.js';
import { useProjects } from '../../context/ProjectContext.jsx';

const defaultPico = {
  population: '',
  intervention: '',
  comparison: '',
  outcome: '',
  question: '',
};

function Phase1Page() {
  const { project } = useOutletContext() ?? {};
  const { loadProjects } = useProjects();
  const [topic, setTopic] = useState('');
  const [picoData, setPicoData] = useState(defaultPico);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (project?.picoData) {
      setTopic(project.picoData.topic ?? '');
      setPicoData({
        population: project.picoData.population ?? '',
        intervention: project.picoData.intervention ?? '',
        comparison: project.picoData.comparison ?? '',
        outcome: project.picoData.outcome ?? '',
        question: project.picoData.question ?? '',
      });
    } else {
      setTopic(project?.title ?? '');
      setPicoData(defaultPico);
    }
  }, [project]);

  const picoCards = useMemo(
    () => [
      { key: 'population', title: 'Población', content: picoData.population },
      { key: 'intervention', title: 'Intervención', content: picoData.intervention },
      { key: 'comparison', title: 'Comparación', content: picoData.comparison },
      { key: 'outcome', title: 'Resultado', content: picoData.outcome },
    ],
    [picoData]
  );

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setErrorMessage('Escribe un tema para generar el protocolo.');
      return;
    }
    setIsGenerating(true);
    setStatusMessage('Pensando…');
    setErrorMessage('');
    try {
      const response = await generatePICO(topic.trim());
      setPicoData({
        population: response.population ?? '',
        intervention: response.intervention ?? '',
        comparison: response.comparison ?? '',
        outcome: response.outcome ?? '',
        question: response.question ?? '',
      });
      setStatusMessage('Protocolo generado con IA ✨');
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message ?? 'No pudimos generar el protocolo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!project?.id) return;
    setIsSaving(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      await updateProject(project.id, {
        picoData: {
          topic,
          ...picoData,
        },
      });
      await loadProjects();
      setStatusMessage('Cambios guardados correctamente.');
    } catch (error) {
      console.error(error);
      setErrorMessage('No pudimos guardar los cambios. Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Fase 1 · Planificación</p>
          <h1 className="text-4xl font-display text-white">Generador PICO con IA</h1>
          <p className="mt-2 text-sm text-ink-muted">Define el corazón metodológico de tu revisión en segundos.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Pensando…
              </>
            ) : (
              <>
                <Sparkles size={16} className="mr-2" />
                Generar protocolo con IA
              </>
            )}
          </Button>
          <Button variant="ghost" onClick={handleSave} disabled={isSaving || isGenerating}>
            {isSaving ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Guardando…
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Guardar cambios
              </>
            )}
          </Button>
        </div>
      </header>

      <section className="glass-panel space-y-4 border border-white/10 p-6">
        <label className="space-y-2 text-sm text-ink-muted">
          ¿Qué quieres investigar?
          <Input
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="Impacto del dengue en comunidades rurales del Perú"
            className="text-base"
          />
        </label>
        {statusMessage && <p className="text-sm text-primary-indigo">{statusMessage}</p>}
        {errorMessage && <p className="text-sm text-red-300">{errorMessage}</p>}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {picoCards.map((card) => (
          <Card key={card.key} className="min-h-[200px] space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">{card.title}</p>
            <p className="text-lg text-white">{card.content || 'Completar con IA o manualmente.'}</p>
          </Card>
        ))}
      </section>

      <section className="glass-panel space-y-3 border border-white/10 p-6">
        <label className="text-xs uppercase tracking-[0.4em] text-ink-muted">Pregunta de investigación</label>
        <textarea
          value={picoData.question}
          onChange={(event) => setPicoData((prev) => ({ ...prev, question: event.target.value }))}
          rows={4}
          className="input-editorial w-full rounded-3xl border border-white/15 bg-transparent px-4 py-3 text-base"
          placeholder="¿Cuál es el impacto de ...?"
        />
      </section>
    </div>
  );
}

export default Phase1Page;
