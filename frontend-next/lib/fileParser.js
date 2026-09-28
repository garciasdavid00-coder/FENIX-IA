import {apiPost} from './api';
/**
 * Utilidad para procesar y extraer texto/miniaturas de archivos adjuntos en Fenix IA.
 * Soporta documentos de texto, código, markdown, JSON, CSV, PDFs, Word e imágenes.
 */

export function formatearTamano(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = 1;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function obtenerIconoArchivo(tipo, nombre = '') {
  const ext = (nombre.split('.').pop() || '').toLowerCase();
  
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext) || tipo.startsWith('image/')) {
    return '🖼️';
  }
  if (ext === 'pdf') return '📕';
  if (['doc', 'docx'].includes(ext)) return '📘';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'html', 'css', 'json', 'sql', 'php', 'cpp', 'java'].includes(ext)) {
    return '💻';
  }
  if (['md', 'txt', 'rtf', 'log'].includes(ext)) return '📄';
  return '📎';
}

/**
 * Procesa un archivo del input y extrae su contenido de texto o miniatura de imagen.
 * @param {File} file
 * @returns {Promise<{ nombre: string, tipo: string, tamano: string, contenidoTexto: string, miniaturaUrl?: string, esImagen: boolean }>}
 */
export async function procesarArchivo(file) {
  if (!file) throw new Error('No se seleccionó ningún archivo');

  if (file.size > 3000000) throw new Error('El archivo supera el límite de 3 MB.');
  const nombre = file.name;
  const tipo = file.type || '';
  const tamano = formatearTamano(file.size);
  const ext = (nombre.split('.').pop() || '').toLowerCase();
  const esImagen = tipo.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext);

  if (['pdf','docx'].includes(ext)) {
    const dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file)});
    const result=await apiPost('/api/archivos/texto',{extension:ext,base64:String(dataUrl).split(',')[1]});
    return {nombre,tipo,tamano,contenidoTexto:result.text,esImagen:false};
  }
  if(['doc','xls','xlsx','ppt','pptx','zip'].includes(ext))throw new Error('Exporta este archivo a PDF, DOCX, CSV o texto para analizarlo.');
  // 1. Si es imagen, generar Data URL para miniatura
  if (esImagen) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          nombre,
          tipo,
          tamano,
          contenidoTexto: `[Imagen adjunta: "${nombre}", tamaño: ${tamano}]`,
          miniaturaUrl: e.target.result,
          esImagen: true,
        });
      };
      reader.onerror = () => reject(new Error('Error al leer la imagen'));
      reader.readAsDataURL(file);
    });
  }

  // 2. Si es archivo de texto / código / markdown / csv / json
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const texto = String(e.target.result || '');
      // Límite seguro de caracteres para no saturar el contexto de una sola vez (~60,000 chars)
      const MAX_CARACTERES = 60000;
      const textoRecortado = texto.length > MAX_CARACTERES
        ? texto.slice(0, MAX_CARACTERES) + `\n\n[... Archivo recortado: mostrando los primeros ${MAX_CARACTERES} caracteres de ${texto.length} ...] `
        : texto;

      resolve({
        nombre,
        tipo,
        tamano,
        contenidoTexto: textoRecortado,
        esImagen: false,
      });
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo de texto'));
    reader.readAsText(file);
  });
}
