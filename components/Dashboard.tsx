import React, { useMemo } from 'react';
import { Transaction, Cheongmo } from '../types';
import { Link } from 'react-router-dom';

interface DashboardProps {
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
  desc?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, cheongmos }) => {
  const totalGiven = transactions
    .filter(t => t.type === 'GIVEN')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReceived = transactions
    .filter(t => t.type === 'RECEIVED')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCheongmo = cheongmos.reduce((sum, c) => sum + c.totalCost, 0);

  // Net Asset calculation (Received - Given - Cheongmo)
  const netBalance = totalReceived - totalGiven;

  // Merge transactions and cheongmos for Recent Activity
  const recentActivity: CombinedActivity[] = useMemo(() => {
      const transList: CombinedActivity[] = transactions.map(t => ({
          id: t.id,
          type: t.type,
          eventType: t.eventType,
          name: t.name,
          relation: t.relation,
          amount: t.amount,
          date: t.date,
          location: t.location,
          desc: t.type === 'GIVEN' && t.hasMeal ? '식사 함' : undefined
      }));

      const cheongmoList: CombinedActivity[] = cheongmos.map(c => ({
          id: c.id,
          type: 'CHEONGMO_HOSTED',
          eventType: 'CHEONGMO_HOSTED',
          name: c.name,
          amount: c.totalCost,
          date: c.date,
          location: c.location,
          desc: `${c.guestCount}명 참석`
      }));

      return [...transList, ...cheongmoList]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
  }, [transactions, cheongmos]);

  const formatMoney = (amount: number) => {
    return amount.toLocaleString() + '원';
  };

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

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-[#191F28]">내 경조사 현황</h2>
      </header>

      {/* Main Asset Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-6">
             <div>
                <div className="text-gray-500 font-medium mb-1">내가 낸 경조사비</div>
                <div className="text-3xl font-bold text-[#191F28]">{formatMoney(totalGiven)}</div>
             </div>
             <Link to="/record?tab=given" className="bg-[#3182F6] text-white p-3 rounded-full shadow-md active:scale-95 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
             </Link>
        </div>

        <div className="bg-[#F9FAFB] rounded-xl p-4 flex justify-between items-center">
             <div>
                 <div className="text-xs text-gray-500 mb-1">받은 돈 (회수액)</div>
                 <div className="font-bold text-[#0064FF] text-lg">{formatMoney(totalReceived)}</div>
             </div>
             <div className="h-8 w-px bg-gray-200"></div>
             <div>
                 <div className="text-xs text-gray-500 mb-1">품앗이 잔액</div>
                 <div className={`font-bold text-lg ${netBalance >= 0 ? 'text-[#191F28]' : 'text-gray-400'}`}>
                    {netBalance > 0 ? '+' : ''}{formatMoney(netBalance)}
                 </div>
             </div>
        </div>
      </div>

      {/* Wedding/Special Mode Summary */}
      {(totalReceived > 0 || totalCheongmo > 0) && (
        <div className="bg-gradient-to-br from-pink-50 to-white rounded-3xl p-5 shadow-sm border border-pink-100">
            <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-pink-600 flex items-center gap-2">
                    <span>💍</span> 예비 신혼부부 정산
                </span>
                <Link to="/stats" className="text-xs text-pink-400 font-bold">상세보기 &gt;</Link>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-gray-600">청첩장 모임 지출</span>
                <span className="font-bold text-[#191F28]">{formatMoney(totalCheongmo)}</span>
            </div>
        </div>
      )}

      {/* Recent Activity List */}
      <div>
        <div className="flex justify-between items-center mb-4 mt-8">
            <h3 className="text-lg font-bold text-[#333D4B]">최근 기록</h3>
            <Link to="/history" className="text-sm text-gray-400 hover:text-gray-600 font-bold">전체보기</Link>
        </div>
        
        <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100">
            {recentActivity.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                    아직 기록이 없어요 😶<br/>
                    첫 경조사비를 기록해보세요!
                </div>
            ) : (
                recentActivity.map((t) => (
                    <div key={t.id} className="flex justify-between items-center p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gray-100`}>
                                {getEventIcon(t)}
                            </div>
                            <div>
                                <div className="font-bold text-[#333D4B]">
                                    {t.name} <span className="text-xs font-normal text-gray-400 ml-1">{t.relation}</span>
                                </div>
                                <div className="text-xs text-gray-400">{t.date} · {getEventLabel(t)}</div>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className={`font-bold ${t.type === 'RECEIVED' ? 'text-[#0064FF]' : 'text-[#191F28]'}`}>
                                {t.type === 'GIVEN' || t.type === 'CHEONGMO_HOSTED' ? '' : '+'}{formatMoney(t.amount)}
                            </div>
                            {t.desc && <div className="text-[10px] text-gray-400 mt-0.5">{t.desc}</div>}
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;