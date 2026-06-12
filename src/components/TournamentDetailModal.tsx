import React, { useState } from 'react';
import { Tournament } from '../types';
import { useApp } from './AppContext';
import { X, Trophy, Coins, Target, MapPin, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

interface TournamentDetailModalProps {
  tournament: Tournament;
  onClose: () => void;
}

export const TournamentDetailModal: React.FC<TournamentDetailModalProps> = ({ tournament, onClose }) => {
  const { profile, joinTournament, t, language, setCurrentView } = useApp();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states based on game format (Solo, Duo, Squad, 1v1, 4-Player, etc.)
  const fmt = tournament.format?.toLowerCase() || 'solo';
  
  // Decide exact player count based on format string
  let playerCount = 1;
  if (fmt.includes('solo') || fmt.includes('1v1') || fmt === 'single' || fmt.includes('showdown')) {
    playerCount = 1;
  } else if (fmt.includes('duo')) {
    playerCount = 2;
  } else if (fmt.includes('3v3')) {
    playerCount = 3;
  } else if (fmt.includes('5v5')) {
    playerCount = 5;
  } else if (fmt.includes('squad') || fmt.includes('4-player') || fmt.includes('clan war') || fmt.includes('clash squad')) {
    playerCount = 4;
  } else {
    // Fallback based on typical format
    playerCount = 4; // Default to squad size for other team matches
  }

  const isSolo = playerCount === 1;

  const [teamName, setTeamName] = useState('');
  
  // Players name and in-game ID inputs
  const [p1Name, setP1Name] = useState('');
  const [p1Id, setP1Id] = useState('');

  const [p2Name, setP2Name] = useState('');
  const [p2Id, setP2Id] = useState('');

  const [p3Name, setP3Name] = useState('');
  const [p3Id, setP3Id] = useState('');

  const [p4Name, setP4Name] = useState('');
  const [p4Id, setP4Id] = useState('');

  const [p5Name, setP5Name] = useState('');
  const [p5Id, setP5Id] = useState('');

  // Dynamic Label & Placeholder Helpers based on Game Category
  const getNameLabel = () => {
    switch (tournament.game_category) {
      case 'Ludo':
        return language === 'en' ? 'Ludo Player Name' : 'লুডো প্লেয়ার নাম';
      case 'DLS':
        return language === 'en' ? 'DLS Profile Name' : 'DLS প্লেয়ার নাম';
      case 'COC':
        return language === 'en' ? 'Village Name / Tag' : 'ভিলেজ নাম / ট্যাগ';
      case 'Subway Surfers':
        return language === 'en' ? 'Subway Surfers Name' : 'তাবওয়ে সার্ফার্স নাম';
      default:
        return language === 'en' ? 'In-Game Character Name' : 'ইন-গেম ক্যারেক্টার নাম';
    }
  };

  const getIdLabel = () => {
    switch (tournament.game_category) {
      case 'Ludo':
        return language === 'en' ? 'Ludo King ID' : 'লুডো কিং আইডি';
      case 'DLS':
        return language === 'en' ? 'DLS Profile Code' : 'DLS প্রোফাইল কোড';
      case 'COC':
        return language === 'en' ? 'Player Tag (e.g. #Y28U)' : 'প্লেয়ার ট্যাগ (যেমনঃ #Y28U)';
      case 'Subway Surfers':
        return language === 'en' ? 'Play Store / Facebook ID' : 'গুগল প্লে / ফেসবুক আইডি';
      default:
        return language === 'en' ? 'Character UID / ID' : 'ক্যারেক্টার আইডি';
    }
  };

  const getPlaceholderName = () => {
    switch (tournament.game_category) {
      case 'Ludo': return 'e.g. Ludo_Boss';
      case 'DLS': return 'e.g. Messi_FC';
      case 'COC': return 'e.g. Clan_Champion';
      case 'Subway Surfers': return 'e.g. Speed_Runner';
      default: return 'e.g. BD_HERO';
    }
  };

  const getPlaceholderId = () => {
    switch (tournament.game_category) {
      case 'Ludo': return 'e.g. 192837482';
      case 'DLS': return 'e.g. DLS_5B2A';
      case 'COC': return 'e.g. #Y28UP28';
      case 'Subway Surfers': return 'e.g. surfers_tag';
      default: return 'e.g. 1729381';
    }
  };

  // Validate balance
  const userCoins = profile?.coins_balance ?? 0;
  const isInsufficient = userCoins < tournament.entry_fee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!profile) {
      setErrorMsg(t('notLoggedIn'));
      return;
    }

    if (isInsufficient) {
      setErrorMsg(t('insufficientBalance'));
      return;
    }

    let finalInGameStr = '';

    if (playerCount === 1) {
      if (!p1Name.trim() || !p1Id.trim()) {
        setErrorMsg(language === 'en' ? `Both ${getNameLabel()} and ${getIdLabel()} are required!` : `${getNameLabel()} এবং ${getIdLabel()} দুটোই পূরণ করা আবশ্যক!`);
        return;
      }
      finalInGameStr = `${getNameLabel()}: ${p1Name.trim()} (${getIdLabel()}: ${p1Id.trim()})`;
    } else {
      if (!teamName.trim()) {
        setErrorMsg(language === 'en' ? 'Squad / Duo Team Name is required!' : 'স্কোয়াড ও ডুয়ো টিম নাম আবশ্যক!');
        return;
      }
      
      const players = [];
      if (playerCount >= 1) {
        if (!p1Name.trim() || !p1Id.trim()) {
          setErrorMsg(language === 'en' ? 'Player 1 (Team Leader) Name and ID are required!' : 'প্লেয়ার ১ (টিম লিডার) এর নাম ও আইডি পূরণ করুন!');
          return;
        }
        players.push(`P1: ${p1Name.trim()} (${p1Id.trim()})`);
      }
      if (playerCount >= 2) {
        if (!p2Name.trim() || !p2Id.trim()) {
          setErrorMsg(language === 'en' ? 'Player 2 Name and ID are required!' : 'প্লেয়ার ২ এর নাম ও আইডি পূরণ করুন!');
          return;
        }
        players.push(`P2: ${p2Name.trim()} (${p2Id.trim()})`);
      }
      if (playerCount >= 3) {
        if (!p3Name.trim() || !p3Id.trim()) {
          setErrorMsg(language === 'en' ? 'Player 3 Name and ID are required!' : 'প্লেয়ার ৩ এর নাম ও আইডি পূরণ করুন!');
          return;
        }
        players.push(`P3: ${p3Name.trim()} (${p3Id.trim()})`);
      }
      if (playerCount >= 4) {
        if (!p4Name.trim() || !p4Id.trim()) {
          setErrorMsg(language === 'en' ? 'Player 4 Name and ID are required!' : 'প্লেয়ার ৪ এর নাম ও আইডি পূরণ করুন!');
          return;
        }
        players.push(`P4: ${p4Name.trim()} (${p4Id.trim()})`);
      }
      if (playerCount >= 5) {
        if (!p5Name.trim() || !p5Id.trim()) {
          setErrorMsg(language === 'en' ? 'Player 5 Name and ID are required!' : 'প্লেয়ার ৫ এর নাম ও আইডি পূরণ করুন!');
          return;
        }
        players.push(`P5: ${p5Name.trim()} (${p5Id.trim()})`);
      }

      finalInGameStr = `Team: ${teamName.trim()} [${players.join(', ')}]`;
    }

    setIsSubmitting(true);
    try {
      const response = await joinTournament(tournament, finalInGameStr);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          // Take them to Joined section to see details immediately
          setCurrentView('joined');
        }, 1500);
      } else {
        setErrorMsg(response.message);
      }
    } catch (err) {
      setErrorMsg("An unexpected transaction error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121420] border border-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        
        {/* Header decoration */}
        <div className="bg-[#1a1c2b] p-5 border-b border-gray-800/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-amber-500 font-bold font-mono">
              {t('confirmJoin')}
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-white leading-none mt-1">
              {tournament.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-gray-800/60 hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {success ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto animate-bounce" />
              <h4 className="text-lg font-bold text-white">{t('joiningSuccess')}</h4>
              <p className="text-gray-400 text-xs">
                {language === 'en' ? 'Redirecting to your matches schedule...' : 'আপনার নিবন্ধিত ম্যাচের পাতায় নিয়ে যাওয়া হচ্ছে...'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Ticket Recap Card */}
              <div className="bg-[#1a1c2b]/50 border border-gray-800/60 rounded-2xl p-4 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-amber-400" />
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase leading-none">{t('entryFee')}</span>
                    <span className="text-sm font-mono font-bold text-white mt-1 block">
                      {tournament.entry_fee} {t('coins')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-emerald-400" />
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase leading-none">{t('prizePool')}</span>
                    <span className="text-sm font-mono font-bold text-white mt-1 block">
                      {tournament.prize_pool} {t('coins')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-rose-400" />
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase leading-none">
                      {['Free Fire', 'PUBG/BGMI', 'Call of Duty'].includes(tournament.game_category) 
                        ? t('perKill') 
                        : language === 'en' ? 'Kill Reward' : 'কিল পুরস্কার'}
                    </span>
                    <span className={`text-sm font-mono font-bold mt-1 block ${['Free Fire', 'PUBG/BGMI', 'Call of Duty'].includes(tournament.game_category) ? 'text-white' : 'text-gray-500'}`}>
                      {['Free Fire', 'PUBG/BGMI', 'Call of Duty'].includes(tournament.game_category) 
                        ? `${tournament.per_kill || '0'} ${t('coins')}` 
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-400" />
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase leading-none">
                      {(() => {
                        switch (tournament.game_category) {
                          case 'Ludo': return language === 'en' ? 'Board Mode' : 'বোর্ড মোড';
                          case 'DLS': return language === 'en' ? 'Rules / Time' : 'নিয়ম / সময়';
                          case 'COC': return language === 'en' ? 'Arena / TownHall' : 'টাউনহল লেভেল';
                          case 'Subway Surfers': return language === 'en' ? 'Score Target' : 'টার্গেট স্কোর';
                          case 'Mobile Legends': return language === 'en' ? 'Map Arena' : 'রঙ্গভূমি ম্যাপ';
                          default: return t('map');
                        }
                      })()}
                    </span>
                    <span className="text-sm font-bold text-white mt-1 block truncate font-sans">
                      {tournament.map_name || (() => {
                        switch (tournament.game_category) {
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
                </div>
              </div>

              {/* Game Mode Detail & Custom Rules Section */}
              <div className="space-y-3 bg-[#181a26]/45 p-4 rounded-2xl border border-gray-800/80 font-sans">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold flex items-center gap-1">🎯 {language === 'en' ? 'Match Mode:' : 'গেমের ধরণ:'}</span>
                  <span className="bg-[#a78bfa]/15 text-[#a78bfa] font-black px-2.5 py-1 rounded-lg text-[10px] uppercase border border-[#a78bfa]/20 tracking-wider">
                    {tournament.game_mode || (tournament.format || 'Battle Royale')}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-800/60 space-y-1.5 text-left">
                  <span className="block text-[9px] text-amber-500 font-extrabold uppercase tracking-widest leading-none">
                    📜 {language === 'en' ? 'TOURNAMENT RULES (পড়ুন)' : 'ম্যাচ খেলার নিয়মাবলী (Rules)'}
                  </span>
                  <p className="text-[11px] text-gray-300 leading-relaxed font-sans max-h-[100px] overflow-y-auto whitespace-pre-wrap break-words bg-black/35 p-2.5 rounded-xl border border-white/5 italic">
                    {tournament.rules ? tournament.rules : (
                      language === 'en' 
                        ? '1. No third-party hacks or mod tools.\n2. Standard game features only.\n3. Results will be audited by admin and processed instantly.'
                        : '১. কোনো প্রকার হ্যাক বা থার্ড-পার্টি টুলস ব্যবহার করা সম্পূর্ণ নিষিদ্ধ।\n২. এমুলেটর বা পিসি প্লেয়াররা অনুমতি ছাড়া জয়েন করতে পারবে না।\n৩. ম্যাচ শেষ হওয়া মাত্র স্ক্রিনশট সাবমিট করুন।'
                    )}
                  </p>
                </div>
              </div>

              {/* Wallet Matchup Error message or prompt / Add coins button shortcut */}
              {isInsufficient ? (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-rose-300 leading-tight">
                      {t('insufficientBalance')}
                    </p>
                    <p className="text-[11px] text-rose-400">
                      {language === 'en' 
                        ? `You need ${tournament.entry_fee - userCoins} more coins to register for this match.`
                        : `এই খেলায় অংশ নিতে আপনার আরও ${tournament.entry_fee - userCoins}টি কয়েন প্রয়োজন।`}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        setCurrentView('wallet');
                      }}
                      className="text-xs bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 py-1.5 rounded-lg transition-all"
                    >
                      {t('buyCoins')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-3 flex justify-between items-center text-xs">
                  <span className="text-gray-400">{language === 'en' ? 'Your Balance:' : 'আপনার ব্যালেন্স:'}</span>
                  <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                    {userCoins} {t('coins')}
                  </span>
                </div>
              )}

              {/* Dynamic Game ID / Teammate Form Fields based on Format */}
              <div className="space-y-4 pt-1 max-h-[320px] overflow-y-auto pr-1">
                
                {/* Team Name required for Duo / Squad / team matches */}
                {playerCount > 1 && (
                  <div className="space-y-1.5 animate-slide-up">
                    <label className="block text-xs font-bold text-gray-305 uppercase tracking-wider">
                      {language === 'en' ? 'Squad / Duo Team Name' : 'স্কোয়াড ও ডুয়ো টিম নাম'} <span className="text-[#f59e0b] font-extrabold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder={language === 'en' ? "e.g., BD ELITES" : "যেমনঃ বিডি এলিট টিম"}
                      disabled={isInsufficient || isSubmitting}
                      className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500/75 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-650 focus:outline-none transition-all"
                    />
                  </div>
                )}

                {/* Player 1 Entry */}
                {playerCount >= 1 && (
                  <div className="border border-gray-800 bg-slate-900/10 rounded-2xl p-3.5 space-y-3">
                    <span className="block text-[10px] font-bold text-amber-500 tracking-wider uppercase border-b border-gray-800/80 pb-1">
                      {isSolo ? (language === 'en' ? 'Player Profile Details' : 'আপনার প্লেয়ার তথ্য') : (language === 'en' ? 'Player 1 (Team Leader)' : 'প্লেয়ার ১ (টিম লিডার - আপনি)')}
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-medium">{getNameLabel()} <span className="text-red-500">*</span></span>
                        <input
                          type="text"
                          required
                          value={p1Name}
                          onChange={(e) => setP1Name(e.target.value)}
                          placeholder={getPlaceholderName()}
                          disabled={isInsufficient || isSubmitting}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-medium">{getIdLabel()} <span className="text-red-500">*</span></span>
                        <input
                          type="text"
                          required
                          value={p1Id}
                          onChange={(e) => setP1Id(e.target.value)}
                          placeholder={getPlaceholderId()}
                          disabled={isInsufficient || isSubmitting}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Player 2 Entry */}
                {playerCount >= 2 && (
                  <div className="border border-gray-800 bg-slate-900/10 rounded-2xl p-3.5 space-y-3 animate-slide-up">
                    <span className="block text-[10px] font-bold text-amber-500 tracking-wider uppercase border-b border-gray-800/80 pb-1">
                      {language === 'en' ? 'Player 2 (Teammate)' : 'প্লেয়ার ২ (টিমমেট)'}
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-medium">{getNameLabel()} <span className="text-red-500">*</span></span>
                        <input
                          type="text"
                          required
                          value={p2Name}
                          onChange={(e) => setP2Name(e.target.value)}
                          placeholder={getPlaceholderName()}
                          disabled={isInsufficient || isSubmitting}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-medium">{getIdLabel()} <span className="text-red-500">*</span></span>
                        <input
                          type="text"
                          required
                          value={p2Id}
                          onChange={(e) => setP2Id(e.target.value)}
                          placeholder={getPlaceholderId()}
                          disabled={isInsufficient || isSubmitting}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Player 3 Entry */}
                {playerCount >= 3 && (
                  <div className="border border-gray-800 bg-slate-900/10 rounded-2xl p-3.5 space-y-3 animate-slide-up">
                    <span className="block text-[10px] font-bold text-amber-500 tracking-wider uppercase border-b border-gray-800/80 pb-1">
                      {language === 'en' ? 'Player 3 (Teammate)' : 'প্লেয়ার ৩ (টিমমেট)'}
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-medium">{getNameLabel()} <span className="text-red-500">*</span></span>
                        <input
                          type="text"
                          required
                          value={p3Name}
                          onChange={(e) => setP3Name(e.target.value)}
                          placeholder={getPlaceholderName()}
                          disabled={isInsufficient || isSubmitting}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-medium">{getIdLabel()} <span className="text-red-500">*</span></span>
                        <input
                          type="text"
                          required
                          value={p3Id}
                          onChange={(e) => setP3Id(e.target.value)}
                          placeholder={getPlaceholderId()}
                          disabled={isInsufficient || isSubmitting}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Player 4 Entry */}
                {playerCount >= 4 && (
                  <div className="border border-gray-800 bg-slate-900/10 rounded-2xl p-3.5 space-y-3 animate-slide-up">
                    <span className="block text-[10px] font-bold text-amber-500 tracking-wider uppercase border-b border-gray-800/80 pb-1">
                      {language === 'en' ? 'Player 4 (Teammate)' : 'প্লেয়ার ৪ (টিমমেট)'}
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-medium">{getNameLabel()} <span className="text-red-500">*</span></span>
                        <input
                          type="text"
                          required
                          value={p4Name}
                          onChange={(e) => setP4Name(e.target.value)}
                          placeholder={getPlaceholderName()}
                          disabled={isInsufficient || isSubmitting}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-medium">{getIdLabel()} <span className="text-red-500">*</span></span>
                        <input
                          type="text"
                          required
                          value={p4Id}
                          onChange={(e) => setP4Id(e.target.value)}
                          placeholder={getPlaceholderId()}
                          disabled={isInsufficient || isSubmitting}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Player 5 Entry */}
                {playerCount >= 5 && (
                  <div className="border border-gray-800 bg-slate-900/10 rounded-2xl p-3.5 space-y-3 animate-slide-up">
                    <span className="block text-[10px] font-bold text-amber-500 tracking-wider uppercase border-b border-gray-800/80 pb-1">
                      {language === 'en' ? 'Player 5 (Teammate)' : 'প্লেয়ার ৫ (টিমমেট)'}
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-medium">{getNameLabel()} <span className="text-red-500">*</span></span>
                        <input
                          type="text"
                          required
                          value={p5Name}
                          onChange={(e) => setP5Name(e.target.value)}
                          placeholder={getPlaceholderName()}
                          disabled={isInsufficient || isSubmitting}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-medium">{getIdLabel()} <span className="text-red-500">*</span></span>
                        <input
                          type="text"
                          required
                          value={p5Id}
                          onChange={(e) => setP5Id(e.target.value)}
                          placeholder={getPlaceholderId()}
                          disabled={isInsufficient || isSubmitting}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* General Feedback notices */}
              {errorMsg && (
                <div className="text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* Form Controls */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-gray-800 text-gray-400 hover:text-white rounded-xl font-bold text-xs hover:bg-gray-800/40 transition-all cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isInsufficient || isSubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 font-extrabold text-[#000] rounded-xl text-xs hover:from-amber-400 hover:to-orange-500 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin text-black" />}
                  {isSubmitting ? t('joiningInProgress') : t('confirmJoin')}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default TournamentDetailModal;
