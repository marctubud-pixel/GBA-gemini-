import { useCallback, useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { useWorldStore } from '../store/useWorldStore';
import { useContentStore } from '../store/useContentStore';
import { createGame } from '../game/Game';
import { pixelSound } from '../game/audio/PixelSoundManager';
import { DeviceShell } from '../shell/DeviceShell';
import { PortfolioOverlay } from '../portfolio/PortfolioOverlay';
import { WriteHouseModal } from '../portfolio/WriteHouseModal';
import { MarcCinemaModal } from '../portfolio/MarcCinemaModal';
import { BrandMuseumModal } from '../portfolio/BrandMuseumModal';
import { ArcadeGameModal } from '../portfolio/ArcadeGameModal';
import { HobbyStudioModal } from '../portfolio/HobbyStudioModal';
import { ExperimentLabModal } from '../portfolio/ExperimentLabModal';
import { ProjectIndex } from '../portfolio/ProjectIndex';
import { InfoView } from '../portfolio/InfoView';
import { PostcardModal } from '../portfolio/PostcardModal';
import { EndingModal } from '../portfolio/EndingModal';
import { LoadingScreen, WelcomeScreen } from './JourneyScreens';

const TRANSITION_MS=2200;
const WELCOME_KEYS=new Set(['KeyJ','KeyK','KeyE','KeyA','KeyD','KeyW','KeyS','Enter','Space','Escape','ArrowLeft','ArrowRight','ArrowUp','ArrowDown']);

export const App = () => {
  const currentView=useWorldStore(s=>s.currentView);
  const soundEnabled=useWorldStore(s=>s.soundEnabled);
  const gameContainerRef=useRef<HTMLDivElement>(null);
  const phaserGameRef=useRef<Phaser.Game|null>(null);
  const startInProgress=useRef(false);
  const loadingTimer=useRef<number|null>(null);
  const focusTimer=useRef<number|null>(null);
  const [isLoading,setLoading]=useState(false);
  const [progress,setProgress]=useState(0);
  const [isWorldReady,setWorldReady]=useState(false);
  const [loadingError,setLoadingError]=useState(false);

  useEffect(()=>{void useContentStore.getState().load();},[]);
  useEffect(()=>pixelSound.connectStore(useWorldStore),[]);
  useEffect(()=>{
    if(gameContainerRef.current&&!phaserGameRef.current)phaserGameRef.current=createGame(gameContainerRef.current);
    const game=phaserGameRef.current;
    const ready=()=>setWorldReady(true);
    game?.events.on('journey-world-ready',ready);
    if(game?.scene.isActive('WorldScene'))ready();
    return()=>{
      game?.events.off('journey-world-ready',ready);
      if(loadingTimer.current!==null)window.clearInterval(loadingTimer.current);
      if(focusTimer.current!==null)window.clearTimeout(focusTimer.current);
      startInProgress.current=false;
      useWorldStore.getState().setStarting(false);
      game?.destroy(true);phaserGameRef.current=null;
    };
  },[]);

  const handleStartGame=useCallback(()=>{
    if(startInProgress.current||useWorldStore.getState().currentView!=='welcome')return;
    startInProgress.current=true;
    pixelSound.startAudio();pixelSound.playConfirm();
    const store=useWorldStore.getState();store.setStarting(true);
    store.setVirtualInput({left:false,right:false,up:false,down:false,action:false,accelerate:false,brake:false});
    setLoading(true);setLoadingError(false);setProgress(0);
    const started=performance.now();
    if(loadingTimer.current!==null)window.clearInterval(loadingTimer.current);
    loadingTimer.current=window.setInterval(()=>{
      const elapsed=performance.now()-started;
      const game=phaserGameRef.current;
      const ready=!!game?.scene.isActive('WorldScene');
      if(ready)setWorldReady(true);
      setProgress(Math.min(ready?1:.92,elapsed/TRANSITION_MS));
      if(elapsed>=TRANSITION_MS&&ready){
        window.clearInterval(loadingTimer.current!);loadingTimer.current=null;
        setProgress(1);setLoading(false);startInProgress.current=false;
        const state=useWorldStore.getState();state.setStarting(false);state.setCurrentView('game');
        pixelSound.playMount();
        focusTimer.current=window.setTimeout(()=>{window.focus();game?.canvas?.focus();focusTimer.current=null;},60);
      }else if(elapsed>=20000){
        window.clearInterval(loadingTimer.current!);loadingTimer.current=null;
        setLoadingError(true);startInProgress.current=false;
      }
    },50);
  },[]);
  const handleResume=useCallback(()=>{
    if(startInProgress.current)return;
    pixelSound.playConfirm();useWorldStore.getState().setCurrentView('info');
  },[]);

  // Capture throughout welcome and loading; no action leaks to the Phaser world.
  useEffect(()=>{
    if(currentView!=='welcome')return;
    const onKey=(event:KeyboardEvent)=>{
      if(!WELCOME_KEYS.has(event.code))return;
      const target=event.target instanceof Element?event.target:null;
      if(!startInProgress.current&&(event.code==='Enter'||event.code==='Space')&&target?.closest('button')){
        event.stopPropagation();if(event.repeat)event.preventDefault();return;
      }
      event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
      if(event.repeat||startInProgress.current)return;
      if(event.code==='KeyJ'||event.code==='Enter'||event.code==='Space')handleStartGame();
      else if(event.code==='KeyK'||event.code==='Escape')handleResume();
    };
    const onKeyUp=(event:KeyboardEvent)=>{if(WELCOME_KEYS.has(event.code)){event.stopPropagation();event.stopImmediatePropagation();}};
    window.addEventListener('keydown',onKey,true);window.addEventListener('keyup',onKeyUp,true);
    return()=>{window.removeEventListener('keydown',onKey,true);window.removeEventListener('keyup',onKeyUp,true);};
  },[currentView,handleStartGame,handleResume]);

  return <div className="relative w-screen h-screen overflow-hidden bg-[#0d131a]">
    <DeviceShell>
      <div ref={gameContainerRef} id="phaser-container" className="w-full h-full flex items-center justify-center" />
      {currentView==='welcome'&&(isLoading?<LoadingScreen progress={progress} ready={isWorldReady} error={loadingError} onRetry={handleStartGame}/>:<WelcomeScreen onStart={handleStartGame} onResume={handleResume} soundEnabled={soundEnabled} onSound={()=>useWorldStore.getState().toggleSound()}/>)}
      <WriteHouseModal/><MarcCinemaModal/><BrandMuseumModal/><ArcadeGameModal/><HobbyStudioModal/><ExperimentLabModal/>
      <PostcardModal/><EndingModal/>
    </DeviceShell>
    <PortfolioOverlay/><ProjectIndex/><InfoView/>
  </div>;
};
