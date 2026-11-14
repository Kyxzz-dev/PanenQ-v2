export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatNumber(n) {
  if (n == null) return '-';
  return Number(n).toLocaleString('id-ID');
}

export function formatWeight(kg) {
  if (kg == null) return '-';
  return Number(kg).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' kg';
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

