import { useState } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { getHarvesters, createHarvester, updateHarvester, deleteHarvester } from '../services/api';
import { useFetch, useToast } from '../hooks/useData';

export default function Harvesters() {
  const { toast, show } = useToast();
  const { data: harvesters, loading, reload } = useFetch(getHarvesters);
  const [modal, setModal] = useState(null);
  const [delConfirm, setDelConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => setModal({ name: '', employee_code: '', is_active: true });
  const openEdit = (h) => setModal({ ...h, is_active: !!h.is_active });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { name: modal.name, employee_code: modal.employee_code || null, is_active: modal.is_active };
      if (modal.id) {
        await updateHarvester(modal.id, data);
        show('Pemanen berhasil diubah');
      } else {
        await createHarvester(data);
        show('Pemanen berhasil ditambahkan');
      }
      setModal(null);
      reload();
    } catch (err) { show(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteHarvester(delConfirm.id);
      show('Pemanen berhasil dihapus');
      setDelConfirm(null);
      reload();
    } catch (err) { show(err.message, 'error'); }
  };

  return (
    <Layout title="Data Pemanen">
      <Toast toast={toast} />
      <div className="card">
        <div className="card-header">
          <h3>Daftar Pemanen</h3>
          <button className="btn btn-primary" onClick={openAdd}>+ Tambah Pemanen</button>
        </div>
        {loading ? <div className="loading-center"><div className="spinner" /></div> : !harvesters?.length ? (
          <div className="empty-state"><div className="icon">👷</div><p>Belum ada data pemanen</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nama</th><th>Kode Pekerja</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {harvesters.map(h => (
                  <tr key={h.id}>
                    <td><strong>{h.name}</strong></td>
                    <td>{h.employee_code || '-'}</td>
                    <td>{h.is_active ? <span className="badge badge-green">Aktif</span> : <span className="badge badge-gray">Nonaktif</span>}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary" style={{ marginRight: 6 }} onClick={() => openEdit(h)}>✏️</button>
                      <button className="btn btn-sm btn-danger" onClick={() => setDelConfirm(h)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? 'Edit Pemanen' : 'Tambah Pemanen'}
        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Batal</button><button className="btn btn-primary" form="har-form" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button></>}>
        {modal && (
          <form id="har-form" onSubmit={handleSave}>
            <div className="form-group"><label>Nama *</label><input value={modal.name} onChange={e => setModal(m => ({ ...m, name: e.target.value }))} className="form-control" required /></div>
            <div className="form-group"><label>Kode Pekerja</label><input value={modal.employee_code || ''} onChange={e => setModal(m => ({ ...m, employee_code: e.target.value }))} className="form-control" /></div>
            {modal.id && (
              <div className="form-group">
                <label><input type="checkbox" checked={modal.is_active} onChange={e => setModal(m => ({ ...m, is_active: e.target.checked }))} style={{ marginRight: 8 }} />Aktif</label>
              </div>
            )}
          </form>
        )}
      </Modal>

      <Modal open={!!delConfirm} onClose={() => setDelConfirm(null)} title="Hapus Pemanen"
        footer={<><button className="btn btn-secondary" onClick={() => setDelConfirm(null)}>Batal</button><button className="btn btn-danger" onClick={handleDelete}>Hapus</button></>}>
        <p>Yakin hapus pemanen <strong>{delConfirm?.name}</strong>?</p>
      </Modal>
    </Layout>
  );
}

