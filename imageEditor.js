/* Fenix IA - Editor de imágenes generadas
   Edición 100% en el navegador con Canvas (sin servidor ni cuota).
   Proporciona filtros, tamaños (predefinidos y libres) y miniaturas de
   recomendaciones aplicables con un clic. Depende de script.js solo por
   la variable global `idiomaSeleccionado` (opcional). */
(function () {
  'use strict';

  /* ---------- Traducciones propias de la interfaz del editor ---------- */
  var TRAD = {
    es: { editar: 'Editar', filtros: 'Filtros', tamano: 'Tamaño', recomend: 'Recomendaciones', aplicar: 'Aplicar', cancelar: 'Cancelar', restablecer: 'Restablecer', cerrar: 'Cerrar editor', ancho: 'Ancho', alto: 'Alto', fOriginal: 'Original', fSepia: 'Sepia', fBN: 'B/N', fVintage: 'Vintage', fBrillo: 'Brillo', fContraste: 'Contraste', fSaturacion: 'Saturación', fBlur: 'Desenfoque', fNitidez: 'Nitidez', fVineta: 'Viñeta', tOriginal: 'Original', tCuadrado: 'Cuadrado', tHorizontal: 'Horizontal', tVertical: 'Vertical', rec1: 'Vintage cuadrado', rec2: 'B/N panorámico', rec3: 'Sepia vertical', rec4: 'Enfocado', copiar: 'Copiar', copiado: 'Copiado' },
    en: { editar: 'Edit', filtros: 'Filters', tamano: 'Size', recomend: 'Recommendations', aplicar: 'Apply', cancelar: 'Cancel', restablecer: 'Reset', cerrar: 'Close editor', ancho: 'Width', alto: 'Height', fOriginal: 'Original', fSepia: 'Sepia', fBN: 'B&W', fVintage: 'Vintage', fBrillo: 'Brightness', fContraste: 'Contrast', fSaturacion: 'Saturation', fBlur: 'Blur', fNitidez: 'Sharpen', fVineta: 'Vignette', tOriginal: 'Original', tCuadrado: 'Square', tHorizontal: 'Horizontal', tVertical: 'Vertical', rec1: 'Vintage square', rec2: 'B&W wide', rec3: 'Sepia portrait', rec4: 'Sharpened', copiar: 'Copy', copiado: 'Copied' },
    pt: { editar: 'Editar', filtros: 'Filtros', tamano: 'Tamanho', recomend: 'Recomendações', aplicar: 'Aplicar', cancelar: 'Cancelar', restablecer: 'Restaurar', cerrar: 'Fechar editor', ancho: 'Largura', alto: 'Altura', fOriginal: 'Original', fSepia: 'Sépia', fBN: 'P&B', fVintage: 'Vintage', fBrillo: 'Brilho', fContraste: 'Contraste', fSaturacion: 'Saturação', fBlur: 'Desfoque', fNitidez: 'Nitidez', fVineta: 'Vinheta', tOriginal: 'Original', tCuadrado: 'Quadrado', tHorizontal: 'Horizontal', tVertical: 'Vertical', rec1: 'Vintage quadrado', rec2: 'P&B panorâmico', rec3: 'Sépia vertical', rec4: 'Nítido', copiar: 'Copiar', copiado: 'Copiado' },
    fr: { editar: 'Modifier', filtros: 'Filtres', tamano: 'Taille', recomend: 'Recommandations', aplicar: 'Appliquer', cancelar: 'Annuler', restablecer: 'Réinitialiser', cerrar: 'Fermer', ancho: 'Largeur', alto: 'Hauteur', fOriginal: 'Original', fSepia: 'Sépia', fBN: 'N&B', fVintage: 'Vintage', fBrillo: 'Luminosité', fContraste: 'Contraste', fSaturacion: 'Saturation', fBlur: 'Flou', fNitidez: 'Netteté', fVineta: 'Vignette', tOriginal: 'Original', tCuadrado: 'Carré', tHorizontal: 'Horizontal', tVertical: 'Vertical', rec1: 'Vintage carré', rec2: 'N&B panoramique', rec3: 'Sépia portrait', rec4: 'Netteté', copiar: 'Copier', copiado: 'Copié' },
    de: { editar: 'Bearbeiten', filtros: 'Filter', tamano: 'Größe', recomend: 'Empfehlungen', aplicar: 'Anwenden', cancelar: 'Abbrechen', restablecer: 'Zurücksetzen', cerrar: 'Editor schließen', ancho: 'Breite', alto: 'Höhe', fOriginal: 'Original', fSepia: 'Sepia', fBN: 'S/W', fVintage: 'Vintage', fBrillo: 'Helligkeit', fContraste: 'Kontrast', fSaturacion: 'Sättigung', fBlur: 'Weichzeichner', fNitidez: 'Schärfen', fVineta: 'Vignette', tOriginal: 'Original', tCuadrado: 'Quadrat', tHorizontal: 'Horizontal', tVertical: 'Vertikal', rec1: 'Vintage quadratisch', rec2: 'S/W breit', rec3: 'Sepia hochkant', rec4: 'Geschärft', copiar: 'Kopieren', copiado: 'Kopiert' },
    ja: { editar: '編集', filtros: 'フィルター', tamano: 'サイズ', recomend: 'おすすめ', aplicar: '適用', cancelar: 'キャンセル', restablecer: 'リセット', cerrar: '編集を閉じる', ancho: '幅', alto: '高さ', fOriginal: 'オリジナル', fSepia: 'セピア', fBN: 'モノクロ', fVintage: 'ビンテージ', fBrillo: '明るさ', fContraste: 'コントラスト', fSaturacion: '彩度', fBlur: 'ぼかし', fNitidez: 'シャープ', fVineta: 'ビネット', tOriginal: 'オリジナル', tCuadrado: '正方形', tHorizontal: '横長', tVertical: '縦長', rec1: 'ビンテージ正方形', rec2: 'モノクロ横長', rec3: 'セピア縦長', rec4: 'シャープ', copiar: 'コピー', copiado: 'コピーしました' },
    zh: { editar: '编辑', filtros: '滤镜', tamano: '尺寸', recomend: '推荐', aplicar: '应用', cancelar: '取消', restablecer: '重置', cerrar: '关闭编辑器', ancho: '宽度', alto: '高度', fOriginal: '原图', fSepia: '怀旧', fBN: '黑白', fVintage: '复古', fBrillo: '亮度', fContraste: '对比度', fSaturacion: '饱和度', fBlur: '模糊', fNitidez: '锐化', fVineta: '暗角', tOriginal: '原图', tCuadrado: '方形', tHorizontal: '横屏', tVertical: '竖屏', rec1: '复古方形', rec2: '黑白横屏', rec3: '怀旧竖屏', rec4: '锐化', copiar: '复制', copiado: '已复制' },
    ar: { editar: 'تحرير', filtros: 'الفلاتر', tamano: 'الحجم', recomend: 'اقتراحات', aplicar: 'تطبيق', cancelar: 'إلغاء', restablecer: 'إعادة تعيين', cerrar: 'إغلاق المحرر', ancho: 'العرض', alto: 'الارتفاع', fOriginal: 'الأصلي', fSepia: 'سيبيا', fBN: 'أبيض وأسود', fVintage: 'عتيق', fBrillo: 'سطوع', fContraste: 'تباين', fSaturacion: 'تشبع', fBlur: 'ضبابي', fNitidez: 'حدة', fVineta: 'زوايا داكنة', tOriginal: 'الأصلي', tCuadrado: 'مربع', tHorizontal: 'أفقي', tVertical: 'عمودي', rec1: 'عتيق مربع', rec2: 'أبيض وأسود أفقي', rec3: 'سيبيا عمودي', rec4: 'حاد', copiar: 'نسخ', copiado: 'تم النسخ' }
  };

  function L(clave) {
    var idioma = (typeof idiomaSeleccionado !== 'undefined' && TRAD[idiomaSeleccionado]) ? idiomaSeleccionado : 'es';
    return (TRAD[idioma] && TRAD[idioma][clave] !== undefined) ? TRAD[idioma][clave] : (TRAD.es[clave] || clave);
  }

  /* ---------- Definición de filtros y tamaños ---------- */
  var FILTROS = ['original', 'sepia', 'bn', 'vintage', 'brillo', 'contraste', 'saturacion', 'blur', 'nitidez', 'vineta'];

  var PRESETS = {
    cuadrado: { ancho: 1024, alto: 1024 },
    horizontal: { ancho: 1280, alto: 720 },
    vertical: { ancho: 720, alto: 1280 }
  };

  var LIMITE_LADO = 1600;   // tamaño máximo razonable al editar
  var LIMITE_LIBRE = 3000;  // tope para el tamaño libre digitado por el usuario

  var RECOMENDACIONES = [
    { filtro: 'vintage', modo: 'preset', tipo: 'cuadrado', clave: 'rec1' },
    { filtro: 'bn', modo: 'preset', tipo: 'horizontal', clave: 'rec2' },
    { filtro: 'sepia', modo: 'preset', tipo: 'vertical', clave: 'rec3' },
    { filtro: 'nitidez', modo: 'original', clave: 'rec4' }
  ];

  /* ---------- Utilidades numéricas ---------- */
  function clampNum(v, min, max) {
    v = Math.round(Number(v));
    if (!isFinite(v)) return min;
    return Math.min(Math.max(v, min), max);
  }

  /* ---------- Motor de renderizado (Canvas 2D) ---------- */
  function cargarImagen(url) {
    return new Promise(function (resolver, rechazar) {
      var cache = cacheImagenes[url];
      if (cache && cache.complete && cache.naturalWidth) {
        resolver(cache);
        return;
      }
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () { cacheImagenes[url] = img; resolver(img); };
      img.onerror = function () { rechazar(new Error('img')); };
      img.src = url;
    });
  }
  var cacheImagenes = {};

  /* Calcula el tamaño de salida según la configuración del usuario.
     Mantiene la proporción pedida y no infla la imagen más allá de la fuente. */
  function dimensionesDestino(img, config) {
    var srcW = img.naturalWidth || 1024;
    var srcH = img.naturalHeight || 1024;
    var base, escala;
    if (config.modo === 'preset') {
      base = PRESETS[config.tipo] || PRESETS.cuadrado;
      escala = Math.min(1, Math.sqrt((srcW * srcH * 1.15) / (base.ancho * base.alto)));
      var w = Math.max(160, Math.round(base.ancho * escala));
      return {
        ancho: w,
        alto: Math.max(160, Math.round(base.alto * (w / base.ancho)))
      };
    }
    if (config.modo === 'libre') {
      return {
        ancho: clampNum(config.ancho, 80, LIMITE_LIBRE),
        alto: clampNum(config.alto, 80, LIMITE_LIBRE)
      };
    }
    // original
    escala = Math.min(1, Math.min(LIMITE_LADO / srcW, LIMITE_LADO / srcH));
    return {
      ancho: Math.max(64, Math.round(srcW * escala)),
      alto: Math.max(64, Math.round(srcH * escala))
    };
  }

  /* Dibuja la imagen cubriendo el lienzo, recortando el sobrante (cover). */
  function dibujarCubriendo(ctx, img, w, h) {
    var escala = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    var dw = img.naturalWidth * escala;
    var dh = img.naturalHeight * escala;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }

  /* Aplica filtros por píxel (sepia, B/N, vintage, brillo, contraste, saturación). */
  function aplicarPixeles(ctx, w, h, filtro) {
    var datos = ctx.getImageData(0, 0, w, h);
    var d = datos.data;
    var i, r, g, b;
    for (i = 0; i < d.length; i += 4) {
      r = d[i]; g = d[i + 1]; b = d[i + 2];
      if (filtro === 'sepia') {
        d[i] = 0.393 * r + 0.769 * g + 0.189 * b;
        d[i + 1] = 0.349 * r + 0.686 * g + 0.168 * b;
        d[i + 2] = 0.272 * r + 0.534 * g + 0.131 * b;
      } else if (filtro === 'bn') {
        var lum = 0.299 * r + 0.587 * g + 0.114 * b;
        d[i] = lum; d[i + 1] = lum; d[i + 2] = lum;
      } else if (filtro === 'vintage') {
        var sr = 0.393 * r + 0.769 * g + 0.189 * b;
        var sg = 0.349 * r + 0.686 * g + 0.168 * b;
        d[i] = sr * 0.4 + (r * 1.15 + 18) * 0.6;
        d[i + 1] = sg * 0.4 + (g * 1.04 + 8) * 0.6;
        d[i + 2] = (0.272 * r + 0.534 * g + 0.131 * b) * 0.4 + (b * 0.78 - 6) * 0.6;
      } else if (filtro === 'brillo') {
        d[i] = r * 1.22; d[i + 1] = g * 1.22; d[i + 2] = b * 1.22;
      } else if (filtro === 'contraste') {
        var f = 1.32;
        d[i] = (r - 128) * f + 128;
        d[i + 1] = (g - 128) * f + 128;
        d[i + 2] = (b - 128) * f + 128;
      } else if (filtro === 'saturacion') {
        var lm = 0.299 * r + 0.587 * g + 0.114 * b;
        var s = 1.5;
        d[i] = lm + (r - lm) * s;
        d[i + 1] = lm + (g - lm) * s;
        d[i + 2] = lm + (b - lm) * s;
      }
    }
    ctx.putImageData(datos, 0, 0);
  }

  /* Desenfoque rápido tipo box blur separable (no depende de ctx.filter). */
  function aplicarBlur(ctx, w, h, radio) {
    var datos = ctx.getImageData(0, 0, w, h);
    var d = datos.data;
    var len = d.length;
    var tmp = new Uint8ClampedArray(len);
    var fuera = new Uint8ClampedArray(len);
    var win = radio * 2 + 1;
    var x, y, c, sum, i;
    // pasada horizontal
    for (y = 0; y < h; y++) {
      var fila = y * w;
      for (c = 0; c < 4; c++) {
        sum = 0;
        for (i = 0; i <= radio && i < w; i++) sum += d[(fila + i) * 4 + c];
        for (x = 0; x < w; x++) {
          tmp[(fila + x) * 4 + c] = sum / win;
          var quita = x - radio;
          var entra = x + radio + 1;
          if (quita >= 0) sum -= d[(fila + quita) * 4 + c];
          if (entra < w) sum += d[(fila + entra) * 4 + c];
        }
      }
    }
    // pasada vertical
    for (x = 0; x < w; x++) {
      for (c = 0; c < 4; c++) {
        sum = 0;
        for (y = 0; y <= radio && y < h; y++) sum += tmp[(y * w + x) * 4 + c];
        for (y = 0; y < h; y++) {
          fuera[(y * w + x) * 4 + c] = sum / win;
          var qy = y - radio;
          var ey = y + radio + 1;
          if (qy >= 0) sum -= tmp[(qy * w + x) * 4 + c];
          if (ey < h) sum += tmp[(ey * w + x) * 4 + c];
        }
      }
    }
    ctx.putImageData(new ImageData(fuera, w, h), 0, 0);
  }

  /* Enfoque (nitidez) mediante máscara de desenfoque 3x3. */
  function aplicarNitidez(ctx, w, h) {
    var datos = ctx.getImageData(0, 0, w, h);
    var d = datos.data;
    var out = new Uint8ClampedArray(d.length);
    var a = 0.35;
    var b = 1 + 4 * a;
    var x, y, c, i, ar, ab, al, ad;
    for (y = 0; y < h; y++) {
      ar = (y - 1 < 0) ? 0 : (y - 1);
      ab = (y + 1 > h - 1) ? (h - 1) : (y + 1);
      for (x = 0; x < w; x++) {
        al = (x - 1 < 0) ? 0 : (x - 1);
        ad = (x + 1 > w - 1) ? (w - 1) : (x + 1);
        i = (y * w + x) * 4;
        for (c = 0; c < 3; c++) {
          out[i + c] = b * d[i + c]
            - a * d[(ar * w + x) * 4 + c]
            - a * d[(ab * w + x) * 4 + c]
            - a * d[(y * w + al) * 4 + c]
            - a * d[(y * w + ad) * 4 + c];
        }
        out[i + 3] = d[i + 3];
      }
    }
    ctx.putImageData(new ImageData(out, w, h), 0, 0);
  }

  /* Viñeta: oscurece suavemente los bordes. */
  function aplicarVineta(ctx, w, h) {
    var grad = ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.35,
      w / 2, h / 2, Math.max(w, h) * 0.72
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.72, 'rgba(0,0,0,0.08)');
    grad.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  /* Renderiza la imagen con un filtro y tamaño; devuelve un <canvas>. */
  function renderizar(img, config) {
    var tam = dimensionesDestino(img, config);
    var w = tam.ancho;
    var h = tam.alto;
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    dibujarCubriendo(ctx, img, w, h);
    var f = config.filtro;
    if (f === 'blur') {
      aplicarBlur(ctx, w, h, Math.max(1, Math.round(Math.min(w, h) / 420)));
    } else if (f === 'nitidez') {
      aplicarNitidez(ctx, w, h);
    } else if (f === 'vineta') {
      aplicarVineta(ctx, w, h);
    } else if (f !== 'original') {
      aplicarPixeles(ctx, w, h, f);
    }
    return canvas;
  }

  /* Versión en miniatura (para las recomendaciones y la vista previa). */
  function renderizarMin(img, config, maxLado) {
    var tam = dimensionesDestino(img, config);
    var escala = Math.min(1, maxLado / Math.max(tam.ancho, tam.alto));
    config = Object.assign({}, config);
    config.modo = 'libre';
    config.ancho = Math.max(1, Math.round(tam.ancho * escala));
    config.alto = Math.max(1, Math.round(tam.alto * escala));
    return renderizar(img, config);
  }

  /* ---------- Estado del editor ---------- */
  var estado = { src: null, destino: null, url: '', config: null, onAplicar: null, blobActual: null, abierto: false };

  function normalizarConfig(config) {
    config = config || {};
    var f = FILTROS.indexOf(config.filtro) !== -1 ? config.filtro : 'original';
    var base = { filtro: f, modo: 'original' };
    if (config.modo === 'preset' && PRESETS[config.tipo]) {
      base.modo = 'preset';
      base.tipo = config.tipo;
    } else if (config.modo === 'libre') {
      base.modo = 'libre';
      base.ancho = clampNum(config.ancho, 80, LIMITE_LIBRE);
      base.alto = clampNum(config.alto, 80, LIMITE_LIBRE);
    }
    return base;
  }

  function configALibre(config, w, h) {
    return { filtro: config.filtro, modo: 'libre', ancho: w, alto: h };
  }

  /* ---------- Construcción del modal ---------- */
  var modal, refs = {};

  function construirModal() {
    modal = document.createElement('div');
    modal.className = 'fenix-modal';
    modal.id = 'fenixEdModal';
    modal.hidden = true;
    modal.innerHTML =
      '<div class="fenix-modal-caja">' +
        '<div class="fenix-modal-titulo">' +
          '<span data-ref="titulo"></span>' +
          '<button type="button" class="fenix-modal-cerrar" data-ref="cerrar" aria-label="' + L('cerrar') + '">&times;</button>' +
        '</div>' +
        '<div class="fenix-modal-cuerpo">' +
          '<div class="fenix-ed-vista"><canvas data-ref="lienzo"></canvas></div>' +
          '<div class="fenix-ed-fila">' +
            '<div class="fenix-ed-fila-titulo" data-ref="tfiltros"></div>' +
            '<div class="fenix-chips" data-ref="filtros"></div>' +
          '</div>' +
          '<div class="fenix-ed-fila">' +
            '<div class="fenix-ed-fila-titulo" data-ref="ttamano"></div>' +
            '<div class="fenix-chips" data-ref="tamanos"></div>' +
            '<div class="fenix-tamano-libre">' +
              '<input type="number" min="80" max="' + LIMITE_LIBRE + '" placeholder="' + L('ancho') + '" data-ref="ancho">' +
              '<span>&times;</span>' +
              '<input type="number" min="80" max="' + LIMITE_LIBRE + '" placeholder="' + L('alto') + '" data-ref="alto">' +
            '</div>' +
          '</div>' +
          '<div class="fenix-ed-fila">' +
            '<div class="fenix-ed-fila-titulo" data-ref="trecomend"></div>' +
            '<div class="fenix-recom" data-ref="recom"></div>' +
          '</div>' +
        '</div>' +
        '<div class="fenix-modal-botones">' +
          '<button type="button" class="fenix-boton" data-ref="reset">' + L('restablecer') + '</button>' +
          '<div class="fenix-modal-botones-der">' +
            '<button type="button" class="fenix-boton" data-ref="cancelar">' + L('cancelar') + '</button>' +
            '<button type="button" class="fenix-boton primario" data-ref="aplicar">' + L('aplicar') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    modal.querySelectorAll('[data-ref]').forEach(function (el) {
      refs[el.getAttribute('data-ref')] = el;
    });
    refs.titulo.textContent = L('editar');
    refs.tfiltros.textContent = L('filtros');
    refs.ttamano.textContent = L('tamano');
    refs.trecomend.textContent = L('recomend');

    var chipActual = null;
    function hacerChip(texto, activo) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'fenix-chip' + (activo ? ' activo' : '');
      b.textContent = texto;
      return b;
    }

    // botones de filtro
    var botonesFiltro = {};
    FILTROS.forEach(function (f) {
      var b = hacerChip(L('f' + f.charAt(0).toUpperCase() + f.slice(1)), false);
      botonesFiltro[f] = b;
      b.addEventListener('click', function () {
        configurarChipFiltro(f);
      });
      refs.filtros.appendChild(b);
    });

    // botones de tamaño predefinido
    var TAMANOS = [
      { modo: 'original', tipo: null, clave: 'tOriginal' },
      { modo: 'preset', tipo: 'cuadrado', clave: 'tCuadrado' },
      { modo: 'preset', tipo: 'horizontal', clave: 'tHorizontal' },
      { modo: 'preset', tipo: 'vertical', clave: 'tVertical' }
    ];
    var botonesTamaño = {};
    TAMANOS.forEach(function (t) {
      var b = hacerChip(L(t.clave), false);
      botonesTamaño[t.modo + (t.tipo ? ':' + t.tipo : '')] = b;
      b.addEventListener('click', function () {
        estado.config = normalizarConfig({ filtro: estado.config.filtro, modo: t.modo, tipo: t.tipo });
        refs.ancho.value = '';
        refs.alto.value = '';
        refrescarControlYPreview();
      });
      refs.tamanos.appendChild(b);
    });

    refs.ancho.addEventListener('input', alCambiarLibre);
    refs.alto.addEventListener('input', alCambiarLibre);

    refs.reset.addEventListener('click', function () {
      estado.config = { filtro: 'original', modo: 'original' };
      refs.ancho.value = '';
      refs.alto.value = '';
      refrescarControlYPreview();
    });
    refs.cancelar.addEventListener('click', cerrar);
    refs.cerrar.addEventListener('click', cerrar);
    refs.aplicar.addEventListener('click', function () {
      aplicarEdicion(configDesdeControles(), true);
    });
    modal.addEventListener('click', function (ev) {
      if (ev.target === modal) cerrar();
    });

    function configurarChipFiltro(f) {
      estado.config = normalizarConfig(Object.assign({}, estado.config, { filtro: f }));
      refrescarControlYPreview();
    }
    function alCambiarLibre() {
      var w = parseInt(refs.ancho.value, 10);
      var h = parseInt(refs.alto.value, 10);
      if (isFinite(w) && isFinite(h) && w >= 80 && h >= 80) {
        estado.config = configALibre(estado.config, clampNum(w, 80, LIMITE_LIBRE), clampNum(h, 80, LIMITE_LIBRE));
        refrescarControlYPreview();
      }
    }
    function configDesdeControles() {
      return estado.config;
    }
    function refrescarControlYPreview() {
      actualizarChips();
      pintarPreview();
    }
    function actualizarChips() {
      var f = estado.config ? estado.config.filtro : 'original';
      Object.keys(botonesFiltro).forEach(function (k) {
        botonesFiltro[k].classList.toggle('activo', k === f);
      });
      Object.keys(botonesTamaño).forEach(function (k) {
        var m = estado.config.modo === 'preset' ? 'preset:' + estado.config.tipo : estado.config.modo;
        botonesTamaño[k].classList.toggle('activo', k === m);
      });
      if (estado.config.modo === 'libre') {
        refs.ancho.value = estado.config.ancho;
        refs.alto.value = estado.config.alto;
      }
    }
    // expone funciones internas
    modal._internas = {
      refrescarControlYPreview: refrescarControlYPreview,
      actualizarChips: actualizarChips,
      pintarPreview: pintarPreview
    };
    document.body.appendChild(modal);
  }

  function pintarPreview() {
    if (!estado.src || !refs.lienzo) return;
    try {
      var mini = renderizarMin(estado.src, estado.config, 520);
      refs.lienzo.width = mini.width;
      refs.lienzo.height = mini.height;
      refs.lienzo.getContext('2d').drawImage(mini, 0, 0);
    } catch (err) {
      // en algún navegador viejo puede fallar el render; se ignora
    }
  }

  function construirRecomendaciones() {
    var cont = refs.recom;
    cont.innerHTML = '';
    if (!estado.src) return;
    RECOMENDACIONES.forEach(function (rec, idx) {
      var boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'fenix-recom-item';
      var img = document.createElement('img');
      img.alt = L(rec.clave);
      var etiqueta = document.createElement('span');
      etiqueta.textContent = L(rec.clave);
      boton.appendChild(img);
      boton.appendChild(etiqueta);
      var config = normalizarConfig({ filtro: rec.filtro, modo: rec.modo, tipo: rec.tipo });
      // miniatura con la misma receta
      try {
        var mini = renderizarMin(estado.src, config, 130);
        img.src = mini.toDataURL('image/jpeg', 0.8);
      } catch (err) {
        boton.style.opacity = '.5';
      }
      boton.addEventListener('click', function () {
        estado.config = config;
        aplicarEdicion(config, true);
      });
      cont.appendChild(boton);
    });
  }

  function abrir() {
    if (!modal) construirModal();
    refs.ancho.value = '';
    refs.alto.value = '';
    if (estado.src) {
      modal._internas.actualizarChips();
      pintarPreview();
      construirRecomendaciones();
    }
    estado.abierto = true;
    modal.hidden = false;
  }

  function cerrar() {
    estado.abierto = false;
    if (modal) modal.hidden = true;
  }

  /* --- Aplicar: pinta en el <img> del chat y notifica a script.js --- */
  function aplicarEdicion(config, cerrarLuego) {
    if (!estado.destino || !estado.url) return;
    cargarImagen(estado.url).then(function (img) {
      try {
        var canvas = renderizar(img, config);
        estado.src = img;
        estado.config = config;
        canvas.toBlob(function (blob) {
          if (!blob) return;
          var urlBlob = URL.createObjectURL(blob);
          if (estado.blobActual) URL.revokeObjectURL(estado.blobActual);
          estado.blobActual = urlBlob;
          estado.destino.src = urlBlob;
          if (estado.onAplicar) estado.onAplicar(config);
          if (cerrarLuego) cerrar();
        }, 'image/jpeg', 0.92);
      } catch (err) {
        if (cerrarLuego) cerrar();
      }
    }).catch(function () {
      if (cerrarLuego) cerrar();
    });
  }

  /* Aplica en silencio una edición guardada (historial re-renderizado). */
  function aplicarEdicionSilenciosa(img, url, config) {
    if (!config || config.filtro === 'original' && config.modo === 'original') {
      img.src = url;
      return;
    }
    cargarImagen(url).then(function (imagen) {
      try {
        var canvas = renderizar(imagen, config);
        canvas.toBlob(function (blob) {
          if (blob) img.src = URL.createObjectURL(blob);
        }, 'image/jpeg', 0.92);
      } catch (err) { /* se queda con la original */ }
    }).catch(function () { /* se queda con la original */ });
  }

  /* ---------- Punto de entrada: asocia metadatos de edición a un <img> ---------- */
  function adjuntar(img, urlOriginal, edicionInicial, onAplicar) {
    if (!img || !urlOriginal || !img.parentNode || img.__fenixEditor) return;

    var config = edicionInicial ? normalizarConfig(edicionInicial) : { filtro: 'original', modo: 'original' };
    img.__fenixEditor = {
      url: urlOriginal,
      config: config,
      onAplicar: onAplicar || null,
      abierta: false
    };

    if (!(config.filtro === 'original' && config.modo === 'original')) {
      aplicarEdicionSilenciosa(img, urlOriginal, config);
    }
  }

  /* ---------- Abre el editor desde el menú del mensaje ---------- */
  function editar(imgEl) {
    if (!imgEl || !imgEl.__fenixEditor) return false;
    var meta = imgEl.__fenixEditor;
    if (estado.abierto) return true;
    cargarImagen(meta.url).then(function (imagen) {
      estado.src = imagen;
      estado.destino = imgEl;
      estado.url = meta.url;
      estado.config = meta.config;
      estado.onAplicar = function (cfg) {
        meta.config = cfg;
        if (meta.onAplicar) meta.onAplicar(cfg);
      };
      estado.blobActual = null;
      try {
        pintarPreview();
        construirRecomendaciones();
        abrir();
      } catch (err) {
        console.error('[FenixImgEditor] No se pudo abrir el editor:', err);
      }
    }).catch(function () {
      console.warn('[FenixImgEditor] Imagen sin acceso de lectura (posible bloqueo CORS):', meta.url);
    });
    return true;
  }

  window.FenixImgEditor = { adjuntar: adjuntar, editar: editar, t: L };
})();