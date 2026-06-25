import React, { useState } from 'react';
import { useApp } from './AppContext';
import { Trophy, Flame, ChevronLeft, ArrowLeft, Gamepad2, Sparkles, Filter } from 'lucide-react';
import { TournamentDetailModal } from './TournamentDetailModal';
import { getGameFallbackBanner } from './Dashboard';

export const AllTournamentsView: React.FC = () => {
  const { 
    tournaments, 
    profile, 
    language, 
    setCurrentView 
  } = useApp();

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);

  const activeTournaments = (tournaments || []).filter(t => !t.winner_name);
  const filteredCompacts = activeTournaments.filter(t => {
    if (selectedSubCategory === 'All') return true;
    return t.game_category.toLowerCase() === selectedSubCategory.toLowerCase();
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Premium Header Bar with Back navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0b0c13] border border-gray-800/80 p-4 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('home')}
            className="p-2 sm:p-2.5 bg-[#141624] hover:bg-[#1c1f33] border border-gray-800 hover:border-amber-500/30 text-gray-300 hover:text-amber-400 rounded-2xl transition-all cursor-pointer group"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:-translate-x-1" />
          </button>
          
          <div className="text-left space-y-1">
            <h2 className="text-white font-extrabold text-sm sm:text-lg flex items-center gap-2 leading-none">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 animate-pulse" />
              <span>{language === 'en' ? 'All Live Tournaments' : 'সকল লাইভ টুর্নামেন্ট'}</span>
            </h2>
            <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium leading-none">
              {language === 'en' ? 'Choose any custom esports lobby to register' : 'খেলার জন্য যেকোনো একটি কাস্টম টুর্নামেন্ট বেছে নিন'}
            </p>
          </div>
        </div>

        {/* Micro Category Filter Selectors */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none select-none">
          <Filter className="h-3.5 w-3.5 text-gray-500 shrink-0 hidden xs:inline" />
          {[
            { id: 'All', label: language === 'en' ? 'All Matches' : 'সকল টুর্নামেন্ট' },
            { id: 'Free Fire', label: 'Free Fire' },
            { id: 'PUBG/BGMI', label: 'PUBG' },
            { id: 'Ludo', label: 'Ludo' }
          ].map((cat) => {
            const isSel = selectedSubCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedSubCategory(cat.id)}
                className={`text-[9.5px] font-black px-3 py-2 rounded-xl border transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  isSel
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 border-amber-400 text-black font-black shadow-md'
                    : 'bg-[#141624]/60 hover:bg-[#1a1d30] text-gray-400 border-gray-800/80 hover:border-gray-750'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid View Container: EXACTLY 2 CARDS PER ROW ALWAYS */}
      {filteredCompacts.length === 0 ? (
        <div className="bg-[#0b0c13] border border-gray-800/80 rounded-3xl py-12 text-center space-y-3">
          <Gamepad2 className="h-10 w-10 text-gray-600 mx-auto animate-bounce" />
          <p className="text-xs sm:text-sm text-gray-500 font-bold italic">
            {language === 'en' 
              ? 'No active matches found matching the selection.' 
              : 'দুঃখিত! এই ক্যাটাগরিতে কোনো একটি লাইভ টুর্নামেন্টও পাওয়া যায়নি।'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          {filteredCompacts.map((match) => {
            const pct = Math.min(100, Math.round(((match.joined_count || 0) / (match.total_slots || 48)) * 100));
            const isJoined = profile && match.joined_players_uids?.includes(profile.uid);
            const isFull = (match.joined_count || 0) >= (match.total_slots || 48);

            return (
              <div
                key={match.match_id}
                onClick={() => setSelectedMatch(match)}
                className="flex flex-col bg-[#0b0c13]/90 border border-gray-850 hover:border-amber-500/30 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-200 cursor-pointer group hover:bg-[#111220] shadow-xl relative select-none transform active:scale-[0.98]"
              >
                {/* Image Header wrapper layout */}
                <div className="relative w-full h-24 sm:h-40 bg-black/40 border-b border-gray-800/40">
                  <img
                    src={match.image_url || getGameFallbackBanner(match.game_category)}
                    alt={match.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e101d]/90 via-[#0e101d]/10 to-transparent" />
                  
                  {/* Category overlay label */}
                  <span className="absolute top-2 left-2 text-[8px] font-black bg-black/80 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded whitespace-nowrap uppercase tracking-wider">
                    {match.game_category}
                  </span>
                </div>

                {/* Info and metadata area nested container */}
                <div className="p-3 sm:p-4 text-left flex-grow flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-[10px] sm:text-xs font-black text-white line-clamp-1 group-hover:text-amber-400 transition-colors leading-tight">
                      {match.title}
                    </h4>
                    
                    {/* Game Mode Detail */}
                    <p className="text-[8px] sm:text-[10px] text-gray-500 font-bold truncate mt-1">
                      🕹️ {match.game_mode ? match.game_mode.replace(/\s*\(.*\)/g, '') : 'Classic / Squad'}
                    </p>
                  </div>

                  {/* Financial Prizes info */}
                  <div className="flex items-center justify-between gap-1 border-t border-gray-800/30 pt-2 text-[9px] sm:text-xs font-mono">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-gray-500 leading-none">{language === 'en' ? 'PRIZE' : 'প্রাইজ'}</span>
                      <span className="text-amber-500 font-black text-[10px] sm:text-xs">৳{match.prize_pool}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[8px] text-gray-505 leading-none">{language === 'en' ? 'ENTRY' : 'এন্ট্রি'}</span>
                      <span className="text-emerald-400 font-black text-[10px] sm:text-xs">৳{match.entry_fee}</span>
                    </div>
                  </div>

                  {/* Progressive indicator for registration counts */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[8.5px] text-gray-500 font-black font-mono">
                      <span>{language === 'en' ? 'Seats Full' : 'সীট সংখ্যা'}</span>
                      <span>{match.joined_count}/{match.total_slots}</span>
                    </div>
                    <div className="w-full h-1 bg-black/70 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Button Action CTA badge */}
                  <div className="pt-1">
                    {isJoined ? (
                      <span className="w-full text-[9px] sm:text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-1.5 sm:py-2 rounded-xl font-black uppercase text-center block tracking-wider">
                        {language === 'en' ? 'JOINED' : 'নিবন্ধিত'}
                      </span>
                    ) : isFull ? (
                      <span className="w-full text-[9px] sm:text-xs bg-gray-850 text-gray-500 py-1.5 sm:py-2 rounded-xl font-black uppercase text-center block tracking-wider">
                        {language === 'en' ? 'FULL' : 'ফুল'}
                      </span>
                    ) : (
                      <span className="w-full text-[9px] sm:text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black py-1.5 sm:py-2 rounded-xl uppercase tracking-wider text-center block border-b border-orange-600 group-hover:from-amber-400 group-hover:to-orange-450">
                        {language === 'en' ? 'PLAY MATCH' : 'নিবন্ধন করুন'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail overlay Modal sliding card */}
      {selectedMatch && (
        <TournamentDetailModal 
          tournament={selectedMatch} 
          onClose={() => setSelectedMatch(null)} 
        />
      )}
    </div>
  );
};
