import React, { useState, useEffect } from 'react';
import { Clock, Timer, Hourglass } from 'lucide-react';

interface MatchStartingClockProps {
  time: string;
  language?: 'en' | 'bn';
}

export const MatchStartingClock: React.FC<MatchStartingClockProps> = ({ time, language = 'en' }) => {
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);
  const [status, setStatus] = useState<'FUTURE' | 'COUNTDOWN' | 'STARTED'>('FUTURE');

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(language === 'en' ? 'en-US' : 'bn-BD', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  useEffect(() => {
    const targetTimestamp = new Date(time).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const diff = targetTimestamp - now;
      setTimeLeftMs(diff);

      const fifteenMins = 15 * 60 * 1000;
      if (isNaN(targetTimestamp)) {
        setStatus('FUTURE');
      } else if (diff <= 0) {
        setStatus('STARTED');
      } else if (diff <= fifteenMins) {
        setStatus('COUNTDOWN');
      } else {
        setStatus('FUTURE');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [time]);

  return (
    <div className="absolute bottom-1.5 right-1.5 sm:bottom-2.5 sm:right-2.5 flex flex-col items-end gap-1 max-w-[92%] select-none z-10">
      {/* 1. Status/Countdown Badge stacked above the Start Time */}
      {status === 'STARTED' && (
        <div className="flex items-center gap-1 text-[8px] sm:text-[10px] font-extrabold text-amber-400 bg-amber-500/20 backdrop-blur-md px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-amber-500/30 shadow-lg font-sans animate-pulse">
          <Timer className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-amber-400" />
          <span>
            {language === 'en' ? 'Live Match • Started' : 'লাইভ • শুরু হয়েছে'}
          </span>
        </div>
      )}

      {status === 'COUNTDOWN' && (() => {
        const totalSeconds = Math.max(0, Math.floor(timeLeftMs / 1000));
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        const pad = (num: number) => String(num).padStart(2, '0');
        
        return (
          <div className="flex items-center gap-1 text-[8px] sm:text-[10px] font-black text-rose-400 bg-rose-500/25 backdrop-blur-md px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-rose-500/40 shadow-xl font-mono animate-pulse">
            <Hourglass className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-rose-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span>
              {language === 'en' ? 'In: ' : 'শুরু: '}
              <span className="text-white font-bold">{pad(m)}m {pad(s)}s</span>
            </span>
          </div>
        );
      })()}

      {/* 2. Absolute Start Time Badge (ALWAYS SHOWS) */}
      <div className="flex items-center gap-1 text-[8px] sm:text-[10px] text-gray-100 bg-black/85 backdrop-blur-md px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-white/10 font-mono shadow-md">
        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-orange-400 shrink-0" />
        <span className="truncate leading-none">
          <span className="text-gray-400 font-sans mr-0.5 text-[7px] sm:text-[8px] uppercase tracking-wider">
            {language === 'en' ? 'Start:' : 'শুরু:'}
          </span>
          <span className="font-extrabold text-orange-400">
            {formatDate(time)}
          </span>
        </span>
      </div>
    </div>
  );
};

export default MatchStartingClock;
