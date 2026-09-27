import React, { useState } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { PORTFOLIO_PROJECTS, PortfolioProject } from '../data/projects';
import { WORLD_LOCATIONS } from '../data/locations';
import { X, Bike, ArrowUpRight, Compass, Filter, Sparkles } from 'lucide-react';

export const ProjectIndex: React.FC = () => {
  const { currentView, setCurrentView, openProjectOverlay, teleportToLocation } = useWorldStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (currentView !== 'index') return null;

  const categories = ['All', 'Film & Visual Storytelling', 'Brand & Creative Strategy', 'Writing & Narrative', 'Game & Interaction Prototype'];

  const filteredProjects = selectedCategory === 'All'
    ? PORTFOLIO_PROJECTS
    : PORTFOLIO_PROJECTS.filter((p) => p.category === selectedCategory);

  const handleRideTo = (project: PortfolioProject) => {
    teleportToLocation(project.locationId);
  };

  const handleOpenDetail = (project: PortfolioProject) => {
    openProjectOverlay(project);
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/85 backdrop-blur-md overflow-y-auto p-4 sm:p-8 animate-fadeIn">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between bg-white/95 backdrop-blur p-6 rounded-2xl shadow-xl border border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
              <Compass className="w-4 h-4" />
              Recruiter & Quick Explorer Mode
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              作品全览索引 (Project Index)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              为招聘方与快速浏览准备的直接清单。点击任意项目可查看深度 Case Study，或骑车前往该地标。
            </p>
          </div>

          <button
            onClick={() => setCurrentView('game')}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 text-xs font-bold"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">回到世界 (Back)</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 items-center bg-white/80 p-3 rounded-xl border border-slate-100 shadow-sm">
          <Filter className="w-4 h-4 text-slate-400 ml-2 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'All' ? '全部领域 (All Works)' : cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredProjects.map((project) => {
            const loc = WORLD_LOCATIONS.find((l) => l.id === project.locationId);
            return (
              <div
                key={project.id}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span 
                      className="px-2.5 py-1 text-[11px] font-bold rounded-md text-white shadow-xs"
                      style={{ backgroundColor: loc?.bannerColor || '#2e6db4' }}
                    >
                      {loc?.name || 'Landmark'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{project.date}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
                      {project.subtitle}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {project.oneLiner}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.tools.slice(0, 4).map((t) => (
                      <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-5 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenDetail(project)}
                    className="flex-1 py-2 px-3 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center justify-center gap-1"
                  >
                    查看详情
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleRideTo(project)}
                    className="py-2 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                    title="在海边世界骑车传送到此建筑"
                  >
                    <Bike className="w-4 h-4" />
                    骑车前往
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
