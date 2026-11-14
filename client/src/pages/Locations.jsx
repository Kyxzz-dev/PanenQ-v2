import { useState } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { getLocations, createLocation, updateLocation, deleteLocation } from '../services/api';
import { useFetch, useToast } from '../hooks/useData';

export default function Locations() {
  const { toast, show } = useToast();
  const { data: locations, loading, reload } = useFetch(getLocations);
  const [modal, setModal] = useState(null); // null | { id?, name, description }
  const [delConfirm, setDelConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => setModal({ name: '', description: '' });
  const openEdit = (loc) => setModal({ ...loc });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.id) {
        await updateLocation(modal.id, { name: modal.name, description: modal.description });
        show('Lokasi berhasil diubah');
      } else {
        await createLocation({ name: modal.name, description: modal.description });
        show('Lokasi berhasil ditambahkan');
      }
      setModal(null);
      reload();
    } catch (err) { show(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteLocation(delConfirm.id);
      show('Lokasi berhasil dihapus');
      setDelConfirm(null);
      reload();
    } catch (err) { show(err.message, 'error'); }
  };

  return (
    <Layout title="Data Lokasi / Blok">
      <Toast toast={toast} />
      <div className="card">
        <div className="card-header">
          <h3>Daftar Lokasi</h3>
          <button className="btn btn-primary" onClick={openAdd}>+ Tambah Lokasi</button>
        </div>
        {loading ? <div className="loading-center"><div className="spinner" /></div> : !locations?.length ? (
          <div className="empty-state"><div className="icon">📍</div><p>Belum ada data lokasi</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nama</th><th>Keterangan</th><th>Aksi</th></tr></thead>
              <tbody>
                {locations.map(l => (
                  <tr key={l.id}>
                    <td><strong>{l.name}</strong></td>
                    <td>{l.description || '-'}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary" style={{ marginRight: 6 }} onClick={() => openEdit(l)}>✏️</button>
                      <button className="btn btn-sm btn-danger" onClick={() => setDelConfirm(l)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? 'Edit Lokasi' : 'Tambah Lokasi'}
        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Batal</button><button className="btn btn-primary" form="loc-form" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button></>}>
        {modal && (
          <form id="loc-form" onSubmit={handleSave}>
            <div className="form-group"><label>Nama Lokasi *</label><input value={modal.name} onChange={e => setModal(m => ({ ...m, name: e.target.value }))} className="form-control" required /></div>
            <div className="form-group"><label>Keterangan</label><textarea value={modal.description || ''} onChange={e => setModal(m => ({ ...m, description: e.target.value }))} className="form-control" rows={3} /></div>
          </form>
        )}
      </Modal>

      <Modal open={!!delConfirm} onClose={() => setDelConfirm(null)} title="Hapus Lokasi"
        footer={<><button className="btn btn-secondary" onClick={() => setDelConfirm(null)}>Batal</button><button className="btn btn-danger" onClick={handleDelete}>Hapus</button></>}>
        <p>Yakin hapus lokasi <strong>{delConfirm?.name}</strong>?</p>
      </Modal>
    </Layout>
  );
}

