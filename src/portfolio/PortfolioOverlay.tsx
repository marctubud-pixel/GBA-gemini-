import React, { useState } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { PORTFOLIO_PROJECTS, PortfolioProject } from '../data/projects';
import { WORLD_LOCATIONS } from '../data/locations';
import { X, ChevronLeft, ChevronRight, ExternalLink, Calendar, MapPin, Wrench, UserCheck, Award, Sparkles, BookOpen, Layers, Lightbulb } from 'lucide-react';
import {
  LANDMARK_ENTRANCE_DATA,
  LANDMARK_PLAZA_DATA,
  LANDMARK_PRINT_HOUSE_DATA,
  LANDMARK_BRAND_MUSEUM_DATA,
  LANDMARK_MARC_CINEMA_DATA,
  LANDMARK_EXPERIMENT_LAB_DATA,
  LANDMARK_ARCADE_DATA,
  LANDMARK_MY_STUDIO_DATA,
  LANDMARK_OBSERVATORY_DATA
} from '../assets/buildings/allLandmarksData';

const LANDMARK_BANNER_MAP: Record<string, string> = {
  'entrance': LANDMARK_ENTRANCE_DATA,
  'central-plaza': LANDMARK_PLAZA_DATA,
  'print-house': LANDMARK_PRINT_HOUSE_DATA,
  'brand-museum': LANDMARK_BRAND_MUSEUM_DATA,
  'marc-cinema': LANDMARK_MARC_CINEMA_DATA,
  'experiment-lab': LANDMARK_EXPERIMENT_LAB_DATA,
  'arcade': LANDMARK_ARCADE_DATA,
  'my-studio': LANDMARK_MY_STUDIO_DATA,
  'observatory': LANDMARK_OBSERVATORY_DATA
};

export const PortfolioOverlay: React.FC = () => {
  const { isOverlayOpen, activeProject, activeLocation, closeOverlay, openProjectOverlay } = useWorldStore();
  const [activeTab, setActiveTab] = useState<'case-study' | 'gallery'>('case-study');

  if (!isOverlayOpen || !activeProject) return null;
  // Print House / Write House has its own dedicated interior & book UI modal
  if (activeLocation?.id === 'print-house') return null;

  // Find related projects at the same location
  const locationProjects = PORTFOLIO_PROJECTS.filter((p) => p.locationId === activeProject.locationId);
  const currentIndex = locationProjects.findIndex((p) => p.id === activeProject.id);

  const handlePrev = () => {
    if (currentIndex > 0) {
      openProjectOverlay(locationProjects[currentIndex - 1]);
    } else {
      openProjectOverlay(locationProjects[locationProjects.length - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < locationProjects.length - 1) {
      openProjectOverlay(locationProjects[currentIndex + 1]);
    } else {
      openProjectOverlay(locationProjects[0]);
    }
  };

  const loc = activeLocation || WORLD_LOCATIONS.find((l) => l.id === activeProject.locationId);
  const bannerImage = LANDMARK_BANNER_MAP[activeProject.locationId] || LANDMARK_MARC_CINEMA_DATA;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <span 
              className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md text-white shadow-sm"
              style={{ backgroundColor: loc?.bannerColor || '#ef6453' }}
            >
              {loc?.name || 'Landmark'}
            </span>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {activeProject.date}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {locationProjects.length > 1 && (
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
                <button
                  onClick={handlePrev}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600 transition"
                  title="Previous project"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs px-2 text-slate-500 font-mono">
                  {currentIndex + 1} / {locationProjects.length}
                </span>
                <button
                  onClick={handleNext}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600 transition"
                  title="Next project"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={closeOverlay}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition flex items-center gap-1 text-xs font-semibold"
            >
              <span className="hidden sm:inline font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">ESC</span>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Authentic 1:1 GBA Pixel Art Hero Banner */}
          {bannerImage && (
            <div className="w-full h-36 sm:h-52 rounded-2xl overflow-hidden bg-gradient-to-b from-[#4fa9dc] via-[#7ec2e8] to-[#e0e9f0] flex items-center justify-center p-3 border border-slate-200/80 shadow-inner relative group">
              <img 
                src={bannerImage} 
                alt={loc?.name || activeProject.title} 
                className="max-h-full max-w-full object-contain filter drop-shadow-md select-none pointer-events-none transition-transform duration-300 group-hover:scale-105" 
              />
              <div className="absolute bottom-2.5 right-3 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-xs text-[10px] font-mono text-white/90 border border-white/10 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>1:1 GBA PIXEL ASSET</span>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold tracking-wider text-blue-600 uppercase">
                {activeProject.category}
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('case-study')}
                  className={`px-3 py-1 rounded-md transition ${activeTab === 'case-study' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Case Study 详析</span>
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`px-3 py-1 rounded-md transition ${activeTab === 'gallery' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>技术与工具栈</span>
                  </span>
                </button>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {activeProject.title}
            </h1>
            <p className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed">
              {activeProject.subtitle}
            </p>
          </div>

          {/* One-Liner Highlight Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-100/80 text-blue-950 font-medium text-sm leading-relaxed shadow-xs flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>{activeProject.oneLiner}</div>
          </div>

          {/* Tab 1: Deep Case Study */}
          {activeTab === 'case-study' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Left Column: Context, Problem & Strategy */}
              <div className="space-y-5">
                <section className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    01 · 背景与痛点 (Context & Problem)
                  </h3>
                  <div className="text-sm text-slate-700 leading-relaxed space-y-2">
                    <p>{activeProject.context}</p>
                    <div className="p-3 bg-amber-50/70 border-l-4 border-amber-400 rounded-r-lg text-amber-900 text-xs">
                      <span className="font-bold">核心挑战：</span>{activeProject.problem}
                    </div>
                  </div>
                </section>

                <section className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    02 · 核心洞察与策略 (Insight & Strategy)
                  </h3>
                  <div className="text-sm text-slate-700 leading-relaxed space-y-2">
                    <p><span className="font-semibold text-slate-900">洞察：</span>{activeProject.insight}</p>
                    <p><span className="font-semibold text-slate-900">策略：</span>{activeProject.strategy}</p>
                  </div>
                </section>
              </div>

              {/* Right Column: Idea, Execution & Result */}
              <div className="space-y-5">
                <section className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    03 · 创意与执行 (Idea & Execution)
                  </h3>
                  <div className="text-sm text-slate-700 leading-relaxed space-y-2">
                    <p className="font-semibold text-indigo-700 bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100">
                      “{activeProject.idea}”
                    </p>
                    <p>{activeProject.execution}</p>
                  </div>
                </section>

                <section className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>04 · 成果与影响 (Result & Impact)</span>
                  </h3>
                  <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-950 rounded-xl text-xs sm:text-sm font-medium leading-relaxed">
                    {activeProject.result}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* Tab 2: Gallery & Tech Breakdown */}
          {activeTab === 'gallery' && (
            <div className="space-y-6 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                  <div className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-blue-600" />
                    <span>工具与生产管线</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {activeProject.tools.map((tool) => (
                      <span key={tool} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg font-mono text-xs shadow-xs">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                  <div className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>职责与分工</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 font-medium pt-1">
                    {activeProject.myRole}
                  </p>
                  {activeProject.collaborators && (
                    <p className="text-xs text-slate-500 pt-1 border-t border-slate-200">
                      合作方：{activeProject.collaborators.join(' · ')}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-3">
                <div className="text-xs font-mono uppercase text-sky-400 tracking-wider">
                  DESIGN SYSTEM & ARTIFACT METRICS
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-lg font-bold text-amber-300">1:1</div>
                    <div className="text-[11px] text-slate-300">GBA Pixel Art</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-lg font-bold text-sky-300">60 FPS</div>
                    <div className="text-[11px] text-slate-300">Phaser 3 Canvas</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-lg font-bold text-emerald-300">8-bit</div>
                    <div className="text-[11px] text-slate-300">Web Audio API</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-lg font-bold text-indigo-300">100%</div>
                    <div className="text-[11px] text-slate-300">Slope Grounding</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Metadata Footer: My Role, Tools, Collaborators */}
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <div className="text-slate-400 font-semibold uppercase flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>我的职责 (My Role)</span>
              </div>
              <div className="text-slate-800 font-medium">{activeProject.myRole}</div>
            </div>

            <div className="space-y-1.5">
              <div className="text-slate-400 font-semibold uppercase flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" />
                <span>使用工具 (Tools)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeProject.tools.map((tool) => (
                  <span key={tool} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono text-[11px]">
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {activeProject.collaborators && (
              <div className="space-y-1.5">
                <div className="text-slate-400 font-semibold uppercase">合作团队</div>
                <div className="text-slate-600">
                  {activeProject.collaborators.join(', ')}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            按 <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-slate-700">ESC</kbd> 返回海边世界继续骑行
          </div>

          <div className="flex items-center gap-2">
            {activeProject.externalLink && (
              <a
                href={activeProject.externalLink.url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition flex items-center gap-1.5 border border-blue-200"
              >
                <span>{activeProject.externalLink.label}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={closeOverlay}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-md hover:shadow-lg active:scale-95"
            >
              返回世界 (Return to World)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
