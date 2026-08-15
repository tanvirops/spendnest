import React, { useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    // Auto-dismiss after 2.5 seconds
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 animate-splash-fadeout" style={{ animationDelay: '1.5s' }}>
      {/* Main Content Container */}
      <div className="relative flex flex-col items-center gap-4 animate-splash-scalein">
        {/* Logo Container */}
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-3 shadow-2xl flex items-center justify-center">
            <img 
              src="/apple-touch-icon.png" 
              alt="SpendNest" 
              className="w-20 h-20 object-contain drop-shadow-lg" 
            />
          </div>
          {/* Animated ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-emerald-500 opacity-30 animate-pulse" />
        </div>

        {/* Text Content */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-wider text-white">SpendNest</h1>
          <p className="text-sm text-slate-400 mt-1">Personal Finance Tracker</p>
        </div>
      </div>

      {/* Loading Bar */}
      <div className="absolute bottom-20 w-40 h-1 bg-slate-800 rounded-full overflow-hidden shadow-lg">
        <div className="w-full h-full bg-gradient-to-r from-emerald-400 to-emerald-600 animate-[shimmer_1.5s_infinite]" />
      </div>

      {/* Loading Text */}
      <p className="absolute bottom-8 text-xs text-slate-500 tracking-widest uppercase">Loading...</p>
    </div>
  );
}