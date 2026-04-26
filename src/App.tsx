import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import RequestModal from './components/ui/RequestModal';

import Home from './pages/Home';
import Works from './pages/Works';
import About from './pages/About';
import Hire from './pages/Hire';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import AdminPage from './pages/AdminPage';

const NO_FOOTER_ROUTES = ['/auth', '/dashboard', '/admin'];

const AppInner: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.8rem',
        color: 'var(--green)',
      }}>
        <span>▮ initialising...</span>
      </div>
    );
  }

  const showFooter = !NO_FOOTER_ROUTES.some(r => location.pathname.startsWith(r));

  return (
    <>
      <Navbar onStartProject={() => setModalOpen(true)} />
      <RequestModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <main>
        <Routes>
          <Route path="/" element={<Home onStartProject={() => setModalOpen(true)} />} />
          <Route path="/works" element={<Works onStartProject={() => setModalOpen(true)} />} />
          <Route path="/about" element={<About onStartProject={() => setModalOpen(true)} />} />
          <Route path="/hire" element={<Hire onStartProject={() => setModalOpen(true)} />} />
          <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
          <Route
            path="/dashboard"
            element={user ? <Dashboard onStartProject={() => setModalOpen(true)} /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/admin"
            element={isAdmin ? <AdminPage /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showFooter && <Footer onStartProject={() => setModalOpen(true)} />}
    </>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
