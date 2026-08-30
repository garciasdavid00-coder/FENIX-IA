/* ============================================================
   Editor de imágenes con Fabric.js  (Fenix IA)
   ------------------------------------------------------------
   Módulo ES6 independiente: NO depende de script.js.
   - openImageEditor(url, onSave, opciones)  abre el modal.
     onSave(snapshot, dataURL) recibe el estado del editor (snapshot
     Fabric JSON para persistirlo) y la imagen final en base64/dataURL.
     El caller decide qué hacer con la imagen (chat, documento, etc).
   - También expone window.FenixImgEditor para que script.js (script
     clásico) siga funcionando: editar(imgEl), renderVista(url, snap),
     configurarAlGuardar(fn).
   La edición se persiste como snapshot { ancho, alto, objetos } de
   Fabric (compacto y re-editable); el raster final viaja en dataURL.
============================================================ */
const fabricInst = (typeof fabric !== 'undefined') ? fabric : null;

const COLOR_NEGRO = '#111111';
const COLOR_BLANCO = '#ffffff';
const MAX_UNDO = 40; // entradas de deshacer/rehacer

// ---------------------------------------------------------------------------
// Estado del editor (ámbito de módulo; hay un solo editor abierto por vez)
// ---------------------------------------------------------------------------
let modal = null;           // raíz del modal en el DOM
let canvas = null;          // instancia fabric.Canvas
let baseImagen = null;      // fabric.Image de fondo (la foto generada)
let rectRecorte = null;     // rectángulo de recorte en modo crop
let dirty = false;          // hay cambios sin guardar
let bloqueoHistorial = false;

let pilaDeshacer = [];      // estados anteriores (JSON)
let pilaRehacer = [];       // estados deshechos para rehacer (JSON)
let estadoPrevisto = null;  // estado "actual" capturado para armar el historial

let estadoActivo = null;    // { url, onSave, imgEl, snapshot } de la edición abierta

// Controles por defecto
let controlColor = COLOR_NEGRO;
let controlGrosor = 3;
let controlTamTexto = 28;

// Hook que script.js instala para persistir en el historial local
let hookAlGuardar = null;

const ETIQUETAS = {
  editar: 'Editar', copiar: 'Copiar', copiado: 'Copiado',
  titulo: 'Editar imagen', recortar: 'Recortar', aplicar: 'Aplicar',
  cancelar: 'Cancelar', rotar: 'Rotar', voltearH: 'Voltear ⟷',
  voltearV: 'Voltear ↕', texto: 'Texto', dibujar: 'Pincel',
  seleccionar: 'Seleccionar', color: 'Color', negro: 'Negro',
  blanco: 'Blanco', grosor: 'Grosor', tamTexto: 'Tamaño texto',
  deshacer: 'Deshacer', rehacer: 'Rehacer', descargar: 'Descargar',
  guardar: 'Guardar en Fenix IA', cerrar: 'Cerrar',
  confirmarCerrar: 'Hay cambios sin guardar. ¿Descartarlos?',
  confirmarSustituir: 'Ya hay una edición abierta. ¿Sustituirla?',
  errorCarga: 'No se pudo cargar la imagen.'
};
const t = clave => ETIQUETAS[clave] || clave;

/* ============================================================
   Construcción del modal y la barra de herramientas.
   Se crea una sola vez; el lienzo se regenera por cada apertura.
   ============================================================ */
function construirModal() {
  if (modal) return;

  modal = document.createElement('div');
  modal.className = 'fe-modal';
  modal.id = 'feEdModal';
  modal.hidden = true;
  modal.innerHTML =
    '<div class="fe-caja">' +
      '<div class="fe-cabecera">' +
        '<span class="fe-titulo"></span>' +
        '<div class="fe-cabecera-acciones">' +
          '<button type="button" class="fe-boton-ghost" data-fe="deshacer" title="' + t('deshacer') + '">↶</button>' +
          '<button type="button" class="fe-boton-ghost" data-fe="rehacer" title="' + t('rehacer') + '">↷</button>' +
        '</div>' +
        '<button type="button" class="fe-cerrar" data-fe="cerrar" aria-label="' + t('cerrar') + '">&times;</button>' +
      '</div>' +
      '<div class="fe-toolbar">' +
        '<button type="button" class="fe-tool" data-fe="seleccionar">' + t('seleccionar') + '</button>' +
        '<button type="button" class="fe-tool" data-fe="dibujar"><span aria-hidden="true">✎</span>' + t('dibujar') + '</button>' +
        '<button type="button" class="fe-tool" data-fe="texto"><span aria-hidden="true">T</span>' + t('texto') + '</button>' +
        '<button type="button" class="fe-tool" data-fe="recortar"><span aria-hidden="true">▭</span>' + t('recortar') + '</button>' +
        '<button type="button" class="fe-tool" data-fe="rotar"><span aria-hidden="true">↻</span>' + t('rotar') + '</button>' +
        '<button type="button" class="fe-tool" data-fe="voltearH" title="Horizontal">⟷</button>' +
        '<button type="button" class="fe-tool" data-fe="voltearV" title="Vertical">↕</button>' +
        '<span class="fe-sep"></span>' +
        '<div class="fe-control" title="' + t('color') + '">' +
          '<button type="button" class="fe-swatch activo" data-fe="colorN" aria-label="' + t('negro') + '"></button>' +
          '<button type="button" class="fe-swatch" data-fe="colorB" aria-label="' + t('blanco') + '"></button>' +
        '</div>' +
        '<div class="fe-control" title="' + t('grosor') + '">' +
          '<span class="fe-control-letra">──</span>' +
          '<input type="range" min="1" max="24" value="3" data-fe="grosor">' +
        '</div>' +
        '<div class="fe-control" title="' + t('tamTexto') + '">' +
          '<span class="fe-control-letra">T</span>' +
          '<input type="number" min="10" max="200" value="28" class="fe-numero" data-fe="tamTexto">' +
        '</div>' +
      '</div>' +
      '<div class="fe-lienzo"></div>' +
      '<div class="fe-pie">' +
        '<button type="button" class="fe-boton-sec" data-fe="cancelar">' + t('cancelar') + '</button>' +
        '<div class="fe-pie-der">' +
          '<button type="button" class="fe-boton-sec" data-fe="descargar">⬇ ' + t('descargar') + '</button>' +
          '<button type="button" class="fe-boton-primario" data-fe="guardar">' + t('guardar') + '</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  modal.querySelector('.fe-titulo').textContent = t('titulo');

  // --- cableado de eventos de la UI (una sola vez) ---
  const porDato = {};
  modal.querySelectorAll('[data-fe]').forEach(el => {
    const accion = el.getAttribute('data-fe');
    porDato[accion] = porDato[accion] ? porDato[accion].concat(el) : [el];
  });
  const prim = accion => (porDato[accion] || [])[0];

  prim('seleccionar').addEventListener('click', () => { salirRecorte(); desactivarDibujo(); marcarHerramienta(null); });
  prim('dibujar').addEventListener('click', alternarDibujo);
  prim('texto').addEventListener('click', agregarTexto);
  prim('recortar').addEventListener('click', alternarRecorte);
  prim('rotar').addEventListener('click', () => rotarGrados(90));
  prim('voltearH').addEventListener('click', () => voltear(true));
  prim('voltearV').addEventListener('click', () => voltear(false));

  porDato['colorN'].forEach(b => b.addEventListener('click', () => setColor(COLOR_NEGRO)));
  porDato['colorB'].forEach(b => b.addEventListener('click', () => setColor(COLOR_BLANCO)));

  porDato['grosor'].forEach(i => i.addEventListener('input', e => {
    controlGrosor = parseInt(e.target.value, 10) || 3;
    if (canvas) canvas.freeDrawingBrush.width = controlGrosor;
  }));
  porDato['tamTexto'].forEach(i => i.addEventListener('input', e => {
    controlTamTexto = parseInt(e.target.value, 10) || 28;
  }));

  prim('deshacer').addEventListener('click', deshacer);
  prim('rehacer').addEventListener('click', rehacer);
  prim('descargar').addEventListener('click', descargar);
  prim('guardar').addEventListener('click', guardarYcerrar);
  (porDato['cancelar'] || []).forEach(b => b.addEventListener('click', intentarCerrar));
  (porDato['cerrar'] || []).forEach(b => b.addEventListener('click', intentarCerrar));

  // Atajos: Escape cierra (con confirmación), Ctrl+Z/X rehace/deshace.
  document.addEventListener('keydown', e => {
    if (!modal || modal.hidden) return;
    if (!e.ctrlKey && !e.metaKey && e.key === 'Escape') { e.preventDefault(); intentarCerrar(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? rehacer() : deshacer(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); rehacer(); }
  });

  document.body.appendChild(modal);
}

/* ============================================================
   Apertura pública: openImageEditor(url, onSave, opciones)
   ============================================================ */
export function openImageEditor(url, onSave, opciones) {
  if (!fabricInst) { alert('Fabric.js no está cargado.'); return; }
  opciones = opciones || {};
  if (modal && !modal.hidden) {
    if (!confirm(t('confirmarSustituir'))) return;
    cerrarForzado();
  }
  estadoActivo = {
    url: url,
    onSave: onSave || (() => {}),
    snapshot: opciones.snapshot || null,
    imgEl: opciones.imgEl || null
  };
  construirModal();
  abrirModalUI();
  cargarImagenFabric(url).then(im => {
    encenderLienzo(im, estadoActivo.snapshot);
  }).catch(() => {
    mensajeEnLienzo('⚠️ ' + t('errorCarga'));
  });
}

// Permite que script.js (script clásico) instale la persistencia
export function configurarAlGuardar(fn) { hookAlGuardar = fn; }

/* ============================================================
   Utilidades Fabric: carga de imagen con CORS y tamaño del lienzo
   ============================================================ */
function cargarImagenFabric(url) {
  return new Promise((ok, mal) => {
    fabricInst.Image.fromURL(url, img => ok(img), { crossOrigin: 'anonymous' }, err => mal(err));
  });
}

// Ajusta las dimensiones para que la imagen entre en el área visible,
// limitando además la resolución de edición (MAX_LADO).
function dimensionesLienzo(im, maxW, maxH, maxLado) {
  const natW = im.width || 1024;
  const natH = im.height || 1024;
  const escala = Math.min(1, maxW / natW, maxH / natH, maxLado / Math.max(natW, natH));
  return {
    w: Math.max(120, Math.round(natW * escala)),
    h: Math.max(120, Math.round(natH * escala))
  };
}

function mensajeEnLienzo(texto) {
  const zona = modal.querySelector('.fe-lienzo');
  zona.innerHTML = '<div class="fe-lienzo-error">' + texto + '</div>';
  canvas = null;
}

/* ============================================================
   Ciclo de vida del modal
   ============================================================ */
function abrirModalUI() {
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function cerrarForzado() {
  dirty = false;
  cerrarModal();
}

function intentarCerrar() {
  // No permite perder el trabajo sin confirmar.
  if (dirty && !confirm(t('confirmarCerrar'))) return;
  cerrarModal();
}

function cerrarModal() {
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = '';
  if (canvas) { try { canvas.dispose(); } catch (e) {} canvas = null; }
  const zona = modal.querySelector('.fe-lienzo');
  if (zona) zona.innerHTML = '';
  baseImagen = null;
  rectRecorte = null;
  pilaDeshacer.length = 0;
  pilaRehacer.length = 0;
  estadoPrevisto = null;
  marcarHerramienta(null);
}

/* ============================================================
   Inicialización del lienzo: canvas Fabric con la imagen de fondo.
   Si viene un snapshot guardado (edición previa), se restauran los
   objetos (texto, trazos, recortes) sobre la imagen original.
   ============================================================ */
function encenderLienzo(im, snapshot) {
  const zona = modal.querySelector('.fe-lienzo');
  zona.innerHTML = '<canvas></canvas>';
  const el = zona.querySelector('canvas');

  const dims = snapshot && snapshot.ancho
    ? { w: snapshot.ancho, h: snapshot.alto }
    : dimensionesLienzo(im, 860, 480, 1400);
  el.width = dims.w;
  el.height = dims.h;

  canvas = new fabricInst.Canvas(el, { backgroundColor: '#ffffff' });
  baseImagen = im;
  im.set({ selectable: false, evented: false });
  canvas.add(im);
  canvas.sendToBack(im);

  // El historial escucha los cambios hechos con el mouse.
  canvas.on('object:modified', onCambio);
  canvas.on('path:created', onCambio);

  if (snapshot && snapshot.objetos) {
    restaurarSnapshot(snapshot);
  } else {
    canvas.renderAll();
    capturaInicial();
  }
}

/* ============================================================
   Historial undo/redo con snapshots de Fabric (toJSON).
   - Cada acción registrada guarda el estado anterior en pilaDeshacer
     y limpia pilaRehacer.
   - deshacer() restaura el estado más reciente y lo mueve a rehacer.
   ============================================================ */
function generarEstado() {
  return { ancho: canvas.getWidth(), alto: canvas.getHeight(), objetos: canvas.toJSON() };
}

function capturaInicial() {
  estadoPrevisto = JSON.stringify(generarEstado());
  actualizarBotonesHistorial();
}

// Registra "un cambio consumado": describe el estado previo.
function onCambio() {
  if (bloqueoHistorial || !canvas) return;
  pilaDeshacer.push(estadoPrevisto);
  if (pilaDeshacer.length > MAX_UNDO) pilaDeshacer.shift();
  pilaRehacer.length = 0;
  estadoPrevisto = JSON.stringify(generarEstado());
  dirty = true;
  actualizarBotonesHistorial();
}

function deshacer() {
  if (!canvas || !pilaDeshacer.length) return;
  pilaRehacer.push(estadoPrevisto);
  const previo = pilaDeshacer.pop();
  estadoPrevisto = previo;
  restaurarSnapshot(JSON.parse(previo));
  dirty = true;
  actualizarBotonesHistorial();
}

function rehacer() {
  if (!canvas || !pilaRehacer.length) return;
  pilaDeshacer.push(estadoPrevisto);
  const siguiente = pilaRehacer.pop();
  estadoPrevisto = siguiente;
  restaurarSnapshot(JSON.parse(siguiente));
  dirty = true;
  actualizarBotonesHistorial();
}

function restaurarSnapshot(snapshot) {
  bloqueoHistorial = true;
  canvas.clear();
  canvas.setDimensions({ width: snapshot.ancho, height: snapshot.alto });
  // Se ejecuta cuando el estado ya quedó completamente restaurado.
  const finalizar = () => {
    try { estadoPrevisto = JSON.stringify(generarEstado()); } catch (e) {}
    bloqueoHistorial = false;
  };
  canvas.loadFromJSON(snapshot.objetos, null, () => {
    const im = canvas.getObjects().find(o => o.type === 'image');
    if (im) {
      im.set({ selectable: false, evented: false });
      im.sendToBack();
      baseImagen = im;
      // La imagen base se recarga SIEMPRE (con CORS si es una URL) para que
      // el lienzo no quede "tainted" o sin decodificar y se pueda exportar.
      fabricInst.Image.fromURL(im.getSrc(), nueva => {
        nueva.set({
          left: im.left, top: im.top, scaleX: im.scaleX, scaleY: im.scaleY,
          angle: im.angle, flipX: im.flipX, flipY: im.flipY,
          selectable: false, evented: false
        });
        canvas.remove(im);
        canvas.add(nueva);
        canvas.sendToBack(nueva);
        baseImagen = nueva;
        canvas.renderAll();
        finalizar();
      }, { crossOrigin: /^https?:/i.test(im.getSrc()) ? 'anonymous' : undefined }, finalizar);
    } else {
      canvas.renderAll();
      finalizar();
    }
  }, () => {
    // Si falla el render del snapshot, liberamos el historial igualmente.
    bloqueoHistorial = false;
  });
}

function actualizarBotonesHistorial() {
  const b = modal ? modal.querySelector('[data-fe="deshacer"]') : null;
  const r = modal ? modal.querySelector('[data-fe="rehacer"]') : null;
  if (b) b.classList.toggle('deshabilitado', !pilaDeshacer.length);
  if (r) r.classList.toggle('deshabilitado', !pilaRehacer.length);
}

/* ============================================================
   Herramientas: dibujar, hacer clic en color y escribir
   ============================================================ */
function alternarDibujo() {
  if (!canvas) return;
  salirRecorte();
  if (canvas.isDrawingMode) {
    desactivarDibujo();
    marcarHerramienta(null);
  } else {
    canvas.isDrawingMode = true;
    canvas.selection = false;
    canvas.freeDrawingBrush = new fabricInst.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = controlColor;
    canvas.freeDrawingBrush.width = controlGrosor;
    marcarHerramienta('dibujar');
  }
}

function desactivarDibujo() {
  if (!canvas) return;
  canvas.isDrawingMode = false;
  canvas.selection = true;
}

function agregarTexto() {
  if (!canvas) return;
  salirRecorte();
  desactivarDibujo();
  const nuevo = new fabricInst.IText('Texto', {
    left: canvas.getWidth() / 2 - 40,
    top: canvas.getHeight() / 2 - 16,
    fontFamily: 'Playfair Display, Georgia, serif',
    fontSize: controlTamTexto,
    fill: controlColor,
    textAlign: 'center',
    padding: 6
  });
  canvas.add(nuevo);
  canvas.setActiveObject(nuevo);
  marcarHerramienta('texto');
  onCambio();
}

function setColor(color) {
  controlColor = color;
  const sws = modal.querySelectorAll('.fe-swatch');
  sws.forEach(sw => {
    const esNegro = sw.getAttribute('aria-label') === t('negro');
    sw.classList.toggle('activo', (color === COLOR_NEGRO) === esNegro);
  });
  if (canvas && canvas.freeDrawingBrush) canvas.freeDrawingBrush.color = color;
}

function marcarHerramienta(activa) {
  if (!modal) return;
  modal.querySelectorAll('.fe-tool').forEach(btn => btn.classList.remove('activo'));
  if (activa) {
    modal.querySelectorAll('.fe-tool').forEach(btn => {
      if (btn.getAttribute('data-fe') === activa) btn.classList.add('activo');
    });
  }
}

/* ============================================================
   Rotar / voltear (aplicados a la imagen de fondo)
   ============================================================ */
function rotarGrados(grados) {
  if (!canvas || !baseImagen) return;
  baseImagen.set('angle', (((baseImagen.angle || 0) + grados) % 360 + 360) % 360);
  canvas.renderAll();
  onCambio();
}

function voltear(horizontal) {
  if (!canvas || !baseImagen) return;
  if (horizontal) baseImagen.set('flipX', !baseImagen.flipX);
  else baseImagen.set('flipY', !baseImagen.flipY);
  canvas.renderAll();
  onCambio();
}

/* ============================================================
   Recorte: modo con rectángulo arrastrable y "aplicar" filtra la
   región recortada como nueva imagen base (resultado predecible).
   ============================================================ */
function alternarRecorte() {
  if (!canvas || !baseImagen) return;
  if (rectRecorte) { aplicarRecorte(); return; }
  salirRecorte();
  desactivarDibujo();
  const w = Math.round(baseImagen.getScaledWidth() * 0.55);
  const h = Math.round(baseImagen.getScaledHeight() * 0.55);
  rectRecorte = new fabricInst.Rect({
    left: (canvas.getWidth() - w) / 2,
    top: (canvas.getHeight() - h) / 2,
    width: w, height: h,
    fill: 'rgba(255,255,255,0.18)',
    stroke: '#111111',
    strokeWidth: 1,
    strokeDashArray: [8, 5],
    lockRotation: true,
    cornerColor: '#111111',
    cornerSize: 10,
    transparentCorners: false
  });
  canvas.add(rectRecorte);
  canvas.setActiveObject(rectRecorte);
  marcarHerramienta('recortar');
}

function salirRecorte() {
  if (rectRecorte && canvas) canvas.remove(rectRecorte);
  rectRecorte = null;
}

function aplicarRecorte() {
  if (!canvas || !rectRecorte) { salirRecorte(); return; }
  const r = rectRecorte.getBoundingRect();
  const left = Math.max(0, Math.round(r.left));
  const top = Math.max(0, Math.round(r.top));
  const ancho = Math.min(canvas.getWidth() - left, Math.round(r.width));
  const alto = Math.min(canvas.getHeight() - top, Math.round(r.height));
  if (ancho < 8 || alto < 8) { salirRecorte(); return; }

  canvas.remove(rectRecorte);
  rectRecorte = null;
  canvas.renderAll();

  // Rasteriza la región elegida en un lienzo temporal.
  const tmp = document.createElement('canvas');
  tmp.width = ancho;
  tmp.height = alto;
  const ctx = tmp.getContext('2d');
  ctx.translate(-left, -top);
  ctx.drawImage(canvas.lowerCanvasEl, 0, 0);
  const datos = tmp.toDataURL('image/png');

  canvas.clear();
  canvas.setDimensions({ width: ancho, height: alto });
  fabricInst.Image.fromURL(datos, im => {
    im.set({ selectable: false, evented: false });
    baseImagen = im;
    canvas.add(im);
    canvas.renderAll();
    marcarHerramienta(null);
    onCambio();
  }, { crossOrigin: 'anonymous' });
}

/* ============================================================
   Descargar y Guardar: exportan el lienzo a imagen final.
   El botón principal (Guardar en Fenix IA) invoca onSave(snapshot,
   dataURL) y, si se abrió desde un mensaje, actualiza su <img> y
   notifica a script.js vía hookAlGuardar para persistir.
   ============================================================ */
function descargar() {
  if (!canvas) return;
  const enlace = document.createElement('a');
  enlace.href = canvas.toDataURL({ format: 'png' });
  enlace.download = 'imagen-editada.png';
  enlace.click();
}

function guardarYcerrar() {
  if (!canvas || !estadoActivo) return;
  try {
    const dataURL = canvas.toDataURL({ format: 'jpeg', quality: 0.92 });
    const snapshot = generarEstado();
    const onSave = estadoActivo.onSave || (() => {});
    const imgEl = estadoActivo.imgEl || null;

    onSave(snapshot, dataURL);

    if (imgEl) {
      imgEl.src = dataURL;
      if (imgEl.__fenixEditor) imgEl.__fenixEditor.snapshot = snapshot;
    }
    if (hookAlGuardar) hookAlGuardar(imgEl, snapshot, dataURL);

    dirty = false;
    cerrarModal();
  } catch (err) {
    console.error('[FenixImgEditor] No se pudo exportar la imagen:', err);
    alert('No se pudo exportar la imagen editada.');
  }
}

/* ============================================================
   Vista previa del historial: renderVista(url, snapshot) devuelve
   una dataURL con la imagen editada aplicada (sin abrir el modal).
   ============================================================ */
export function renderVista(url, snapshot) {
  return new Promise((resolver, rechazar) => {
    if (!fabricInst || !snapshot) { resolver(url); return; }
    cargarImagenFabric(url).then(im => {
      const ancho = snapshot.ancho || im.width;
      const alto = snapshot.alto || im.height;
      const off = document.createElement('canvas');
      off.width = ancho;
      off.height = alto;
      const lienzoOff = new fabricInst.Canvas(off, { backgroundColor: '#ffffff' });
      try {
        lienzoOff.loadFromJSON(snapshot.objetos, null, () => {
          const imagenes = lienzoOff.getObjects().filter(o => o.type === 'image');
          let pendientes = 0;
          const restan = () => {
            if (--pendientes <= 0) {
              try {
                resolver(lienzoOff.toDataURL({ format: 'jpeg', quality: 0.92 }));
              } catch (e) {
                resolver(url);
              }
              lienzoOff.dispose();
            }
          };
          imagenes.forEach(o => {
            pendientes++;
            fabricInst.Image.fromURL(o.getSrc(), nueva => {
              nueva.set({
                left: o.left, top: o.top, scaleX: o.scaleX, scaleY: o.scaleY,
                angle: o.angle, flipX: o.flipX, flipY: o.flipY,
                selectable: false, evented: false
              });
              lienzoOff.remove(o);
              lienzoOff.add(nueva);
              lienzoOff.sendToBack(nueva);
              lienzoOff.renderAll();
              restan();
            }, { crossOrigin: /^https?:/i.test(o.getSrc()) ? 'anonymous' : undefined }, () => restan());
          });
          if (!imagenes.length) {
            try {
              resolver(lienzoOff.toDataURL({ format: 'jpeg', quality: 0.92 }));
            } catch (e) {
              resolver(url);
            }
            lienzoOff.dispose();
          }
        });
      } catch (e) {
        resolver(url);
      }
    }).catch(() => resolver(url));
  });
}

/* ============================================================
   Puente global para script.js (script clásico).
   - editar(imgEl): abre el editor para el <img> de un mensaje,
     leyendo { url, snapshot } guardados en img.__fenixEditor.
   ============================================================ */
window.FenixImgEditor = {
  editar(imgEl) {
    if (!imgEl || !window.FenixImgEditor) return;
    const meta = imgEl.__fenixEditor || {};
    openImageEditor(meta.url || imgEl.src, (snapshot, dataURL) => {
      // script.js decide qué hacer con el resultado vía hookAlGuardar
    }, {
      snapshot: meta.snapshot || null,
      imgEl: imgEl
    });
  },
  renderVista: renderVista,
  configurarAlGuardar: configurarAlGuardar,
  t: clave => t(clave),
  cargado: true
};