import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getReportSummary, getHarvestRecords } from '../services/api';
import { formatNumber, formatWeight, formatDate } from '../utils/format';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getReportSummary(),
      getHarvestRecords({ limit: 5, sort: 'desc' }),
    ]).then(([rep, rec]) => {
      setSummary(rep);
      setRecent(rec.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Dashboard"><div className="loading-center"><div className="spinner" /></div></Layout>;

  const s = summary?.summary || {};

  return (
    <Layout title="Dashboard">
      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Total Transaksi</div>
          <div className="value">{formatNumber(s.total_transactions)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Tandan</div>
          <div className="value">{formatNumber(s.total_bunches)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Berat</div>
          <div className="value">{formatWeight(s.total_weight)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Rata-rata Berat/Tandan</div>
          <div className="value">{formatWeight(s.avg_weight_per_bunch)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-header"><h3>Hasil per Lokasi</h3></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Lokasi</th><th>Tandan</th><th>Berat</th></tr></thead>
              <tbody>
                {(summary?.byLocation || []).map(r => (
                  <tr key={r.location_id}>
                    <td>{r.location_name}</td>
                    <td>{formatNumber(r.total_bunches)}</td>
                    <td>{formatWeight(r.total_weight)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Catatan Terbaru</h3></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Tanggal</th><th>Lokasi</th><th>Tandan</th><th>Berat</th></tr></thead>
              <tbody>
                {recent.map(r => (
                  <tr key={r.id}>
                    <td>{formatDate(r.harvest_date)}</td>
                    <td>{r.location_name}</td>
                    <td>{formatNumber(r.bunch_count)}</td>
                    <td>{formatWeight(r.total_weight_kg)}</td>
                  </tr>
                ))}
                {recent.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: '#999' }}>Belum ada data</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

