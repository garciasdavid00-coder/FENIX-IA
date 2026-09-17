'use client';

import { obtenerIconoArchivo } from '@/lib/fileParser';

/**
 * Chip visual para archivos adjuntos.
 * 
 * Props:
 * - archivo: { nombre, tamano, tipo, esImagen, miniaturaUrl }
 * - onRemover: () => void (opcional, si se pasa muestra el botón ✕)
 * - compacto: boolean (opcional, para renderizar dentro de la burbuja)
 */
export default function FileAttachmentChip({ archivo, onRemover, compacto = false }) {
  if (!archivo) return null;

  const icono = obtenerIconoArchivo(archivo.tipo, archivo.nombre);

  return (
    <div className={`file-attachment-chip ${compacto ? 'chip-compacto' : ''}`}>
      {archivo.esImagen && archivo.miniaturaUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={archivo.miniaturaUrl}
          alt={archivo.nombre}
          className="file-chip-thumb"
        />
      ) : (
        <span className="file-chip-icon">{icono}</span>
      )}

      <div className="file-chip-info">
        <span className="file-chip-name" title={archivo.nombre}>
          {archivo.nombre}
        </span>
        {archivo.tamano && (
          <span className="file-chip-size">{archivo.tamano}</span>
        )}
      </div>

      {onRemover && (
        <button
          type="button"
          className="file-chip-remove-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemover();
          }}
          title="Eliminar archivo adjunto"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
