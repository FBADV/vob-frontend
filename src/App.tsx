import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalDataProvider, useGlobalData } from './context/GlobalDataContext';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { GamificationProvider } from './context/GamificationContext';
import { GlobalModals } from './components/GlobalModals';
import { GlobalErrorProvider } from './context/GlobalErrorContext';
import { GlobalErrorModal } from './components/GlobalErrorModal';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/Login';
import { JusBrCallback } from './pages/JusBrCallback';
import { PortalLogin } from './pages/portal/PortalLogin';
import { PortalDashboard } from './pages/portal/PortalDashboard';
import { PortalDocuments } from './pages/portal/PortalDocuments';
import { PortalMessages } from './pages/portal/PortalMessages';
import { PortalLayout } from './layouts/PortalLayout';
import { usePortalAuth } from './hooks/usePortalAuth';

const PortalProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = usePortalAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/portal/login" />;
  }

  return <>{children}</>;
};
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Processes } from './pages/Processes';
import { Services } from './pages/Services';
import { Intimations } from './pages/Intimations';
import { Documents } from './pages/Documents';
import { Financial } from './pages/Financial';
import { Cases } from './pages/Cases';
import { Agenda } from './pages/Agenda';
import { Settings } from './pages/Settings';
import { Reports } from './pages/Reports';
import { Jurisprudence } from './pages/Jurisprudence';
import { Profile } from './pages/Profile';
import { CRM } from './pages/CRM';
import { Notifications } from './pages/Notifications';
import { Controladoria } from './pages/Controladoria';
import { ChatProvider } from './context/ChatContext';
import { Chat } from './pages/Chat';
import { Gamification } from './pages/Gamification';
import { ToastProvider } from './context/ToastContext';
import { ConfirmationProvider } from './context/ConfirmationContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useGlobalData();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <GlobalErrorProvider>
        <GlobalDataProvider>
          <ModalProvider>
            <GamificationProvider>
              <ChatProvider>
                <ToastProvider>
                  <ConfirmationProvider>
                    <Router>
                      <GlobalErrorModal />
                      <GlobalModals />
                      <Routes>
                        {/* OAuth Callback Routes */}
                        <Route path="/auth/jusbr/callback" element={<JusBrCallback />} />

                        {/* Client Portal */}
                        <Route path="/portal" element={<PortalLayout />}>
                          <Route path="login" element={<PortalLogin />} />
                          <Route path="dashboard" element={
                            <PortalProtectedRoute>
                              <PortalDashboard />
                            </PortalProtectedRoute>
                          } />
                          <Route path="documents" element={
                            <PortalProtectedRoute>
                              <PortalDocuments />
                            </PortalProtectedRoute>
                          } />
                          <Route path="messages" element={
                            <PortalProtectedRoute>
                              <PortalMessages />
                            </PortalProtectedRoute>
                          } />
                          <Route index element={<Navigate to="/portal/dashboard" replace />} />
                        </Route>

                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={
                          <ProtectedRoute>
                            <MainLayout />
                          </ProtectedRoute>
                        }>
                          <Route index element={<Dashboard />} />
                          <Route path="clients" element={<Clients />} />
                          <Route path="processes" element={<Processes />} />
                          <Route path="agenda" element={<Agenda />} />
                          <Route path="services" element={<Services />} />
                          <Route path="financial" element={<Financial />} />
                          <Route path="jurisprudence" element={<Jurisprudence />} />
                          <Route path="cases" element={<Cases />} />
                          <Route path="reports" element={<Reports />} />
                          <Route path="crm" element={<CRM />} />
                          <Route path="settings" element={<Settings />} />
                          <Route path="profile" element={<Profile />} />
                          <Route path="intimations" element={<Intimations />} />
                          <Route path="documents" element={<Documents />} />
                          <Route path="notifications" element={<Notifications />} />
                          <Route path="controladoria" element={
                            <ProtectedRoute>
                              <Controladoria />
                            </ProtectedRoute>
                          } />
                          <Route path="chat" element={<Chat />} />
                          <Route path="gamification" element={<Gamification />} />
                        </Route>
                      </Routes>
                    </Router>
                  </ConfirmationProvider>
                </ToastProvider>
              </ChatProvider>
            </GamificationProvider>
          </ModalProvider>
        </GlobalDataProvider>
      </GlobalErrorProvider>
    </AuthProvider>
  );
}

export default App;
