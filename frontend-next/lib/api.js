/**
 * Cliente de API centralizado para Fenix IA.
 * 
 * Reglas clave:
 * 1. Apunta al backend Express mediante NEXT_PUBLIC_API_URL.
 * 2. Siempre incluye credentials: 'include' para que las cookies de sesión (connect.sid)
 *    se envíen automáticamente en peticiones cross-origin.
 */

// El backend Express puede estar en otro origen solo en desarrollo
// (NEXT_PUBLIC_API_URL=http://localhost:3001). En producción, Express también
// sirve el build estático de Next, así que usamos MISMO ORIGEN: peticiones
// relativas, cookies de sesión same-origin automáticas.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? String(process.env.NEXT_PUBLIC_API_URL).replace(/\/+$/, '')
  : '';

/**
 * Realiza una petición HTTP al backend con credenciales y headers adecuados.
 * @param {string} ruta - Endpoint relativo (ej. '/api/usuario-actual' o 'api/chat')
 * @param {RequestInit} [opciones={}] - Opciones estándar de fetch
 * @returns {Promise<Response>}
 */
export async function apiFetch(ruta, opciones = {}) {
  const url = ruta.startsWith('http')
    ? ruta
    : `${API_BASE_URL}${ruta.startsWith('/') ? '' : '/'}${ruta}`;

  const defaultHeaders = {
    ...(opciones.body && !(opciones.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
  };

  const configuracion = {
    ...opciones,
    // Obligatorio para enviar y recibir cookies de sesión cross-origin
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...(opciones.headers || {}),
    },
  };

  return fetch(url, configuracion);
}

/**
 * Petición GET tipada que parsea JSON automáticamente.
 * @template T
 * @param {string} ruta
 * @returns {Promise<T>}
 */
export async function apiGet(ruta) {
  const res = await apiFetch(ruta, { method: 'GET' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Petición POST con JSON que parsea respuesta JSON.
 * @template T
 * @param {string} ruta
 * @param {any} [body]
 * @returns {Promise<T>}
 */
export async function apiPost(ruta, body) {
  const res = await apiFetch(ruta, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const error = new Error(data.error || `Error ${res.status}: ${res.statusText}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return res.json();
}

/**
 * Petición DELETE con JSON que parsea respuesta JSON.
 * @template T
 * @param {string} ruta
 * @returns {Promise<T>}
 */
export async function apiDelete(ruta) {
  const res = await apiFetch(ruta, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const error = new Error(data.error || `Error ${res.status}: ${res.statusText}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return res.json();
}

/**
 * Genera la URL completa para iniciar sesión con Google OAuth en el backend.
 */
export function getGoogleAuthUrl() {
  return `${API_BASE_URL}/auth/google`;
}
