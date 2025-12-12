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
import { Transaction, Cheongmo } from './types';
import { storage } from './services/storage';

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
        {/* Landing Page - No Layout */}
        <Route path="/" element={<LandingPage />} />
        
        {/* App Pages - With Layout */}
        <Route 
          path="/dashboard" 
          element={
            <Layout>
              <Dashboard transactions={transactions} cheongmos={cheongmos} />
            </Layout>
          } 
        />
        <Route 
          path="/history" 
          element={
            <Layout>
              <HistoryPage transactions={transactions} cheongmos={cheongmos} />
            </Layout>
          } 
        />
        <Route 
          path="/record" 
          element={
            <Layout>
              <RecordPage 
                onAddTransaction={addTransaction} 
                onAddCheongmo={addCheongmo} 
              />
            </Layout>
          } 
        />
        <Route 
          path="/income" 
          element={
            <Layout>
              <IncomePage 
                onAddTransaction={addTransaction} 
              />
            </Layout>
          } 
        />
        <Route 
          path="/stats" 
          element={
            <Layout>
              <StatsPage transactions={transactions} cheongmos={cheongmos} />
            </Layout>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <Layout>
              <SettingsPage onDataChange={refreshData} />
            </Layout>
          } 
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;