import React, { useState } from 'react';
import { useApp } from './AppContext';
import { Tournament } from '../types';
import { 
  Trophy, 
  MapPin, 
  Users, 
  Clock, 
  UserCheck, 
  ArrowRight, 
  Sparkles, 
  Info,
  CheckCircle,
  AlertTriangle,
  Flame,
  Share2,
  Check,
  Download,
  Smartphone,
  Compass,
  Chrome
} from 'lucide-react';
import { TournamentDetailModal } from './TournamentDetailModal';
import { MatchStartingClock } from './MatchStartingClock';

// Static Categories data (Filtered only Free Fire, PUBG, Ludo, CODM, Mobile Legends as requested)
export const categories = [
  { name: "Free Fire", icon: "💥", color: "from-orange-500 to-red-600", desc: "Clash Squad & Bermuda Solo/Squad" },
  { name: "PUBG/BGMI", icon: "🔫", color: "from-yellow-500 to-amber-600", desc: "Classic Erangel & TDM matches" },
  { name: "Ludo", icon: "🎲", color: "from-emerald-500 to-teal-600", desc: "1v1 Quick Ludo Board showdowns" },
  { name: "Call of Duty", icon: "⚔️", color: "from-slate-600 to-zinc-800", desc: "CODM Search & Destroy / Battle Royale" },
  { name: "Mobile Legends", icon: "🛡️", color: "from-indigo-600 to-purple-800", desc: "5v5 MLBB Battle Arena Showdowns" },
];

// Fallback high-quality background covers for game categories
export const getGameFallbackBanner = (category: string): string => {
  switch (category) {
    case 'Free Fire':
      return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop';
    case 'PUBG/BGMI':
      return 'https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=800&auto=format&fit=crop';
    case 'Ludo':
      return 'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?q=80&w=800&auto=format&fit=crop';
    case 'Call of Duty':
      return 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop';
    case 'Mobile Legends':
      return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop';
    default:
      return 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop';
  }
};

export const Dashboard: React.FC = () => {
  const { 
    tournaments, 
    selectedCategory, 
    setSelectedCategory, 
    profile, 
    t, 
    language,
    setCurrentView,
    settings,
    notificationPermission,
    requestNotificationPermission,
    handleInstallApp
  } = useApp();

  const [selectedMatch, setSelectedMatch] = useState<Tournament | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedModeType, setSelectedModeType] = useState<string>('All');

  // Detect iOS or Android Webview/In-app browser (Facebook Messenger, Telegram, Instagram, etc)
  const isInAppBrowser = () => {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
    return (
      ua.indexOf('FBAN') > -1 || 
      ua.indexOf('FBAV') > -1 || 
      ua.indexOf('Instagram') > -1 || 
      ua.indexOf('Messenger') > -1 || 
      ua.indexOf('WhatsApp') > -1 ||
      ua.indexOf('Line') > -1 ||
      ua.indexOf('GSA') > -1
    );
  };

  const handleShareApp = async () => {
    const rawLink = window.location.origin + "/";
    const shareText = language === 'en' 
      ? `🔥 Play Free Fire, PUBG & Ludo Tournaments on ProTournament BD and win amazing cash coins!\n\nJoin now using this link (Open in Google Chrome or Safari browser):\n🔗 ${rawLink}` 
      : `🔥 প্রোটুর্নামেন্ট বিডি (ProTournament BD) এ ফ্রি ফায়ার, পাবজি ও লুডু টুর্নামেন্ট খেলে গোল্ডেন কয়েন ও আকর্ষণীয় প্রাইজ জিতে নিন!\n\nলিংকটি কপি করে গুগল ক্রোম ব্রাউজারে খুলুন ও ফোনে ইনস্টল করুন:\n🔗 ${rawLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ProTournament BD',
          text: shareText,
          url: rawLink
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Filter tournaments by category, mode, and remove completed/winner declared matches
  const filteredTournaments = (selectedCategory === 'All'
    ? tournaments
    : tournaments.filter(t => t.game_category.toLowerCase() === selectedCategory.toLowerCase())
  ).filter(t => !t.winner_name)
   .filter(t => {
     if (selectedModeType === 'All') return true;
     
     const gm = (t.game_mode || '').toLowerCase();
     const format = (t.format || '').toLowerCase();
     const title = (t.title || '').toLowerCase();
     const map = (t.map_name || '').toLowerCase();

     const isClashSquad = gm.includes('cs') || gm.includes('clash') || format.includes('cs') || format.includes('clash') || title.includes('cs') || title.includes('clash') || title.includes('clash squad');
     const isLoneWolf = gm.includes('lone') || gm.includes('wolf') || format.includes('lone') || format.includes('wolf') || title.includes('lone') || title.includes('wolf');

     if (selectedModeType === 'CS') {
       return isClashSquad && !isLoneWolf;
     }
     if (selectedModeType === 'Lone Wolf') {
       return isLoneWolf;
     }
     if (selectedModeType === 'BR') {
       // Battle Royale (BR) matches standard maps like Bermuda, but they are NOT Clash Squad or Lone Wolf
       if (isClashSquad || isLoneWolf) return false;
       return gm.includes('br') || gm.includes('battle') || format.includes('br') || format.includes('battle') || map.includes('bermuda') || map.includes('purgatory') || map.includes('erangel') || map.includes('kalahari') || map.includes('alpine') || title.includes('battle r') || title.includes('br');
     }
     return true;
   });

  // Count active tournaments per category (excluding declared ones)
  const getCount = (gameName: string) => {
    return tournaments.filter(t => t.game_category.toLowerCase() === gameName.toLowerCase() && !t.winner_name).length;
  };

  const handleMatchClick = (match: Tournament) => {
    setSelectedMatch(match);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* 1. ABSOLUTE TOP: NOTICE TICKER */}
      {settings.notice && (
        <div className="bg-amber-500/10 border border-amber-500/15 text-amber-300 px-4 py-2.5 rounded-2xl flex items-center gap-3 overflow-hidden text-xs font-semibold shadow-md">
          <span className="flex items-center gap-1 bg-amber-500 text-black px-2 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider shrink-0 font-mono">
            NOTICE
          </span>
          <marquee className="font-mono text-xs text-slate-350 w-full font-semibold" scrollamount="4">
            {settings.notice}
          </marquee>
        </div>
      )}

      {/* 2. SELECT GAME CATEGORY */}
      <div className="bg-[#0b0c13] border border-gray-800/60 p-4 sm:p-5 rounded-3xl space-y-3 shadow-xl relative text-left">
        <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest block leading-none">
          {language === 'en' ? '🎮 SELECT GAME CATEGORY:' : '🎮 গেম ক্যাটাগরি সিলেক্ট করুন:'}
        </label>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-800">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 whitespace-nowrap cursor-pointer select-none border shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black border-amber-400 shadow-md font-black'
                : 'bg-[#141624]/80 hover:bg-[#1a1d30] text-gray-300 border-gray-800/80'
            }`}
          >
            <span>🔥</span>
            <span>{language === 'en' ? 'All Games' : 'সকল গেম'}</span>
          </button>
          {categories.map((cat) => {
            const isSel = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            const count = getCount(cat.name);
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 whitespace-nowrap cursor-pointer select-none border shrink-0 ${
                  isSel
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black border-amber-400 shadow-md font-black'
                    : 'bg-[#141624]/80 hover:bg-[#1a1d30] text-gray-300 border-gray-800/80'
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span>{cat.name}</span>
                {count > 0 && (
                  <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.5 rounded-full font-mono font-bold">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SELECT SLOT MODE (BR, CS, LONE WOLF) */}
      <div className="space-y-2">
        <label className="text-[10px] text-[#a78bfa] font-black uppercase tracking-widest block leading-none">
          {language === 'en' ? '⚡ SELECT SLOT MODE' : '⚡ গেম খেলার স্লট মোড (CS / BR / লোন উলফ):'}
        </label>
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-gray-800 w-full">
          {[
            { id: 'All', labelEn: 'All Modes & Slots', labelBn: 'সকল স্লট 🎮', icon: '🔥' },
            { id: 'CS', labelEn: 'Clash Squad (CS)', labelBn: 'CS স্লট (ক্ল্যাশ স্কোয়াড) 💥', icon: '⚡' },
            { id: 'BR', labelEn: 'Battle Royale (BR)', labelBn: 'BR স্লট (ব্যাটেল রয়্যাল) 🗺️', icon: '🏆' },
            { id: 'Lone Wolf', labelEn: 'Lone Wolf', labelBn: 'লোন উলফ 🐺', icon: '⚔️' }
          ].map((mode) => {
            const isSel = selectedModeType === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedModeType(mode.id)}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[11px] sm:text-xs font-black transition-all relative cursor-pointer active:scale-95 whitespace-nowrap select-none border shrink-0 duration-150 ${
                  isSel 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black border-amber-400 shadow-md font-black'
                    : 'bg-[#141624]/80 hover:bg-[#1a1d30] text-gray-300 border-gray-800/80'
                }`}
              >
                <span className="text-sm shrink-0">{mode.icon}</span>
                <span>{language === 'en' ? mode.labelEn : mode.labelBn}</span>
                {isSel && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse border-2 border-black" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ⚠️ CRITICAL RULES DISCIPLINE WARNING CARD */}
      <div className="bg-gradient-to-r from-[#170e0a] via-[#22130c] to-[#170e0a] border-2 border-rose-600/40 p-4.5 rounded-3xl flex flex-row items-center gap-4.5 shadow-2xl relative overflow-hidden animate-slide-up">
        {/* Blinking orange status dot */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="text-[8px] text-rose-400 font-black uppercase font-mono tracking-widest hidden sm:inline-block">RULE WARNING</span>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-rose-600 text-black p-3 rounded-2xl shadow-lg shrink-0 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-black animate-bounce shrink-0" />
        </div>
        <div className="space-y-1 text-left">
          <h4 className="text-xs font-black text-amber-500 uppercase tracking-wide font-mono flex items-center gap-1">
            ⚠️ {language === 'en' ? 'POLICY & MATCH RULES WARNING' : 'ম্যাচ পলিসি সতর্কবার্তা'}
          </h4>
          <p className="text-xs sm:text-sm text-gray-200 font-bold leading-relaxed max-w-xl">
            {language === 'en' 
              ? 'It is strictly mandatory to read the rules before playing any match. Otherwise, you run the risk of losing prizes even if you win!'
              : 'প্রতিটি গেম খেলার পূর্বে রুলস পড়া আবশ্যক, নইলে পুরস্কার জেতার শর্তেও তা মিস হতে পারে!'}
          </p>
        </div>
      </div>

      {/* 2. INSTANT TOURNAMENT MATCH LIST */}
      <div className="space-y-4 pt-1">
        <div className="flex items-center justify-between border-b border-gray-800/50 pb-2">
          <h2 className="text-md sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5 leading-none">
            <Trophy className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
            <span>
              {selectedCategory === 'All' 
                ? (language === 'en' ? 'Available Matches To Join' : 'খেলার জন্য উপলব্ধ ম্যাচ সমুহ')
                : t('tournamentsFor', { game: selectedCategory })}
            </span>
          </h2>
          <span className="text-[11px] text-gray-400 font-mono font-bold bg-[#141624] border border-gray-800 px-2.5 py-1 rounded-lg">
            {filteredTournaments.length} {language === 'en' ? 'Matches' : 'টি ম্যাচ'}
          </span>
        </div>

        {filteredTournaments.length === 0 ? (
          <div className="border border-dashed border-gray-850 rounded-3xl p-10 text-center bg-[#0d0e16]/40 max-w-2xl mx-auto space-y-3">
            <Info className="h-8 w-8 text-slate-500 mx-auto" />
            <h3 className="text-white font-bold text-sm">{language === 'en' ? 'No Matches in This Slot' : 'এই স্লটে নতুন কোনো ম্যাচ নেই'}</h3>
            <p className="text-gray-400 text-[11px] leading-relaxed max-w-xs mx-auto">
              {language === 'en' 
                ? 'There are currently no active matches for the selected categories/slots. Please choose another game or wait for newer matches.'
                : 'এই স্লটের সব ম্যাচ সম্পূর্ণ হয়ে গেছে অথবা এখনও চালু করা হয়নি। অনুগ্রহ করে অন্য স্লট বা গেম ক্যাটাগরি সিলেক্ট করুন।'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedModeType('All');
              }}
              className="mt-1 text-xs bg-amber-550/10 border border-amber-500/20 text-amber-400 px-3.5 py-1.5 hover:bg-amber-500/20 rounded-xl transition-all font-bold cursor-pointer"
            >
              {language === 'en' ? 'Reset All Filters' : 'ফিল্টার রিসেট করুন'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-5 max-w-2xl mx-auto w-full pb-28">
            {filteredTournaments.map((match) => {
              const capUsed = match.joined_count;
              const capTotal = match.total_slots;
              const pct = Math.min(100, Math.round((capUsed / capTotal) * 100));
              const isJoined = profile && match.joined_players_uids?.includes(profile.uid);
              const isFull = capUsed >= capTotal;

              return (
                <div
                  key={match.match_id}
                  className="bg-[#121420] border-2 border-gray-800/80 rounded-3xl hover:border-amber-500/40 overflow-hidden flex flex-col justify-between transition-all group duration-300 shadow-lg"
                >
                  {/* Game Cover Banner Image slot */}
                  <div className="relative h-32 sm:h-48 w-full overflow-hidden shrink-0 bg-[#0d0e16]/85 border-b border-gray-800/40">
                    <img
                      src={match.image_url || getGameFallbackBanner(match.game_category)}
                      alt={match.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      referrerPolicy="no-referrer"
                    />
                    {/* Shaded vignette to support text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121420] via-transparent to-black/35" />
                    
                    {/* Floating top tags and clock */}
                    <div className="absolute top-3.5 left-3.5 flex gap-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold font-mono px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md text-amber-400 border border-amber-500/20 shadow-lg select-none">
                        {match.game_category}
                      </span>
                      {match.game_mode && (
                        <span className="text-[9px] font-black font-sans px-2.5 py-1 rounded-md bg-[#a78bfa] text-black border border-[#a78bfa]/20 uppercase tracking-wider shadow-lg select-none">
                          {match.game_mode.replace(/\s*\(.*\)/g, '')}
                        </span>
                      )}
                    </div>

                    <MatchStartingClock time={match.time} language={language} />
                  </div>

                  {/* Body details and parameters metadata */}
                  <div className="p-3.5 sm:p-4 border-b border-gray-800/50 space-y-2.5 sm:space-y-3.5 text-left">
                    <h3 className="font-extrabold text-white text-sm sm:text-base tracking-tight line-clamp-1">
                      {match.title}
                    </h3>

                    {/* Metadata attributes */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-400 bg-[#0d0e16]/55 px-2.5 py-1.5 rounded-xl border border-white/5">
                        <span className="text-[10px] text-gray-500 uppercase font-black font-semibold">
                          {(() => {
                            switch (match.game_category) {
                              case 'Ludo': return language === 'en' ? 'Board:' : 'বোর্ড:';
                              case 'DLS': return language === 'en' ? 'Rules:' : 'নিয়মাবলি:';
                              case 'COC': return language === 'en' ? 'Arena:' : 'রঙ্গভূমি:';
                              case 'Subway Surfers': return language === 'en' ? 'Target:' : 'টার্গেট:';
                              case 'Mobile Legends': return language === 'en' ? 'Map:' : 'ম্যাপ:';
                              default: return t('map') + ':';
                            }
                          })()}
                        </span>
                        <span className="font-bold text-white truncate text-[11px]">
                          {match.map_name || (() => {
                            switch (match.game_category) {
                              case 'Ludo': return 'Classic Board';
                              case 'DLS': return '6 Mins (Any Team)';
                              case 'COC': return 'TownHall 12+';
                              case 'Subway Surfers': return '10 Lakh Target';
                              case 'Mobile Legends': return 'Land of Dawn';
                              case 'PUBG/BGMI': return 'Erangel';
                              case 'Call of Duty': return 'Crash';
                              default: return 'Bermuda';
                            }
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 bg-[#0d0e16]/55 px-2.5 py-1.5 rounded-xl border border-white/5">
                        <span className="text-[10px] text-gray-500 uppercase font-black">
                          {(() => {
                            switch (match.game_category) {
                              case 'Ludo':
                              case 'DLS':
                              case 'COC':
                              case 'Mobile Legends': return language === 'en' ? 'Mode:' : 'মোড:';
                              case 'Subway Surfers': return language === 'en' ? 'Type:' : 'ধরণ:';
                              default: return t('format') + ':';
                            }
                          })()}
                        </span>
                        <span className="font-bold text-white truncate text-[11px]">
                          {match.format || (() => {
                            switch (match.game_category) {
                              case 'Ludo': return '1v1';
                              case 'DLS': return '1v1';
                              case 'COC': return '1v1';
                              case 'Subway Surfers': return 'Solo';
                              case 'Mobile Legends': return '5v5';
                              default: return 'Squad';
                            }
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Economy/Reward Grid */}
                  <div className="bg-[#1a1c2b]/30 p-3 sm:p-4 grid grid-cols-3 gap-1 border-b border-gray-800/40 text-center">
                    <div>
                      <span className="block text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                        {t('prizePool')}
                      </span>
                      <span className="text-sm font-mono font-black text-amber-500">
                        {match.prize_pool} C
                      </span>
                    </div>

                    <div>
                      <span className="block text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                        {['Free Fire', 'PUBG/BGMI', 'Call of Duty'].includes(match.game_category) 
                          ? t('perKill') 
                          : language === 'en' ? 'Kill Reward' : 'কিল পুরস্কার'}
                      </span>
                      <span className={`text-sm font-mono font-black ${['Free Fire', 'PUBG/BGMI', 'Call of Duty'].includes(match.game_category) ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {['Free Fire', 'PUBG/BGMI', 'Call of Duty'].includes(match.game_category) 
                          ? `${match.per_kill || '0'} C` 
                          : 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                        {t('entryFee')}
                      </span>
                      <span className="text-sm font-mono font-black text-white">
                        {match.entry_fee || 'FREE'} C
                      </span>
                    </div>
                  </div>

                  {/* Seat availability counter & Joining Call-To-Action Option */}
                  <div className="p-3 sm:p-4 space-y-2.5 sm:space-y-3.5">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 flex items-center gap-1.5 font-semibold">
                          <Users className="h-3.5 w-3.5 text-indigo-400" />
                          {capUsed} / {capTotal} {language === 'en' ? 'Players' : 'নিবন্ধিত খেলোয়াড়'}
                        </span>
                        <span className="font-mono text-gray-400 font-black">
                          {capTotal - capUsed} {t('slotsAvailable')}
                        </span>
                      </div>
                      
                      {/* Custom progress bar */}
                      <div className="w-full h-2 bg-gray-950 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-650 rounded-full transition-all duration-300" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Prominent, clean action option button */}
                    {isJoined ? (
                      <button
                        onClick={() => {
                          setCurrentView('joined');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full py-3 bg-emerald-500/15 hover:bg-emerald-500/25 border-2 border-emerald-500/40 text-emerald-400 font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none uppercase tracking-wider"
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>{language === 'en' ? 'Registered - View Room Info' : 'নিবন্ধিত সম্পন্ন - রুম আইডি দেখুন 🔑'}</span>
                      </button>
                    ) : isFull ? (
                      <div className="w-full text-center py-3 bg-gray-800 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-wider">
                        {t('matchFull')}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleMatchClick(match)}
                        className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-350 hover:to-orange-450 text-black font-black rounded-2xl text-xs sm:text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-lg hover:shadow-orange-500/10 hover:scale-[1.01] active:scale-95 duration-150 select-none uppercase tracking-wider"
                      >
                        <span>{language === 'en' ? 'JOIN MATCH NOW' : 'টুর্নামেন্টে জয়েন করুন 🎮'}</span>
                        <ArrowRight className="h-4 w-4 stroke-[3]" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Slide-up Bottom Sheet Modal */}
      {selectedMatch && (
        <TournamentDetailModal 
          tournament={selectedMatch} 
          onClose={() => setSelectedMatch(null)} 
        />
      )}
    </div>
  );
};
export default Dashboard;
