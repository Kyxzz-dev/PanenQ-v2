import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import { getReportSummary, getLocations, getHarvesters, exportCSV } from '../services/api';
import { useToast } from '../hooks/useData';
import { formatNumber, formatWeight, formatDate } from '../utils/format';

export default function Reports() {
  const { toast, show } = useToast();
  const [locations, setLocations] = useState([]);
  const [harvesters, setHarvesters] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', locationId: '', harvesterId: '', period: 'daily' });

  useEffect(() => {
    getLocations().then(setLocations).catch(() => {});
    getHarvesters().then(setHarvesters).catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    const params = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.locationId) params.locationId = filters.locationId;
    if (filters.harvesterId) params.harvesterId = filters.harvesterId;
    params.period = filters.period;
    getReportSummary(params).then(setReport).catch(err => show(err.message, 'error')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleExport = async () => {
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.locationId) params.locationId = filters.locationId;
      if (filters.harvesterId) params.harvesterId = filters.harvesterId;
      const blob = await exportCSV(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'laporan-panen.csv';
      a.click();
      URL.revokeObjectURL(url);
      show('File CSV berhasil diunduh');
    } catch (err) { show(err.message, 'error'); }
  };

  const s = report?.summary || {};

  return (
    <Layout title="Laporan">
      <Toast toast={toast} />

      <div className="filter-bar">
        <div className="form-group">
          <label>Dari</label>
          <input type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} className="form-control" />
        </div>
        <div className="form-group">
          <label>Sampai</label>
          <input type="date" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} className="form-control" />
        </div>
        <div className="form-group">
          <label>Lokasi</label>
          <select value={filters.locationId} onChange={e => setFilters(f => ({ ...f, locationId: e.target.value }))} className="form-control">
            <option value="">Semua</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Pemanen</label>
          <select value={filters.harvesterId} onChange={e => setFilters(f => ({ ...f, harvesterId: e.target.value }))} className="form-control">
            <option value="">Semua</option>
            {harvesters.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Periode</label>
          <select value={filters.period} onChange={e => setFilters(f => ({ ...f, period: e.target.value }))} className="form-control">
            <option value="daily">Harian</option>
            <option value="weekly">Mingguan</option>
            <option value="monthly">Bulanan</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={load} disabled={loading}>🔍 Tampilkan</button>
        <button className="btn btn-secondary" onClick={handleExport}>📥 Ekspor CSV</button>
      </div>

      {loading ? <div className="loading-center"><div className="spinner" /></div> : report && (
        <>
          <div className="stat-grid">
            <div className="stat-card"><div className="label">Total Transaksi</div><div className="value">{formatNumber(s.total_transactions)}</div></div>
            <div className="stat-card"><div className="label">Total Tandan</div><div className="value">{formatNumber(s.total_bunches)}</div></div>
            <div className="stat-card"><div className="label">Total Berat</div><div className="value">{formatWeight(s.total_weight)}</div></div>
            <div className="stat-card"><div className="label">Rata-rata/Tandan</div><div className="value">{formatWeight(s.avg_weight_per_bunch)}</div></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
            <div className="card">
              <div className="card-header"><h3>Rekap per Periode ({filters.period === 'daily' ? 'Harian' : filters.period === 'weekly' ? 'Mingguan' : 'Bulanan'})</h3></div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Periode</th><th>Transaksi</th><th>Tandan</th><th>Berat</th><th>Rata-rata</th></tr></thead>
                  <tbody>
                    {(report.byPeriod || []).map((r, i) => (
                      <tr key={i}>
                        <td>{r.period}</td>
                        <td>{formatNumber(r.total_transactions)}</td>
                        <td>{formatNumber(r.total_bunches)}</td>
                        <td>{formatWeight(r.total_weight)}</td>
                        <td>{formatWeight(r.avg_weight_per_bunch)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="card">
                <div className="card-header"><h3>Per Lokasi</h3></div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Lokasi</th><th>Tandan</th><th>Berat</th></tr></thead>
                    <tbody>
                      {(report.byLocation || []).map(r => (
                        <tr key={r.location_id}><td>{r.location_name}</td><td>{formatNumber(r.total_bunches)}</td><td>{formatWeight(r.total_weight)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card">
                <div className="card-header"><h3>Per Pemanen</h3></div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Pemanen</th><th>Tandan</th><th>Berat</th></tr></thead>
                    <tbody>
                      {(report.byHarvester || []).map(r => (
                        <tr key={r.harvester_id}><td>{r.harvester_name || '-'}</td><td>{formatNumber(r.total_bunches)}</td><td>{formatWeight(r.total_weight)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

