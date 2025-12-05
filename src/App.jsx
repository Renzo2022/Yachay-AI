import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProjectProvider } from './context/ProjectContext.jsx';
import MainLayout from './components/layout/MainLayout.jsx';
import WorkspaceLayout from './components/layout/WorkspaceLayout.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import DashboardPage from './features/dashboard/DashboardPage.jsx';
import Phase1Page from './features/phases/Phase1Page.jsx';
import Phase2Page from './features/phases/Phase2Page.jsx';
import Phase3Page from './features/phases/Phase3Page.jsx';
import Phase5Page from './features/phases/Phase5Page.jsx';
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
              </Route>
              <Route element={<WorkspaceLayout />}>
                <Route path="/workspace/:projectId" element={<Phase1Page />} />
                <Route path="/workspace/:projectId/phase-1" element={<Phase1Page />} />
                <Route path="/workspace/:projectId/phase-2" element={<Phase2Page />} />
                <Route path="/workspace/:projectId/phase-3" element={<Phase3Page />} />
                <Route path="/workspace/:projectId/phase-5" element={<Phase5Page />} />
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
