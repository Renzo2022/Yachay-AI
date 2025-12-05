import { BookOpenCheck, Shield, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button.jsx';

function LoginPage() {
  return (
    <div className="min-h-screen bg-academic-bg text-ink-strong flex items-center justify-center px-6">
      <div className="glass-panel grid w-full max-w-5xl grid-cols-1 overflow-hidden border border-white/10 lg:grid-cols-2">
        <div className="relative h-full bg-gradient-to-br from-primary-indigo/30 via-transparent to-ink-muted/5 p-10">
          <BookOpenCheck className="text-ink-strong/40" size={48} />
          <h1 className="mt-10 text-4xl font-display leading-snug text-white">
            Yachay AI
            <span className="block text-ink-muted">Gestión académica con precisión editorial.</span>
          </h1>
          <p className="mt-6 text-ink-muted">
            Plataforma SaaS para coordinar y visualizar cada fase de una Revisión Sistemática de Literatura con trazabilidad y control.
          </p>
          <div className="mt-12 space-y-4 text-sm text-ink-muted">
            <p className="flex items-center gap-3">
              <Shield size={18} /> Seguridad de grado académico
            </p>
            <p className="flex items-center gap-3">
              <ArrowRight size={18} /> Protocolos editables y auditables
            </p>
          </div>
        </div>
        <div className="p-10">
          <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Acceso</p>
          <h2 className="mt-4 text-3xl font-display text-white">Inicia sesión</h2>
          <form className="mt-8 space-y-4">
            <input className="input-editorial w-full" placeholder="Correo institucional" type="email" />
            <input className="input-editorial w-full" placeholder="Contraseña" type="password" />
            <Button type="submit" className="w-full justify-center">
              Acceder al workspace
            </Button>
            <Button type="button" variant="ghost" className="w-full justify-center text-sm text-ink-muted">
              Solicitar acceso
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
