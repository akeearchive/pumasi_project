import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import RecordPage from './components/RecordPage';
import IncomePage from './components/IncomePage';
import StatsPage from './components/StatsPage';
import LandingPage from './components/LandingPage';
import HistoryPage from './components/HistoryPage';
import SettingsPage from './components/SettingsPage';
import LoginPage from './components/LoginPage';
import { Transaction, Cheongmo } from './types';
import { storage } from './services/storage';
import { authService } from './services/authService';

// Wrapper for protected routes
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const isAuthenticated = authService.isAuthenticated();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  // Load initial data from storage service
  const [transactions, setTransactions] = useState<Transaction[]>(() => storage.getTransactions());
  const [cheongmos, setCheongmos] = useState<Cheongmo[]>(() => storage.getCheongmos());

  // Save to storage whenever state changes
  useEffect(() => {
    storage.saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    storage.saveCheongmos(cheongmos);
  }, [cheongmos]);

  const addTransaction = (t: Transaction) => {
    setTransactions(prev => [t, ...prev]);
  };

  const addCheongmo = (c: Cheongmo) => {
    setCheongmos(prev => [c, ...prev]);
  };

  // Used by SettingsPage to refresh data after import/reset
  const refreshData = () => {
    setTransactions(storage.getTransactions());
    setCheongmos(storage.getCheongmos());
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes - All require Layout and Authentication */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard transactions={transactions} cheongmos={cheongmos} />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/history" 
          element={
            <ProtectedRoute>
              <Layout>
                <HistoryPage transactions={transactions} cheongmos={cheongmos} />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/record" 
          element={
            <ProtectedRoute>
              <Layout>
                <RecordPage 
                  onAddTransaction={addTransaction} 
                  onAddCheongmo={addCheongmo} 
                />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/income" 
          element={
            <ProtectedRoute>
              <Layout>
                <IncomePage 
                  onAddTransaction={addTransaction} 
                />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/stats" 
          element={
            <ProtectedRoute>
              <Layout>
                <StatsPage transactions={transactions} cheongmos={cheongmos} />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Layout>
                <SettingsPage onDataChange={refreshData} />
              </Layout>
            </ProtectedRoute>
          } 
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;