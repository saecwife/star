import React, { useState, useRef } from 'react';
import { generatePoseIdeas, generatePoseImage } from './services/geminiService';
import { PoseSuggestion } from './types';
import { PoseCard } from './components/PoseCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { PoseDetailModal } from './components/PoseDetailModal';

// Simple unique ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

const STYLE_PRESETS = [
  "極簡純白 (Minimalist White)",
  "溫暖居家 (Cozy Home)",
  "歐美街拍 (Street Style)",
  "高級時尚 (High Fashion)",
  "強烈對比 (High Contrast)",
  "清新日系 (Japanese Airy)"
];

const App: React.FC = () => {
  const [productInput, setProductInput] = useState('');
  const [contextInput, setContextInput] = useState('');
  const [modelInput, setModelInput] = useState('');
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [poses, setPoses] = useState<PoseSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [environmentDesc, setEnvironmentDesc] = useState<string>('');
  const [selectedPose, setSelectedPose] = useState<PoseSuggestion | null>(null);
  
  // Use a ref to keep track of current poses state for async updates
  const posesRef = useRef<PoseSuggestion[]>([]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productInput.trim()) return;

    setIsGeneratingText(true);
    setError(null);
    setPoses([]);
    setEnvironmentDesc('');
    posesRef.current = [];

    try {
      // 1. Generate Text Ideas first
      const data = await generatePoseIdeas(productInput, contextInput, modelInput);
      
      // Store the environment description for consistent image generation
      const envDesc = data.environmentDescription || contextInput;
      const modelDesc = data.modelDescription || modelInput;
      setEnvironmentDesc(envDesc);

      // Initialize poses with loading state for images
      const initialPoses: PoseSuggestion[] = data.poses.map(p => ({
        ...p,
        id: generateId(),
        isImageLoading: true,
        imageError: false
      }));

      setPoses(initialPoses);
      posesRef.current = initialPoses;
      setIsGeneratingText(false);

      // 2. Trigger Image Generation for each pose (Parallel)
      initialPoses.forEach(pose => {
        generateImageForPose(pose.id, pose.description, productInput, envDesc, modelDesc);
      });

    } catch (err) {
      console.error(err);
      setError("無法產生姿勢建議。請檢查 API Key 是否有效，或稍後再試。");
      setIsGeneratingText(false);
    }
  };

  const generateImageForPose = async (id: string, description: string, product: string, envContext: string, modelContext: string) => {
    try {
      const base64Image = await generatePoseImage(product, description, envContext, modelContext);
      
      // Update state efficiently
      setPoses(currentPoses => 
        currentPoses.map(p => 
          p.id === id 
            ? { ...p, imageUrl: base64Image, isImageLoading: false, imageError: false } 
            : p
        )
      );
    } catch (err) {
      console.error(`Failed to generate image for pose ${id}`, err);
      // Mark as error
      setPoses(currentPoses => 
        currentPoses.map(p => 
          p.id === id 
            ? { ...p, isImageLoading: false, imageError: true } 
            : p
        )
      );
    }
  };

  const handleRetryImage = (id: string) => {
    const pose = poses.find(p => p.id === id);
    if (!pose) return;

    // Reset loading state for this specific card
    setPoses(currentPoses => 
      currentPoses.map(p => 
        p.id === id 
          ? { ...p, isImageLoading: true, imageError: false } 
          : p
      )
    );

    // Re-trigger generation
    const contextToUse = environmentDesc || contextInput;
    generateImageForPose(id, pose.description, productInput, contextToUse, modelInput);
  };

  const handleStyleSelect = (style: string) => {
    setContextInput(style);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-gray-900 selection:text-white pb-20">
      {/* Header / Hero */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
           <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
             <span className="material-symbols-outlined">camera_enhance</span>
             Star Pose Generator
           </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-gray-900">
            打造完美的產品代言分鏡
          </h2>
          <p className="text-sm text-gray-500 max-w-xl mx-auto mb-8 font-light">
            輸入代言產品、模特兒特徵與情境，AI 創意總監將為您生成 9 格專業分鏡腳本。
          </p>

          {/* Input Section */}
          <form onSubmit={handleGenerate} className="max-w-2xl mx-auto bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
            
            <div className="space-y-5">
              {/* Product Input */}
              <div className="space-y-1.5 text-left">
                <label htmlFor="product" className="text-xs font-semibold text-gray-700 ml-1 uppercase tracking-wider">代言產品</label>
                <input
                  id="product"
                  type="text"
                  value={productInput}
                  onChange={(e) => setProductInput(e.target.value)}
                  placeholder="例如：運動機能飲料、奢華絲絨唇膏"
                  className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all"
                  disabled={isGeneratingText}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Model Input */}
                 <div className="space-y-1.5 text-left">
                  <label htmlFor="model" className="text-xs font-semibold text-gray-700 ml-1 uppercase tracking-wider">模特兒特徵 (選填)</label>
                  <input
                    id="model"
                    type="text"
                    value={modelInput}
                    onChange={(e) => setModelInput(e.target.value)}
                    placeholder="例如：亞裔年輕女性、歐美健身男性"
                    className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all"
                    disabled={isGeneratingText}
                  />
                </div>

                {/* Context Input */}
                <div className="space-y-1.5 text-left">
                  <label htmlFor="context" className="text-xs font-semibold text-gray-700 ml-1 uppercase tracking-wider">拍攝風格 (選填)</label>
                  <input
                    id="context"
                    type="text"
                    value={contextInput}
                    onChange={(e) => setContextInput(e.target.value)}
                    placeholder="自行輸入或點擊下方標籤"
                    className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all"
                    disabled={isGeneratingText}
                  />
                </div>
              </div>

              {/* Style Chips */}
              {!isGeneratingText && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {STYLE_PRESETS.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => handleStyleSelect(style)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors
                        ${contextInput === style 
                          ? 'bg-gray-800 text-white border-gray-800' 
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700'
                        }`}
                    >
                      {style.split('(')[0]}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={isGeneratingText || !productInput.trim()}
                className={`w-full py-3.5 rounded-lg font-medium text-sm tracking-wide transition-all duration-300 flex items-center justify-center
                  ${isGeneratingText || !productInput.trim()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                    : 'bg-gray-900 text-white hover:bg-black hover:shadow-lg hover:shadow-gray-900/10'
                  }`}
              >
                {isGeneratingText ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2 text-gray-500">設計分鏡中...</span>
                  </>
                ) : (
                  '生成 9 格姿勢分鏡'
                )}
              </button>
            </div>
          </form>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-lg mb-8 text-center max-w-xl mx-auto text-sm flex flex-col items-center">
            <span className="mb-2">{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!isGeneratingText && poses.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-8 opacity-30">
            <div className="grid grid-cols-3 gap-3 mb-6 w-48 opacity-40 grayscale">
               <div className="bg-gray-300 aspect-square rounded-sm"></div>
               <div className="bg-gray-300 aspect-square rounded-sm"></div>
               <div className="bg-gray-300 aspect-square rounded-sm"></div>
               <div className="bg-gray-300 aspect-square rounded-sm"></div>
               <div className="bg-gray-300 aspect-square rounded-sm"></div>
               <div className="bg-gray-300 aspect-square rounded-sm"></div>
               <div className="bg-gray-300 aspect-square rounded-sm"></div>
               <div className="bg-gray-300 aspect-square rounded-sm"></div>
               <div className="bg-gray-300 aspect-square rounded-sm"></div>
            </div>
            <p className="text-gray-400 text-sm font-light">等待輸入指令...</p>
          </div>
        )}

        {/* Loading Skeleton (Initial Text Generation) */}
        {isGeneratingText && (
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             {Array.from({ length: 9 }).map((_, i) => (
               <div key={i} className="bg-white rounded-lg overflow-hidden border border-gray-200">
                 <div className="bg-gray-100 aspect-square w-full animate-pulse"></div>
                 <div className="p-3 space-y-2">
                   <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto"></div>
                 </div>
               </div>
             ))}
           </div>
        )}

        {/* Results Grid - Storyboard Style */}
        {poses.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6 px-1 border-b border-gray-200 pb-2">
               <div className="flex items-baseline space-x-3">
                 <h2 className="text-xl font-bold text-gray-900 tracking-tight">Storyboard</h2>
                 <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">{poses.length} SHOTS</span>
               </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium truncate max-w-[200px]">
                {environmentDesc || contextInput || "Studio"}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {poses.map((pose) => (
                <PoseCard 
                  key={pose.id} 
                  pose={pose} 
                  onRetry={handleRetryImage}
                  onClick={setSelectedPose}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Lightbox Modal */}
      {selectedPose && (
        <PoseDetailModal 
          pose={selectedPose} 
          onClose={() => setSelectedPose(null)} 
          onRetry={handleRetryImage}
        />
      )}
      
      <footer className="text-center text-gray-400 text-xs py-8 border-t border-gray-100 mt-12">
        <p>AI Creative Director • Gemini 2.5 Flash</p>
      </footer>
    </div>
  );
};

export default App;