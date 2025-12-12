import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen text-[#191F28] overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-screen-lg mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold text-[#0064FF] flex items-center gap-1">
            <span>🤝</span> 품앗이
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-[#3182F6] hover:bg-[#1B64DA] text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors"
          >
            시작하기
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 animate-fade-in-up">
          오고 간 마음의 기록,<br />
          <span className="text-[#0064FF]">품앗이</span>가 함께합니다
        </h1>
        <p className="text-gray-500 text-lg md:text-xl mb-10 leading-relaxed animate-fade-in-up delay-100">
            결혼식, 장례식, 돌잔치... 잊기 쉬운 경조사비.<br/>
            내가 낸 돈과 받은 돈을 가장 투명하게 관리하세요.
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-[#3182F6] hover:bg-[#1B64DA] text-white text-lg font-bold px-8 py-4 rounded-2xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-95 animate-fade-in-up delay-200"
        >
          품앗이 시작하기
        </button>
        
        {/* Abstract UI Mockup - Comparison */}
        <div className="mt-16 mx-auto max-w-sm md:max-w-lg bg-[#F2F4F6] rounded-3xl p-6 md:p-8 animate-fade-in-up delay-300 shadow-xl border border-gray-100">
            <div className="bg-white rounded-2xl p-5 shadow-sm text-left mb-4 flex justify-between items-center">
                <div>
                    <div className="text-xs text-gray-400 mb-1">내가 낸 경조사비</div>
                    <div className="text-xl font-bold text-[#191F28]">3,200,000원</div>
                </div>
                <div className="bg-blue-100 text-blue-500 p-2 rounded-full">📤</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm text-left flex justify-between items-center">
                <div>
                    <div className="text-xs text-gray-400 mb-1">돌려 받은 돈 (회수)</div>
                    <div className="text-xl font-bold text-[#0064FF]">5,400,000원</div>
                </div>
                <div className="bg-blue-50 text-blue-500 p-2 rounded-full">📥</div>
            </div>
            <div className="mt-4 flex justify-center">
                <span className="text-xs text-gray-400 bg-gray-200 px-3 py-1 rounded-full">
                    품앗이 정산 완료 +220만원
                </span>
            </div>
        </div>
      </section>

      {/* Feature 1: Easy Recording */}
      <section className="py-24 bg-[#F9FAFB] px-6">
        <div className="max-w-screen-lg mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
                <div className="inline-block bg-blue-100 text-[#0064FF] px-3 py-1 rounded-full text-sm font-bold mb-4">
                    간편 지출 기록
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                    봉투 넣기 전에<br/>
                    <span className="text-gray-400">3초면 기록 끝</span>
                </h2>
                <p className="text-gray-500 text-lg">
                    결혼식장에서, 장례식장에서.<br/>
                    이름과 금액만 입력하면 언제 어디서든 내 마음을 기록할 수 있어요.
                </p>
            </div>
            <div className="flex-1 bg-white p-6 rounded-3xl shadow-lg border border-gray-100 max-w-sm w-full mx-auto">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between p-3 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">💍</span>
                            <div>
                                <div className="font-bold">김철수 결혼식</div>
                                <div className="text-xs text-gray-400">친구 · 식사O</div>
                            </div>
                        </div>
                        <div className="font-bold">100,000원</div>
                    </div>
                    <div className="flex items-center justify-between p-3 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🕯️</span>
                            <div>
                                <div className="font-bold">이영희 부친상</div>
                                <div className="text-xs text-gray-400">직장동료</div>
                            </div>
                        </div>
                        <div className="font-bold">50,000원</div>
                    </div>
                    <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🎂</span>
                            <div>
                                <div className="font-bold">박민수 돌잔치</div>
                                <div className="text-xs text-gray-400">사촌</div>
                            </div>
                        </div>
                        <div className="font-bold">100,000원</div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Feature 2: Wedding Special */}
      <section className="py-24 px-6">
        <div className="max-w-screen-lg mx-auto flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1 text-center md:text-left">
                <div className="inline-block bg-pink-100 text-pink-500 px-3 py-1 rounded-full text-sm font-bold mb-4">
                    예비 신혼부부 전용
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                    받은 축의금 정산도<br/>
                    <span className="text-gray-400">AI가 알아서 척척</span>
                </h2>
                <p className="text-gray-500 text-lg">
                    정신없는 결혼식 당일, 방명록 사진만 찍어두세요.<br/>
                    AI가 하객 명단과 금액을 자동으로 엑셀처럼 정리해드립니다.<br/>
                    <span className="text-sm text-gray-400 mt-2 block">* 청첩장 모임 비용 관리 기능 포함</span>
                </p>
            </div>
            <div className="flex-1 relative">
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 max-w-sm w-full mx-auto relative z-10">
                     <div className="space-y-4">
                        <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center text-gray-400 mb-4">
                            📸 방명록 이미지
                        </div>
                        <div className="animate-pulse space-y-2">
                             <div className="h-4 bg-blue-100 rounded w-3/4"></div>
                             <div className="h-4 bg-blue-100 rounded w-1/2"></div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center border border-blue-100">
                             <div className="text-sm font-bold text-blue-600">김하객</div>
                             <div className="text-sm font-bold text-blue-600">50,000원</div>
                        </div>
                     </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-10 -right-4 w-20 h-20 bg-pink-200 rounded-full blur-2xl opacity-50 z-0"></div>
                <div className="absolute bottom-10 -left-4 w-20 h-20 bg-blue-200 rounded-full blur-2xl opacity-50 z-0"></div>
            </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 text-center bg-[#F2F4F6]">
        <h2 className="text-3xl font-bold mb-8 text-[#191F28]">
            가는 정 오는 정, 이제 헷갈리지 마세요
        </h2>
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-[#3182F6] hover:bg-[#1B64DA] text-white text-lg font-bold px-12 py-4 rounded-2xl shadow-lg transition-colors"
        >
          품앗이 시작하기
        </button>
        <div className="mt-8 text-xs text-gray-400">
            © 2024 Pumasi. All rights reserved.
        </div>
      </section>
    </div>
  );
};

export default LandingPage;