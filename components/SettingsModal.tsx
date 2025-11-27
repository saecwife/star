import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  onClose: () => void;
  onKeyUpdate: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onKeyUpdate }) => {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    // Check if key exists
    const key = localStorage.getItem('user_gemini_api_key');
    if (key) {
      setSavedKey(key);
      setApiKey(key);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem('user_gemini_api_key', apiKey.trim());
    setSavedKey(apiKey.trim());
    onKeyUpdate();
    onClose();
  };

  const handleRemove = () => {
    localStorage.removeItem('user_gemini_api_key');
    setSavedKey(null);
    setApiKey('');
    onKeyUpdate();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">設定 Settings</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-900">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Gemini API Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your API key here..."
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                輸入您自己的 API Key 以避免消耗創作者的額度。您的 Key 僅會儲存在此瀏覽器中，不會上傳伺服器。
              </p>
              <a 
                href="https://aistudiogoogle.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center mt-1 text-xs text-blue-600 hover:underline"
              >
                取得免費 API Key <span className="material-symbols-outlined text-[10px] ml-0.5">open_in_new</span>
              </a>
            </div>

            {savedKey ? (
              <div className="flex items-center justify-between p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  <span>已設定自訂金鑰</span>
                </div>
                <button 
                  onClick={handleRemove}
                  className="text-xs font-semibold hover:text-green-900 underline"
                >
                  移除
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-gray-50 text-gray-500 rounded-lg text-sm border border-gray-100">
                 <span className="material-symbols-outlined text-lg">info</span>
                 <span>目前使用系統預設金鑰</span>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors shadow-sm"
            >
              儲存設定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};