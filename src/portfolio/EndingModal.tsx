import { useCallback, useEffect, useRef, useState } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { profile } from '../data/profile';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { JourneyBackdrop, JourneyFrame } from '../app/JourneyScreens';
import { useModalKeys } from './SceneModalFrame';

const PLACEHOLDER_EMAIL=/@(?:example\.(?:com|org|net)|portfolio\.me)$/i;
function availableEmail(){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)&&!PLACEHOLDER_EMAIL.test(profile.email)?profile.email:null;}
function availableLinks(){return profile.links.filter(link=>{try{const url=new URL(link.url);return /^https?:$/.test(url.protocol)&&url.pathname!=='/'&&url.pathname!==''&&!url.hostname.endsWith('example.com');}catch{return false;}});}

export const EndingModal=()=>{
  const isOpen=useWorldStore(s=>s.isEndingModalOpen&&s.currentView==='game');
  const closeEndingModal=useWorldStore(s=>s.closeEndingModal);
  const [showContact,setShowContact]=useState(false);
  const [selectedAction,setSelectedAction]=useState(2);
  const contactRef=useRef<HTMLElement>(null);
  useEffect(()=>{
    if(!showContact)return;
    const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
    contactRef.current?.querySelector<HTMLElement>('button')?.focus();
    return()=>{if(previous?.isConnected)previous.focus({preventScroll:true});};
  },[showContact]);
  useEffect(()=>{if(isOpen){setShowContact(false);setSelectedAction(2);}},[isOpen]);
  const restart=useCallback(()=>{pixelSound.playConfirm();setShowContact(false);closeEndingModal();},[closeEndingModal]);
  const resume=useCallback(()=>{pixelSound.playConfirm();setShowContact(false);closeEndingModal();useWorldStore.getState().setCurrentView('info');},[closeEndingModal]);
  const back=useCallback(()=>{if(showContact){pixelSound.playCancel();setShowContact(false);}else restart();},[showContact,restart]);
  const contact=useCallback(()=>{pixelSound.playSelect();setSelectedAction(1);setShowContact(true);},[]);
  const moveAction=useCallback((step:number)=>{if(showContact)return;pixelSound.playSelect();setSelectedAction(index=>(index+step+3)%3);},[showContact]);
  const confirm=useCallback(()=>{
    if(showContact){pixelSound.playCancel();setShowContact(false);return;}
    if(selectedAction===0)resume();else if(selectedAction===1)contact();else restart();
  },[showContact,selectedAction,resume,contact,restart]);
  useModalKeys({isOpen,onClose:back,onConfirm:confirm,onPrev:()=>moveAction(-1),onNext:()=>moveAction(1),onUp:()=>moveAction(-1),onDown:()=>moveAction(1)});
  if(!isOpen)return null;
  const email=availableEmail(),links=availableLinks();
  return <JourneyFrame className="journey-ending" role="dialog" aria-modal="true" aria-label="旅程留念" onPointerDown={event=>event.stopPropagation()} onKeyDown={event=>{
    if(event.key!=='Tab')return;
    const container=showContact?contactRef.current:event.currentTarget;
    const controls=Array.from(container?.querySelectorAll<HTMLElement>('button,a[href]')??[]);
    if(!controls.length)return;
    event.preventDefault();
    const index=controls.indexOf(document.activeElement as HTMLElement);
    const next=index<0?(event.shiftKey?controls.length-1:0):(index+(event.shiftKey?-1:1)+controls.length)%controls.length;
    controls[next].focus({preventScroll:true});
  }}>
    <JourneyBackdrop kind="ending"/>
    <div className="journey-ending-copy" aria-hidden={showContact || undefined}><h2>Thank you <br />for exploration</h2><p className="journey-ending-line">谢谢你的参观</p>
      <div className="journey-ending-actions" aria-label="旅程结束操作"><button className={`journey-button journey-button-cream ${selectedAction===0?'is-selected':''}`} onMouseEnter={()=>setSelectedAction(0)} onFocus={()=>setSelectedAction(0)} onClick={resume}>VIEW RESUME</button><button className={`journey-button ${selectedAction===1?'is-selected':''}`} onMouseEnter={()=>setSelectedAction(1)} onFocus={()=>setSelectedAction(1)} onClick={contact}>CONTACT</button><button className={`journey-button journey-button-cream ${selectedAction===2?'is-selected':''}`} onMouseEnter={()=>setSelectedAction(2)} onFocus={()=>setSelectedAction(2)} onClick={restart}>EXPLORE AGAIN ▶</button></div>
    </div>
    {showContact&&<div className="journey-contact-backdrop"><aside className="journey-contact" ref={contactRef} role="dialog" aria-modal="true" aria-label="联系方式"><h3>{profile.englishName} · CONTACT</h3>{email?<p>邮箱：<a href={`mailto:${email}`}>{email}</a></p>:<p>联系方式待更新。</p>}{links.length>0&&<p>{links.map(link=><a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label} ↗ </a>)}</p>}<p>{profile.title}</p><button className="journey-button" onClick={()=>setShowContact(false)}>ESC · 返回</button></aside></div>}
  </JourneyFrame>;
};
