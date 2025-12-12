import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Transaction, Cheongmo, RelationType, EventType } from '../types';

interface RecordPageProps {
  onAddTransaction: (t: Transaction) => void;
  onAddCheongmo: (c: Cheongmo) => void;
}

const RecordPage: React.FC<RecordPageProps> = ({ onAddTransaction, onAddCheongmo }) => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'given' | 'cheongmo'>('given');

  // Input States
  const [eventType, setEventType] = useState<EventType>('WEDDING');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [relation, setRelation] = useState<RelationType>('FRIEND');
  const [location, setLocation] = useState('');
  const [hasMeal, setHasMeal] = useState(true);
  const [memo, setMemo] = useState('');
  
  // Cheongmo Attendance Details (For Given)
  const [attendedCheongmo, setAttendedCheongmo] = useState(false);
  const [cheongmoPriceRange, setCheongmoPriceRange] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [givenCheongmoGift, setGivenCheongmoGift] = useState(false);

  // Hosted Cheongmo specific
  const [guestCount, setGuestCount] = useState('');
  const [attendees, setAttendees] = useState('');

  const RELATION_CHIPS: { label: string; value: RelationType }[] = [
    { label: '친구/지인', value: 'FRIEND' },
    { label: '직장동료', value: 'COLLEAGUE' },
    { label: '친척/가족', value: 'FAMILY' },
    { label: '기타', value: 'OTHER' },
  ];

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'given' || tab === 'cheongmo') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount.replace(/,/g, ''), 10);
    
    if (activeTab === 'cheongmo') {
      const newCheongmo: Cheongmo = {
        id: Date.now().toString(),
        name,
        date,
        location,
        totalCost: numAmount,
        guestCount: parseInt(guestCount || '0', 10),
        memo,
        attendees
      };
      onAddCheongmo(newCheongmo);
      alert('청모 지출이 기록되었습니다! 🥂');
    } else {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'GIVEN', // Always GIVEN in this page
        eventType,
        name,
        relation,
        amount: numAmount,
        date,
        location,
        hasMeal,
        memo,
        // Only include cheongmo details if it's a Wedding and Given
        attendedCheongmo: (eventType === 'WEDDING') ? attendedCheongmo : undefined,
        cheongmoPriceRange: (eventType === 'WEDDING' && attendedCheongmo) ? cheongmoPriceRange : undefined,
        givenCheongmoGift: (eventType === 'WEDDING' && attendedCheongmo) ? givenCheongmoGift : undefined,
      };
      onAddTransaction(newTransaction);
      alert('경조사비 지출이 기록되었습니다! 💸');
    }

    // Reset fields partially to allow continuous entry
    setName('');
    setAmount('');
    setMemo('');
    setAttendees('');
  };

  const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 py-4 text-sm font-bold rounded-xl transition-all ${
        activeTab === id 
          ? 'bg-[#3182F6] text-white shadow-md' 
          : 'bg-white text-gray-500 hover:bg-gray-50'
      }`}
    >
      <span className="mr-1 text-lg">{icon}</span> {label}
    </button>
  );

  // Calculation for Cheongmo per person cost
  const perPersonCost = activeTab === 'cheongmo' && amount && guestCount && parseInt(guestCount) > 0
    ? Math.round(parseInt(amount.replace(/,/g, ''), 10) / parseInt(guestCount))
    : 0;

  return (
    <div className="pb-10">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-[#191F28]">지출 기록</h2>
        <p className="text-sm text-gray-400 mt-1">내가 낸 경조사비와 모임 비용을 기록합니다.</p>
      </header>
      
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-200 rounded-2xl mb-6">
        <TabButton id="given" label="경조사비 내기" icon="✉️" />
        <TabButton id="cheongmo" label="청모 쏘기" icon="🥂" />
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Event Type Selector - Only for Given */}
          {activeTab === 'given' && (
              <div className="grid grid-cols-4 gap-2">
                  {[
                      { val: 'WEDDING', label: '결혼식', icon: '💍' },
                      { val: 'FUNERAL', label: '장례식', icon: '🕯️' },
                      { val: 'FIRST_BIRTHDAY', label: '돌잔치', icon: '🎂' },
                      { val: 'OTHER', label: '기타', icon: '🎉' },
                  ].map((opt) => (
                      <button
                          key={opt.val}
                          type="button"
                          onClick={() => setEventType(opt.val as EventType)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                              eventType === opt.val
                                  ? 'bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                          }`}
                      >
                          <span className="text-xl mb-1">{opt.icon}</span>
                          <span className="text-[10px] font-bold">{opt.label}</span>
                      </button>
                  ))}
              </div>
          )}

          {/* Core Inputs */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              {activeTab === 'cheongmo' ? '모임 이름' : '상대방 이름'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={activeTab === 'cheongmo' ? '고등학교 동창 청모' : '이름 입력'}
              className="w-full text-lg border-b-2 border-gray-100 focus:border-[#3182F6] outline-none py-2 bg-transparent transition-colors placeholder-gray-300"
            />
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 mb-1">
               {activeTab === 'cheongmo' ? '총 지출 금액' : '금액'}
             </label>
             <div className="relative">
                <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full text-2xl font-bold border-b-2 border-gray-100 focus:border-[#3182F6] outline-none py-2 bg-transparent transition-colors placeholder-gray-300"
                />
                <span className="absolute right-0 bottom-3 text-lg font-bold text-gray-400">원</span>
             </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">날짜</label>
                <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border-b-2 border-gray-100 focus:border-[#3182F6] outline-none py-2 bg-transparent text-gray-800 text-sm"
                />
            </div>
            
            {/* Relation or Guest Count depending on tab */}
            {activeTab === 'given' ? (
                <div>
                     <label className="block text-xs font-bold text-gray-500 mb-2">관계</label>
                     <div className="flex flex-wrap gap-2">
                        {RELATION_CHIPS.map((chip) => (
                            <button
                                key={chip.value}
                                type="button"
                                onClick={() => setRelation(chip.value)}
                                className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                    relation === chip.value
                                        ? 'bg-[#3182F6] border-[#3182F6] text-white shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {chip.label}
                            </button>
                        ))}
                     </div>
                </div>
            ) : (
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">참석 인원</label>
                    <input
                        type="number"
                        value={guestCount}
                        onChange={(e) => setGuestCount(e.target.value)}
                        placeholder="N명"
                        className="w-full border-b-2 border-gray-100 focus:border-[#3182F6] outline-none py-2 bg-transparent text-sm"
                    />
                </div>
            )}
          </div>

          {/* Hosted Cheongmo Extras */}
          {activeTab === 'cheongmo' && (
             <>
                {perPersonCost > 0 && (
                   <div className="bg-blue-50 p-3 rounded-xl flex items-center justify-between text-[#0064FF] text-sm">
                      <span className="font-bold">1인당 예상 단가</span>
                      <span className="font-bold text-lg">{perPersonCost.toLocaleString()}원</span>
                   </div>
                )}
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">참석자 명단 (선택)</label>
                    <input
                        type="text"
                        value={attendees}
                        onChange={(e) => setAttendees(e.target.value)}
                        placeholder="예: 김철수, 이영희, 박민수"
                        className="w-full border-b-2 border-gray-100 focus:border-[#3182F6] outline-none py-2 bg-transparent text-sm placeholder-gray-300"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">쉼표(,)로 구분해서 입력해주세요.</p>
                </div>
             </>
          )}

          {/* Additional Options */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">장소 (선택)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예: 더채플 앳 청담"
              className="w-full border-b-2 border-gray-100 focus:border-[#3182F6] outline-none py-2 bg-transparent text-sm"
            />
          </div>

          {/* Cheongmo Attendance (For GIVEN + WEDDING) */}
          {activeTab === 'given' && eventType === 'WEDDING' && (
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4 animate-fade-in-up">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#191F28]">청첩장 모임에 다녀왔나요?</span>
                    <button
                        type="button"
                        onClick={() => setAttendedCheongmo(!attendedCheongmo)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${attendedCheongmo ? 'bg-[#3182F6]' : 'bg-gray-300'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${attendedCheongmo ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                {attendedCheongmo && (
                    <div className="space-y-4 pt-2 border-t border-gray-200">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">대접받은 식사 가격대</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { val: 'LOW', label: '1~3만원', sub: '가벼운 식사' },
                                    { val: 'MEDIUM', label: '3~5만원', sub: '정성스런 식사' },
                                    { val: 'HIGH', label: '5만원~', sub: '고급 식사' },
                                ].map((opt) => (
                                    <button
                                        key={opt.val}
                                        type="button"
                                        onClick={() => setCheongmoPriceRange(opt.val as any)}
                                        className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                                            cheongmoPriceRange === opt.val
                                                ? 'bg-blue-50 border-blue-500 text-blue-600'
                                                : 'bg-white border-gray-200 text-gray-500'
                                        }`}
                                    >
                                        <span className="text-xs font-bold">{opt.label}</span>
                                        <span className="text-[9px] opacity-70">{opt.sub}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setGivenCheongmoGift(!givenCheongmoGift)}>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${givenCheongmoGift ? 'bg-pink-500 border-pink-500 text-white' : 'bg-white border-gray-300'}`}>
                                {givenCheongmoGift && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <span className="text-sm text-gray-700">따로 선물도 줬어요 🎁</span>
                        </div>
                    </div>
                )}
             </div>
          )}

          {activeTab === 'given' && (
             <div className="flex items-center gap-3 py-2">
                <button
                    type="button"
                    onClick={() => setHasMeal(!hasMeal)}
                    className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${hasMeal ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 bg-white'}`}
                >
                    {hasMeal && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </button>
                <span className="text-sm text-gray-700" onClick={() => setHasMeal(!hasMeal)}>결혼식장 식사 했어요 🍽️</span>
             </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#3182F6] text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-blue-200 active:scale-95 transition-transform"
          >
            기록 완료
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecordPage;