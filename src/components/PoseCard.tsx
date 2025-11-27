import React from 'react';
import { PoseSuggestion } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface PoseCardProps {
  pose: PoseSuggestion;
  onRetry: (id: string) => void;
  onClick: (pose: PoseSuggestion) => void;
}

export const PoseCard: React.FC<PoseCardProps> = ({ pose, onRetry, onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    // If clicking the retry or regenerate button, don't trigger the card click
    if ((e.target as HTMLElement).closest('button')) return;
    if (!pose.isImageLoading && !pose.imageError) {
      onClick(pose);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`group bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm transition-all duration-300 
        ${!pose.isImageLoading && !pose.imageError ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : ''}`}
    >
      {/* Image Section - Square Aspect Ratio for Storyboard look */}
      <div className="relative w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
        {pose.isImageLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-white/50 z-10">
            <LoadingSpinner />
          </div>
        ) : pose.imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400 mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <span className="text-xs text-gray-500 mb-3">無法生成圖片</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRetry(pose.id);
              }}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-1 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              重試
            </button>
          </div>
        ) : pose.imageUrl ? (
          <>
             <img 
              src={pose.imageUrl} 
              alt={pose.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Hover hint */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="bg-white/90 backdrop-blur text-gray-900 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                放大檢視
              </span>
            </div>
            
            {/* Regenerate Button (Hover) */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRetry(pose.id);
              }}
              title="重新生成圖片 (Regenerate)"
              className="absolute top-2 left-2 p-1.5 bg-white/80 hover:bg-white text-gray-700 rounded-full backdrop-blur shadow-sm opacity-0 group-hover:opacity-100 transition-all z-20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          </>
        ) : (
          <div className="text-gray-400 text-xs uppercase tracking-widest">No Preview</div>
        )}
        
        {/* Minimal Overlay for Angle */}
        {!pose.isImageLoading && !pose.imageError && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-[2px] text-white text-[10px] font-medium px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {pose.angle}
          </div>
        )}
      </div>

      {/* Minimal Content Section */}
      <div className="p-3 text-center">
        <h3 className="text-sm font-bold text-gray-900 tracking-wide">{pose.title}</h3>
        {/* Optional: Very subtle description, truncated */}
        <p className="text-[10px] text-gray-500 mt-1 line-clamp-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {pose.description}
        </p>
      </div>
    </div>
  );
};