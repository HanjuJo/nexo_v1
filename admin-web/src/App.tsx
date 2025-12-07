import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminAccounts from './pages/admin/AdminAccounts';
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeDetail from './pages/employees/EmployeeDetail';
import ClientList from './pages/clients/ClientList';
import ClientDetail from './pages/clients/ClientDetail';
import ItemList from './pages/items/ItemList';
import ItemDetail from './pages/items/ItemDetail';
import ConsultationList from './pages/consultations/ConsultationList';
import ConsultationDetail from './pages/consultations/ConsultationDetail';
import QuotationList from './pages/quotations/QuotationList';
import QuotationDetail from './pages/quotations/QuotationDetail';
import ContractList from './pages/contracts/ContractList';
import ContractDetail from './pages/contracts/ContractDetail';
import InstallationList from './pages/installations/InstallationList';
import InstallationDetail from './pages/installations/InstallationDetail';
import InventoryList from './pages/inventory/InventoryList';
import InventoryDetail from './pages/inventory/InventoryDetail';
import Backup from './pages/Backup';
import Layout from './components/Layout';
import './App.css';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.is_admin) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.is_super_admin) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* 슈퍼관리자 전용 */}
            <Route
              path="admin/accounts"
              element={
                <SuperAdminRoute>
                  <AdminAccounts />
                </SuperAdminRoute>
              }
            />
            
            {/* 관리자 전용 */}
            <Route
              path="employees"
              element={
                <AdminRoute>
                  <EmployeeList />
                </AdminRoute>
              }
            />
            <Route
              path="employees/:id"
              element={
                <AdminRoute>
                  <EmployeeDetail />
                </AdminRoute>
              }
            />
            <Route
              path="employees/new"
              element={
                <AdminRoute>
                  <EmployeeDetail />
                </AdminRoute>
              }
            />
            <Route
              path="clients"
              element={
                <AdminRoute>
                  <ClientList />
                </AdminRoute>
              }
            />
            <Route
              path="clients/:id"
              element={
                <AdminRoute>
                  <ClientDetail />
                </AdminRoute>
              }
            />
            <Route
              path="clients/new"
              element={
                <AdminRoute>
                  <ClientDetail />
                </AdminRoute>
              }
            />
            <Route
              path="items"
              element={
                <AdminRoute>
                  <ItemList />
                </AdminRoute>
              }
            />
            <Route
              path="items/:id"
              element={
                <AdminRoute>
                  <ItemDetail />
                </AdminRoute>
              }
            />
            <Route
              path="items/new"
              element={
                <AdminRoute>
                  <ItemDetail />
                </AdminRoute>
              }
            />
            <Route
              path="consultations"
              element={
                <AdminRoute>
                  <ConsultationList />
                </AdminRoute>
              }
            />
            <Route
              path="consultations/:id"
              element={
                <AdminRoute>
                  <ConsultationDetail />
                </AdminRoute>
              }
            />
            <Route
              path="consultations/new"
              element={
                <AdminRoute>
                  <ConsultationDetail />
                </AdminRoute>
              }
            />
            <Route
              path="quotations"
              element={
                <AdminRoute>
                  <QuotationList />
                </AdminRoute>
              }
            />
            <Route
              path="quotations/:id"
              element={
                <AdminRoute>
                  <QuotationDetail />
                </AdminRoute>
              }
            />
            <Route
              path="quotations/new"
              element={
                <AdminRoute>
                  <QuotationDetail />
                </AdminRoute>
              }
            />
            <Route
              path="contracts"
              element={
                <AdminRoute>
                  <ContractList />
                </AdminRoute>
              }
            />
            <Route
              path="contracts/:id"
              element={
                <AdminRoute>
                  <ContractDetail />
                </AdminRoute>
              }
            />
            <Route
              path="contracts/new"
              element={
                <AdminRoute>
                  <ContractDetail />
                </AdminRoute>
              }
            />
            <Route
              path="installations"
              element={
                <AdminRoute>
                  <InstallationList />
                </AdminRoute>
              }
            />
            <Route
              path="installations/:id"
              element={
                <AdminRoute>
                  <InstallationDetail />
                </AdminRoute>
              }
            />
            <Route
              path="installations/new"
              element={
                <AdminRoute>
                  <InstallationDetail />
                </AdminRoute>
              }
            />
            <Route
              path="inventory"
              element={
                <AdminRoute>
                  <InventoryList />
                </AdminRoute>
              }
            />
            <Route
              path="inventory/:id"
              element={
                <AdminRoute>
                  <InventoryDetail />
                </AdminRoute>
              }
            />
            <Route
              path="inventory/new"
              element={
                <AdminRoute>
                  <InventoryDetail />
                </AdminRoute>
              }
            />
            <Route
              path="backup"
              element={
                <AdminRoute>
                  <Backup />
                </AdminRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

