const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';
const EXTERNAL_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=cop';

async function fetchWithTimeout(url, options = {}, timeout = 2500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } finally {
    clearTimeout(id);
  }
}

export async function getExternalMarketSignal() {
  try {
    const data = await fetchWithTimeout(EXTERNAL_API_URL, {}, 2500);
    return {
      ok: true,
      source: 'Coindesk API externa',
      backend: false,
      data: {
        asset: 'BTC/COP',
        rate: data?.bitcoin?.cop ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(data.bitcoin.cop) : 'No disponible',
        updated: new Date().toISOString(),
        description: 'Señal externa usada como ejemplo para enriquecer análisis de riesgo.',
      },
    };
  } catch (error) {
    return {
      ok: false,
      source: 'Fallback local',
      backend: false,
      error: error.message,
      data: {
        asset: 'BTC/COP',
        rate: '$ 0 demo',
        updated: new Date().toISOString(),
        description: 'La API externa no respondió; TriDa mantiene datos demo para funcionar sin conexión.',
      },
    };
  }
}

export async function backendList(resource) {
  try {
    const data = await fetchWithTimeout(`${BACKEND_URL}/${resource}`, {}, 2000);
    return { ok: true, source: BACKEND_URL, data: Array.isArray(data) ? data : data?.items || [] };
  } catch (error) {
    return { ok: false, source: BACKEND_URL, error: error.message, data: [] };
  }
}

export async function backendCreate(resource, item, token) {
  try {
    const data = await fetchWithTimeout(`${BACKEND_URL}/${resource}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
      body: JSON.stringify(item),
    }, 2000);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error.message, data: item };
  }
}

export async function backendUpdate(resource, id, item, token) {
  try {
    const data = await fetchWithTimeout(`${BACKEND_URL}/${resource}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
      body: JSON.stringify(item),
    }, 2000);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error.message, data: item };
  }
}

export async function backendDelete(resource, id, token) {
  try {
    await fetchWithTimeout(`${BACKEND_URL}/${resource}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token || ''}` },
    }, 2000);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export { BACKEND_URL, EXTERNAL_API_URL };
