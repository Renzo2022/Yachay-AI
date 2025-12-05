import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

function ProtectedRoute() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-academic-bg text-ink-strong">
        <div className="glass-panel flex items-center gap-3 px-6 py-4">
          <Loader2 className="animate-spin text-primary-indigo" size={20} />
          <span className="text-sm tracking-[0.4em] text-ink-muted">CARGANDO</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
