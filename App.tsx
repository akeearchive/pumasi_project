import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import RecordPage from './components/RecordPage';
import IncomePage from './components/IncomePage';
import StatsPage from './components/StatsPage';
import LandingPage from './components/LandingPage';
import HistoryPage from './components/HistoryPage';
import { Transaction, Cheongmo } from './types';

// Mock Initial Data
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'GIVEN', eventType: 'WEDDING', name: '김민수', relation: 'FRIEND', amount: 100000, date: '2024-03-15', location: '더채플', hasMeal: true },
  { id: '2', type: 'GIVEN', eventType: 'FUNERAL', name: '박지영', relation: 'COLLEAGUE', amount: 50000, date: '2024-04-02', location: '서울성모병원', hasMeal: false },
  { id: '3', type: 'RECEIVED', eventType: 'WEDDING', name: '최강호', relation: 'FRIEND', amount: 150000, date: '2024-10-20' },
  { id: '4', type: 'GIVEN', eventType: 'FIRST_BIRTHDAY', name: '이서준', relation: 'FAMILY', amount: 100000, date: '2024-05-05', hasMeal: true },
];

const INITIAL_CHEONGMO: Cheongmo[] = [
    { id: '101', name: '고등학교 동창 청모', date: '2024-08-15', location: '강남 고기집', totalCost: 320000, guestCount: 6 }
];

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
      const saved = localStorage.getItem('transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [cheongmos, setCheongmos] = useState<Cheongmo[]>(() => {
      const saved = localStorage.getItem('cheongmos');
      return saved ? JSON.parse(saved) : INITIAL_CHEONGMO;
  });

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('cheongmos', JSON.stringify(cheongmos));
  }, [cheongmos]);

  const addTransaction = (t: Transaction) => {
    setTransactions(prev => [t, ...prev]);
  };

  const addCheongmo = (c: Cheongmo) => {
    setCheongmos(prev => [c, ...prev]);
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
              <div className="text-center pt-20 text-gray-400">준비 중입니다 ⚙️</div>
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