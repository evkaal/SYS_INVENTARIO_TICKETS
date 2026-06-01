import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import ConsumiblesPage from './pages/ConsumiblesPage';
import DispositivosPage from './pages/DispositivosPage';
import MovimientosPage from './pages/MovimientosPage';
import PrestamosPage from './pages/PrestamosPage';
import TicketsPage from './pages/TicketsPage';
import HistorialPage from './pages/HistorialPage';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <NotificationProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar onMenuClick={toggleSidebar} />
          
          <div className="flex">
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
            
            <main className="flex-1 w-full min-w-0 overflow-x-auto" style={{ marginTop: '60px' }}>
              <div className="p-4 md:p-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/consumibles" element={<ConsumiblesPage />} />
                  <Route path="/dispositivos" element={<DispositivosPage />} />
                  <Route path="/movimientos" element={<MovimientosPage />} />
                  <Route path="/prestamos" element={<PrestamosPage />} />
                  <Route path="/tickets" element={<TicketsPage />} />
                  <Route path="/historial" element={<HistorialPage />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;