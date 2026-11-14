const API_BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  if (res.headers.get('content-type')?.includes('text/csv')) {
    return res.blob();
  }
  return res.json();
}

// Locations
export const getLocations = () => request('/locations');
export const createLocation = (data) => request('/locations', { method: 'POST', body: JSON.stringify(data) });
export const updateLocation = (id, data) => request(`/locations/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteLocation = (id) => request(`/locations/${id}`, { method: 'DELETE' });

// Harvesters
export const getHarvesters = (active) => request(`/harvesters${active ? '?active=1' : ''}`);
export const createHarvester = (data) => request('/harvesters', { method: 'POST', body: JSON.stringify(data) });
export const updateHarvester = (id, data) => request(`/harvesters/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteHarvester = (id) => request(`/harvesters/${id}`, { method: 'DELETE' });

// Harvest Records
export const getHarvestRecords = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/harvest-records${qs ? '?' + qs : ''}`);
};
export const getHarvestRecord = (id) => request(`/harvest-records/${id}`);
export const createHarvestRecord = (data) => request('/harvest-records', { method: 'POST', body: JSON.stringify(data) });
export const updateHarvestRecord = (id, data) => request(`/harvest-records/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteHarvestRecord = (id) => request(`/harvest-records/${id}`, { method: 'DELETE' });

// Reports
export const getReportSummary = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/reports/summary${qs ? '?' + qs : ''}`);
};
export const exportCSV = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/reports/export${qs ? '?' + qs : ''}`);
};

