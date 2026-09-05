import { apiFetch } from './api';

/**
 * Detecta si el mensaje pide crear una imagen (necesita verbo + objeto de imagen,
 * para no confundirse con preguntas que solo mencionan "imagen").
 */
export function esPeticionImagen(texto) {
  if (!texto || texto.length > 300) return false;
  const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC');
  const DIBUJO = /(dibuj|pint|desenh|draw|paint|zeichn)/;
  if (DIBUJO.test(t)) return true;
  const OBJETO = /(imagen|imagem|image|picture|photo|fotografia|foto|dibujo|ilustracion|illustration|drawing|retrato|portrait|logo|icono|icon|avatar|poster|sticker|wallpaper|bild)|画像|图片|照片|صورة/;
  const ACCION = /(gener|crea|cria|gere|erzeug|hazme|muestr|mostra|show|quiero|dame)|生成|作成|أنشئ|صمم/;
  return OBJETO.test(t) && ACCION.test(t);
}

/**
 * Pide una imagen al servidor (Pollinations vía /api/imagen) y devuelve la URL.
 * @param {string} descripcion - Prompt para generar la imagen
 * @returns {Promise<string>} URL de la imagen generada
 */
export async function generarImagen(descripcion) {
  const res = await apiFetch('/api/imagen', {
    method: 'POST',
    body: JSON.stringify({ prompt: descripcion }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) {
    throw new Error(data.error || 'No se pudo generar la imagen');
  }
  return data.url;
}