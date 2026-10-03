import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';

export function CinemaTicketTitle({ title }: { title: string }) {
  const viewport = useRef<HTMLHeadingElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const [distance, setDistance] = useState(0);
  useLayoutEffect(() => {
    const measure = () => setDistance(Math.max(0, (text.current?.scrollWidth || 0) - (viewport.current?.clientWidth || 0)));
    measure();
    const observer = new ResizeObserver(measure);
    if (viewport.current) observer.observe(viewport.current);
    return () => observer.disconnect();
  }, [title]);
  return <h3 className="cinema-ticket-title" ref={viewport} title={title} aria-label={title}>
    <span key={title} ref={text} className={`cinema-title-text${distance > 1 ? ' is-scrolling' : ''}`}
      style={{ '--title-scroll': `-${distance}px`, '--title-time': `${Math.max(8, distance / 22 + 5)}s` } as CSSProperties}>{title}</span>
  </h3>;
}
