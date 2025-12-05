import { NavLink } from 'react-router-dom';
import { Home, Layers, NotebookPen, LogOut } from 'lucide-react';

const navItems = [
  { to: '/app', label: 'Overview', icon: Home },
  { to: '/app/phases', label: 'Fases RSL', icon: Layers },
  { to: '/app/library', label: 'Bitácora', icon: NotebookPen },
];

function Sidebar() {
  return (
    <aside className="flex h-screen w-72 flex-col gap-6 border-r border-white/5 bg-academic-bg/80 px-6 py-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-ink-muted">Yachay AI</p>
        <p className="mt-2 text-2xl font-display">Academic Glass</p>
      </div>
      <nav className="space-y-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 transition',
                isActive ? 'bg-primary-indigo/15 border-primary-indigo/60 text-white' : 'text-ink-muted hover:border-white/10 hover:text-ink-strong',
              ].join(' ')
            }
          >
            <Icon size={18} />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
      <button className="flex items-center gap-3 text-sm text-ink-muted transition hover:text-ink-strong">
        <LogOut size={18} />
        Cerrar sesión
      </button>
    </aside>
  );
}

export default Sidebar;
