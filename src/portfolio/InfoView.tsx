import { useEffect } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { profile } from '../data/profile';
import { Mail, MapPin, ExternalLink, Sparkles } from 'lucide-react';
import { PixelBike } from '../shell/PixelIcons';
import './infoView.css';

export const InfoView = () => {
  const { currentView, setCurrentView } = useWorldStore();
  useEffect(() => {
    if (currentView !== 'info') return;
    const close = (event: KeyboardEvent) => {
      if (event.code !== 'Escape' && event.code !== 'KeyK') return;
      event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
      if (!event.repeat) setCurrentView('game');
    };
    window.addEventListener('keydown', close, true);
    return () => window.removeEventListener('keydown', close, true);
  }, [currentView, setCurrentView]);
  if (currentView !== 'info') return null;
  return <div className="profile-overlay">
    <div className="profile-toolbar"><span>PERSONAL PROFILE</span><button onClick={() => setCurrentView('game')} aria-label="返回游戏">ESC · 返回小镇</button></div>
    <article className="profile-card">
      <header className="profile-banner"><span>个人资料与工作经历</span></header>
      <div className="profile-content">
        <div className="profile-heading">
          <div className="profile-avatar">{profile.avatarUrl ? <img src={profile.avatarUrl} alt={`${profile.name}头像`} /> : <PixelBike size={40} />}</div>
          <div><h1>{profile.name}</h1><p className="profile-english">{profile.englishName}</p><p className="profile-role">{profile.title}</p></div>
          <p className="profile-location"><MapPin size={14} />{profile.location}</p>
        </div>
        <p className="profile-tagline">{profile.tagline}</p>
        <section className="profile-section"><h2>关于创作者 (About)</h2><p>{profile.longBio}</p></section>
        <section className="profile-section"><h2>能力与经验 (Skills)</h2><div className="profile-skills">{profile.skills.map(group => <div className="profile-skill-group" key={group.category}><h3><Sparkles size={14} />{group.category}</h3><div className="profile-tags">{group.items.map(item => <span key={item}>{item}</span>)}</div></div>)}</div></section>
        <section className="profile-section"><h2>工作经历 (Experience)</h2><ol className="profile-jobs">{profile.experience.map(job => <li className="profile-job" key={`${job.company}-${job.period}`}><div className="profile-job-heading"><h3>{job.company}</h3><time>{job.period}</time></div><p className="profile-role">{job.role}</p><ul>{job.responsibilities.map(text => <li key={text}>{text}</li>)}</ul></li>)}</ol></section>
        <footer className="profile-contact"><a href={`mailto:${profile.email}`}><Mail size={15} />{profile.email}</a>{profile.links.map(link => <a key={link.label} href={link.url} target="_blank" rel="noreferrer">{link.label}<ExternalLink size={13} /></a>)}<span>内容来源：用户提供的简历</span></footer>
      </div>
    </article>
  </div>;
};
