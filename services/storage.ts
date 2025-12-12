import { Transaction, Cheongmo } from '../types';

const KEYS = {
  TRANSACTIONS: 'transactions',
  CHEONGMOS: 'cheongmos',
};

// Mock Initial Data (Used only when storage is empty)
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'GIVEN', eventType: 'WEDDING', name: '김민수', relation: 'FRIEND', amount: 100000, date: '2024-03-15', location: '더채플', hasMeal: true },
  { id: '2', type: 'GIVEN', eventType: 'FUNERAL', name: '박지영', relation: 'COLLEAGUE', amount: 50000, date: '2024-04-02', location: '서울성모병원', hasMeal: false },
  { id: '3', type: 'RECEIVED', eventType: 'WEDDING', name: '최강호', relation: 'FRIEND', target: 'GROOM', amount: 150000, date: '2024-10-20', hasMeal: true },
  { id: '4', type: 'GIVEN', eventType: 'FIRST_BIRTHDAY', name: '이서준', relation: 'FAMILY', amount: 100000, date: '2024-05-05', hasMeal: true },
];

const INITIAL_CHEONGMO: Cheongmo[] = [
    { id: '101', name: '고등학교 동창 청모', date: '2024-08-15', location: '강남 고기집', totalCost: 320000, guestCount: 6 }
];

export const storage = {
  getTransactions: (): Transaction[] => {
    try {
      const data = localStorage.getItem(KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : INITIAL_TRANSACTIONS;
    } catch (e) {
      console.error("Failed to load transactions", e);
      return [];
    }
  },
  
  saveTransactions: (data: Transaction[]) => {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(data));
  },
  
  getCheongmos: (): Cheongmo[] => {
    try {
      const data = localStorage.getItem(KEYS.CHEONGMOS);
      return data ? JSON.parse(data) : INITIAL_CHEONGMO;
    } catch (e) {
      console.error("Failed to load cheongmos", e);
      return [];
    }
  },
  
  saveCheongmos: (data: Cheongmo[]) => {
    localStorage.setItem(KEYS.CHEONGMOS, JSON.stringify(data));
  },
  
  // Data Management Features
  exportData: () => {
    const data = {
      transactions: JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]'),
      cheongmos: JSON.parse(localStorage.getItem(KEYS.CHEONGMOS) || '[]'),
      exportedAt: new Date().toISOString(),
      version: 1.0
    };
    return JSON.stringify(data, null, 2);
  },

  importData: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      
      // Basic validation
      if (!Array.isArray(data.transactions) || !Array.isArray(data.cheongmos)) {
        throw new Error("Invalid data format");
      }

      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
      localStorage.setItem(KEYS.CHEONGMOS, JSON.stringify(data.cheongmos));
      return true;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  },

  resetData: () => {
    localStorage.removeItem(KEYS.TRANSACTIONS);
    localStorage.removeItem(KEYS.CHEONGMOS);
  }
};
