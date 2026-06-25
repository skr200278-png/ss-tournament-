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
  const gMode = tournament.game_mode?.toLowerCase() || '';
  const gTitle = tournament.title?.toLowerCase() || '';
  
  // Decide exact player count based on format string, game mode, or title
  let playerCount = 4; // Default to 4 slots
  if (
    fmt.includes('solo') || fmt.includes('1v1') || fmt === 'single' || fmt.includes('showdown') ||
    gMode.includes('solo') || gMode.includes('1v1') || gMode.includes('single') ||
    gTitle.includes('solo') || gTitle.includes('1v1')
  ) {
    playerCount = 1;
  } else if (
    fmt.includes('duo') || fmt.includes('double') || fmt.includes('2v2') || fmt.includes('2-player') ||
    gMode.includes('duo') || gMode.includes('2v2') ||
    gTitle.includes('duo') || gTitle.includes('2v2')
  ) {
    playerCount = 4;
  } else if (
    fmt.includes('3v3') || fmt.includes('trio') ||
    gMode.includes('3v3') || gMode.includes('trio') ||
    gTitle.includes('3v3') || gTitle.includes('trio')
  ) {
    playerCount = 4;
  } else if (
    fmt.includes('5v5') ||
    gMode.includes('5v5') ||
    gTitle.includes('5v5')
  ) {
    playerCount = 4;
  } else if (
    fmt.includes('squad') || fmt.includes('4-player') || fmt.includes('clan') || fmt.includes('clash') || fmt.includes('4v4') || fmt.includes('cs') ||
    gMode.includes('squad') || gMode.includes('clash') || gMode.includes('cs') || gMode.includes('4v4') ||
    gTitle.includes('squad') || gTitle.includes('clash') || gTitle.includes('cs') || gTitle.includes('4v4')
  ) {
    playerCount = 4;
  } else {
    // If category is Ludo, default is usually 2 or 4.
    if (tournament.game_category === 'Ludo') {
      playerCount = 4;
    } else {
      playerCount = 4;
    }
  }

  const isSolo = playerCount === 1;

  // New state selectors for high fidelity Squad choices asked by owner
  const [registrationType, setRegistrationType] = useState<'squad' | 'matchmaker'>('squad');
  const [squadPaymentOption, setSquadPaymentOption] = useState<'leader_pays_all' | 'leader_pays_self'>('leader_pays_all');
  const [selectedTeamSlot, setSelectedTeamSlot] = useState('Any (যেকোনো ফাঁকা স্লট)');
  const [showRules, setShowRules] = useState(false);

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

  // Validate balance based on registration type and multiplier choices
  const computedFeeMultiplier = (!isSolo && registrationType === 'squad' && squadPaymentOption === 'leader_pays_all') ? playerCount : 1;
  const totalPaymentRequired = tournament.entry_fee * computedFeeMultiplier;
  const userCoins = profile?.coins_balance ?? 0;
  const isInsufficient = userCoins < totalPaymentRequired;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!profile) {
      setErrorMsg(t('notLoggedIn'));
      return;
    }

    if (tournament.winner_name) {
      setErrorMsg(language === 'en' ? 'This tournament is already completed and winners declared!' : 'এই টুর্নামেন্টটি ইতিমধ্যেই শেষ হয়েছে এবং ফলাফল ঘোষণা করা হয়েছে!');
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
      if (registrationType === 'matchmaker') {
        if (!p1Name.trim() || !p1Id.trim()) {
          setErrorMsg(language === 'en' ? `Your Character Name and Game ID are required for matchmaker!` : `ম্যাচমেকিং নিবন্ধনের জন্য আপনার ক্যারেক্টার নাম এবং ক্যারেক্টার আইডি পূরণ করা আবশ্যক!`);
          return;
        }
        finalInGameStr = `M-MAKER [Slot: ${selectedTeamSlot}] - Player: ${p1Name.trim()} (UID: ${p1Id.trim()})`;
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
    }

    setIsSubmitting(true);
    try {
      const response = await joinTournament(tournament, finalInGameStr, computedFeeMultiplier);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121420] border border-gray-800 rounded-3xl w-full max-w-lg max-h-[85vh] sm:max-h-[88vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Header decoration */}
        <div className="bg-[#1a1c2b] p-5 border-b border-gray-800/80 flex items-center justify-between shrink-0">
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

        {success ? (
          <div className="p-5 sm:p-6 text-center py-12 space-y-3 overflow-y-auto flex-1 min-h-[300px] flex flex-col justify-center">
            <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-white">{t('joiningSuccess')}</h4>
            <p className="text-gray-400 text-xs">
              {language === 'en' ? 'Redirecting to your matches schedule...' : 'আপনার নিবন্ধিত ম্যাচের পাতায় নিয়ে যাওয়া হচ্ছে...'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Scrollable Form Content */}
            <div className="p-4 sm:p-5 pb-20 space-y-4 overflow-y-auto flex-1 min-h-0 scroll-smooth [webkit-overflow-scrolling:touch]">
              
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

              {/* Game Mode Detail & Custom Rules Section (Collapsible) */}
              <div className="bg-[#1a1410] rounded-2xl border border-amber-600/35 font-sans relative overflow-hidden shadow-xl shadow-amber-950/20 text-left">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowRules(!showRules)}
                  className="w-full flex justify-between items-center p-3 text-xs font-bold text-amber-400 cursor-pointer select-none"
                >
                  <span className="flex items-center gap-1.5 font-black uppercase tracking-wider">
                    ⚠️ 📜 {language === 'en' ? 'TOURNAMENT RULES' : 'ম্যাচ খেলার নিয়মাবলী'}
                  </span>
                  <span className="text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 text-amber-300 font-extrabold shrink-0 flex items-center gap-1">
                    {showRules ? (language === 'en' ? 'Hide ✕' : 'বন্ধ করুন ✕') : (language === 'en' ? 'Read ⬇' : 'পড়ুন ⬇')}
                  </span>
                </button>
                
                {showRules ? (
                  <div className="p-3 pt-0 border-t border-amber-600/15 space-y-2.5 animate-slide-down">
                    <div className="flex justify-between items-center text-[10px] text-amber-400 font-bold">
                      <span>🎯 {language === 'en' ? 'Match Mode:' : 'গেমের ধরণ:'}</span>
                      <span className="bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-lg text-[10px] uppercase border border-amber-500/15 tracking-wider">
                        {tournament.game_mode || (tournament.format || 'Battle Royale')}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-250 leading-relaxed font-sans whitespace-pre-wrap break-words bg-black/60 p-2.5 rounded-xl border border-amber-500/15 font-semibold text-amber-100 max-h-[140px] overflow-y-auto">
                      {tournament.rules ? tournament.rules : (
                        language === 'en' 
                          ? '1. No third-party hacks or mod tools.\n2. Standard game features only.\n3. Results will be audited by admin and processed instantly.'
                          : '১. কোনো প্রকার হ্যাক বা থার্ড-পার্টি টুলস ব্যবহার করা সম্পূর্ণ নিষিদ্ধ।\n২. এমুলেটর বা পিসি প্লেয়াররা অনুমতি ছাড়া জয়েন করতে পারবে না।\n৩. ম্যাচ শেষ হওয়া মাত্র স্ক্রিনশট সাবমিট করুন।'
                      )}
                    </p>
                    <p className="text-[10px] text-amber-500 font-bold italic bg-amber-500/5 p-2 rounded-lg border border-amber-500/10 leading-tight">
                      {language === 'en' 
                        ? '📢 Note: Breaking rules will result in disqualification and loss of awards even if you win!'
                        : '📢 সতর্কবার্তা: নিয়ম ভঙ্গ করলে পুরস্কার জেতার শর্তেও ম্যাচটি বাতিল হতে পারে!'}
                    </p>
                  </div>
                ) : (
                  <div className="px-3 pb-2 text-[10px] text-amber-500/80 leading-tight flex justify-between items-center bg-amber-500/5">
                    <span>💡 {language === 'en' ? 'Tap to read standard game rules and guidelines.' : 'ম্যাচের নিয়মাবলী পড়তে এখানে চাপুন।'}</span>
                  </div>
                )}
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
                        ? `You need ৳${tournament.entry_fee - userCoins} more to register for this match.`
                        : `এই খেলায় অংশ নিতে আপনার আরও ৳${tournament.entry_fee - userCoins} প্রয়োজন।`}
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
              <div className="space-y-4 pt-1">
                
                {/* 
                  REGISTRATION TYPE SELECTOR FOR TEAM GAMES (DUO/SQUAD) 
                */}
                {playerCount > 1 && (
                  <div className="bg-[#181a26]/80 p-1.5 rounded-2xl border border-gray-800/85 grid grid-cols-2 gap-1 animate-slide-up mb-2">
                    <button
                      type="button"
                      onClick={() => setRegistrationType('squad')}
                      className={`py-2 px-3 rounded-xl text-center font-bold text-xs flex flex-col items-center justify-center transition-all cursor-pointer ${
                        registrationType === 'squad'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black font-black shadow-md'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>👥 {language === 'en' ? 'Register Full Team' : 'পুরো স্কোয়াড নিয়ে'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegistrationType('matchmaker')}
                      className={`py-2 px-3 rounded-xl text-center font-bold text-xs flex flex-col items-center justify-center transition-all cursor-pointer ${
                        registrationType === 'matchmaker'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black font-black shadow-md'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>👤 {language === 'en' ? 'Solo Matchmaker' : 'টিম নেই (নির্ধারিত স্লটে)'}</span>
                    </button>
                  </div>
                )}

                {/* Matchmaker specific Target Slot setup */}
                {playerCount > 1 && registrationType === 'matchmaker' && (
                  <div className="bg-[#0b0c13] border border-gray-800/80 p-3.5 rounded-2xl space-y-2 animate-slide-up text-left">
                    <label className="block text-[10px] font-black uppercase text-amber-500 tracking-wider font-mono">
                      {language === 'en' ? 'Select Preferred Slot / Team' : 'আপনার স্লট / টিম সিলেক্ট করুন (সিলেক্ট করুন)'}
                    </label>
                    <select
                      value={selectedTeamSlot}
                      onChange={(e) => setSelectedTeamSlot(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    >
                      <option value="Any Option (অ্যাডমিন ফাঁকা যেকোনো স্লট বা টিমে দিবে)">
                        {language === 'en' ? 'Auto Matchmaker (Admin choice)' : 'অটো স্লট (ফাঁকা যেকোনো টিমে প্লেয়ার বসবে)'}
                      </option>
                      <option value="Slot 2 (Team B / স্লট ২)">Slot 2 (Team B / স্লট ২)</option>
                      <option value="Slot 3 (Team C / স্লট ৩)">Slot 3 (Team C / স্লট ৩)</option>
                      <option value="Slot 4 (Team D / স্লট ৪)">Slot 4 (Team D / স্লট ৪)</option>
                      <option value="Slot 5 (Team E / স্লট ৫)">Slot 5 (Team E / স্লট ৫)</option>
                      <option value="Slot 6 (Team F / স্লট ৬)">Slot 6 (Team F / স্লট ৬)</option>
                      <option value="Slot 7 (Team G / স্লট ৭)">Slot 7 (Team G / স্লট ৭)</option>
                      <option value="Slot 8 (Team H / স্লট ৮)">Slot 8 (Team H / স্লট ৮)</option>
                      <option value="Slot 9 (Team I / স্লট ৯)">Slot 9 (Team I / স্লট ৯)</option>
                      <option value="Slot 10 (Team J / স্লট ১০)">Slot 10 (Team J / স্লট ১০)</option>
                      <option value="Slot 11 (Team K / স্লট ১১)">Slot 11 (Team K / স্লট ১১)</option>
                      <option value="Slot 12 (Team L / স্লট ১২)">Slot 12 (Team L / স্লট ১২)</option>
                    </select>
                    <p className="text-[10px] text-gray-400 leading-relaxed font-sans mt-1">
                      {language === 'en' 
                        ? '💡 Tip: If you have team partners, choose the same slot number so the custom room creator groups you together!' 
                        : '💡 টিপসঃ আপনার অন্য কোনো সাথী থাকলে একই স্লট নম্বর সিলেক্ট করুন, যাতে অ্যাডমিন কাস্টম রুমের সময় আপনাদের একই সাথে সেট করতে পারেন!'}
                    </p>
                  </div>
                )}
                
                {/* PAYMENT OPTION SELECTOR (WHO PAYS?) */}
                {playerCount > 1 && registrationType === 'squad' && (
                  <div className="bg-[#0b0c13]/90 border border-gray-800/80 p-3 rounded-2xl space-y-2 animate-slide-up text-left">
                    <label className="block text-[10px] font-black uppercase text-amber-500 tracking-wider font-mono">
                      💸 {language === 'en' ? 'ENTRY FEE PAYMENT OPTION' : 'এন্ট্রি ফি পরিশোধ করার পদ্ধতি:'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className={`flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer select-none ${squadPaymentOption === 'leader_pays_all' ? 'border-amber-500/50 bg-amber-500/5' : 'border-gray-850 bg-transparent hover:bg-[#121420]/40'}`}>
                        <input
                          type="radio"
                          name="squadPaymentOption"
                          value="leader_pays_all"
                          checked={squadPaymentOption === 'leader_pays_all'}
                          onChange={() => setSquadPaymentOption('leader_pays_all')}
                          className="accent-amber-500 cursor-pointer scale-90 shrink-0"
                        />
                        <div className="text-[11px] leading-tight flex-1">
                          <p className="font-bold text-white">
                            {language === 'en' ? 'Leader Pays All' : 'লিডার সবার ফি দিবে'}
                          </p>
                          <span className="text-[10px] text-amber-400 block font-mono font-bold">
                            {tournament.entry_fee * playerCount} {t('coins')}
                          </span>
                        </div>
                      </label>

                      <label className={`flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer select-none ${squadPaymentOption === 'leader_pays_self' ? 'border-amber-500/50 bg-amber-500/5' : 'border-gray-850 bg-transparent hover:bg-[#121420]/40'}`}>
                        <input
                          type="radio"
                          name="squadPaymentOption"
                          value="leader_pays_self"
                          checked={squadPaymentOption === 'leader_pays_self'}
                          onChange={() => setSquadPaymentOption('leader_pays_self')}
                          className="accent-amber-500 cursor-pointer scale-90 shrink-0"
                        />
                        <div className="text-[11px] leading-tight flex-1">
                          <p className="font-bold text-white">
                            {language === 'en' ? 'Pay Only My Share' : 'শুধু নিজের ফি দিব'}
                          </p>
                          <span className="text-[10px] text-amber-400 block font-mono font-bold">
                            {tournament.entry_fee} {t('coins')}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
                
                {/* Team Name required for Duo / Squad / team matches */}
                {playerCount > 1 && registrationType === 'squad' && (
                  <div className="space-y-1.5 animate-slide-up">
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                      {language === 'en' ? 'Squad / Duo Team Name' : 'স্কোয়াড ও ডুয়ো টিম নাম'} <span className="text-[#f59e0b] font-extrabold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder={language === 'en' ? "e.g., BD ELITES" : "যেমনঃ বিডি এলিট টিম"}
                      disabled={isInsufficient || isSubmitting}
                      className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500/75 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
                    />
                  </div>
                )}

                {/* Player 1 Entry */}
                {playerCount >= 1 && (
                  <div className="border border-gray-800 bg-[#0f111a] rounded-2xl p-3.5 space-y-2.5 shadow-inner">
                    <span className="block text-[10px] font-extrabold text-amber-500 tracking-wider uppercase border-b border-amber-500/10 pb-1.5 flex items-center gap-1">
                      🎮 {isSolo ? (language === 'en' ? 'Player Profile Details' : 'আপনাদের প্লেয়ার তথ্য') : (language === 'en' ? 'Player 1 Details (You)' : 'আপনার তথ্য (প্লেয়ার ১ / স্লট লিডার)')}
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5 text-left">
                        <span className="text-[11px] text-gray-300 font-semibold">{getNameLabel()} <span className="text-amber-500 font-extrabold">*</span></span>
                        <input
                          type="text"
                          required
                          value={p1Name}
                          onChange={(e) => setP1Name(e.target.value)}
                          placeholder={getPlaceholderName()}
                          disabled={isInsufficient || isSubmitting}
                          className="w-full bg-[#07080d] border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 font-sans font-medium hover:border-gray-700 transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5 text-left">
                        <span className="text-[11px] text-gray-300 font-semibold">{getIdLabel()} <span className="text-amber-500 font-extrabold">*</span></span>
                        <input
                          type="text"
                          required
                          value={p1Id}
                          onChange={(e) => setP1Id(e.target.value)}
                          placeholder={getPlaceholderId()}
                          disabled={isInsufficient || isSubmitting}
                          className="w-full bg-[#07080d] border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 font-mono font-medium hover:border-gray-700 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Compact Unified Squad Teammates Card */}
                {playerCount >= 2 && registrationType === 'squad' && (
                  <div className="border border-gray-800 bg-[#0f111a] rounded-2xl p-3 shadow-inner text-left space-y-3">
                    <span className="block text-[10px] font-extrabold text-amber-500 tracking-wider uppercase border-b border-amber-500/15 pb-1.5 flex items-center gap-1">
                      👥 {language === 'en' ? 'SQUAD MEMBERS (টিম মেম্বার্স)' : 'বাকি স্কোয়াড মেম্বার্সদের তথ্য পূরণ করুন:'}
                    </span>
                    
                    <div className="space-y-2.5 divide-y divide-gray-800/40">
                      {/* Player 2 Row */}
                      {playerCount >= 2 && (
                        <div className="space-y-1 pt-1 first:pt-0 border-none">
                          <label className="block text-[10px] font-black text-amber-400">
                            👤 {language === 'en' ? 'Player 2 (Teammate)' : 'প্লেয়ার ২ (টিমমেট)'} <span className="text-amber-500 font-extrabold">*</span>
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              required
                              value={p2Name}
                              onChange={(e) => setP2Name(e.target.value)}
                              placeholder={getNameLabel()}
                              disabled={isInsufficient || isSubmitting}
                              className="w-full bg-[#07080d] border border-gray-800 focus:border-amber-500/50 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-gray-650 focus:outline-none transition-all placeholder:text-[11px] placeholder:font-sans"
                            />
                            <input
                              type="text"
                              required
                              value={p2Id}
                              onChange={(e) => setP2Id(e.target.value)}
                              placeholder={getIdLabel()}
                              disabled={isInsufficient || isSubmitting}
                              className="w-full bg-[#07080d] border border-gray-800 focus:border-amber-500/50 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-gray-650 focus:outline-none font-mono transition-all placeholder:text-[11px] placeholder:font-sans"
                            />
                          </div>
                        </div>
                      )}

                      {/* Player 3 Row */}
                      {playerCount >= 3 && (
                        <div className="space-y-1 pt-2">
                          <label className="block text-[10px] font-black text-amber-400">
                            👤 {language === 'en' ? 'Player 3 (Teammate)' : 'প্লেয়ার ৩ (টিমমেট)'} <span className="text-amber-500 font-extrabold">*</span>
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              required
                              value={p3Name}
                              onChange={(e) => setP3Name(e.target.value)}
                              placeholder={getNameLabel()}
                              disabled={isInsufficient || isSubmitting}
                              className="w-full bg-[#07080d] border border-gray-800 focus:border-amber-500/50 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-gray-650 focus:outline-none transition-all placeholder:text-[11px] placeholder:font-sans"
                            />
                            <input
                              type="text"
                              required
                              value={p3Id}
                              onChange={(e) => setP3Id(e.target.value)}
                              placeholder={getIdLabel()}
                              disabled={isInsufficient || isSubmitting}
                              className="w-full bg-[#07080d] border border-gray-800 focus:border-amber-500/50 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-gray-650 focus:outline-none font-mono transition-all placeholder:text-[11px] placeholder:font-sans"
                            />
                          </div>
                        </div>
                      )}

                      {/* Player 4 Row */}
                      {playerCount >= 4 && (
                        <div className="space-y-1 pt-2">
                          <label className="block text-[10px] font-black text-amber-400">
                            👤 {language === 'en' ? 'Player 4 (Teammate)' : 'প্লেয়ার ৪ (টিমমেট)'} <span className="text-amber-500 font-extrabold">*</span>
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              required
                              value={p4Name}
                              onChange={(e) => setP4Name(e.target.value)}
                              placeholder={getNameLabel()}
                              disabled={isInsufficient || isSubmitting}
                              className="w-full bg-[#07080d] border border-gray-800 focus:border-amber-500/50 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-gray-650 focus:outline-none transition-all placeholder:text-[11px] placeholder:font-sans"
                            />
                            <input
                              type="text"
                              required
                              value={p4Id}
                              onChange={(e) => setP4Id(e.target.value)}
                              placeholder={getIdLabel()}
                              disabled={isInsufficient || isSubmitting}
                              className="w-full bg-[#07080d] border border-gray-800 focus:border-amber-500/50 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-gray-650 focus:outline-none font-mono transition-all placeholder:text-[11px] placeholder:font-sans"
                            />
                          </div>
                        </div>
                      )}

                      {/* Player 5 Row */}
                      {playerCount >= 5 && (
                        <div className="space-y-1 pt-2">
                          <label className="block text-[10px] font-black text-amber-400">
                            👤 {language === 'en' ? 'Player 5 (Teammate)' : 'প্লেয়ার ৫ (টিমমেট)'} <span className="text-amber-500 font-extrabold">*</span>
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              required
                              value={p5Name}
                              onChange={(e) => setP5Name(e.target.value)}
                              placeholder={getNameLabel()}
                              disabled={isInsufficient || isSubmitting}
                              className="w-full bg-[#07080d] border border-gray-800 focus:border-amber-500/50 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-gray-650 focus:outline-none transition-all placeholder:text-[11px] placeholder:font-sans"
                            />
                            <input
                              type="text"
                              required
                              value={p5Id}
                              onChange={(e) => setP5Id(e.target.value)}
                              placeholder={getIdLabel()}
                              disabled={isInsufficient || isSubmitting}
                              className="w-full bg-[#07080d] border border-gray-800 focus:border-amber-500/50 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-gray-650 focus:outline-none font-mono transition-all placeholder:text-[11px] placeholder:font-sans"
                            />
                          </div>
                        </div>
                      )}
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
            </div>

            {/* Fixed Sticky Footer Controls */}
            <div className="bg-[#1a1c2b] p-4 sm:p-5 border-t border-gray-800/80 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 border border-gray-800 text-gray-400 hover:text-white rounded-2xl font-bold text-xs hover:bg-gray-800/40 transition-all cursor-pointer select-none"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={isInsufficient || isSubmitting}
                className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 font-extrabold text-black rounded-2xl text-xs hover:from-amber-400 hover:to-orange-500 transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-lg hover:shadow-orange-500/10 select-none"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin text-black" />}
                {isSubmitting ? t('joiningInProgress') : (language === 'en' ? `Pay ৳${totalPaymentRequired} & Join` : `নিশ্চিত করুন (৳${totalPaymentRequired} কাটবে)`)}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default TournamentDetailModal;
