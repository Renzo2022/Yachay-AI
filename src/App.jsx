import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProjectProvider } from './context/ProjectContext.jsx';
import MainLayout from './components/layout/MainLayout.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import DashboardPage from './features/dashboard/DashboardPage.jsx';
import WorkspacePlaceholder from './features/dashboard/WorkspacePlaceholder.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProjectProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/workspace/:projectId" element={<WorkspacePlaceholder />} />
              </Route>
              <Route path="/app" element={<Navigate to="/dashboard" replace />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ProjectProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
