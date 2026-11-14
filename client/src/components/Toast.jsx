export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 100, minWidth: 280, maxWidth: 400 }}>
      <div className={`alert alert-${toast.type === 'error' ? 'error' : 'success'}`}>
        {toast.message}
      </div>
    </div>
  );
}

