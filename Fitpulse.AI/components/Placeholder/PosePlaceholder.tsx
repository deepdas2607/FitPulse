import React from 'react';
import { User, Activity, AlertCircle } from 'lucide-react';

const PosePlaceholder: React.FC = () => {
    return (
        <div className="relative w-full h-80 bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center">
            {/* Mock Skeleton */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <svg viewBox="0 0 100 100" className="w-full h-full p-10 stroke-primary-400 stroke-2 fill-none">
                    <circle cx="50" cy="20" r="5" />
                    <path d="M50 25 L50 45" /> {/* Spine */}
                    <path d="M50 45 L30 70" /> {/* Left Leg */}
                    <path d="M50 45 L70 70" /> {/* Right Leg */}
                    <path d="M30 30 L70 30" /> {/* Shoulders */}
                    <path d="M30 30 L20 50" /> {/* Left Arm */}
                    <path d="M70 30 L80 15" /> {/* Right Arm - Raised */}
                </svg>
            </div>

            <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full border border-slate-700 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-xs text-white font-mono">Launch Session for live feed</span>
            </div>

            <div className="z-10 text-center px-6">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-slate-600 border-dashed">
                    <User className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="text-white font-semibold mb-1">AI FORM CORRECTION</h4>
                <p className="text-slate-400 text-sm mb-4">
                    Enable camera to detect posture and rep counting automatically.
                </p>
                <div className="inline-flex items-center gap-2 bg-accent-500/10 border border-accent-500/20 text-accent-500 px-3 py-1.5 rounded-lg text-xs font-bold">
                    <AlertCircle className="w-3 h-3" />
                    <span>CONNECTED MEDIAPIPE MODEL</span>
                </div>
            </div>
        </div>
    );
};

export default PosePlaceholder;