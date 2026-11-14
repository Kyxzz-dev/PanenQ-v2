import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import { getLocations, getHarvesters, createHarvestRecord } from '../services/api';
import { useToast } from '../hooks/useData';
import { today } from '../utils/format';

export default function HarvestForm() {
  const navigate = useNavigate();
  const { toast, show } = useToast();
  const [locations, setLocations] = useState([]);
  const [harvesters, setHarvesters] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    harvest_date: today(),
    location_id: '',
    harvester_id: '',
    bunch_count: '',
    total_weight_kg: '',
    notes: '',
  });

  useEffect(() => {
    getLocations().then(setLocations).catch(() => {});
    getHarvesters(true).then(setHarvesters).catch(() => {});
  }, []);

  const onChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createHarvestRecord({
        ...form,
        location_id: Number(form.location_id),
        harvester_id: form.harvester_id ? Number(form.harvester_id) : null,
        bunch_count: Number(form.bunch_count),
        total_weight_kg: form.total_weight_kg ? Number(form.total_weight_kg) : null,
      });
      show('Catatan panen berhasil disimpan!');
      setForm({ harvest_date: today(), location_id: '', harvester_id: '', bunch_count: '', total_weight_kg: '', notes: '' });
    } catch (err) {
      show(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Input Panen">
      <Toast toast={toast} />
      <div className="card" style={{ maxWidth: 640 }}>
        <form onSubmit={onSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Tanggal Panen *</label>
              <input type="date" name="harvest_date" value={form.harvest_date} onChange={onChange} className="form-control" required />
            </div>
            <div className="form-group">
              <label>Lokasi / Blok *</label>
              <select name="location_id" value={form.location_id} onChange={onChange} className="form-control" required>
                <option value="">-- Pilih Lokasi --</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Pemanen</label>
              <select name="harvester_id" value={form.harvester_id} onChange={onChange} className="form-control">
                <option value="">-- Pilih Pemanen --</option>
                {harvesters.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Jumlah Tandan *</label>
              <input type="number" name="bunch_count" value={form.bunch_count} onChange={onChange} className="form-control" min="1" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Berat Total (kg)</label>
              <input type="number" name="total_weight_kg" value={form.total_weight_kg} onChange={onChange} className="form-control" min="0" step="0.1" />
            </div>
          </div>
          <div className="form-group">
            <label>Keterangan</label>
            <textarea name="notes" value={form.notes} onChange={onChange} className="form-control" rows={3} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><div className="spinner" /> Menyimpan...</> : '💾 Simpan'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/history')}>Lihat Riwayat</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

