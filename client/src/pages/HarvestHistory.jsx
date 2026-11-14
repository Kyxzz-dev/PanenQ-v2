import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { getHarvestRecords, getLocations, getHarvesters, deleteHarvestRecord, updateHarvestRecord } from '../services/api';
import { useToast } from '../hooks/useData';
import { formatDate, formatNumber, formatWeight } from '../utils/format';

export default function HarvestHistory() {
  const { toast, show } = useToast();
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [harvesters, setHarvesters] = useState([]);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', locationId: '', harvesterId: '' });
  const [editModal, setEditModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    getLocations().then(setLocations).catch(() => {});
    getHarvesters().then(setHarvesters).catch(() => {});
  }, []);

  const load = useCallback((page = 1) => {
    setLoading(true);
    const params = { page, limit: 15, sort: 'desc' };
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.locationId) params.locationId = filters.locationId;
    if (filters.harvesterId) params.harvesterId = filters.harvesterId;
    getHarvestRecords(params)
      .then(res => { setRecords(res.data); setPagination(res.pagination); })
      .catch(err => show(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [filters]); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteHarvestRecord(deleteConfirm.id);
      show('Catatan berhasil dihapus');
      setDeleteConfirm(null);
      load(pagination.page);
    } catch (err) { show(err.message, 'error'); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await updateHarvestRecord(editModal.id, {
        harvest_date: editModal.harvest_date,
        location_id: Number(editModal.location_id),
        harvester_id: editModal.harvester_id ? Number(editModal.harvester_id) : null,
        bunch_count: Number(editModal.bunch_count),
        total_weight_kg: editModal.total_weight_kg ? Number(editModal.total_weight_kg) : null,
        notes: editModal.notes || '',
      });
      show('Catatan berhasil diubah');
      setEditModal(null);
      load(pagination.page);
    } catch (err) { show(err.message, 'error'); }
  };

  return (
    <Layout title="Riwayat Panen">
      <Toast toast={toast} />

      <div className="filter-bar">
        <div className="form-group">
          <label>Dari Tanggal</label>
          <input type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} className="form-control" />
        </div>
        <div className="form-group">
          <label>Sampai Tanggal</label>
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
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : records.length === 0 ? (
          <div className="empty-state"><div className="icon">📋</div><p>Belum ada catatan panen</p></div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th><th>Lokasi</th><th>Pemanen</th><th>Tandan</th><th>Berat</th><th>Catatan</th><th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id}>
                      <td>{formatDate(r.harvest_date)}</td>
                      <td>{r.location_name}</td>
                      <td>{r.harvester_name || '-'}</td>
                      <td>{formatNumber(r.bunch_count)}</td>
                      <td>{formatWeight(r.total_weight_kg)}</td>
                      <td>{r.notes || '-'}</td>
                      <td>
                        <button className="btn btn-sm btn-secondary" style={{ marginRight: 6 }}
                          onClick={() => setEditModal({ ...r })}>✏️</button>
                        <button className="btn btn-sm btn-danger"
                          onClick={() => setDeleteConfirm(r)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <button className="btn btn-sm btn-secondary" disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)}>← Sebelumnya</button>
              <span className="page-info">Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} data)</span>
              <button className="btn btn-sm btn-secondary" disabled={pagination.page >= pagination.totalPages} onClick={() => load(pagination.page + 1)}>Selanjutnya →</button>
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Edit Catatan Panen"
        footer={<><button className="btn btn-secondary" onClick={() => setEditModal(null)}>Batal</button><button className="btn btn-primary" form="edit-form">Simpan</button></>}>
        {editModal && (
          <form id="edit-form" onSubmit={handleEdit}>
            <div className="form-group"><label>Tanggal</label><input type="date" value={editModal.harvest_date} onChange={e => setEditModal(m => ({ ...m, harvest_date: e.target.value }))} className="form-control" required /></div>
            <div className="form-group"><label>Lokasi</label><select value={editModal.location_id} onChange={e => setEditModal(m => ({ ...m, location_id: e.target.value }))} className="form-control" required><option value="">--</option>{locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
            <div className="form-group"><label>Pemanen</label><select value={editModal.harvester_id || ''} onChange={e => setEditModal(m => ({ ...m, harvester_id: e.target.value }))} className="form-control"><option value="">--</option>{harvesters.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}</select></div>
            <div className="form-group"><label>Tandan</label><input type="number" value={editModal.bunch_count} onChange={e => setEditModal(m => ({ ...m, bunch_count: e.target.value }))} className="form-control" min="1" required /></div>
            <div className="form-group"><label>Berat (kg)</label><input type="number" value={editModal.total_weight_kg || ''} onChange={e => setEditModal(m => ({ ...m, total_weight_kg: e.target.value }))} className="form-control" min="0" step="0.1" /></div>
            <div className="form-group"><label>Catatan</label><textarea value={editModal.notes || ''} onChange={e => setEditModal(m => ({ ...m, notes: e.target.value }))} className="form-control" rows={2} /></div>
          </form>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Hapus Catatan"
        footer={<><button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Batal</button><button className="btn btn-danger" onClick={handleDelete}>Hapus</button></>}>
        <p>Yakin hapus catatan panen tanggal <strong>{deleteConfirm && formatDate(deleteConfirm.harvest_date)}</strong> di <strong>{deleteConfirm?.location_name}</strong>?</p>
      </Modal>
    </Layout>
  );
}

