'use client';

import { useEffect, useState } from 'react';
import { PenTool, Plus, TrendingUp, Target, Calendar } from 'lucide-react';
import Link from 'next/link';

interface WritingProject {
  id: string;
  title: string;
  description: string;
  targetWords: number;
  currentWords: number;
  status: string;
  createdAt: string;
}

export default function WritingPage() {
  const [projects, setProjects] = useState<WritingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    targetWords: 50000,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/writing-projects', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    try {
      const response = await fetch('/api/writing-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newProject),
      });

      if (response.ok) {
        setShowNewProject(false);
        setNewProject({ title: '', description: '', targetWords: 50000 });
        fetchProjects();
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const getProgress = (project: WritingProject) => {
    return Math.min(100, Math.round((project.currentWords / project.targetWords) * 100));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-wood-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-wood-700">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wood-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-wood-900 mb-2">
            ✍️ Outils d'Écriture
          </h1>
          <p className="text-wood-600">
            Suivez vos projets d'écriture et votre progression quotidienne
          </p>
        </div>

        {/* New Project Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowNewProject(true)}
            className="inline-flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Nouveau projet</span>
          </button>
        </div>

        {/* New Project Form */}
        {showNewProject && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-wood-900 mb-4">Nouveau Projet</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-wood-700 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Mon roman..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-wood-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Description du projet..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-wood-700 mb-1">
                  Objectif (mots)
                </label>
                <input
                  type="number"
                  value={newProject.targetWords}
                  onChange={(e) => setNewProject({ ...newProject, targetWords: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={createProject}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  Créer
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewProject(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Projects List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
              <PenTool className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Aucun projet d'écriture pour le moment</p>
              <button
                type="button"
                onClick={() => setShowNewProject(true)}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Créer votre premier projet →
              </button>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-wood-900">{project.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    project.status === 'active' ? 'bg-green-100 text-green-800' :
                    project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status === 'active' ? 'Actif' :
                     project.status === 'completed' ? 'Terminé' : 'En pause'}
                  </span>
                </div>

                {project.description && (
                  <p className="text-sm text-wood-600 mb-4">{project.description}</p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-wood-600">Progression</span>
                    <span className="font-bold text-purple-600">{getProgress(project)}%</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${getProgress(project)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm text-wood-600">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{project.currentWords.toLocaleString()} mots</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4" />
                      <span>{project.targetWords.toLocaleString()} mots</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <Link
                      href={`/writing/${project.id}`}
                      className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                    >
                      Voir les détails →
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8">
          <Link href="/" className="text-purple-600 hover:text-purple-700 font-medium">
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}

