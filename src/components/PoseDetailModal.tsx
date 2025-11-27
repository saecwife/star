import React, { useEffect } from 'react';
import { PoseSuggestion } from '../types';

interface PoseDetailModalProps {
  pose: PoseSuggestion;
  onClose: () => void;
  onRetry: (id: string) => void;
  onToggleProp?: (id: string, index: number) => void;
}

export const PoseDetailModal: React.FC<PoseDetailModalProps> = ({ pose, onClose, onRetry, onToggleProp }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    // Disable body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleDownload = () => {
    if (!pose.imageUrl) return;
    const link = document.createElement('a');
    link.href = pose.imageUrl;
    link.download = `pose-idea-${pose.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRegenerate = () => {
    onRetry(pose.id);
    onClose(); // Close modal to show the loading state on the main grid
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Close Button Mobile */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur md:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image Side */}
        <div className="w-full md:w-3/5 bg-gray-100 flex items-center justify-center relative">
          {pose.imageUrl && (
            <img 
              src={pose.imageUrl} 
              alt={pose.title} 
              className="w-full h-full object-contain max-h-[50vh] md:max-h-[90vh]"
            />
          )}
        </div>

        {/* Content Side */}
        <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col overflow-y-auto bg-white">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-block px-2 py-1 text-[10px] font-bold tracking-widest text-white bg-gray-900 rounded uppercase">
                {pose.angle}
              </span>
              <button onClick={onClose} className="hidden md:block p-1 text-gray-400 hover:text-gray-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{pose.title}</h2>
            
            <div className="prose prose-sm prose-gray mb-6">
              <p className="text-base text-gray-600 leading-relaxed whitespace-pre-line">
                {pose.description}
              </p>
            </div>

            {/* Props Checklist Section */}
            {pose.props && pose.props.length > 0 && (
               <div className="mb-6">
                 <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                   <span className="material-symbols-outlined text-sm">fact_check</span>
                   拍攝準備清單 (服裝/道具/器材)
                 </h4>
                 <div className="space-y-2">
                   {pose.props.map((prop, idx) => (
                     <label 
                      key={idx} 
                      className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer select-none
                        ${prop.checked 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-white border-gray-200 hover:border-gray-300'}`}
                     >
                       <input 
                        type="checkbox" 
                        checked={prop.checked}
                        onChange={() => onToggleProp && onToggleProp(pose.id, idx)}
                        className="mt-1 w-4 h-4 text-gray-900 bg-gray-100 border-gray-300 rounded focus:ring-gray-900 focus:ring-2 accent-gray-900"
                       />
                       <span className={`text-sm ${prop.checked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                         {prop.name}
                       </span>
                     </label>
                   ))}
                 </div>
               </div>
            )}
            
            {/* Tips Section */}
            {pose.tips && pose.tips.length > 0 && (
               <div className="mt-2 p-4 bg-yellow-50/50 rounded-lg border border-yellow-100/50">
                 <h4 className="text-xs font-bold text-yellow-600/70 uppercase tracking-wider mb-2">執行重點 Tips</h4>
                 <ul className="space-y-1.5">
                   {pose.tips.map((tip, idx) => (
                     <li key={idx} className="text-sm text-gray-600 flex items-start">
                       <span className="text-yellow-400 mr-2">•</span> {tip}
                     </li>
                   ))}
                 </ul>
               </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
             {/* Regenerate Button */}
             <button
              onClick={handleRegenerate}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              不滿意？重新生成 (Regenerate)
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center px-4 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors shadow-lg shadow-gray-900/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 12.75l-3.3-3.3m0 0l-3.3 3.3m3.3-3.3v7.5" />
              </svg>
              下載圖片 (Download)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};