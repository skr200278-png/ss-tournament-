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
  Flame
} from 'lucide-react';
import { TournamentDetailModal } from './TournamentDetailModal';
import { MatchStartingClock } from './MatchStartingClock';

// Static Categories data
export const categories = [
  { name: "Free Fire", icon: "💥", color: "from-orange-500 to-red-600", desc: "Clash Squad & Bermuda Solo/Squad" },
  { name: "PUBG/BGMI", icon: "🔫", color: "from-yellow-500 to-amber-600", desc: "Classic Erangel & TDM matches" },
  { name: "Ludo", icon: "🎲", color: "from-emerald-500 to-teal-600", desc: "1v1 Quick Ludo Board showdowns" },
  { name: "Call of Duty", icon: "⚔️", color: "from-slate-600 to-zinc-800", desc: "CODM Search & Destroy / Battle Royale" },
  { name: "Mobile Legends", icon: "🛡️", color: "from-indigo-600 to-purple-800", desc: "5v5 MLBB Battle Arena Showdowns" },
  { name: "DLS", icon: "⚽", color: "from-blue-500 to-indigo-600", desc: "Dream League Soccer 1v1 Arena" },
  { name: "COC", icon: "🏰", color: "from-purple-500 to-pink-600", desc: "Clash of Clans Friendly Challenges" },
  { name: "Subway Surfers", icon: "🏃", color: "from-pink-500 to-rose-600", desc: "Weekly High Score Tournament" },
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
    case 'DLS':
      return 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop';
    case 'COC':
      return 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=800&auto=format&fit=crop';
    case 'Subway Surfers':
      return 'https://images.unsplash.com/photo-1484788984921-03950022c9ef?q=80&w=800&auto=format&fit=crop';
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
    requestNotificationPermission
  } = useApp();

  const [selectedMatch, setSelectedMatch] = useState<Tournament | null>(null);

  // Filter tournaments by category
  const filteredTournaments = selectedCategory === 'All'
    ? tournaments
    : tournaments.filter(t => t.game_category.toLowerCase() === selectedCategory.toLowerCase());

  // Count active tournaments per category
  const getCount = (gameName: string) => {
    return tournaments.filter(t => t.game_category.toLowerCase() === gameName.toLowerCase()).length;
  };

  const handleMatchClick = (match: Tournament) => {
    setSelectedMatch(match);
  };

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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Scrolling Notice Banner */}
      {settings.notice && (
        <div className="bg-amber-500/10 border border-amber-500/15 text-amber-300 px-4 py-2.5 rounded-2xl flex items-center gap-3 overflow-hidden text-xs font-semibold shadow-md">
          <span className="flex items-center gap-1 bg-amber-500 text-black px-2 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider shrink-0 font-mono">
            NOTICE
          </span>
          <marquee className="font-mono text-xs text-slate-300 w-full" scrollamount="4">
            {settings.notice}
          </marquee>
        </div>
      )}

      {/* Native Notification Request Box (Bilingual, high polish) */}
      {notificationPermission === 'default' && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-600/10 to-[#121420] border border-orange-500/20 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-lg border-white/5">
          <div className="flex items-center gap-3 text-left">
            <div className="h-10 w-10 shrink-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white text-lg shadow-md hover:scale-105 transition-all">
              📢
            </div>
            <div>
              <h4 className="font-extrabold text-white text-[11px] sm:text-xs uppercase tracking-wider">
                {language === 'en' ? 'Get Direct Game Alarms!' : 'ফোনে ইনস্ট্যান্ট এলার্ম পান!'}
              </h4>
              <p className="text-[11px] text-gray-400 font-sans mt-0.5 leading-tight">
                {language === 'en' 
                  ? 'Enable notifications to receive alerts 10 minutes before joined matches and for new match arrivals.'
                  : 'নটিফিকেশন চালু রাখুন! প্রতিটি ম্যাচ শুরুর ১০ মিনিট আগে ও নতুন টুর্নামেন্ট এড করা হলে সরাসরি এলার্ম পাবেন।'}
              </p>
            </div>
          </div>
          <button
            onClick={() => requestNotificationPermission()}
            className="w-full sm:w-auto shrink-0 py-2.5 px-5 bg-gradient-to-r from-amber-500 to-orange-600 text-black hover:from-amber-400 hover:to-orange-500 font-extrabold rounded-2xl text-[11px] transition-all cursor-pointer whitespace-nowrap shadow-md select-none"
          >
            {language === 'en' ? 'Allow Notifications' : 'নোটিফিকেশন অন করুন'}
          </button>
        </div>
      )}

      {/* Promotional Banner */}
      {settings.banner_url && (
        <div className="relative rounded-3xl overflow-hidden border border-gray-800/80 h-36 sm:h-44 shadow-lg hover:border-gray-700/80 transition-all group">
          <img 
            src={settings.banner_url} 
            alt="Promotion Banner" 
            className="w-full h-full object-cover transition-all group-hover:scale-[1.01]" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07080d]/60 via-transparent to-[#121420]/30 p-4 sm:p-6 flex flex-col justify-end">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest sm:mb-1 block">
              {language === 'en' ? '★ SPECIAL TOURNAMENT ANNOUNCEMENT' : '★ বিশেষ টুর্নামেন্ট বিজ্ঞপ্তি'}
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-none drop-shadow-md">
              {language === 'en' ? 'Daily esports matches with instant cashout lobby' : 'দৈনিক মোবাইল টুর্নামেন্টে অংশ নিয়ে জিতে নিন কয়েন কিলার ব্যালেন্স'}
            </h3>
          </div>
        </div>
      )}

      {/* Dynamic Header Promo */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-gray-900 to-[#1e1b4b] border border-gray-800 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-600/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-semibold font-mono uppercase tracking-wide">
            <Flame className="h-3 w-3 animate-pulse text-amber-500" />
            {language === 'en' ? 'HOT TOURNAMENTS LIVE NOW' : 'লাইভ টুর্নামেন্ট টুডে'}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-extrabold text-white tracking-tight leading-none">
            {t('appName')}
          </h1>
          <p className="text-gray-400 text-sm max-w-lg">
            {t('tagline')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="bg-[#111827]/80 rounded-2xl p-4 border border-gray-800 text-center flex-1 sm:min-w-[140px]">
            <span className="block text-gray-400 text-xs uppercase tracking-wider">{language === 'en' ? 'ACTIVE MATCHES' : 'চলমান ম্যাচ'}</span>
            <span className="text-2xl font-mono font-bold text-amber-400">{tournaments.length}</span>
          </div>
          <div className="bg-[#111827]/80 rounded-2xl p-4 border border-gray-800 text-center flex-1 sm:min-w-[140px]">
            <span className="block text-gray-400 text-xs uppercase tracking-wider">{language === 'en' ? 'CONVERSION RATE' : 'মূল্য পরিবর্তন'}</span>
            <span className="text-lg font-bold text-emerald-400">1 BDT = 1 Coin</span>
          </div>
        </div>
      </div>

      {/* GAME CATEGORIES CAROUSEL/GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-sans font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            {t('gameCategories')}
          </h2>

          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              {language === 'en' ? 'View All Games' : 'সব গেম দেখুন'} &rarr;
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Default ALL Category Card */}
          <div
            onClick={() => setSelectedCategory('All')}
            className={`cursor-pointer rounded-2xl p-4 transition-all relative overflow-hidden flex flex-col justify-between h-28 border border-gray-800/80 hover:scale-[1.02] ${
              selectedCategory === 'All'
                ? 'bg-gradient-to-br from-amber-500/20 to-orange-600/10 border-amber-500/50 shadow-lg shadow-amber-500/5'
                : 'bg-[#181a26]/90 hover:bg-[#1f2130]'
            }`}
          >
            <span className="text-2xl">🔥</span>
            <div>
              <span className="block font-bold text-white text-sm sm:text-base">{t('allGames')}</span>
              <span className="text-[10px] sm:text-xs text-gray-400">
                {tournaments.length} {language === 'en' ? 'Matches' : 'টি টুর্নামেন্ট'}
              </span>
            </div>
            {selectedCategory === 'All' && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500"></div>
            )}
          </div>

          {/* Dynamic Categories Cards */}
          {categories.map((cat) => {
            const isSel = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            const count = getCount(cat.name);
            return (
              <div
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`cursor-pointer rounded-2xl p-4 transition-all relative overflow-hidden flex flex-col justify-between h-28 border hover:scale-[1.02] ${
                  isSel
                    ? `bg-gradient-to-br ${cat.color}/20 border-amber-400 shadow-md shadow-amber-500/5`
                    : 'bg-[#181a26]/90 hover:bg-[#1f2130] border-gray-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{cat.icon}</span>
                  {count > 0 && (
                    <span className="text-[9px] px-2 py-0.5 font-bold font-mono text-black bg-amber-400 rounded-full">
                      {count}
                    </span>
                  )}
                </div>
                <div>
                  <span className="block font-bold text-white text-sm sm:text-base">{cat.name}</span>
                  <span className="text-[10px] text-gray-400 line-clamp-1">{cat.desc}</span>
                </div>
                {isSel && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500"></div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* TOURNAMENT Matches List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-sans font-extrabold text-white tracking-tight">
            {selectedCategory === 'All' 
              ? t('activeTournaments')
              : t('tournamentsFor', { game: selectedCategory })}
          </h2>
          <span className="text-xs text-gray-400 font-mono">
            {filteredTournaments.length} {language === 'en' ? 'Available' : 'টি উপলভ্য'}
          </span>
        </div>

        {filteredTournaments.length === 0 ? (
          <div className="border border-dashed border-gray-800 rounded-3xl p-12 text-center bg-[#0d0e16]/40 max-w-2xl mx-auto space-y-4">
            <Info className="h-10 w-10 text-slate-500 mx-auto" />
            <h3 className="text-white font-bold">{language === 'en' ? 'No Games Active' : 'কোন ম্যাচ চালু নেই'}</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              {t('noTournaments')}
            </p>
            <button
              onClick={() => setCurrentView('dev' as any)}
              className="mt-2 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 hover:bg-amber-500/20 rounded-xl transition-all"
            >
              {language === 'en' ? 'Access Testing Seeder Panel' : 'টেস্টার প্যানেল খুলুন'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 max-w-2xl mx-auto w-full">
            {filteredTournaments.map((match) => {
              const capUsed = match.joined_count;
              const capTotal = match.total_slots;
              const pct = Math.min(100, Math.round((capUsed / capTotal) * 100));
              const isJoined = profile && match.joined_players_uids?.includes(profile.uid);
              const isFull = capUsed >= capTotal;

              return (
                <div
                  key={match.match_id}
                  className="bg-[#121420] border border-gray-800/90 rounded-3xl hover:border-amber-500/30 overflow-hidden flex flex-col justify-between transition-all group duration-300"
                >
                  {/* Game Cover Banner Image slot */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden shrink-0 bg-[#0d0e16]/85 border-b border-gray-800/40">
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
                  <div className="p-4 border-b border-gray-800/50 space-y-3.5">
                    <h3 className="font-extrabold text-white text-sm sm:text-base tracking-tight line-clamp-1">
                      {match.title}
                    </h3>

                    {/* Metadata attributes */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1 text-gray-400 bg-[#0d0e16]/55 px-2.5 py-1.5 rounded-xl border border-white/5">
                        <span className="text-[10px] text-gray-500 uppercase">
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
                        <span className="font-semibold text-white truncate text-[11px]">
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
                      <div className="flex items-center gap-1 text-gray-400 bg-[#0d0e16]/55 px-2.5 py-1.5 rounded-xl border border-white/5">
                        <span className="text-[10px] text-gray-500 uppercase">
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
                        <span className="font-semibold text-white truncate text-[11px]">
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
                  <div className="bg-[#1a1c2b]/30 p-4 grid grid-cols-3 gap-1 border-b border-gray-800/40 text-center">
                    <div>
                      <span className="block text-[9px] text-slate-500 uppercase font-medium">
                        {t('prizePool')}
                      </span>
                      <span className="text-sm font-mono font-extrabold text-amber-400">
                        {match.prize_pool} C
                      </span>
                    </div>

                    <div>
                      <span className="block text-[9px] text-slate-500 uppercase font-medium">
                        {['Free Fire', 'PUBG/BGMI', 'Call of Duty'].includes(match.game_category) 
                          ? t('perKill') 
                          : language === 'en' ? 'Kill Reward' : 'কিল পুরস্কার'}
                      </span>
                      <span className={`text-sm font-mono font-extrabold ${['Free Fire', 'PUBG/BGMI', 'Call of Duty'].includes(match.game_category) ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {['Free Fire', 'PUBG/BGMI', 'Call of Duty'].includes(match.game_category) 
                          ? `${match.per_kill || '0'} C` 
                          : 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[9px] text-slate-500 uppercase font-medium">
                        {t('entryFee')}
                      </span>
                      <span className="text-sm font-mono font-extrabold text-white">
                        {match.entry_fee || 'FREE'} C
                      </span>
                    </div>
                  </div>

                  {/* Seat availability counter */}
                  <div className="p-4 space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-indigo-400" />
                          {capUsed} / {capTotal} {language === 'en' ? 'Players' : 'খেলোয়াড়'}
                        </span>
                        <span className="font-mono text-gray-500 font-bold">
                          {capTotal - capUsed} {t('slotsAvailable')}
                        </span>
                      </div>
                      
                      {/* Custom progress bar */}
                      <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Button with validation action checks */}
                    {isJoined ? (
                      <button
                        onClick={() => {
                          setCurrentView('joined');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer select-none"
                      >
                        <UserCheck className="h-4 w-4" />
                        {language === 'en' ? 'Registered - View Room Card' : 'নিবন্ধিত সম্পন্ন - রুম আইডি দেখুন'}
                      </button>
                    ) : isFull ? (
                      <div className="w-full text-center py-2 bg-gray-800 text-gray-500 rounded-xl font-bold text-xs">
                        {t('matchFull')}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleMatchClick(match)}
                        className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer hover:shadow-lg hover:shadow-orange-500/5 select-none"
                      >
                        {t('joinNow')}
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

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
