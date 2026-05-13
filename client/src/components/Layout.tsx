import React from 'react';
import { TokenManager } from './TokenManager';

interface LayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { key: 'auth', label: '🔐 Auth' },
  { key: 'users', label: '👥 Users' },
  { key: 'conversations', label: '💬 Conversations' },
  { key: 'messages', label: '✉️ Messages' },
  { key: 'socket', label: '🔌 Socket.IO' },
];

export const Layout: React.FC<LayoutProps> = ({ currentPage, onNavigate, onLogout, children }) => {
  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>Chat API Testing UI</h1>
        <p className="subtitle">Backend: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:1209/api'}</p>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <nav>
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                className={`nav-btn ${currentPage === item.key ? 'active' : ''}`}
                onClick={() => onNavigate(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <TokenManager onLogout={onLogout} />
          </div>
        </aside>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};
