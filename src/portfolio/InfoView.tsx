import React from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { profile } from '../data/profile';
import { X, Mail, MapPin, ExternalLink, Sparkles, Code2, Palette, Cpu } from 'lucide-react';

export const InfoView: React.FC = () => {
  const { currentView, setCurrentView } = useWorldStore();

  if (currentView !== 'info') return null;

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/85 backdrop-blur-md overflow-y-auto p-4 sm:p-8 animate-fadeIn">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header Cover Banner */}
        <div className="h-36 bg-gradient-to-r from-sky-400 via-teal-400 to-indigo-500 relative p-6 flex items-end justify-between">
          <button
            onClick={() => setCurrentView('game')}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white backdrop-blur transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <span className="px-3 py-1 bg-white/90 text-slate-800 rounded-full text-xs font-bold shadow-xs">
              Personal Profile & Philosophy
            </span>
          </div>
        </div>

        {/* Avatar & Basic Info */}
        <div className="px-8 pb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg border border-slate-100">
                <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center text-3xl">
                  🚲
                </div>
              </div>
              <div className="space-y-0.5">
                <h1 className="text-2xl font-black text-slate-900">{profile.name}</h1>
                <p className="text-xs sm:text-sm font-semibold text-blue-600">{profile.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              {profile.location}
            </div>
          </div>

          {/* Tagline */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-sm font-medium italic">
            “{profile.tagline}”
          </div>

          {/* Bio */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">关于创作者 (About)</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{profile.longBio}</p>
          </div>

          {/* Skill Matrix */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">技能矩阵 (Skills & Tools)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {profile.skills.map((skillGroup) => (
                <div key={skillGroup.category} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    {skillGroup.category}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {skillGroup.items.map((item) => (
                      <span key={item} className="text-[10px] bg-white border border-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact & Links */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <a
                href={`mailto:${profile.email}`}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                {profile.email}
              </a>
            </div>

            <div className="flex items-center gap-2">
              {profile.links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                >
                  {link.label}
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
