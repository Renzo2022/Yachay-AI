import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenCheck, Shield, ArrowRight, Mail, Lock, Loader2, AlertCircle, Sparkles, UserPlus, LogIn, BadgeCheck } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const modes = [
  { key: 'login', label: 'Iniciar sesión', icon: LogIn },
  { key: 'register', label: 'Crear cuenta', icon: UserPlus },
];

const authErrors = {
  'auth/email-already-in-use': 'Este correo ya está registrado.',
  'auth/invalid-email': 'El formato del correo no es válido.',
  'auth/wrong-password': 'La contraseña es incorrecta.',
  'auth/user-not-found': 'No existe una cuenta con ese correo.',
  'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
};

function LoginPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { currentUser, loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate('/app', { replace: true });
    }
  }, [currentUser, navigate]);

  const tabs = useMemo(
    () =>
      modes.map(({ key, label, icon: Icon }) => ({
        key,
        label,
        icon: <Icon size={16} />,
      })),
    []
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (mode === 'register' && form.password !== form.confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(form.email, form.password);
      } else {
        await registerWithEmail(form.email, form.password);
      }
    } catch (err) {
      const friendly = authErrors[err.code] ?? 'No pudimos procesar tu solicitud. Inténtalo de nuevo.';
      setError(friendly);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError('No pudimos autenticar con Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-academic-bg text-ink-strong flex items-center justify-center px-6 py-10">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-3xl lg:grid-cols-[1.1fr,0.9fr]">
        <div className="relative h-full bg-gradient-to-br from-primary-indigo/25 via-transparent to-ink-muted/5 p-12">
          <div className="glass-panel inset shadow-glass">
            <BookOpenCheck className="text-ink-strong/60" size={48} />
          </div>
          <h1 className="mt-10 text-4xl font-display leading-snug text-white">
            Yachay AI
            <span className="block text-base font-sans text-ink-muted">
              El laboratorio digital para tus Revisiones Sistemáticas de Literatura.
            </span>
          </h1>
          <div className="mt-10 space-y-6 text-ink-muted">
            <p className="flex items-center gap-3 text-sm">
              <Shield size={18} /> Encriptación end-to-end para tus protocolos.
            </p>
            <p className="flex items-center gap-3 text-sm">
              <ArrowRight size={18} /> Auditoría de cambios por fase y rol.
            </p>
            <p className="flex items-center gap-3 text-sm">
              <BadgeCheck size={18} /> Cumplimiento con estándares PRISMA.
            </p>
          </div>
          <div className="mt-12 rounded-3xl border border-white/10 bg-academic-bg/30 p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-ink-muted">Academic Glass</p>
            <p className="mt-2 text-2xl font-display text-white">Workspace Seguro</p>
            <p className="mt-3 text-sm text-ink-muted">Integrado con Firestore y trazabilidad editorial.</p>
          </div>
        </div>

        <div className="bg-academic-bg/70 p-10 backdrop-blur-xl">
          <div className="flex gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-sm">
            {tabs.map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setMode(key);
                  setError('');
                }}
                className={[
                  'flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 transition',
                  mode === key ? 'bg-primary-indigo text-white shadow-lg' : 'text-ink-muted hover:text-ink-strong',
                ].join(' ')}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="space-y-2 text-sm">
              <span className="flex items-center gap-2 text-ink-muted">
                <Mail size={16} /> Correo institucional
              </span>
              <Input name="email" type="email" placeholder="investigador@universidad.edu" value={form.email} onChange={handleChange} required />
            </label>

            <label className="space-y-2 text-sm">
              <span className="flex items-center gap-2 text-ink-muted">
                <Lock size={16} /> Contraseña
              </span>
              <Input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required minLength={6} />
            </label>

            {mode === 'register' && (
              <label className="space-y-2 text-sm">
                <span className="flex items-center gap-2 text-ink-muted">
                  <Lock size={16} /> Confirmar contraseña
                </span>
                <Input
                  name="confirm"
                  type="password"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </label>
            )}

            {error && (
              <p className="flex items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                <AlertCircle size={16} />
                {error}
              </p>
            )}

            <Button type="submit" className="w-full justify-center" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Procesando…
                </>
              ) : mode === 'login' ? (
                'Acceder al workspace'
              ) : (
                'Crear cuenta académica'
              )}
            </Button>

            <Button type="button" variant="ghost" className="w-full justify-center gap-2 text-ink-muted" onClick={handleGoogle} disabled={isSubmitting}>
              <Sparkles size={16} />
              Continuar con Google académico
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
