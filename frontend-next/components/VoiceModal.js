'use client';
import React, {useState,useEffect,useRef,useCallback} from 'react';
import {useSpeechRecognition} from '@/hooks/useSpeechRecognition';
import {apiFetch} from '@/lib/api';
import {readSSE} from '@/lib/sse';
import VoiceExperience from '@/components/VoiceExperience';

export default function VoiceModal({isOpen,onClose,onEnviarMensaje,chatId,historial=[],modelo='auto',webSearch='auto'}) {
  const [estado,setEstado]=useState('escuchando');
  const [transcripcionUsuario,setTranscripcionUsuario]=useState('');
  const [respuestaIA,setRespuestaIA]=useState('');
  const estadoRef=useRef('escuchando');
  const openRef=useRef(isOpen);
  useEffect(()=>{openRef.current=isOpen},[isOpen]);
  const turnoRef=useRef(0);
  const controllerRef=useRef(null);
  const utterRef=useRef(null);
  const finishSpeechRef=useRef(null);
  const timerRef=useRef(null);
  const localChatRef=useRef(null);
  const selectedChatRef=useRef(chatId);
  useEffect(()=>{selectedChatRef.current=chatId},[chatId]);
  const historyRef=useRef(historial);
  useEffect(()=>{historyRef.current=historial},[historial]);
  const sendRef=useRef(null);
  const cambiarEstado=useCallback(value=>{estadoRef.current=value;setEstado(value)},[]);
  const cancelar=useCallback(()=>{
    turnoRef.current++;
    controllerRef.current?.abort(); controllerRef.current=null;
    clearTimeout(timerRef.current);
    window.speechSynthesis?.cancel();
    finishSpeechRef.current?.(); finishSpeechRef.current=null; utterRef.current=null;
  },[]);
  const {escuchando,soportado,iniciar,detener,consumir}=useSpeechRecognition({
    onResult:(texto)=>{
      const limpio=texto.trim();
      if(!limpio || !openRef.current || ['pausado','cerrado'].includes(estadoRef.current))return;
      if(estadoRef.current==='hablando'){
        const spoken=utterRef.current?.text?.toLowerCase() || '';
        if(spoken && spoken.includes(limpio.toLowerCase()))return;
      }
      if(['hablando','pensando'].includes(estadoRef.current)){
        cancelar(); cambiarEstado('escuchando');
      }
      setTranscripcionUsuario(limpio);
      clearTimeout(timerRef.current);
      timerRef.current=setTimeout(()=>sendRef.current?.(limpio),1100);
    },
    onError:err=>{setRespuestaIA(err==='not-allowed'?'Permite el micrófono en tu navegador.':'El reconocimiento de voz no está disponible.');cambiarEstado('pausado')}
  });
  const hablar=useCallback((texto,turn)=>new Promise(resolve=>{
    if(!openRef.current || turnoRef.current!==turn || !window.speechSynthesis)return resolve();
    const clean=texto.replace(/\[[^\]]*\]/g,'').replace(/[*_#\x60]/g,'').trim();
    if(!clean)return resolve();
    cambiarEstado('hablando');
    const utter=new SpeechSynthesisUtterance(clean);
    utter.lang=localStorage.getItem('fenixIdioma') || 'es';
    utter.voice=window.speechSynthesis.getVoices().find(v=>v.lang.startsWith(utter.lang)) || null;
    utterRef.current=utter;
    let finished=false;
    const done=()=>{if(finished)return;finished=true;clearTimeout(watchdog);if(finishSpeechRef.current===done)finishSpeechRef.current=null;resolve()};
    const watchdog=setTimeout(done,Math.max(15000,clean.length*150));
    finishSpeechRef.current=done;
    utter.onend=done;utter.onerror=done;
    try{window.speechSynthesis.speak(utter)}catch{done()}
  }),[cambiarEstado]);

  const enviarConsultaVoz=async prompt=>{
    if(!prompt.trim() || !openRef.current || estadoRef.current==='cerrado')return;
    cancelar(); consumir();
    const turn=turnoRef.current;
    const controller=new AbortController();controllerRef.current=controller;
    const id=chatId || localChatRef.current || Date.now().toString();localChatRef.current=id;
    cambiarEstado('pensando');setRespuestaIA('');
    let total='', pending='', speech=Promise.resolve();
    const queue=text=>{speech=speech.then(()=>hablar(text,turn))};
    try{
      const res=await apiFetch('/api/chat',{method:'POST',signal:controller.signal,body:JSON.stringify({mensaje:prompt,chatId:id,historial:historyRef.current.map(m=>({role:m.rol==='user'?'user':'assistant',content:m.contenido||''})),modelo,webSearch,idioma:localStorage.getItem('fenixIdioma')||'es',instruccion:localStorage.getItem('fenixSystemPrompt')||'',canal:'voz',timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone})});
      if(!res.ok){const e=await res.json().catch(()=>({}));throw Object.assign(new Error(e.mensaje||e.error||'No se pudo obtener respuesta.'),{bloqueado:e.error==='CHAT_BLOQUEADO'})}
      for await(const data of readSSE(res.body)){
        if(turnoRef.current!==turn)return;
        if(data.texto){total+=data.texto;pending+=data.texto;setRespuestaIA(total);
          let match;while((match=pending.match(/^([\s\S]*?[.!?])\s+([\s\S]*)$/))){queue(match[1]);pending=match[2]}
        }
      }
      if(!total.trim())throw new Error('El modelo no devolvió texto.');
      queue(pending);
      if(turnoRef.current===turn)await onEnviarMensaje?.(prompt,{chatId:id,canalVoz:true,respuestaPrecalculada:total});
      await speech;
      if(turnoRef.current===turn && openRef.current){consumir();cambiarEstado('escuchando');setTranscripcionUsuario('')}
    }catch(e){
      if(controller.signal.aborted || turnoRef.current!==turn)return;
      setRespuestaIA(e.message);
      cancelar();
      const errorTurn=turnoRef.current;
      if(e.bloqueado){detener();await onEnviarMensaje?.(prompt,{chatId:id,respuestaPrecalculada:e.message,bloqueado:true});}
      await hablar(e.message,errorTurn);
      if(turnoRef.current===errorTurn)cambiarEstado(e.bloqueado?'cerrado':'escuchando');
    }finally{if(controllerRef.current===controller)controllerRef.current=null}
  };
  useEffect(()=>{sendRef.current=enviarConsultaVoz});
  useEffect(()=>{
    if(!isOpen)return;
    localChatRef.current=selectedChatRef.current || Date.now().toString();
    cambiarEstado('escuchando');setRespuestaIA('');setTranscripcionUsuario('');
    const timer=setTimeout(iniciar,150);
    return()=>{clearTimeout(timer);cancelar();detener()};
  },[isOpen,iniciar,detener,cancelar,cambiarEstado]);
  const manejarClickOrbe=()=>{
    if(['hablando','pensando'].includes(estadoRef.current)){cancelar();consumir();cambiarEstado('escuchando');setTranscripcionUsuario('')}
    else if(estadoRef.current==='escuchando' && transcripcionUsuario.trim())sendRef.current(transcripcionUsuario);
  };
  if (!isOpen) return null;

  return <VoiceExperience estado={estado} escuchando={escuchando} soportado={soportado}
    transcripcionUsuario={transcripcionUsuario} respuestaIA={respuestaIA}
    onClose={onClose} onOrb={manejarClickOrbe}
    onToggleMic={()=>{
      cancelar();
      if(escuchando){detener();cambiarEstado('pausado')}
      else{cambiarEstado('escuchando');iniciar()}
    }}/>;
}
