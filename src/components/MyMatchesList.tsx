import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { Tournament } from '../types';
import { db } from '../firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { 
  Trophy, 
  MapPin, 
  Calendar, 
  Clock, 
  Key, 
  Copy, 
  Check, 
  Users, 
  Award,
  BookOpen,
  User,
  Zap,
  CheckCircle,
  HelpCircle,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

const WinnerCelebrationBanner: React.FC<{ match: Tournament }> = ({ match }) => {
  if (!match.winner_name) return null;

  const theme = match.winner_banner_theme || 'classic_gold';
  let customImg = match.winner_banner_image;

  // Supply high-quality themed fallback if customImg is empty or invalid
  if (!customImg || !customImg.trim().startsWith('http')) {
    switch (theme) {
      case 'cyber_neon':
        customImg = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800";
        break;
      case 'royal_champion':
        customImg = "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800";
        break;
      case 'gaming_dark':
        customImg = "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=800";
        break;
      case 'classic_gold':
      default:
        customImg = "https://images.unsplash.com/photo-1578269174936-2709b5a5e003?auto=format&fit=crop&q=80&w=800";
        break;
    }
  }

  // Presets configurations
  let bgClass = "bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10";
  let borderClass = "border-amber-500/20";
  let badgeLabel = "🥇 CHAMPION DECLARATION";
  let accentBg = "bg-amber-500/10 text-amber-400";
  let iconColor = "text-amber-400";
  
  if (theme === 'cyber_neon') {
    bgClass = "bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-pink-500/10";
    borderClass = "border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]";
    badgeLabel = "⚡ DECLARED CYBER CHAMPION";
    accentBg = "bg-cyan-500/15 text-cyan-300";
    iconColor = "text-cyan-300";
  } else if (theme === 'royal_champion') {
    bgClass = "bg-gradient-to-r from-rose-600/10 via-rose-500/5 to-amber-500/10";
    borderClass = "border-rose-500/20";
    badgeLabel = "👑 ROYAL CHAMPIONSHIP CREST";
    accentBg = "bg-rose-500/15 text-rose-300";
    iconColor = "text-rose-400";
  } else if (theme === 'gaming_dark') {
    bgClass = "bg-gradient-to-r from-[#e11d48]/5 via-[#0f172a]/70 to-[#2563eb]/5";
    borderClass = "border-[#3b82f6]/20";
    badgeLabel = "🔥 ELITE PRO GAMER VICTORY";
    accentBg = "bg-indigo-500/15 text-[#60a5fa]";
    iconColor = "text-indigo-400";
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-[#0a0b12] group transition-all duration-300 hover:border-amber-500/40">
      {/* Banner Image */}
      <div className="h-44 sm:h-52 w-full overflow-hidden relative">
        <img 
          src={customImg} 
          alt="Tournament Winner Banner" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b12] via-[#0a0b12]/40 to-transparent" />
        
        {/* Top-left Badges */}
        <div className="absolute top-4 left-4 flex gap-1.5 flex-wrap">
          <span className="bg-amber-500 text-black text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg">
            🥇 VICTORY BANNER
          </span>
          <span className="bg-[#0f111a]/80 backdrop-blur-md text-white border border-gray-700 text-[9px] font-mono px-2 py-0.5 rounded-full">
            {match.game_category}
          </span>
        </div>
      </div>

      {/* glass summary stats panel */}
      <div className="p-4 bg-[#0d0f1b] border-t border-gray-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        <div className="space-y-0.5">
          <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider block">Winner Player Name</span>
          <span className="text-white font-extrabold text-sm sm:text-base tracking-wide flex items-center gap-1 truncate">
            {match.winner_name} 🛡️
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:col-span-2">
          <div className="bg-[#121422] border border-gray-800/60 rounded-xl px-3 py-1.5 text-center sm:text-left">
            <span className="text-[8px] text-gray-500 uppercase tracking-wider font-bold block">Prize Reward</span>
            <span className="text-amber-400 font-extrabold text-xs sm:text-sm font-mono">{match.winner_prize || match.prize_pool} Coins</span>
          </div>
          <div className="bg-[#121422] border border-gray-800/60 rounded-xl px-3 py-1.5 text-center sm:text-left">
            <span className="text-[8px] text-gray-500 uppercase tracking-wider font-bold block">Player Kills</span>
            <span className="text-white font-extrabold text-xs sm:text-sm font-mono">{match.winner_kills || 0} Kills</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MyMatchesList: React.FC = () => {
  const { profile, tournaments, t, language } = useApp();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Screenshot claim submission states
  const [proofMatchId, setProofMatchId] = useState<string | null>(null);
  const [proofInGameId, setProofInGameId] = useState<string>('');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [proofSuccess, setProofSuccess] = useState<boolean>(false);

  const handleSendProof = async (match: Tournament) => {
    if (!profile) return;
    if (!proofInGameId.trim() || !proofUrl.trim()) {
      alert("Please enter both your Game Char ID and Screenshot proof URL!");
      return;
    }

    try {
      const submissionsCol = collection(db, 'proof_submissions');
      const newDocRef = doc(submissionsCol);
      await setDoc(newDocRef, {
        id: newDocRef.id,
        userId: profile.uid,
        userName: profile.name,
        matchId: match.match_id,
        matchTitle: match.title,
        inGameId: proofInGameId,
        screenshotUrl: proofUrl,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });
      setProofSuccess(true);
      setTimeout(() => {
        setProofSuccess(false);
        setProofMatchId(null);
        setProofInGameId('');
        setProofUrl('');
      }, 3000);
    } catch (err) {
      alert("Error sending claim. Please ensure fields are correct.");
    }
  };

  // Keep stopwatch ticked for Room ID 10-15 mins calculations
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // 10s tick
    return () => clearInterval(timer);
  }, []);

  if (!profile) {
    return (
      <div className="text-center py-16 border border-dashed border-gray-800 rounded-3xl max-w-xl mx-auto space-y-4">
        <Users className="h-10 w-10 text-slate-500 mx-auto" />
        <h3 className="text-white font-bold">{t('notLoggedIn')}</h3>
        <p className="text-gray-400 text-xs">{language === 'en' ? 'Please sign in or enter guest mode to view your leagues.' : 'আপনার নিবন্ধিত ম্যাচ দেখতে দয়া করে লগইন করুন।'}</p>
      </div>
    );
  }

  const uidsMatchFilter = (tournament: Tournament) => {
    return Array.isArray(tournament.joined_players_uids) && tournament.joined_players_uids.includes(profile.uid);
  };

  // Divide tournaments into joined upcoming, or past results
  const upcomingJoined = tournaments.filter((tournament) => {
    return uidsMatchFilter(tournament) && !tournament.winner_name;
  });

  // Past results (strictly includes matches where winner is explicitly declared by Admin)
  const pastMatches = tournaments.filter((tournament) => {
    return !!tournament.winner_name;
  });

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper: check if tournament starts within 15 minutes to reveal Room Key
  const getMinutesToMatch = (isoStr: string) => {
    const matchTime = new Date(isoStr);
    const diffMs = matchTime.getTime() - currentTime.getTime();
    return Math.floor(diffMs / 60000);
  };

  const isRoomCredentialsVisible = (isoStr: string) => {
    const mins = getMinutesToMatch(isoStr);
    // Revealed if match starts within 15 mins (or starts in past)
    return mins <= 15;
  };

  // Real leaderboard generator (strictly from admin-declared entries)
  const getLeaderboard = (match: Tournament) => {
    const list = [];
    if (match.winner_name) {
      list.push({
        rank: 1,
        name: match.winner_name + " 🏆 (Winner)",
        kills: match.winner_kills || 0,
        prize: match.winner_prize || match.prize_pool
      });
    }
    return list;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Description Banner */}
      <div>
        <h2 className="text-xl sm:text-2xl font-sans font-extrabold text-white tracking-tight flex items-center gap-2">
          <Calendar className="h-6 w-6 text-amber-500" />
          {t('myMatches')}
        </h2>
        <p className="text-gray-400 text-xs mt-1">
          {t('myMatchesDesc')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setTab('upcoming')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-1.5 ${
            tab === 'upcoming'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Zap className="h-4 w-4" />
          {t('activeJoined')}
          {upcomingJoined.length > 0 && (
            <span className="bg-amber-500 font-mono text-black font-extrabold px-2 py-0.5 rounded-full text-[10px]">
              {upcomingJoined.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('past')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-1.5 ${
            tab === 'past'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Award className="h-4 w-4" />
          {t('pastResults')}
        </button>
      </div>

      {tab === 'upcoming' ? (
        upcomingJoined.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-800 rounded-3xl p-6 bg-[#0d0e16]/40 max-w-lg mx-auto space-y-4">
            <BookOpen className="h-10 w-10 text-slate-600 mx-auto" />
            <h4 className="text-white font-bold">{language === 'en' ? 'No Registered Matches yet' : 'কোন নিবন্ধিত ম্যাচ চালু নেই'}</h4>
            <p className="text-gray-400 text-xs">
              {t('noMatchesJoined')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto w-full">
            {upcomingJoined.map((match) => {
              const visible = isRoomCredentialsVisible(match.time);
              const minsLeft = getMinutesToMatch(match.time);
              const isRevealed = !!(match.room_id || match.room_password);

              return (
                <div 
                  key={match.match_id} 
                  className="bg-[#121420] border border-gray-800/90 rounded-3xl overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {match.game_category}
                      </span>
                      <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" /> {language === 'en' ? 'Registered' : 'নিবন্ধিত সম্পন্ন'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-white text-base">
                      {match.title}
                    </h3>

                    {/* Metadata attributes */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1 text-gray-400 bg-[#0d0e16]/55 px-2.5 py-2 rounded-xl">
                        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                        <span className="font-semibold text-white truncate">
                          {new Date(match.time).toLocaleString(language === 'en' ? 'en' : 'bn')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 bg-[#0d0e16]/55 px-2.5 py-2 rounded-xl">
                        <Trophy className="h-3.5 w-3.5 text-amber-400" />
                        <span className="font-mono font-bold text-white">
                          Prize: {match.prize_pool} C
                        </span>
                      </div>
                    </div>

                    {/* Credentials Unlock Banner */}
                    <div className="bg-[#181a26] border border-gray-800 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                          <Key className="h-4 w-4 text-amber-400" />
                          {t('roomIdPassTitle')}
                        </span>
                        
                        {!isRevealed && (
                          <span className="text-[10px] font-mono text-orange-400 font-bold">
                            {t('roomReadyIn', { mins: minsLeft })}
                          </span>
                        )}
                      </div>

                      {isRevealed ? (
                        <div className="space-y-3">
                          <div className="text-[11px] text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-lg">
                            {t('revealedBanner')}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {/* Room ID Copy */}
                            <div className="bg-[#0f111a] rounded-xl px-3 py-2 border border-gray-800 flex justify-between items-center">
                              <div className="truncate">
                                <span className="block text-[8px] text-gray-500 font-mono tracking-wide uppercase">{t('roomIdLabel')}</span>
                                <span className="text-[13px] font-mono font-extrabold text-white tracking-wider truncate">{match.room_id}</span>
                              </div>
                              <button
                                onClick={() => handleCopyText(match.room_id, match.match_id + '_rid')}
                                className="p-1 text-gray-400 hover:text-white"
                                title="Copy Room ID"
                              >
                                {copiedId === match.match_id + '_rid' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                              </button>
                            </div>

                            {/* Room Password Copy */}
                            <div className="bg-[#0f111a] rounded-xl px-3 py-2 border border-gray-800 flex justify-between items-center">
                              <div className="truncate">
                                <span className="block text-[8px] text-gray-500 font-mono tracking-wide uppercase">{t('passwordLabel')}</span>
                                <span className="text-[13px] font-mono font-extrabold text-[#f59e0b] tracking-wider truncate">{match.room_password}</span>
                              </div>
                              <button
                                onClick={() => handleCopyText(match.room_password, match.match_id + '_pass')}
                                className="p-1 text-gray-400 hover:text-white"
                                title="Copy Room Password"
                              >
                                {copiedId === match.match_id + '_pass' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2.5 text-gray-400 text-xs">
                          {t('roomIdPassBanner')}
                        </div>
                      )}
                    </div>

                    {/* Professional Winner celebration banner display area */}
                    <div className="pt-3 border-t border-gray-800/60 mt-3">
                      {match.winner_name ? (
                        <WinnerCelebrationBanner match={match} />
                      ) : (
                        <div className="bg-[#181a26]/40 p-3.5 border border-dashed border-gray-800 rounded-xl text-center text-gray-400 text-[11px]">
                          ⏳ {language === 'en' ? 'Evaluation in progress. Admin will declare the winner shortly.' : 'ম্যাচ যাচাইকরণ চলছে। এডমিন শীঘ্রই বিজয়ী ঘোষণা করবেন।'}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* PAST MATCHES RESULTS */
        pastMatches.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-xs">
            {t('noPastMatches')}
          </div>
        ) : (
          <div className="space-y-6">
            {pastMatches.map((match) => {
              const leaderboard = getLeaderboard(match);

              return (
                <div 
                  key={match.match_id} 
                  className="bg-[#121420] border border-gray-800/90 rounded-3xl p-5 sm:p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300">
                        {match.game_category}
                      </span>
                      <h3 className="font-extrabold text-white text-base mt-2">
                        {match.title}
                      </h3>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="block text-[11px] text-emerald-400 font-semibold">
                        {t('pastMatchNote')}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(match.time).toLocaleDateString(language === 'en' ? 'en-US' : 'bn-BD')}
                      </span>
                    </div>
                  </div>

                  {/* Leaderboards */}
                  {match.winner_name && (
                    <div className="mb-4">
                      <WinnerCelebrationBanner match={match} />
                    </div>
                  )}

                  <div className="bg-[#181a26]/70 rounded-2xl p-3 sm:p-4 border border-gray-800/80">
                    <span className="text-xs font-bold text-gray-300 block mb-3 font-sans">
                      {t('leaderboard')}
                    </span>

                    {leaderboard.length === 0 ? (
                      <div className="text-center py-5 text-gray-500 font-sans text-xs italic">
                        {language === 'en' 
                          ? '🕒 Live game completed. Results will be published by Admin shortly.' 
                          : '🕒 ম্যাচ যাচাইকরণ চলছে। এডমিন শীঘ্রই বিজয়ী তালিকা প্রকাশ করবেন।'}
                      </div>
                    ) : (
                      <table className="w-full text-left font-sans">
                        <thead>
                          <tr className="border-b border-gray-800 text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                            <th className="pb-2">{t('rank')}</th>
                            <th className="pb-2">{t('player')}</th>
                            <th className="pb-2 text-center">{t('kills')}</th>
                            <th className="pb-2 text-right">{t('prizesWon')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                          {leaderboard.map((row) => (
                            <tr key={row.rank} className="hover:bg-slate-900/10">
                              <td className="py-2">
                                {row.rank === 1 ? '🥇 1st' : row.rank === 2 ? '🥈 2nd' : row.rank === 3 ? '🥉 3rd' : `${row.rank}th`}
                              </td>
                              <td className="py-2 font-semibold">
                                {row.name}
                              </td>
                              <td className="py-2 text-center font-mono font-medium">
                                {row.kills}
                              </td>
                              <td className="py-2 text-right font-mono font-bold text-amber-400">
                                {row.prize} C
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )
      )}

    </div>
  );
};
export default MyMatchesList;
