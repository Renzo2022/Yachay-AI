import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Layers, NotebookPen, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const navItems = [
  { to: '/app', label: 'Overview', icon: Home },
  { to: '/app/phases', label: 'Fases RSL', icon: Layers },
  { to: '/app/library', label: 'Bitácora', icon: NotebookPen },
];

function Sidebar() {
  const { currentUser, logout } = useAuth();

  const initials = useMemo(() => {
    if (!currentUser) return 'AA';
    if (currentUser.displayName) {
      return currentUser.displayName
        .split(' ')
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase();
    }
    if (currentUser.email) {
      return currentUser.email.slice(0, 2).toUpperCase();
    }
    return 'AA';
  }, [currentUser]);

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
      <div className="mt-auto flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-indigo/30 text-lg font-semibold text-white">
          {initials}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">
            {currentUser?.displayName ?? 'Investigador'}
          </p>
          <p className="text-xs text-ink-muted line-clamp-1">{currentUser?.email ?? 'workspace@yachay.ai'}</p>
        </div>
        <button
          className="rounded-full border border-white/10 p-2 text-ink-muted transition hover:text-ink-strong"
          onClick={logout}
          title="Cerrar sesión"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
