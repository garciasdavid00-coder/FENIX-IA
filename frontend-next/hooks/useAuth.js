'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost } from '@/lib/api';

/**
 * Contexto de autenticación compartido por toda la app.
 *
 * Antes este hook devolvía estado local por componente (useState dentro del
 * hook), de modo que al hacer logout desde el menú de usuario, el Sidebar y
 * el Topbar seguían mostrando el nombre de la cuenta anterior hasta recargar
 * la página. Con un contexto compartido, un solo logout actualiza a todos
 * los componentes al instante.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
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

  return (
    <AuthContext.Provider
      value={{
        usuario,
        autenticado,
        cargando,
        error,
        refrescar: consultarUsuario,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}