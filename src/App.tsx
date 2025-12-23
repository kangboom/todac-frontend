import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import { AdminLayout } from './components/AdminLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import BabyForm from './pages/BabyForm';
import Chat from './pages/Chat';
import AdminDashboard from './pages/admin/Dashboard';
import KnowledgePage from './pages/admin/Knowledge';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './styles/global.css';
import './styles/components.css';
import './styles/mobile.css';

function App() {
  const { initializeAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <MantineProvider>
      <Notifications />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/signup"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />}
          />

          {/* User Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/babies/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <BabyForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/babies/:id/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <BabyForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Layout>
                  <Chat />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="knowledge" element={<KnowledgePage />} />
              <Route path="settings" element={<div>설정 페이지 (준비중)</div>} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;

