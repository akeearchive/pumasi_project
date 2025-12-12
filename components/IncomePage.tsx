import React, { useState, useRef } from 'react';
import { Transaction, RelationType, EventType, TargetType } from '../types';
import { parseGuestListImage } from '../services/geminiService';

interface IncomePageProps {
  onAddTransaction: (t: Transaction) => void;
}

const IncomePage: React.FC<IncomePageProps> = ({ onAddTransaction }) => {
  const [eventType, setEventType] = useState<EventType>('WEDDING');
  
  // Manual Input States
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [relation, setRelation] = useState<RelationType>('FRIEND');
  const [target, setTarget] = useState<TargetType>('GROOM'); // Default to Groom
  const [memo, setMemo] = useState('');
  
  // AI Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const RELATION_CHIPS: { label: string; value: RelationType }[] = [
    { label: '친구/지인', value: 'FRIEND' },
    { label: '직장동료', value: 'COLLEAGUE' },
    { label: '친척/가족', value: 'FAMILY' },
    { label: '기타', value: 'OTHER' },
  ];

  const TARGET_CHIPS: { label: string; value: TargetType }[] = [
    { label: '신랑', value: 'GROOM' },
    { label: '신부', value: 'BRIDE' },
    { label: '신랑 혼주', value: 'GROOM_FAMILY' },
    { label: '신부 혼주', value: 'BRIDE_FAMILY' },
  ];

  const handleDownloadTemplate = () => {
    // CSV content with BOM for Korean characters support in Excel
    const headers = "순번,관계(친구/지인|직장동료|친척/가족|기타),대상(신랑|신부|신랑혼주|신부혼주),이름,금액,식권갯수,비고\n";
    const example1 = "1,친구/지인,신랑,홍길동,50000,1,결혼 축하해!\n";
    const example2 = "2,친척/가족,신부,김철수,100000,2,행복하세요\n";
    const example3 = "3,직장동료,본인,이부장,100000,1,축하하네";
    const csvContent = headers + example1 + example2 + example3;
    
    // 0xEF, 0xBB, 0xBF is the BOM for UTF-8
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `품앗이_${eventType}_명단_양식.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const results = await parseGuestListImage(base64);
        
        let count = 0;
        const currentEventType = eventType; 
        const currentDate = date;

        results.forEach(item => {
           // Basic target mapping from AI logic (Mock for now, would need AI prompt update to support target parsing fully)
           // Defaulting to currently selected target or parsing if AI provides it.
           // For now, let's assume mass upload goes to the default selected 'Target' state unless user splits files.
           onAddTransaction({
               id: Date.now().toString() + Math.random(),
               type: 'RECEIVED',
               eventType: currentEventType,
               name: item.name,
               amount: item.amount,
               relation: (item.relation as RelationType) || 'FRIEND',
               target: target, // Assign currently selected target for bulk upload context
               date: currentDate,
               hasMeal: item.hasMeal,
               memo: item.memo || 'AI 자동 인식'
           });
           count++;
        });
        alert(`${count}건의 내역이 입력되었습니다.\n선택하신 대상(${TARGET_CHIPS.find(t=>t.value===target)?.label})의 명단으로 저장했습니다.`);
      } catch (err) {
        alert('파일 분석 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount.replace(/,/g, ''), 10);
    
    onAddTransaction({
      id: Date.now().toString(),
      type: 'RECEIVED',
      eventType,
      name,
      relation,
      target,
      amount: numAmount,
      date,
      memo: memo || '수동 입력',
      hasMeal: false
    });
    
    setName('');
    setAmount('');
    setMemo('');
    alert('수입이 기록되었습니다. 💰');
  };

  return (
    <div className="pb-10">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-[#191F28]">수입 정산소</h2>
        <p className="text-sm text-gray-400 mt-1">결혼식, 장례식 등 큰 행사 수입을 체계적으로 정리하세요.</p>
      </header>

      {/* 1. Event Selector */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-3">어떤 행사를 정산하시나요?</label>
        <div className="grid grid-cols-4 gap-2">
            {[
                { val: 'WEDDING', label: '결혼식', icon: '💍' },
                { val: 'FUNERAL', label: '장례식', icon: '🕯️' },
                { val: 'FIRST_BIRTHDAY', label: '돌잔치', icon: '🎂' },
                { val: 'OTHER', label: '기타', icon: '🎉' },
            ].map((opt) => (
                <button
                    key={opt.val}
                    onClick={() => setEventType(opt.val as EventType)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        eventType === opt.val
                            ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm'
                            : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                    }`}
                >
                    <span className="text-2xl mb-1">{opt.icon}</span>
                    <span className="text-xs font-bold">{opt.label}</span>
                </button>
            ))}
        </div>
      </div>

      {/* 2. Bulk Upload Section */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-6 shadow-sm border border-blue-100 mb-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-[#0064FF] flex items-center gap-2">
                📂 대량 등록 (엑셀/AI)
            </h3>
            <span className="bg-white text-[10px] px-2 py-0.5 rounded border border-blue-200 text-blue-500 font-bold">Best</span>
        </div>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            엑셀 명단을 올리거나, 방명록 사진을 찍어 올리세요.<br/>
            AI가 자동으로 이름을 읽어 정리해줍니다.
        </p>

        {/* Target Selection for Bulk Upload */}
        <div className="mb-4">
             <label className="block text-xs font-bold text-gray-500 mb-2">누구의 손님인가요?</label>
             <div className="flex flex-wrap gap-2">
                {TARGET_CHIPS.map((chip) => (
                    <button
                        key={chip.value}
                        onClick={() => setTarget(chip.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                            target === chip.value
                                ? 'bg-pink-50 border-pink-500 text-pink-600 shadow-sm'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        {chip.label}
                    </button>
                ))}
             </div>
        </div>

        <div className="flex flex-col gap-3">
             <button 
                onClick={handleDownloadTemplate}
                className="w-full bg-white text-gray-600 font-bold py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors flex justify-center items-center gap-2"
            >
                <span>📥</span> 엑셀 양식 다운로드
            </button>
            
            <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload}
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full bg-[#3182F6] text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform flex justify-center items-center gap-2"
            >
                {isProcessing ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        분석 중입니다...
                    </>
                ) : (
                    <>
                        <span>📸</span> 명단 파일 업로드
                    </>
                )}
            </button>
        </div>
      </div>

      {/* 3. Manual Input Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-[#191F28] mb-4">✍️ 직접 입력</h3>
        <form onSubmit={handleManualSubmit} className="space-y-4">
            {/* Target Chips */}
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">대상 (누구의 손님)</label>
                <div className="flex flex-wrap gap-2">
                    {TARGET_CHIPS.map((chip) => (
                        <button
                            key={chip.value}
                            type="button"
                            onClick={() => setTarget(chip.value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                target === chip.value
                                    ? 'bg-pink-50 border-pink-500 text-pink-600 shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            {chip.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">이름</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="이름"
                        className="w-full border-b-2 border-gray-100 focus:border-[#3182F6] outline-none py-2 bg-transparent text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">금액</label>
                    <input
                        type="number"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="w-full border-b-2 border-gray-100 focus:border-[#3182F6] outline-none py-2 bg-transparent text-sm font-bold"
                    />
                </div>
            </div>
            
            {/* Relation Chips */}
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">관계</label>
                <div className="flex flex-wrap gap-2">
                    {RELATION_CHIPS.map((chip) => (
                        <button
                            key={chip.value}
                            type="button"
                            onClick={() => setRelation(chip.value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
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

            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">날짜</label>
                <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border-b-2 border-gray-100 focus:border-[#3182F6] outline-none py-2 bg-transparent text-sm"
                />
            </div>

            <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">비고</label>
                 <input
                        type="text"
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="특이사항 메모"
                        className="w-full border-b-2 border-gray-100 focus:border-[#3182F6] outline-none py-2 bg-transparent text-sm"
                    />
            </div>
            <button
                type="submit"
                className="w-full bg-gray-100 text-[#191F28] font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
            >
                추가하기
            </button>
        </form>
      </div>
    </div>
  );
};

export default IncomePage;