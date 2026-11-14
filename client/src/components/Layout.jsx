import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/harvest', label: 'Input Panen', icon: '📝' },
  { to: '/history', label: 'Riwayat Panen', icon: '📋' },
  { to: '/locations', label: 'Data Lokasi', icon: '📍' },
  { to: '/harvesters', label: 'Data Pemanen', icon: '👷' },
  { to: '/reports', label: 'Laporan', icon: '📈' },
];

export default function Layout({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="app-layout">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1><span>🌴</span> Panen TBS</h1>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} onClick={() => setOpen(false)}>
              <span className="icon">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main-content">
        <div className="topbar">
          <button className="hamburger" onClick={() => setOpen(!open)}>☰</button>
          <h2>{title}</h2>
          <div />
        </div>
        <div className="page-content">{children}</div>
      </div>
      {open && <div style={{ position: 'fixed', inset: 0, zIndex: 35 }} onClick={() => setOpen(false)} />}
    </div>
  );
}

