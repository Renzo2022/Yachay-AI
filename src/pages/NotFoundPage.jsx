import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../components/ui/Button.jsx';

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-academic-bg flex flex-col items-center justify-center text-center text-ink-muted px-6">
      <Compass size={60} className="text-primary-indigo" />
      <h1 className="mt-6 text-5xl font-display text-white">404</h1>
      <p className="mt-4 text-lg">No encontramos esa ruta en el atlas académico.</p>
      <Button as={Link} to="/" className="mt-8">
        Volver al login
      </Button>
    </div>
  );
}

export default NotFoundPage;
