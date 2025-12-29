import React, { useState } from 'react';
import { Camera, ScanLine, Loader2 } from 'lucide-react';

const OCRPlaceholder: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2000);
  };

  return (
    <div className="relative w-full h-64 bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center text-slate-300 group">
      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* Viewfinder corners */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary-500 rounded-tl-lg"></div>
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary-500 rounded-tr-lg"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary-500 rounded-bl-lg"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary-500 rounded-br-lg"></div>

      {/* Content */}
      <div className="z-10 flex flex-col items-center gap-3">
        {isScanning ? (
           <div className="animate-pulse flex flex-col items-center">
             <ScanLine className="w-12 h-12 text-primary-400 mb-2 animate-bounce" />
             <span className="text-primary-400 font-mono text-sm">ANALYZING LABEL...</span>
           </div>
        ) : (
          <>
            <div className="bg-slate-800 p-3 rounded-full mb-2 group-hover:bg-slate-700 transition-colors">
              <Camera className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium">Point at Nutrition Label</p>
            <button 
              onClick={handleScan}
              className="mt-2 px-4 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-full flex items-center gap-2 transition-all">
              <span>SCAN</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">AI MODEL: TODO</span>
            </button>
          </>
        )}
      </div>

      {/* Fake blurred background image hint */}
      <div className="absolute inset-0 -z-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
    </div>
  );
};

export default OCRPlaceholder;