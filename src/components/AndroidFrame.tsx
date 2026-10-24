import React, { createContext, useContext, useState } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal } from 'lucide-react';

interface AndroidFrameContextType {
  isPhoneView: boolean;
  setIsPhoneView: (val: boolean) => void;
}

const AndroidFrameContext = createContext<AndroidFrameContextType>({
  isPhoneView: false,
  setIsPhoneView: () => {},
});

export const useAndroidFrame = () => useContext(AndroidFrameContext);

export const AndroidFrameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPhoneView, setIsPhoneView] = useState<boolean>(false);
  return (
    <AndroidFrameContext.Provider value={{ isPhoneView, setIsPhoneView }}>
      {children}
    </AndroidFrameContext.Provider>
  );
};

export const AndroidFrameShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isPhoneView, setIsPhoneView } = useAndroidFrame();
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-start text-zinc-100">
      {/* Top Bar with View Mode Toggle */}
      <header className="w-full bg-zinc-900/90 border-b border-zinc-800/80 px-4 py-2.5 flex items-center justify-between text-xs sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-subheading font-bold uppercase tracking-wider text-amber-400">
            Battle Arena Engine
          </span>
          <span className="hidden sm:inline-block text-zinc-400">| Free Fire BR & CS Esports</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPhoneView(false)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium ${
              !isPhoneView
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Desktop / Tablet Expanded View"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Responsive Web</span>
          </button>

          <button
            onClick={() => setIsPhoneView(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium ${
              isPhoneView
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Simulate Android Mobile View"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android Shell</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex-1 flex justify-center items-start p-0 sm:p-4">
        {isPhoneView ? (
          <div className="w-full max-w-[420px] my-2 relative">
            {/* Realistic Android Phone Mockup Frame */}
            <div className="relative mx-auto rounded-[44px] border-[10px] border-zinc-800 bg-zinc-950 shadow-[0_0_60px_rgba(245,158,11,0.15)] overflow-hidden flex flex-col h-[880px]">
              {/* Android Notch / Punch hole */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-zinc-900 border border-zinc-700/50 z-50 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-900/60" />
              </div>

              {/* Android Status Bar */}
              <div className="w-full bg-zinc-950/95 text-zinc-400 text-[11px] px-6 pt-2 pb-1 flex items-center justify-between z-40 select-none">
                <span className="font-semibold text-zinc-200">{currentTime}</span>
                <div className="flex items-center gap-2">
                  <Signal className="w-3 h-3 text-zinc-300" />
                  <span className="text-[10px] font-bold text-amber-400">5G</span>
                  <Wifi className="w-3 h-3 text-zinc-300" />
                  <div className="flex items-center gap-1">
                    <span className="text-[10px]">100%</span>
                    <Battery className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  </div>
                </div>
              </div>

              {/* Scrollable Screen Content */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col bg-zinc-950">
                {children}
              </div>

              {/* Android Navigation Gesture Bar */}
              <div className="w-full bg-zinc-950 py-2 flex justify-center items-center z-40">
                <div className="w-32 h-1 bg-zinc-600 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-6xl mx-auto flex flex-col">
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
