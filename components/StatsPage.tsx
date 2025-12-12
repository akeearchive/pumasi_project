import React, { useState, useMemo } from 'react';
import { Transaction, Cheongmo, TargetType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Legend, YAxis, CartesianGrid } from 'recharts';

interface StatsPageProps {
  transactions: Transaction[];
  cheongmos: Cheongmo[];
}

const COLORS = ['#3182F6', '#EA2A6A', '#FFBB28', '#FF8042', '#82ca9d'];
const TARGET_COLORS: Record<string, string> = {
    'GROOM': '#3182F6', // Blue
    'BRIDE': '#EA2A6A', // Pink
    'GROOM_FAMILY': '#90C2FF', // Light Blue
    'BRIDE_FAMILY': '#FFB0C8', // Light Pink
    'OTHER': '#E5E8EB'
};

const StatsPage: React.FC<StatsPageProps> = ({ transactions, cheongmos }) => {
  const [activeTab, setActiveTab] = useState<'SPENDING' | 'INCOME'>('SPENDING');

  // --- Spending Data Logic (Tab 1) ---
  const givenTransactions = transactions.filter(t => t.type === 'GIVEN');
  
  const relationData = useMemo(() => [
    { name: '친구', value: givenTransactions.filter(t => t.relation === 'FRIEND').reduce((acc, cur) => acc + cur.amount, 0) },
    { name: '가족', value: givenTransactions.filter(t => t.relation === 'FAMILY').reduce((acc, cur) => acc + cur.amount, 0) },
    { name: '동료', value: givenTransactions.filter(t => t.relation === 'COLLEAGUE').reduce((acc, cur) => acc + cur.amount, 0) },
    { name: '기타', value: givenTransactions.filter(t => t.relation === 'OTHER').reduce((acc, cur) => acc + cur.amount, 0) },
  ].filter(d => d.value > 0), [givenTransactions]);

  const monthlySpendingData = useMemo(() => {
    const map: {[key: string]: number} = {};
    givenTransactions.forEach(t => {
        const month = t.date.substring(5, 7) + '월';
        map[month] = (map[month] || 0) + t.amount;
    });
    return Object.keys(map).map(k => ({ name: k, amount: map[k] })).sort((a,b) => a.name.localeCompare(b.name));
  }, [givenTransactions]);


  // --- Income/Settlement Data Logic (Tab 2) ---
  const receivedTransactions = transactions.filter(t => t.type === 'RECEIVED');
  const totalReceived = receivedTransactions.reduce((acc, cur) => acc + cur.amount, 0);
  const totalCheongmoCost = cheongmos.reduce((acc, cur) => acc + cur.totalCost, 0);
  const netIncome = totalReceived - totalCheongmoCost;
  const avgIncome = receivedTransactions.length > 0 ? Math.round(totalReceived / receivedTransactions.length) : 0;
  
  // Meal Ratio
  const totalMealGuests = receivedTransactions.filter(t => t.hasMeal).length;
  const mealRatio = receivedTransactions.length > 0 ? Math.round((totalMealGuests / receivedTransactions.length) * 100) : 0;

  // Target Analysis (Groom vs Bride)
  const targetData = useMemo(() => {
      const groups: {[key: string]: number} = { 'GROOM': 0, 'BRIDE': 0, 'GROOM_FAMILY': 0, 'BRIDE_FAMILY': 0, 'OTHER': 0 };
      receivedTransactions.forEach(t => {
          const key = t.target || 'OTHER';
          groups[key] = (groups[key] || 0) + t.amount;
      });
      
      return Object.keys(groups)
        .filter(k => groups[k] > 0)
        .map(k => {
            let label = '기타';
            if (k === 'GROOM') label = '신랑';
            if (k === 'BRIDE') label = '신부';
            if (k === 'GROOM_FAMILY') label = '신랑 혼주';
            if (k === 'BRIDE_FAMILY') label = '신부 혼주';
            return { name: label, value: groups[k], key: k };
        });
  }, [receivedTransactions]);

  // Relation Analysis (Bar Chart)
  const incomeByRelation = useMemo(() => {
      const groups: {[key: string]: {amount: number, count: number}} = { 'FRIEND': {amount:0, count:0}, 'COLLEAGUE': {amount:0, count:0}, 'FAMILY': {amount:0, count:0}, 'OTHER': {amount:0, count:0} };
      receivedTransactions.forEach(t => {
          const rel = t.relation;
          groups[rel].amount += t.amount;
          groups[rel].count += 1;
      });
      return [
          { name: '친구', amount: groups['FRIEND'].amount, count: groups['FRIEND'].count },
          { name: '동료', amount: groups['COLLEAGUE'].amount, count: groups['COLLEAGUE'].count },
          { name: '가족', amount: groups['FAMILY'].amount, count: groups['FAMILY'].count },
          { name: '기타', amount: groups['OTHER'].amount, count: groups['OTHER'].count },
      ].filter(d => d.amount > 0);
  }, [receivedTransactions]);

  // VIP List (Top 5)
  const vipList = useMemo(() => {
      return [...receivedTransactions].sort((a,b) => b.amount - a.amount).slice(0, 5);
  }, [receivedTransactions]);

  // Pumasi Match Logic (Did they give me? Did I give them?)
  const matchAnalysis = useMemo(() => {
    // Find people who are in both lists (Match by Name - Simple string match)
    // In a real app, this should match by phone number or ID.
    const matches: {name: string, given: number, received: number}[] = [];
    const receivedMap = new Map<string, number>();
    
    receivedTransactions.forEach(t => {
        receivedMap.set(t.name, (receivedMap.get(t.name) || 0) + t.amount);
    });

    // Check against GIVEN list
    const processedNames = new Set<string>();
    givenTransactions.forEach(t => {
        if (receivedMap.has(t.name) && !processedNames.has(t.name)) {
            matches.push({
                name: t.name,
                given: t.amount,
                received: receivedMap.get(t.name) || 0
            });
            processedNames.add(t.name);
        }
    });

    return matches;
  }, [givenTransactions, receivedTransactions]);

  const formatMoney = (val: number) => val.toLocaleString();

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">분석 리포트</h2>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <button 
            onClick={() => setActiveTab('SPENDING')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'SPENDING' ? 'bg-[#191F28] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            💸 지출 분석
          </button>
          <button 
            onClick={() => setActiveTab('INCOME')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'INCOME' ? 'bg-[#3182F6] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            💰 수입 정산
          </button>
      </div>

      {/* --- Tab 1: SPENDING CONTENT --- */}
      {activeTab === 'SPENDING' && (
          <div className="space-y-6 animate-fade-in-up">
              {/* Card 1: By Relation */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 text-[#333D4B]">누구에게 많이 냈을까?</h3>
                {relationData.length > 0 ? (
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={relationData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {relationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} />
                        <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                ) : (
                    <div className="h-40 flex items-center justify-center text-gray-400">데이터가 없습니다</div>
                )}
              </div>

              {/* Card 2: Monthly Trend */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 text-[#333D4B]">월별 지출 흐름</h3>
                {monthlySpendingData.length > 0 ? (
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlySpendingData}>
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            formatter={(value: number) => `${value.toLocaleString()}원`}
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                        />
                        <Bar dataKey="amount" fill="#90C2FF" radius={[4, 4, 0, 0]} barSize={24} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
                ) : (
                    <div className="h-40 flex items-center justify-center text-gray-400">데이터가 없습니다</div>
                )}
              </div>

              {/* Card 3: Top Cheongmo */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 text-[#333D4B]">가장 비쌌던 청모 Top 3</h3>
                {cheongmos.length > 0 ? (
                    <ul className="space-y-4">
                        {cheongmos.sort((a, b) => b.totalCost - a.totalCost).slice(0, 3).map((c, idx) => (
                            <li key={c.id} className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className={`text-lg font-bold w-4 ${idx === 0 ? 'text-[#3182F6]' : 'text-gray-300'}`}>{idx + 1}</span>
                                    <div>
                                        <div className="font-bold text-[#333D4B]">{c.name}</div>
                                        <div className="text-xs text-gray-400">{c.date}</div>
                                    </div>
                                </div>
                                <div className="font-bold text-[#333D4B]">{c.totalCost.toLocaleString()}원</div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center text-gray-400 py-4">기록된 청모가 없습니다</div>
                )}
            </div>
          </div>
      )}

      {/* --- Tab 2: INCOME/SETTLEMENT CONTENT --- */}
      {activeTab === 'INCOME' && (
          <div className="space-y-6 animate-fade-in-up">
              {receivedTransactions.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
                      <div className="text-4xl mb-4">😶</div>
                      <p className="text-gray-500 font-bold mb-2">아직 정산된 수입이 없어요.</p>
                      <p className="text-sm text-gray-400">수입·정산 탭에서 축의금 명단을 등록해보세요!</p>
                  </div>
              ) : (
                  <>
                    {/* 1. Summary Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 bg-[#191F28] rounded-3xl p-6 text-white shadow-lg">
                            <div className="text-sm text-gray-400 mb-1">총 축의금 수입</div>
                            <div className="text-3xl font-bold">{formatMoney(totalReceived)}원</div>
                            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                                <span className="text-sm text-gray-300">청모 지출 차감 순수익</span>
                                <span className="font-bold text-[#3182F6] text-xl">+{formatMoney(netIncome)}원</span>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <div className="text-xs text-gray-400 mb-1">1인 평균 축의금</div>
                            <div className="text-lg font-bold text-[#333D4B]">{formatMoney(avgIncome)}원</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <div className="text-xs text-gray-400 mb-1">식권 회수율</div>
                            <div className="text-lg font-bold text-[#333D4B]">{mealRatio}%</div>
                            <div className="text-[10px] text-gray-400">{totalMealGuests}명 식사</div>
                        </div>
                    </div>

                    {/* 2. Target Analysis (Groom vs Bride) */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold mb-4 text-[#333D4B]">어느 쪽 손님이 많았을까?</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                <Pie
                                    data={targetData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {targetData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={TARGET_COLORS[entry.key] || '#E5E8EB'} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} />
                                <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-center text-xs text-gray-400">
                            * 명단 등록 시 '대상'을 기준으로 분류됩니다.
                        </div>
                    </div>

                    {/* 3. Relation Analysis */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold mb-4 text-[#333D4B]">관계별 수입 현황</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={incomeByRelation} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E8EB" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={40} tick={{fontSize: 12}} />
                                <Tooltip 
                                    formatter={(value: number) => `${value.toLocaleString()}원`}
                                    cursor={{fill: 'transparent'}}
                                />
                                <Bar dataKey="amount" fill="#3182F6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                             {incomeByRelation.map(item => (
                                 <div key={item.name} className="bg-gray-50 rounded-lg py-2">
                                     <div className="text-xs text-gray-400">{item.name}</div>
                                     <div className="text-xs font-bold">{item.count}명</div>
                                 </div>
                             ))}
                        </div>
                    </div>

                    {/* 4. VIP List */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-[#333D4B]">👑 고액 축의금 Top 5</h3>
                            <span className="text-xs text-gray-400">감사 인사 필수!</span>
                        </div>
                        <ul className="space-y-4">
                            {vipList.map((t, idx) => (
                                <li key={t.id} className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-lg font-bold w-5 text-center ${idx < 3 ? 'text-yellow-500' : 'text-gray-300'}`}>{idx + 1}</span>
                                        <div>
                                            <div className="font-bold text-[#333D4B]">
                                                {t.name} <span className="text-xs font-normal text-gray-400">{t.relation}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-400">{t.target === 'GROOM' ? '신랑측' : t.target === 'BRIDE' ? '신부측' : ''}</div>
                                        </div>
                                    </div>
                                    <div className="font-bold text-[#191F28]">{formatMoney(t.amount)}원</div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 5. Pumasi Match Analysis (Return Match) */}
                    {matchAnalysis.length > 0 && (
                        <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-6 shadow-sm border border-blue-100">
                            <h3 className="text-lg font-bold mb-2 text-[#0064FF]">🤝 품앗이 매칭 (Return Match)</h3>
                            <p className="text-xs text-gray-500 mb-4">내가 냈던 돈과 이번에 받은 돈을 비교합니다. (이름 일치 기준)</p>
                            
                            <div className="space-y-3">
                                {matchAnalysis.slice(0, 5).map((m, i) => (
                                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                                        <div className="font-bold text-[#333D4B]">{m.name}</div>
                                        <div className="text-right text-xs">
                                            <div className="text-gray-400">내가 냄: {formatMoney(m.given)}</div>
                                            <div className="text-[#0064FF] font-bold">내가 받음: {formatMoney(m.received)}</div>
                                            <div className="mt-1 font-bold text-gray-600">
                                                차액: {m.received - m.given > 0 ? '+' : ''}{formatMoney(m.received - m.given)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                  </>
              )}
          </div>
      )}
    </div>
  );
};

export default StatsPage;