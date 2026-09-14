// fetch con timeout configurable y AbortController.
// Evita que una API externa que no responde deje el endpoint
// colgado indefinidamente: aborta la petición y lanza un Error claro.

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Timeout de ${timeoutMs}ms alcanzado al llamar a ${url}`);
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}

module.exports = { fetchWithTimeout };