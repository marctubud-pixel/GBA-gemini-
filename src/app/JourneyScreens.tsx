import { useEffect, useRef, useState, type HTMLAttributes } from 'react';
import { drawJourneyScene, JourneySceneKind } from './journeyArt';
import './journeyScreens.css';

/** Keep menus in the same 640 × 360 coordinate space as their pixel backdrop. */
export function JourneyFrame({ children, className = '', ...props }: HTMLAttributes<HTMLElement>) {
  const viewport = useRef<HTMLElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const resize = () => setScale(Math.min(element.clientWidth / 640, element.clientHeight / 360));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <section {...props} ref={viewport} className={`journey-screen ${className}`}>
    <div className="journey-layout" style={{ transform: `scale(${scale})` }}>{children}</div>
  </section>;
}

export function JourneyBackdrop({ kind, progress=0 }: { kind: JourneySceneKind; progress?: number }) {
  const canvas=useRef<HTMLCanvasElement>(null);const latest=useRef(progress);latest.current=progress;
  useEffect(()=>{let raf=0;const start=performance.now();let last=-100;
    const draw=(now:number)=>{const ctx=canvas.current?.getContext('2d');if(ctx&&now-last>=70){drawJourneyScene(ctx,kind,now-start,latest.current);last=now;}raf=requestAnimationFrame(draw);};raf=requestAnimationFrame(draw);return()=>cancelAnimationFrame(raf);
  },[kind]);
  return <canvas ref={canvas} width={640} height={360} className="journey-backdrop" aria-hidden="true" />;
}

export function WelcomeScreen({ onStart,onResume,soundEnabled,onSound }: { onStart:()=>void;onResume:()=>void;soundEnabled:boolean;onSound:()=>void }) {
  return <JourneyFrame className="journey-welcome" aria-label="MARC ISLAND 开场">
    <JourneyBackdrop kind="welcome" />
    <button className="journey-sound" onClick={onSound} aria-label={soundEnabled?'关闭声音':'开启声音'}>SOUND {soundEnabled?'ON':'OFF'}</button>
    <div className="journey-welcome-copy"><span className="journey-kicker">A PLAYABLE CREATIVE WORLD</span><h1>MARC ISLAND</h1><p className="journey-tagline">RIDE · EXPLORE · CREATE</p><span className="journey-rule" />
      <div className="journey-menu"><button className="journey-button journey-button-cream" onClick={onStart}><kbd>J</kbd><span>START GAME</span><b aria-hidden="true">▶</b></button><button className="journey-button" onClick={onResume}><kbd>K</kbd><span>VIEW RESUME</span><b aria-hidden="true">▶</b></button></div>
      <p className="journey-caption">沿着海岸，发现作品与生活。</p>
    </div>
    <p className="journey-screen-hint">A / D 骑行 · E / J 互动 · ESC 返回</p>
  </JourneyFrame>;
}

export function LoadingScreen({progress,ready,error,onRetry}:{progress:number;ready:boolean;error:boolean;onRetry:()=>void}) {
  const segments=12,filled=Math.floor(Math.min(1,progress)*segments);
  return <JourneyFrame className="journey-loading" aria-label="正在进入 MARC ISLAND" aria-busy={!error}>
    <JourneyBackdrop kind="loading" progress={progress} />
    <div className="journey-loading-copy"><span className="journey-kicker">THE ROAD IS WAITING</span><h2>MARC ISLAND</h2><p className="journey-loading-title">{error?'世界尚未准备好':'LOADING...'}</p>
      <div className="journey-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress*100)} aria-label="开场过渡"><div>{Array.from({length:segments},(_,i)=><i className={i<filled?'is-filled':''} key={i}/>)}</div></div>
      <p className="journey-loading-status">{error?'请重试，继续这段旅程。':ready?'Ride toward brighter days.':'正在准备海岸与小镇…'}</p>
      {error&&<button className="journey-button journey-button-cream" onClick={onRetry}>RETRY / 重试</button>}
    </div>
  </JourneyFrame>;
}
