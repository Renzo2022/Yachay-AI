import { CalendarCheck, ClipboardList, Compass, Layers3 } from 'lucide-react';
import Card from '../components/ui/Card.jsx';

const phaseHighlights = [
  { label: 'Protocolos activos', value: '03', icon: Layers3 },
  { label: 'Extracciones', value: '128', icon: ClipboardList },
  { label: 'Síntesis en curso', value: '02', icon: CalendarCheck },
  { label: 'Alertas', value: 'Ninguna', icon: Compass },
];

function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {phaseHighlights.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="space-y-3">
            <Icon className="text-primary-indigo" size={20} />
            <p className="text-sm uppercase tracking-[0.3em] text-ink-muted">{label}</p>
            <p className="text-4xl font-display">{value}</p>
          </Card>
        ))}
      </section>

      <Card className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Ruta RSL</p>
            <h2 className="text-2xl font-display text-ink-strong">Fase actual · Selección crítica</h2>
          </div>
          <button className="text-sm text-primary-indigo hover:text-primary-indigo-strong">Ver cronograma</button>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {['Planeación', 'Búsqueda', 'Selección', 'Extracción', 'Síntesis', 'Redacción'].map((step, index) => (
            <div key={step} className="space-y-2">
              <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Fase {index + 1}</p>
              <p className="text-lg font-semibold">{step}</p>
              <div className="h-1 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-primary-indigo" style={{ width: `${Math.max(10, (index + 1) * 12)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default DashboardPage;
