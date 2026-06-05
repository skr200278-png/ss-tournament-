import React, { useState } from 'react';
import { useApp } from './AppContext';
import { 
  Trophy, 
  Gamepad2, 
  Calendar, 
  Search, 
  Sparkles, 
  MapPin, 
  Users, 
  Crown,
  Share2,
  Sword
} from 'lucide-react';
import { Tournament } from '../types';

export const WinnersList: React.FC = () => {
  const { tournaments, language } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Only show tournaments that have a declared winner
  const completedMatches = tournaments.filter(t => t.winner_name);

  // Filter based on search query
  const filteredMatches = completedMatches.filter(t => 
    t.winner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.game_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.room_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getThemeStyles = (theme: string) => {
    switch (theme) {
      case 'cyber_neon':
        return {
          bg: "bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-pink-500/10",
          border: "border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
          badge: "⚡ DYNAMIC NEON CHAMPION",
          accentText: "text-cyan-400",
          btnBg: "bg-cyan-500/15 text-cyan-300",
          glow: "from-cyan-500 to-fuchsia-500"
        };
      case 'royal_champion':
        return {
          bg: "bg-gradient-to-r from-rose-600/10 via-rose-500/5 to-amber-500/10",
          border: "border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]",
          badge: "👑 ROYAL CHAMPION CREST",
          accentText: "text-rose-400",
          btnBg: "bg-rose-500/15 text-rose-300",
          glow: "from-rose-500 to-amber-500"
        };
      case 'gaming_dark':
        return {
          bg: "bg-gradient-to-r from-[#e11d48]/10 via-[#0f172a]/80 to-[#2563eb]/10",
          border: "border-[#3b82f6]/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]",
          badge: "🔥 ELITE CYBER VICTORY",
          accentText: "text-blue-400",
          btnBg: "bg-indigo-500/15 text-[#60a5fa]",
          glow: "from-rose-600 to-blue-600"
        };
      case 'classic_gold':
      default:
        return {
          bg: "bg-gradient-to-r from-amber-500/15 via-yellow-500/5 to-amber-500/15",
          border: "border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
          badge: "🥇 CLASSIC CHAMPION DECLARED",
          accentText: "text-amber-400",
          btnBg: "bg-amber-500/10 text-amber-400",
          glow: "from-amber-500 to-yellow-400"
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Header Section */}
      <div className="bg-gradient-to-b from-[#111322] to-[#0d0f1b] rounded-3xl p-6 sm:p-8 border border-gray-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Trophy className="h-44 w-44 text-amber-500" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 z-10 relative">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs tracking-wider uppercase">
              <Sparkles className="h-4 w-4 animate-spin" style={{ animationDuration: '4s' }} />
              {language === 'en' ? 'WINNERS ANNOUNCEMENT' : 'বিজয়ীদের তালিকা প্যানেল'}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {language === 'en' ? '🏆 Live Tournament Results' : '🏆 টুর্নামেন্ট ফলাফল ও বিজয়ীবৃন্দ'}
            </h2>
            <p className="text-gray-400 text-xs leading-relaxed leading-3">
              {language === 'en'
                ? 'Check out the elite players who conquered the matches. All rewarded coins have been distributed directly into winners accounts.'
                : 'সকল সফল খেলার ফলাফল নিচে দেওয়া হলো। এডমিন কর্তৃক ঘোষিত বিজয়ীদের ওয়ালেটে কয়েন সরাসরি পৌঁছে গিয়েছে।'}
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder={language === 'en' ? 'Search by player, game...' : 'প্লেয়ার বা টুর্নামেন্ট সার্চ করুন...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#07080d]/90 border border-gray-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Results Listing Grid */}
      {filteredMatches.length === 0 ? (
        <div className="bg-[#111322]/40 rounded-3xl p-16 text-center border border-dashed border-gray-850">
          <div className="bg-amber-500/10 p-4 rounded-full w-fit mx-auto text-amber-400 mb-4 animate-bounce">
            <Trophy className="h-8 w-8" />
          </div>
          <p className="text-white font-extrabold text-sm">
            {language === 'en' ? 'No Declared Winners Found' : 'কোনো ফলাফল খুঁজে পাওয়া যায়নি'}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            {language === 'en' 
              ? 'Results appear here automatically once the tournament admin declares a winner.' 
              : 'এডমিন ম্যাচ শেষে যখনই বিজয়ী ঘোষণা করবেন, সেই ফলাফল এখানে স্বয়ংক্রিয়ভাবে দেখাবে।'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredMatches.map((match) => {
            const styles = getThemeStyles(match.winner_banner_theme || 'classic_gold');
            const customImg = match.winner_banner_image;

            return (
              <div 
                key={match.match_id}
                id={`winner-card-${match.match_id}`}
                className={`bg-[#111322] border border-gray-800 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:border-amber-500/30 flex flex-col`}
              >
                {/* Banner Section */}
                {customImg && customImg.trim().startsWith('http') ? (
                  <div className="h-56 sm:h-64 w-full overflow-hidden relative shrink-0">
                    <img 
                      src={customImg} 
                      alt="Victory Celebration" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Dark gradient overlay to ensure text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/20" />
                    
                    {/* Top badges */}
                    <div className="absolute top-4 left-4 flex gap-1.5 flex-wrap">
                      <span className="bg-amber-500 text-black text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg">
                        🥇 CHAMPION DECLARED
                      </span>
                      <span className="bg-black/70 backdrop-blur-md text-gray-300 border border-gray-800 text-[9px] font-mono px-2.5 py-1 rounded-full uppercase">
                        {match.game_category}
                      </span>
                    </div>

                    {/* Rich Floating Winner Badge Over the Banner */}
                    <div className="absolute bottom-4 left-4 right-4 bg-[#0f111d]/90 backdrop-blur-md border border-gray-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
                      <div className="flex items-center gap-3 w-full sm:w-auto text-center sm:text-left">
                        <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 shrink-0 mx-auto sm:mx-0">
                          <Crown className="h-5 w-5 animate-bounce" style={{ animationDuration: '3s' }} />
                        </div>
                        <div className="truncate w-full">
                          <span className="text-[8px] font-extrabold tracking-widest text-amber-500 block uppercase">CONQUEROR CHAMPION</span>
                          <span className="text-white font-extrabold text-sm sm:text-base tracking-wide flex items-center justify-center sm:justify-start gap-1">
                            {match.winner_name} 🏆
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto font-mono text-center shrink-0">
                        <div className="flex-1 sm:flex-none bg-black/50 border border-gray-800/80 rounded-xl px-3.5 py-1.5 min-w-[75px]">
                          <span className="text-[7px] text-gray-500 uppercase font-black block">KILLS</span>
                          <span className="text-white font-bold text-xs sm:text-sm block mt-0.5">{match.winner_kills || 0}</span>
                        </div>
                        <div className="flex-1 sm:flex-none bg-amber-500/10 border border-amber-500/20 rounded-xl px-3.5 py-1.5 min-w-[75px]">
                          <span className="text-[7px] text-amber-400 uppercase font-black block">PRIZE</span>
                          <span className="text-amber-400 font-bold text-xs sm:text-sm block mt-0.5">{match.winner_prize || match.prize_pool} C</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Dynamic Generated Banner Layout */
                  <div className={`relative px-6 py-8 sm:p-8 border-b border-gray-850/80 ${styles.bg} overflow-hidden shrink-0 flex flex-col sm:flex-row items-center justify-between gap-6`}>
                    {/* Glowing Accent Ring */}
                    <div className={`absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-br ${styles.glow} rounded-full opacity-10 filter blur-xl pointer-events-none`} />

                    <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left z-10">
                      <div className={`p-4 rounded-2xl ${styles.btnBg} flex items-center justify-center shrink-0 shadow-lg`}>
                        <Crown className="h-7 w-7" />
                      </div>
                      <div>
                        <span className={`text-[10px] sm:text-xs font-black tracking-widest uppercase block ${styles.accentText}`}>
                          {styles.badge}
                        </span>
                        <h3 className="text-white text-base sm:text-xl font-black tracking-wide mt-1">
                          {match.winner_name}
                        </h3>
                        <p className="text-[10px] text-gray-500 mt-0.5 font-mono">
                          {language === 'en' ? 'Category: ' : 'গেম ক্যাটাগরি: '} 
                          <span className="text-gray-300 font-bold">{match.game_category}</span> 
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 z-10 w-full sm:w-auto font-mono text-center">
                      <div className="flex-1 sm:flex-none bg-black/40 border border-gray-800 rounded-xl px-4 py-2.5 min-w-[90px]">
                        <span className="text-[8px] text-gray-500 uppercase font-extrabold block">TOTAL KILLS</span>
                        <span className="text-white font-extrabold text-sm sm:text-base mt-0.5 block">{match.winner_kills || 0}</span>
                      </div>
                      <div className="flex-1 sm:flex-none bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-2.5 min-w-[90px]">
                        <span className="text-[8px] text-amber-500 uppercase font-extrabold block">PRIZE AWARD</span>
                        <span className="text-amber-400 font-extrabold text-sm sm:text-base mt-0.5 block">{match.winner_prize || match.prize_pool} C</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Match Details Footer Card Row */}
                <div className="p-5 sm:p-6 bg-[#0a0c14] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="grid grid-cols-2 md:flex md:items-center gap-4 md:gap-6">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-gray-500 uppercase font-bold block">{language === 'en' ? 'Tournament Title' : 'টুর্নামেন্ট নাম'}</span>
                      <span className="text-white font-bold text-xs truncate max-w-[160px] block">{match.title}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] text-gray-500 uppercase font-bold block">{language === 'en' ? 'Map name' : 'খেলার ম্যাপ'}</span>
                      <span className="text-gray-300 font-mono text-xs flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-rose-500" />
                        {match.map_name || 'Bermuda'}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] text-gray-500 uppercase font-bold block">{language === 'en' ? 'Format type' : 'ফরম্যাট'}</span>
                      <span className="text-gray-300 font-mono text-xs flex items-center gap-1">
                        <Users className="h-3 w-3 text-indigo-400" />
                        {match.format || 'Squad'}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] text-gray-500 uppercase font-bold block">{language === 'en' ? 'Room ID' : 'রুম আইডি'}</span>
                      <span className="text-amber-400 font-mono font-bold text-xs">
                        {match.room_id || 'PRO_MATCH'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t border-gray-850 sm:border-0 pt-3 sm:pt-0 justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-[8px] text-gray-500 uppercase font-mono block">MATCH DATE</span>
                      <span className="text-gray-400 text-[11px] block font-medium">
                        {match.time ? new Date(match.time).toLocaleDateString() : '05/06/2026'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
