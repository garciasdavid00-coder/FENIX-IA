'use client';

import {useEffect, useRef, useState} from 'react';

function Icon({name}) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name==='close' && <path d="m6 6 12 12M18 6 6 18"/>}
    {name==='captions' && <><rect x="3" y="5" width="18" height="14" rx="4"/><path d="M10 10H8v4h2m7-4h-2v4h2"/></>}
    {name==='mic' && <><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11v1a7 7 0 0 0 14 0v-1m-7 8v3m-3 0h6"/></>}
    {name==='muted' && <><path d="m3 3 18 18M9 9v3a3 3 0 0 0 5 2M9 5a3 3 0 0 1 6 1v4M5 11v1a7 7 0 0 0 12 5m2-6v1m-7 7v3m-3 0h6"/></>}
    {name==='end' && <path d="M4 15v-3c4-4 12-4 16 0v3l-4 1-1-4H9l-1 4z"/>}
  </svg>;
}

export default function VoiceExperience({estado,escuchando,soportado,transcripcionUsuario,respuestaIA,onClose,onOrb,onToggleMic}) {
  const [captions,setCaptions]=useState(true);
  const dialogRef=useRef(null);
  const transcriptRef=useRef(null);
  const closeRef=useRef(onClose);
  useEffect(()=>{closeRef.current=onClose},[onClose]);
  useEffect(()=>{
    const previous=document.activeElement;
    const overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    dialogRef.current?.querySelector('button')?.focus();
    const handleKey=e=>{
      if(e.key==='Escape'){e.preventDefault();closeRef.current();return}
      if(e.key!=='Tab')return;
      const buttons=[...dialogRef.current.querySelectorAll('button:not(:disabled), [tabindex="0"]')];
      const first=buttons[0],last=buttons.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    };
    document.addEventListener('keydown',handleKey);
    return()=>{
      document.removeEventListener('keydown',handleKey);
      document.body.style.overflow=overflow;
      // The greeting is replaced by the chat after the first spoken response.
      const target=previous?.isConnected?previous:document.querySelector('.voice-call-btn');
      target?.focus();
    };
  },[]);
  useEffect(()=>{
    const box=transcriptRef.current;
    if(box)box.scrollTop=box.scrollHeight;
  },[respuestaIA,transcripcionUsuario,captions]);

  const closed=estado==='cerrado';
  const paused=estado==='pausado';
  const interruptible=estado==='hablando'||estado==='pensando';
  const ready=escuchando&&estado==='escuchando';
  const title=closed?'Hasta aquí, por ahora.':paused?'A tu ritmo.':estado==='pensando'?'Déjame pensar.':estado==='hablando'?'Una idea para ti.':'Hablemos.';
  const status=closed?'Conversación cerrada':paused?'Micrófono en pausa':estado==='pensando'?'Pensando':estado==='hablando'?'Fenix está hablando':ready?'Te estoy escuchando':'Preparando micrófono';
  const hint=closed?'Inicia un nuevo chat para volver a conversar.':paused?'Activa el micrófono cuando quieras continuar.':interruptible?'Puedes interrumpirme. Esta conversación es tuya.':soportado?'Sin escribir. Sin prisa. Solo tú y tus ideas.':'Tu navegador no ofrece reconocimiento de voz.';
  const orbLabel=interruptible?'Interrumpir respuesta':transcripcionUsuario?'Enviar lo que has dicho':'Esperando tu voz';

  return <div className="voice-modal-overlay">
    <section ref={dialogRef} className="voice-modal-container" data-state={estado} role="dialog" aria-modal="true" aria-labelledby="voice-title" aria-describedby="voice-description">
      <header className="voice-modal-header">
        <div className="voice-brand"><span className="voice-emblem" aria-hidden="true">✳</span><span>fenix<span className="voice-brand-mode"> / voz</span></span></div>
        <div className="voice-header-end"><span className="voice-session-label">UN ESPACIO PARA CONVERSAR</span><button type="button" className="voice-close-btn" onClick={onClose} aria-label="Cerrar conversación de voz"><Icon name="close"/></button></div>
      </header>

      <div className="voice-main">
        <div className="voice-state" role="status"><span className={ready||estado==='hablando'?'is-live':''}/>{status}</div>
        <div className="voice-orb-stage">
          <div className="voice-orbit-track" aria-hidden="true"/>
          <button type="button" className="voice-sculpture" onClick={onOrb} disabled={!interruptible&&!transcripcionUsuario} aria-label={orbLabel}>
            <span className="voice-aura"/>
            <span className="voice-sphere"><span className="voice-sphere-flow"/><span className="voice-sphere-light"/></span>
            <span className="voice-ribbon voice-ribbon-one"/><span className="voice-ribbon voice-ribbon-two"/><span className="voice-ribbon voice-ribbon-three"/>
            <span className="voice-spark"/>
          </button>
          <span className="voice-orbit-caption" aria-hidden="true">F E N I X &nbsp; I A</span>
        </div>
        <h2 id="voice-title">{title}</h2>
        <p id="voice-description" className="voice-description">{hint}</p>
      </div>

      <div className="voice-conversation" data-hidden={!captions}>
        {captions ? <><div className="voice-transcript-heading"><span>LA CONVERSACIÓN</span><span className="voice-caption-dots" aria-hidden="true">···</span></div>
          <div className="voice-transcript-box" ref={transcriptRef} tabIndex={0} role="region" aria-label="Transcripción de la conversación">
            {transcripcionUsuario&&<p className="voice-user-text"><span>TÚ</span>{transcripcionUsuario}</p>}
            {respuestaIA&&<p className="voice-ai-text"><span>FENIX</span>{respuestaIA}</p>}
            {!transcripcionUsuario&&!respuestaIA&&<p className="voice-hint">Empieza con una pregunta, una idea<br/>o eso que tienes en mente.</p>}
          </div></> : <p className="voice-captions-off">Transcripción oculta. La conversación continúa.</p>}
      </div>

      <footer className="voice-footer">
        <div className="voice-control-group"><button type="button" className="voice-ctrl-btn" aria-label={captions?'Ocultar transcripción':'Mostrar transcripción'} aria-pressed={captions} onClick={()=>setCaptions(v=>!v)}><Icon name="captions"/></button><span>Texto</span></div>
        <div className="voice-control-group"><button type="button" className={`voice-ctrl-btn voice-mic-btn ${escuchando?'activo':''}`} disabled={closed||!soportado} aria-label={escuchando?'Pausar micrófono':'Activar micrófono'} aria-pressed={escuchando} onClick={onToggleMic}><Icon name={escuchando?'mic':'muted'}/></button><span>{escuchando?'Pausar':'Activar'}</span></div>
        <div className="voice-control-group"><button type="button" className="voice-ctrl-btn voice-end-btn" onClick={onClose} aria-label="Finalizar conversación de voz"><Icon name="end"/></button><span>Finalizar</span></div>
      </footer>
      <div className="voice-bottom-note">{closed?'Esta conversación ha finalizado.':escuchando?'Micrófono activo · Puedes hablar con naturalidad':'El micrófono no está escuchando'}</div>
    </section>
  </div>;
}
