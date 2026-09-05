import AuthState from '@/components/AuthState';

export const metadata = {
  title: 'Estado de Sesión / Login - Fenix IA',
};

export default function LoginPage() {
  return (
    <div className="container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Autenticación y Sesión</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Prueba de fuego de conexión cross-origin entre el frontend Next.js y el backend Express.
        </p>
      </div>

      <AuthState />
    </div>
  );
}
