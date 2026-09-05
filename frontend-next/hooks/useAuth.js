'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost } from '@/lib/api';

/**
 * Hook para gestionar el estado de autenticación del usuario.
 * Llama a GET /api/usuario-actual incluyendo la cookie de sesión.
 */
export function useAuth() {
  const [usuario, setUsuario] = useState(null);
  const [autenticado, setAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const consultarUsuario = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await apiGet('/api/usuario-actual');
      if (data && data.autenticado && data.usuario) {
        setUsuario(data.usuario);
        setAutenticado(true);
      } else {
        setUsuario(null);
        setAutenticado(false);
      }
    } catch (err) {
      console.error('[useAuth] Error consultando usuario actual:', err);
      setError(err.message || 'No se pudo verificar la sesión');
      setUsuario(null);
      setAutenticado(false);
    } finally {
      setCargando(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost('/api/logout');
      setUsuario(null);
      setAutenticado(false);
    } catch (err) {
      console.error('[useAuth] Error al cerrar sesión:', err);
    }
  }, []);

  useEffect(() => {
    consultarUsuario();
  }, [consultarUsuario]);

  return {
    usuario,
    autenticado,
    cargando,
    error,
    refrescar: consultarUsuario,
    logout,
  };
}
