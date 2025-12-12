import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';
import { authService } from '../services/authService';
import { User } from '../types';

interface SettingsPageProps {
  onDataChange: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onDataChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  const handleExport = () => {
    const jsonString = storage.exportData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pumasi_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (storage.importData(content)) {
        alert('데이터가 성공적으로 복구되었습니다! ✅');
        onDataChange(); // Refresh App state
      } else {
        alert('데이터 복구에 실패했습니다. 파일 형식을 확인해주세요. ❌');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleReset = () => {
    if (window.confirm('정말로 모든 데이터를 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.')) {
      storage.resetData();
      alert('모든 데이터가 초기화되었습니다.');
      onDataChange();
    }
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      authService.logout();
      navigate('/login');
    }
  };

  return (
    <div className="pb-10">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-[#191F28]">설정</h2>
        <p className="text-sm text-gray-400 mt-1">내 정보와 데이터를 관리합니다.</p>
      </header>

      {/* User Info */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-lg font-bold text-[#333D4B] mb-4">내 정보</h3>
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                {user?.photoUrl ? (
                  <img src={user.photoUrl} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">👤</span>
                )}
            </div>
            <div>
                <div className="font-bold">{user?.name || '사용자'}</div>
                <div className="text-sm text-gray-400">{user?.email || '로그인이 필요합니다'}</div>
            </div>
            <button 
              onClick={handleLogout}
              className="ml-auto text-xs text-gray-500 font-bold bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200"
            >
                로그아웃
            </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-lg font-bold text-[#333D4B] mb-4">데이터 관리</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            서버가 없는 안전한 로컬 환경입니다.<br/>
            브라우저 캐시 삭제 시 데이터가 날아갈 수 있으니,<br/>
            주기적으로 데이터를 백업(다운로드) 해주세요.
        </p>

        <div className="space-y-3">
            <button 
                onClick={handleExport}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-xl">📤</span>
                    <div className="text-left">
                        <div className="font-bold text-[#333D4B]">데이터 백업하기</div>
                        <div className="text-xs text-gray-400">내 기록을 파일로 다운로드</div>
                    </div>
                </div>
                <span className="text-gray-300">›</span>
            </button>

            <button 
                onClick={handleImportClick}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-xl">📥</span>
                    <div className="text-left">
                        <div className="font-bold text-[#333D4B]">데이터 복구하기</div>
                        <div className="text-xs text-gray-400">백업한 파일을 불러오기</div>
                    </div>
                </div>
                <span className="text-gray-300">›</span>
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".json" 
                className="hidden" 
            />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-red-50">
        <h3 className="text-lg font-bold text-red-500 mb-4">초기화</h3>
        <button 
            onClick={handleReset}
            className="w-full text-red-500 text-sm font-bold py-3 rounded-xl border border-red-100 hover:bg-red-50 transition-colors"
        >
            모든 데이터 삭제
        </button>
      </div>
      
      <div className="mt-8 text-center">
        <div className="text-xs text-gray-300">버전 1.0.0</div>
        <div className="text-[10px] text-gray-300 mt-1">Design inspired by Toss</div>
      </div>
    </div>
  );
};

export default SettingsPage;
