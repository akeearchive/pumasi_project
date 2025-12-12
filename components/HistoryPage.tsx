import React, { useState, useMemo } from 'react';
import { Transaction, Cheongmo } from '../types';

interface HistoryPageProps {
  transactions: Transaction[];
  cheongmos: Cheongmo[];
}

// Unified interface for display
interface CombinedActivity {
    id: string;
    type: 'GIVEN' | 'RECEIVED' | 'CHEONGMO_HOSTED';
    eventType: string;
    name: string;
    relation?: string;
    amount: number;
    date: string;
    location?: string;
    // Cheongmo Attendance fields
    attendedCheongmo?: boolean;
    cheongmoPriceRange?: 'LOW' | 'MEDIUM' | 'HIGH';
    givenCheongmoGift?: boolean;
    hasMeal?: boolean;
    // Cheongmo Hosted fields
    guestCount?: number;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ transactions, cheongmos }) => {
  const [filterType, setFilterType] = useState<'ALL' | 'GIVEN' | 'RECEIVED'>('ALL');

  // Merge and create unified list
  const combinedList: CombinedActivity[] = useMemo(() => {
    const transList: CombinedActivity[] = transactions.map(t => ({
        id: t.id,
        type: t.type,
        eventType: t.eventType,
        name: t.name,
        relation: t.relation,
        amount: t.amount,
        date: t.date,
        location: t.location,
        attendedCheongmo: t.attendedCheongmo,
        cheongmoPriceRange: t.cheongmoPriceRange,
        givenCheongmoGift: t.givenCheongmoGift,
        hasMeal: t.hasMeal
    }));

    const cheongmoList: CombinedActivity[] = cheongmos.map(c => ({
        id: c.id,
        type: 'CHEONGMO_HOSTED',
        eventType: 'CHEONGMO_HOSTED',
        name: c.name,
        amount: c.totalCost,
        date: c.date,
        location: c.location,
        guestCount: c.guestCount
    }));

    return [...transList, ...cheongmoList];
  }, [transactions, cheongmos]);

  const getEventIcon = (item: CombinedActivity) => {
    if (item.type === 'CHEONGMO_HOSTED') return '🥂';
    switch(item.eventType) {
      case 'WEDDING': return '💍';
      case 'FUNERAL': return '🕯️';
      case 'FIRST_BIRTHDAY': return '🎂';
      default: return '🎉';
    }
  };

  const getEventLabel = (item: CombinedActivity) => {
    if (item.type === 'CHEONGMO_HOSTED') return '청모 개최';
    switch(item.eventType) {
      case 'WEDDING': return '결혼식';
      case 'FUNERAL': return '장례식';
      case 'FIRST_BIRTHDAY': return '돌잔치';
      default: return '기타';
    }
  };

  const getPriceRangeLabel = (range?: 'LOW' | 'MEDIUM' | 'HIGH') => {
      if (range === 'LOW') return '1~3만원대 식사';
      if (range === 'MEDIUM') return '3~5만원대 식사';
      if (range === 'HIGH') return '5만원+ 식사';
      return '';
  };

  // Filter and Sort Transactions
  const filteredTransactions = useMemo(() => {
    let data = combinedList;
    if (filterType === 'GIVEN') {
      // Include GIVEN and CHEONGMO_HOSTED (both are expenses)
      data = data.filter(t => t.type === 'GIVEN' || t.type === 'CHEONGMO_HOSTED');
    } else if (filterType === 'RECEIVED') {
      data = data.filter(t => t.type === 'RECEIVED');
    }
    // 'ALL' includes everything

    return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [combinedList, filterType]);

  // Group by Month (YYYY-MM)
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: CombinedActivity[] } = {};
    filteredTransactions.forEach(t => {
      const monthKey = t.date.substring(0, 7); // "2024-03"
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(t);
    });
    return groups;
  }, [filteredTransactions]);

  const monthKeys = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

  const formatMoney = (amount: number) => amount.toLocaleString() + '원';
  const formatMonthTitle = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    return `${year}년 ${parseInt(month)}월`;
  };

  return (
    <div className="pb-10">
      <h2 className="text-2xl font-bold mb-6">전체 내역</h2>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 sticky top-0 bg-[#F2F4F6] py-2 z-10">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            filterType === 'ALL' ? 'bg-[#3182F6] text-white' : 'bg-white text-gray-500 border border-gray-200'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setFilterType('GIVEN')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            filterType === 'GIVEN' ? 'bg-[#3182F6] text-white' : 'bg-white text-gray-500 border border-gray-200'
          }`}
        >
          낸 돈 (지출)
        </button>
        <button
          onClick={() => setFilterType('RECEIVED')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            filterType === 'RECEIVED' ? 'bg-[#3182F6] text-white' : 'bg-white text-gray-500 border border-gray-200'
          }`}
        >
          받은 돈 (수입)
        </button>
      </div>

      {/* Transaction List */}
      <div className="space-y-6">
        {monthKeys.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            내역이 없습니다.
          </div>
        ) : (
          monthKeys.map((month) => (
            <div key={month}>
              <h3 className="text-sm font-bold text-gray-500 mb-3 px-1">{formatMonthTitle(month)}</h3>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {groupedTransactions[month].map((t, index) => (
                  <div 
                    key={t.id} 
                    className={`flex justify-between items-start p-5 hover:bg-gray-50 transition-colors ${
                      index !== groupedTransactions[month].length - 1 ? 'border-b border-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl shrink-0 mt-1">
                        {getEventIcon(t)}
                      </div>
                      <div>
                        <div className="font-bold text-[#333D4B] text-lg">
                          {t.name}
                          <span className="text-sm font-normal text-gray-400 ml-2">{t.relation}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {t.date.substring(8, 10)}일 · {getEventLabel(t)} {t.location ? `· ${t.location}` : ''}
                        </div>
                        
                        {/* Tags for Cheongmo Hosted */}
                        {t.type === 'CHEONGMO_HOSTED' && (
                            <div className="inline-flex items-center px-2 py-0.5 mt-2 rounded text-[10px] font-medium bg-purple-50 text-purple-600">
                                👥 {t.guestCount}명 참석
                            </div>
                        )}

                        {/* Cheongmo Attendance Details Badge */}
                        {t.attendedCheongmo && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600">
                                    🥂 청모 참석 ({getPriceRangeLabel(t.cheongmoPriceRange)})
                                </span>
                                {t.givenCheongmoGift && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-pink-50 text-pink-600">
                                        🎁 선물 전달
                                    </span>
                                )}
                            </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                       <div className={`font-bold text-lg ${t.type === 'RECEIVED' ? 'text-[#0064FF]' : 'text-[#191F28]'}`}>
                        {t.type === 'RECEIVED' ? '+' : ''}{formatMoney(t.amount)}
                      </div>
                      {/* Show 'Meal' info only for simple GIVEN types, not hosted */}
                      {t.hasMeal !== undefined && t.type === 'GIVEN' && (
                          <div className="text-xs text-gray-400 mt-1">
                              {t.hasMeal ? '식사 함 🍽️' : '식사 안함'}
                          </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPage;