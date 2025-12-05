import { Search, Bell, Sparkles } from 'lucide-react';
import Button from '../ui/Button.jsx';

function TopBar() {
  return (
    <header className="glass-panel flex items-center justify-between border border-white/10 px-6 py-4">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Fase 0</p>
        <h1 className="text-2xl font-display text-ink-strong">Andamiaje · Academic Glass</h1>
      </div>
      <div className="flex items-center gap-4">
        <label className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
          <input className="input-editorial pl-10 pr-4 py-2 w-64" placeholder="Buscar protocolo..." />
        </label>
        <button className="rounded-full border border-glass-border/60 p-2 text-ink-muted transition hover:text-ink-strong">
          <Bell size={18} />
        </button>
        <Button>
          <Sparkles size={16} className="mr-2" />
          Nueva RSL
        </Button>
      </div>
    </header>
  );
}

export default TopBar;
