import './globals.css';
import { ChatProvider } from '@/context/ChatContext';

export const metadata = {
  title: 'Fenix IA',
  description: 'Asistente de inteligencia artificial inteligente y privado',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ChatProvider>
          {children}
        </ChatProvider>
      </body>
    </html>
  );
}
