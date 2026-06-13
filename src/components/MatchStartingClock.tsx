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
      if (diff <= 0) {
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

  if (status === 'STARTED') {
    return (
      <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#f59e0b] bg-[#f59e0b]/15 backdrop-blur-md px-3 py-1 rounded-full border border-[#f59e0b]/30 shadow-lg font-sans select-none animate-pulse">
        <Timer className="h-3.5 w-3.5 text-amber-500" />
        <span>
          {language === 'en' ? 'Live Match • Started' : 'লাইভ • ম্যাচ শুরু হয়েছে'}
        </span>
      </div>
    );
  }

  if (status === 'COUNTDOWN') {
    const totalSeconds = Math.floor(timeLeftMs / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;

    // Zero padding helper
    const pad = (num: number) => String(num).padStart(2, '0');

    return (
      <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black text-rose-400 bg-rose-500/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-rose-500/40 shadow-xl font-mono select-none animate-pulse">
        <Hourglass className="h-3.5 w-3.5 text-rose-500 animate-spin" style={{ animationDuration: '3s' }} />
        <span>
          {language === 'en' ? 'Starts in: ' : 'শুরু হবে: '}
          <span className="text-white font-bold">{pad(m)}m {pad(s)}s</span>
        </span>
      </div>
    );
  }

  // Future case: standard label with Clock icon
  return (
    <div className="absolute bottom-3.5 right-3.5 flex flex-col items-end gap-0.5 max-w-[70%] select-none">
      <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-gray-100 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 font-mono shadow-lg">
        <Clock className="h-3.5 w-3.5 text-orange-400 shrink-0" />
        <span className="truncate leading-none">
          <span className="text-gray-400 font-sans mr-1 text-[9px] uppercase tracking-wider">
            {language === 'en' ? 'Start Time:' : 'শুরুর সময়:'}
          </span>
          <span className="font-extrabold text-[#f59e0b]">
            {formatDate(time)}
          </span>
        </span>
      </div>
    </div>
  );
};
export default MatchStartingClock;
