import React, { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { AuthPage } from './pages/AuthPage';
import { UsersPage } from './pages/UsersPage';
import { ConversationsPage } from './pages/ConversationsPage';
import { MessagesPage } from './pages/MessagesPage';
import { SocketTestPage } from './pages/SocketTestPage';
import { tokenStorage } from './utils/tokenStorage';
import './App.css';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('auth');
  const [, setAuthVersion] = useState(0); // force re-render on auth change

  const handleAuthChange = useCallback(() => {
    setAuthVersion(v => v + 1);
  }, []);

  const handleLogout = useCallback(() => {
    tokenStorage.clearTokens();
    setAuthVersion(v => v + 1);
    setCurrentPage('auth');
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'auth': return <AuthPage onAuthChange={handleAuthChange} />;
      case 'users': return <UsersPage />;
      case 'conversations': return <ConversationsPage />;
      case 'messages': return <MessagesPage />;
      case 'socket': return <SocketTestPage />;
      default: return <AuthPage onAuthChange={handleAuthChange} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout}>
      {renderPage()}
    </Layout>
  );
};

export default App;
