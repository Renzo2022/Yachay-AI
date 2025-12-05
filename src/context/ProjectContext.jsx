import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { getUserProjects } from '../services/projectService.js';

const ProjectContext = createContext({
  projects: [],
  projectsLoading: false,
  currentProject: null,
  loadProjects: async () => {},
  selectProject: () => {},
});

export function ProjectProvider({ children }) {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

  const loadProjects = useCallback(async () => {
    if (!currentUser?.uid) {
      setProjects([]);
      setCurrentProject(null);
      return;
    }

    setProjectsLoading(true);
    try {
      const data = await getUserProjects(currentUser.uid);
      setProjects(data);
      setCurrentProject((previous) => {
        if (!previous) {
          return data[0] ?? null;
        }
        const updated = data.find((project) => project.id === previous.id);
        return updated ?? data[0] ?? null;
      });
    } catch (error) {
      console.error('Error loading projects', error);
    } finally {
      setProjectsLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const selectProject = useCallback(
    (projectId) => {
      if (!projectId) {
        setCurrentProject(null);
        return;
      }
      setCurrentProject((prev) => {
        if (prev?.id === projectId) return prev;
        const found = projects.find((project) => project.id === projectId);
        return found ?? prev;
      });
    },
    [projects]
  );

  const value = useMemo(
    () => ({
      projects,
      projectsLoading,
      currentProject,
      loadProjects,
      selectProject,
    }),
    [projects, projectsLoading, currentProject, loadProjects, selectProject]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within ProjectProvider');
  }
  return context;
}
