import React, { useState } from 'react';
import { useApp } from './AppContext';
import { WalletView } from './WalletView';
import { 
  User, 
  ShieldCheck, 
  PhoneCall, 
  Mail, 
  Lock, 
  FileText, 
  Coins, 
  Trophy, 
  Copy, 
  Check, 
  MessageSquare, 
  AlertTriangle, 
  HelpCircle,
  Clock,
  ArrowRight,
  Users,
  Share2,
  Wallet
} from 'lucide-react';

export const ProfileSettingsView: React.FC = () => {
  const { profile, language, t, currentView, setCurrentView, applyReferralCode, updateUserProfile } = useApp();
  const [copiedUid, setCopiedUid] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [enteredCode, setEnteredCode] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet' | 'support' | 'referral' | 'policy'>('profile');
  const [activePolicy, setActivePolicy] = useState<'privacy' | 'terms' | 'refund'>('privacy');

  // Synchronize state if coming directly to the wallet tab
  React.useEffect(() => {
    if (currentView === 'wallet') {
      setActiveTab('wallet');
    }
  }, [currentView]);

  // Profile Edit states
  const [inGameName, setInGameName] = useState(profile?.inGameName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [favoriteGame, setFavoriteGame] = useState(profile?.favoriteGame || 'Free Fire');
  const [devicePlatform, setDevicePlatform] = useState(profile?.devicePlatform || 'Mobile');
  const [statusBio, setStatusBio] = useState(profile?.statusBio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar || '🥷');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Keep state in sync with updated profile context
  React.useEffect(() => {
    if (profile) {
      setInGameName(profile.inGameName || '');
      setPhone(profile.phone || '');
      setFavoriteGame(profile.favoriteGame || 'Free Fire');
      setDevicePlatform(profile.devicePlatform || 'Mobile');
      setStatusBio(profile.statusBio || '');
      setSelectedAvatar(profile.avatar || '🥷');
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setSavingProfile(true);

    try {
      const result = await updateUserProfile({
        inGameName: inGameName.trim(),
        phone: phone.trim(),
        favoriteGame,
        devicePlatform,
        statusBio: statusBio.trim(),
        avatar: selectedAvatar
      });

      if (result.success) {
        setProfileSuccess(result.message);
      } else {
        setProfileError(result.message);
      }
    } catch (err) {
      setProfileError(language === 'en' ? 'An unexpected error occurred.' : 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleClaimReferral = async () => {
    setClaimError('');
    setClaimSuccess('');
    if (!enteredCode.trim()) {
      setClaimError(language === 'en' ? 'Please enter a referral code first.' : 'দয়া করে আগে একটি রেফার কোড লিখুন।');
      return;
    }
    setSubmittingClaim(true);
    try {
      const response = await applyReferralCode(enteredCode);
      if (response.success) {
        setClaimSuccess(response.message);
        setEnteredCode('');
      } else {
        setClaimError(response.message);
      }
    } catch (err) {
      setClaimError(language === 'en' ? 'Something went wrong.' : 'কিছু ভুল হয়েছে, আবার চেষ্টা করুন।');
    } finally {
      setSubmittingClaim(false);
    }
  };

  if (!profile) return null;

  const handleCopyUid = () => {
    navigator.clipboard.writeText(profile.uid);
    setCopiedUid(true);
    setTimeout(() => {
      setCopiedUid(false);
    }, 2000);
  };

  const whatsappNumber = "01410991934";
  const whatsappUrl = `https://wa.me/8801410991934?text=Hello%20ProTournament%20Support!%20My%20Gamer%20UID%20is%20${profile.uid}`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-sans font-extrabold text-white tracking-tight flex items-center gap-2">
          <User className="h-6 w-6 text-amber-500" />
          {language === 'en' ? 'Gamer Account & Support' : 'ইউজার প্রোফাইল ও সাপোর্ট ডেস্ক'}
        </h2>
        <p className="text-gray-400 text-xs mt-1">
          {language === 'en' 
            ? 'Manage your gamer files, legal policies, and connect with direct developer representatives.' 
            : 'আপনার অ্যাকাউন্ট সেটিংস, ডেভেলপার লাইভ সাপোর্ট এবং অফিসিয়াল নীতিমালা দেখুন।'}
        </p>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left column: Highly Polished Esports Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#121420] border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center text-center group shadow-xl">
            
            {/* Holographic Glowing Effects */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400" />
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/15 transition-all duration-700 pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Esports Verified Badge & Gamer Role */}
            <div className="w-full flex justify-between items-center mb-5 text-[10px] font-sans">
              <span className="bg-amber-500/10 border border-amber-500/35 text-amber-400 font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                {(() => {
                  const bal = (profile.coins_balance || 0) + (profile.winning_balance || 0);
                  if (bal > 2000) return '✪ GRANDMASTER';
                  if (bal > 500) return '★ HERO LEGEND';
                  if (bal > 100) return '♦ ELITE PRO';
                  return '● ROOKIE RECRUIT';
                })()}
              </span>
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-1 rounded-lg flex items-center gap-1 uppercase tracking-wider scale-90">
                ✓ Active
              </span>
            </div>

            {/* Avatar Shield with Pulsing Ring */}
            <div className="relative mb-4 group select-none">
              <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl blur opacity-35 group-hover:opacity-55 transition-opacity" />
              <div className="relative w-24 h-24 bg-gradient-to-tr from-[#1b1e30] to-[#0d0e16] border-2 border-amber-500 rounded-2xl flex items-center justify-center shadow-2xl text-4xl transform hover:scale-[1.03] transition-transform duration-300">
                {profile.avatar ? (
                  <span className="block drop-shadow-md">{profile.avatar}</span>
                ) : (
                  <User className="h-12 w-12 text-amber-500 stroke-[2.5]" />
                )}
              </div>
            </div>

            <h3 className="text-white font-extrabold text-xl tracking-tight leading-none truncate max-w-full">
              {profile.name}
            </h3>
            
            {profile.inGameName ? (
              <div className="mt-1.5 bg-[#0a0b12] px-3 py-1 rounded-full border border-gray-800">
                <p className="text-amber-400 text-xs font-mono font-bold">
                  🎮 {profile.inGameName}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-xs mt-1.5 italic">No IGN configured yet</p>
            )}

            {/* Quick Badges inside Esports Card */}
            <div className="flex flex-wrap gap-1 justify-center mt-3.5 w-full">
              <span className="text-[8px] bg-slate-900 border border-gray-800 text-slate-300 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                🎖️ {profile.devicePlatform || "Mobile"} Platform
              </span>
              <span className="text-[8px] bg-slate-900 border border-gray-800 text-indigo-300 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                ⚔️ {profile.favoriteGame || "Free Fire"} Favorite
              </span>
            </div>

            {/* Status Bio Statement */}
            <div className="w-full bg-[#181a26]/30 border border-gray-800/60 p-3 rounded-2xl mt-4 text-left relative">
              <span className="block text-[8px] text-gray-500 font-extrabold uppercase tracking-widest mb-1">
                🗣️ Player Status Bio
              </span>
              <p className="text-gray-300 text-[11px] leading-relaxed font-sans italic break-words">
                "{profile.statusBio || (language === 'en' ? 'Fearless rush gameplay only! ⚔️' : 'রাশ গেমপ্লে করতে ভালোবাসি! ⚔️')}"
              </p>
            </div>

            {/* Email Address details */}
            <p className="text-gray-500 text-[10px] mt-3 select-all font-sans font-medium hover:text-gray-400 transition-colors">
              ✉ {profile.email || "No email verified"}
            </p>

            {/* Coin balances bento visualizer */}
            <div className="w-full mt-5 grid grid-cols-2 gap-2 text-xs">
              <div 
                onClick={() => {
                  setActiveTab('wallet');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-[#181a26]/80 border border-gray-850 rounded-2xl p-3 text-center cursor-pointer hover:border-amber-500/50 hover:bg-[#1c1d2e] transition-all relative overflow-hidden"
              >
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                <Coins className="h-4 w-4 text-amber-500 mx-auto mb-1 animate-pulse" />
                <span className="block text-[8px] text-gray-500 font-bold uppercase">{language === 'en' ? 'COINS' : 'কয়েন'}</span>
                <span className="text-amber-400 font-black text-sm font-mono mt-0.5 block">{profile.coins_balance}</span>
              </div>

              <div 
                onClick={() => {
                  setActiveTab('wallet');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-[#181a26]/80 border border-gray-850 rounded-2xl p-3 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-[#1c1d2e] transition-all relative overflow-hidden"
              >
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <Trophy className="h-4 w-4 text-emerald-400 mx-auto mb-1 animate-pulse" />
                <span className="block text-[8px] text-gray-500 font-bold uppercase">{language === 'en' ? 'WINNINGS' : 'উইনিং'}</span>
                <span className="text-[#10b981] font-black text-sm font-mono mt-0.5 block">{profile.winning_balance}</span>
              </div>
            </div>

            {/* In-Game UID Visual Layout */}
            <div className="w-full mt-5 pt-4 border-t border-gray-800/80 space-y-3.5 text-left">
              {profile.numericId && (
                <div className="space-y-1">
                  <label className="text-[9px] text-amber-400 uppercase tracking-wider font-extrabold block">
                    🕹️ {language === 'en' ? 'Player Game ID (UID)' : 'প্লেয়ার গেম আইডি (UID)'}
                  </label>
                  <div className="bg-[#0a0b12] rounded-xl px-3 py-2 border border-amber-500/30 flex justify-between items-center overflow-hidden">
                    <span className="text-xs font-black font-mono text-amber-400 tracking-widest">{profile.numericId}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(String(profile.numericId));
                        setCopiedUid(true);
                        setTimeout(() => setCopiedUid(false), 2000);
                      }}
                      className="p-1 text-amber-400 hover:text-white shrink-0 transition-colors cursor-pointer"
                      title="Copy Player ID"
                    >
                      {copiedUid ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1 pt-0.5">
                <label className="text-[9px] text-gray-500 uppercase tracking-wider font-bold block">Unique Account UID</label>
                <div className="bg-[#0a0b12] rounded-xl px-3 py-1.5 border border-gray-800 flex justify-between items-center overflow-hidden">
                  <span className="text-[10px] font-mono text-gray-400 truncate tracking-wide max-w-[140px]">{profile.uid}</span>
                  <button
                    onClick={handleCopyUid}
                    className="p-1 text-gray-400 hover:text-white shrink-0 transition-colors cursor-pointer"
                    title="Copy System UID"
                  >
                    {copiedUid ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right column: Tabbed settings panels */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Navigation Tab links */}
          <div className="flex flex-wrap border-b border-gray-800 bg-[#0c0d14]/40 rounded-t-2xl p-1 gap-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 min-w-[100px] py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <User className="h-4 w-4" />
              {language === 'en' ? 'My Profile' : 'আমার প্রোফাইল'}
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`flex-1 min-w-[100px] py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'wallet'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Wallet className="h-4 w-4" />
              {language === 'en' ? 'Wallet' : 'ওয়ালেট'}
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`flex-1 min-w-[100px] py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'support'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <PhoneCall className="h-4 w-4" />
              {language === 'en' ? 'Support' : 'সাপোর্ট'}
            </button>
            <button
              onClick={() => setActiveTab('referral')}
              className={`flex-1 min-w-[100px] py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'referral'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" />
              {language === 'en' ? 'Refer & Earn' : 'রেফার করুন'}
            </button>
            <button
              onClick={() => setActiveTab('policy')}
              className={`flex-1 min-w-[100px] py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'policy'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              {language === 'en' ? 'Policies' : 'নীতিমালা'}
            </button>
          </div>

          {/* MY PROFILE EDITING PANEL CONTENT */}
          {activeTab === 'profile' && (
            <div className="bg-[#121420] border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in text-sans">
              <div className="space-y-1">
                <h3 className="text-white text-lg font-extrabold tracking-tight">
                  {language === 'en' ? 'Edit Gaming Profile' : 'গেমিং প্রোফাইল সাজান'}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {language === 'en'
                    ? 'Customize your gamer identity, select esports avatars, and connect contact details.'
                    : 'আপনার গেমিং প্রোফাইলের তথ্য, কাস্টম এভারটার, ইন-গেম নিকনেম এবং পার্সোনাল মোবাইল নম্বরটি আপডেট করুন।'}
                </p>
              </div>

              {profileSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-4 py-3 rounded-2xl text-xs font-bold">
                  ✓ {profileSuccess}
                </div>
              )}

              {profileError && (
                <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 px-4 py-3 rounded-2xl text-xs font-bold">
                  ⚠️ {profileError}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* 1. Choose Avatar Grid */}
                <div className="space-y-2.5">
                  <label className="text-xs text-white/95 font-bold block">
                    {language === 'en' ? 'Select Gamer Avatar' : 'গেমিং এভাটার নির্বাচন করুন'}
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                    {[
                      { emoji: '🥷', label: 'Shadow Ninja' },
                      { emoji: '⚔️', label: 'FF Fighter' },
                      { emoji: '🔫', label: 'Pro Sniper' },
                      { emoji: '👑', label: 'Lobby King' },
                      { emoji: '🐯', label: 'Tiger Esports' },
                      { emoji: '🔥', label: 'Fiery Gamer' },
                      { emoji: '🦖', label: 'Dino Squad' },
                      { emoji: '👾', label: 'Cyber Alien' }
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setSelectedAvatar(preset.emoji)}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-2xl p-1 transition-all relative cursor-pointer ${
                          selectedAvatar === preset.emoji
                            ? 'bg-amber-500 text-black scale-105 shadow-md shadow-amber-500/20 border-2 border-white'
                            : 'bg-black/40 text-stone-300 hover:bg-black/60 border border-gray-800'
                        }`}
                        title={preset.label}
                      >
                        <span>{preset.emoji}</span>
                        <span className="text-[7px] max-w-full truncate absolute bottom-1 block opacity-80 scale-90">
                          {preset.label.split(' ')[1] || preset.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. In-Game Name and Phone Number Side by Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/90 font-bold block">
                      {language === 'en' ? 'In-Game Name (IGN)' : 'ইন-গেম নেম (যেমন: Viper_YT)'}
                    </label>
                    <input
                      type="text"
                      value={inGameName}
                      onChange={(e) => setInGameName(e.target.value)}
                      placeholder="e.g. Viper_FF_BD"
                      className="w-full bg-black/40 border border-gray-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-white/90 font-bold block">
                      {language === 'en' ? 'Personal Mobile Number' : 'পার্সোনাল মোবাইল নম্বর'}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 017XXXXXXXX"
                      className="w-full bg-black/40 border border-gray-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* 3. Favorite Game and Device Platform Side by Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/90 font-bold block">
                      {language === 'en' ? 'Favorite Game' : 'আপনার প্রিয় গেম'}
                    </label>
                    <select
                      value={favoriteGame}
                      onChange={(e) => setFavoriteGame(e.target.value)}
                      className="w-full bg-[#181a26] border border-gray-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-all"
                    >
                      <option value="Free Fire">Free Fire</option>
                      <option value="Ludo King">Ludo King</option>
                      <option value="PUBG Mobile">PUBG Mobile</option>
                      <option value="Dream League Soccer">Dream League Soccer</option>
                      <option value="CODM">Call of Duty Mobile</option>
                      <option value="Clash of Clans">Clash of Clans</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-white/90 font-bold block">
                      {language === 'en' ? 'Device Platform' : 'ডিভাইস প্ল্যাটফর্ম'}
                    </label>
                    <select
                      value={devicePlatform}
                      onChange={(e) => setDevicePlatform(e.target.value)}
                      className="w-full bg-[#181a26] border border-gray-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-all"
                    >
                      <option value="Mobile">Mobile (মোবাইল)</option>
                      <option value="PC / Emulator">PC / Emulator (পিসি)</option>
                      <option value="Tablet / iPad">Tablet / iPad (ট্যাব)</option>
                    </select>
                  </div>
                </div>

                {/* 4. Bio Status Quote */}
                <div className="space-y-1.5">
                  <label className="text-xs text-white/90 font-bold block">
                    {language === 'en' ? 'Esports Gamer Bio' : 'এস্পোর্টস প্রোফাইল স্ট্যাটাস / বায়ো'}
                  </label>
                  <textarea
                    rows={2}
                    value={statusBio}
                    onChange={(e) => setStatusBio(e.target.value)}
                    placeholder={language === 'en' ? "e.g. Always rush, no fear of death!" : "যেমন: রাশ গেমপ্লে ভালোবাসেন..."}
                    className="w-full bg-black/40 border border-gray-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition-all font-sans leading-relaxed resize-none"
                  />
                </div>

                {/* 5. Submit Button */}
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-gray-700 disabled:to-gray-800 text-black font-black text-sm uppercase rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {savingProfile ? (
                    <span>{language === 'en' ? 'Saving...' : 'সেভ করা হচ্ছে...'}</span>
                  ) : (
                    <>
                      <Check className="h-4 w-4 stroke-[3]" />
                      <span>{language === 'en' ? 'Save Profile' : 'প্রোফাইল সেভ করুন'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="bg-[#121420] border border-gray-800 rounded-3xl p-5 sm:p-6 animate-fade-in">
              <WalletView />
            </div>
          )}

          {/* SUPPORT PAGE PANEL CONTENT */}
          {activeTab === 'support' && (
            <div className="bg-[#121420] border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold">
                  ● Helpline active 24/7
                </div>
                <h3 className="text-white text-lg font-extrabold tracking-tight">Need help? Chat directly with the developers!</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {language === 'en'
                    ? 'Our technical support handles app settings, cash-out requests validation, match score problems, and user accounts. Contact us down below for instant assistance.'
                    : 'গিল্ড ম্যাচ, কয়েন ডিপোজিট, উইনিং টাকা উত্তোলন বা কোন সমস্যার মুখোমুখি হলে আমাদের সাথে নিচে উল্লেখিত উপায়ে যোগাযোগ করুন। ১০-১৫ মিনিটের মধ্যে সমাধান দেওয়া হবে।'}
                </p>
              </div>

              {/* Developer contact methods */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Direct WhatsApp */}
                <div className="bg-[#181a26]/80 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 inline-block rounded-xl border border-emerald-500/20">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-extrabold text-sm">{language === 'en' ? 'Official WhatsApp Chat' : 'সরাসরি হোয়াটসঅ্যাপ'}</h4>
                      <p className="text-gray-400 text-[11px] mt-1 leading-relaxed">
                        {language === 'en' 
                          ? 'Send screenshots of winnings & transaction receipts for instant balance adjustments' 
                          : 'লাইভ চ্যাট এবং স্ক্রিনশট পাঠাতে হোয়াটসঅ্যাপ নম্বরে কল ও মেসেজ করুন।'}
                      </p>
                    </div>
                  </div>

                  <a 
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#20ba5a] text-black font-extrabold text-xs py-3 rounded-xl transition-all"
                  >
                    <MessageSquare className="h-4 w-4 text-black font-bold" />
                    {whatsappNumber} (হোয়াটসঅ্যাপ)
                  </a>
                </div>

                {/* 2. Direct E-Mail */}
                <div className="bg-[#181a26]/80 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="p-3 bg-indigo-500/10 text-indigo-400 inline-block rounded-xl border border-[#3b82f6]/20">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-extrabold text-sm">{language === 'en' ? 'Representative Support Email' : 'অফিসিয়াল ইমেইল সাপোর্ট'}</h4>
                      <p className="text-gray-400 text-[11px] mt-1 leading-relaxed">
                        {language === 'en'
                          ? 'Submit technical problems, partnerships proposals, and general inquiries.'
                          : 'অফিসিয়াল মেইল করতে নিচে ক্লিক করুন বা কপি করুন।'}
                      </p>
                    </div>
                  </div>

                  <a 
                    href={`mailto:skr200278@gmail.com?subject=ProTournament%20Support%20Request%20-%20UID%20${profile.uid}`}
                    className="mt-6 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all border border-gray-700"
                  >
                    <Mail className="h-4 w-4 text-indigo-400" />
                    skr200278@gmail.com
                  </a>
                </div>

              </div>

              {/* Notice info */}
              <div className="bg-amber-500/5 p-4 border border-dashed border-amber-500/20 rounded-2xl flex gap-3 items-start text-xs leading-relaxed text-amber-300">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>{language === 'en' ? 'Legal Guard Fairplay Note:' : 'ফেয়ার প্লে নির্দেশিকা:'}</strong>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {language === 'en'
                      ? 'Sharing accounts, exploiting room match passwords, or using third-party game mods will result in an immediate account ban with zero refund. Every match lobby is spectated.'
                      : 'অন্য কোন ফায়ারবেস বা এপিকে থার্ড পার্টি হ্যাক ব্যবহার করলে অ্যাকাউন্ট চিরতরে নিষিদ্ধ হবে। কোনো হ্যাকার বিজয়ী হলে তার প্রাইজমানি বাতিল হয়ে দ্বিতীয় স্থানাধিকারীকে প্রদান করা হবে।'}
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* REFERRAL SYSTEM PANEL CONTENT */}
          {activeTab === 'referral' && (
            <div className="bg-[#121420] border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-bold">
                  🤝 Viral Referral Program
                </div>
                <h3 className="text-white text-lg font-extrabold tracking-tight">
                  {language === 'en' ? 'Invite Friends & Earn Real Coins' : 'বন্ধুদের ইনভাইট করুন এবং আনলিমিটেড কয়েন ইনকাম করুন!'}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {language === 'en'
                    ? 'Help ProTournament BD expand! When a new gamer registers and applies your custom invite code, they instantly get 20 Coins, and you get 50 Coins credited directly to your principal balance.'
                    : 'প্রো-টুর্নামেন্ট বিডি অ্যাপটি বন্ধুদের সাথে শেয়ার করে গেমার সংখ্যা বাড়াতে সাহায্য করুন! আপনার রেফার কোড ব্যবহার করে কেউ জয়েন করলে সে সাথে সাথে পাবে ২০ কয়েন ফ্রী এবং আপনি পাবেন ৫০ কয়েন সরাসরি মূল ব্যালেন্সে।'}
                </p>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Referral Code Box */}
                <div className="bg-[#181a26]/80 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                      {language === 'en' ? 'Your Referral Invite Code' : 'আপনার রেফার ইনভাইট কোড'}
                    </span>
                    <div className="mt-2 text-white font-extrabold text-2xl tracking-widest font-mono bg-black/40 px-4 py-2 bg-gradient-to-r from-amber-500/5 to-transparent rounded-xl border border-gray-800 flex items-center justify-between">
                      <span>{profile.referralCode || "GETTING_CODE..."}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(profile.referralCode || "");
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        className="p-1.5 bg-gray-900 rounded-lg text-amber-400 hover:text-white hover:bg-gray-800 transition-all cursor-pointer shrink-0"
                        title="Copy Code"
                      >
                        {copiedCode ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-500 text-[10px] mt-4">
                    📢 {language === 'en' ? 'Click copy icon and share with friends' : 'কপি আইকনে ক্লিক করে কপি করুন এবং বন্ধুদের কাছে পাঠান।'}
                  </p>
                </div>

                {/* Performance Box */}
                <div className="bg-[#181a26]/80 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                      {language === 'en' ? 'Your Invitations Performance' : 'আপনার মোট রেফারেল পারফরম্যান্স'}
                    </span>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-black/20 p-2.5 rounded-xl border border-gray-800 text-center">
                        <span className="block text-[9px] text-gray-500 font-bold uppercase">{language === 'en' ? 'TOTAL JOINED' : 'মোট সফল জয়েন'}</span>
                        <span className="text-white font-extrabold text-lg mt-0.5 block font-mono">{profile.referrals_count || 0}</span>
                      </div>
                      <div className="bg-black/20 p-2.5 rounded-xl border border-gray-800 text-center">
                        <span className="block text-[9px] text-emerald-500 font-bold uppercase">{language === 'en' ? 'COINS EARNED' : 'মোট প্রাইজ কয়েন'}</span>
                        <span className="text-emerald-400 font-extrabold text-lg mt-0.5 block font-mono">{(profile.referrals_count || 0) * 50}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-[10px] mt-3">
                    💰 {language === 'en' ? 'Earn 50 coins / successful registration!' : 'প্রতিটি সফল রেফারে ৫০ কয়েন অটোমেটিক যুক্ত হয়!'}
                  </p>
                </div>

              </div>

              {/* Claim Reference Area */}
              <div className="bg-[#181a26]/40 p-5 rounded-2xl border border-gray-800/80">
                <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-1.5">
                  🎁 {language === 'en' ? 'Unlock Entering Code Reward' : 'ইনভাইট কোড দিয়ে ২০ কয়েন বুঝে নিন'}
                </h4>
                <p className="text-gray-400 text-[11px] leading-relaxed mb-4">
                  {language === 'en'
                    ? 'Do you have another player\'s referral or invite code? Enter it below to unlock a special starting package of 20 Coins.'
                    : 'আপনার কাছে কি অন্য কোনো প্লেয়ারের ইনভাইট কোড আছে? তাহলে কোডটি নিচে সাবমিট করে সাথে সাথে ২০ কয়েন ক্লেইম করুন!'}
                </p>

                {profile.referredBy ? (
                  <div className="bg-[#052e16]/30 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold">
                    <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                    <div>
                      <span>
                        {language === 'en' 
                          ? 'Referral is claimed successfully! You have unlocked your 20 Taka/Coins.' 
                          : 'রেফার কোড সফলভাবে দাবি করা হয়েছে! এবং ২০ কয়েন আপনার ওয়ালেটে যোগ করা হয়েছে।'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={language === 'en' ? "e.g., SABI7E1B" : "যেমন: SABI7E1B"}
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                      className="bg-[#0a0b12] text-white border border-gray-800 rounded-xl px-4 py-3 font-mono text-sm tracking-widest focus:outline-none focus:border-amber-500/60 flex-1"
                    />
                    <button
                      onClick={handleClaimReferral}
                      disabled={submittingClaim}
                      className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-850 disabled:text-gray-500 text-black font-extrabold text-xs px-6 rounded-xl transition-all cursor-pointer"
                    >
                      {submittingClaim ? (language === 'en' ? 'Verifying...' : 'যাচাই হচ্ছে...') : (language === 'en' ? 'Claim 20 C' : 'কয়েন ক্লেইম করুন')}
                    </button>
                  </div>
                )}
                {claimError && (
                  <p className="text-red-400 font-bold text-[11px] mt-2.5 leading-tight">
                    ❌ {claimError}
                  </p>
                )}
                {claimSuccess && (
                  <p className="text-emerald-400 font-bold text-[11px] mt-2.5 leading-tight">
                    ✅ {claimSuccess}
                  </p>
                )}
              </div>

            </div>
          )}

          {/* POLICIES PANEL CONTENT */}
          {activeTab === 'policy' && (
            <div className="bg-[#121420] border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in">
              
              {/* Policy Category filter links */}
              <div className="flex gap-1.5 flex-wrap bg-[#0a0b12] p-1 rounded-2xl border border-gray-800/80">
                <button
                  onClick={() => setActivePolicy('privacy')}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all ${
                    activePolicy === 'privacy' 
                      ? 'bg-[#1e1c2b] text-amber-400 border border-amber-500/20' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🔒 Privacy Policy
                </button>
                <button
                  onClick={() => setActivePolicy('terms')}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all ${
                    activePolicy === 'terms' 
                      ? 'bg-[#1e1c2b] text-amber-400 border border-amber-500/20' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  📜 Terms & Rules
                </button>
                <button
                  onClick={() => setActivePolicy('refund')}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all ${
                    activePolicy === 'refund' 
                      ? 'bg-[#1e1c2b] text-amber-400 border border-amber-500/20' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  💰 Refund & Cashouts
                </button>
              </div>

              {/* Category body text */}
              <div className="space-y-4">
                
                {/* 1. Privacy policy content */}
                {activePolicy === 'privacy' && (
                  <div className="space-y-4 text-xs text-gray-300 leading-relaxed font-sans">
                    <h4 className="text-white text-base font-extrabold flex items-center gap-2">
                      <Lock className="h-5 w-5 text-amber-500" />
                      Gamer Privacy & Encryption Policy (প্রাইভেসি পলিসি)
                    </h4>
                    <p>
                      {language === 'en'
                        ? 'We prioritize keeping your gaming accounts and custom lobby identities fully secured. Because we integrate directly with Google Auth and industry-standard Firebase setups, your access passwords are never stored in plaintext.'
                        : 'আমরা আপনার গেমিং প্রফেশনাল অ্যাকাউন্ট এবং ইউজার আইডি তথ্যের গোপনীয়তা সর্বদা বজায় রাখতে দায়বদ্ধ। ফায়ারবেস অথেন্টিকেশন প্রক্রিয়ার মাধ্যমে পাসওয়ার্ড গোপন রাখা হয় এবং আপনি ছাড়া অন্য কেউ তা অ্যাক্সেস করতে পারে না।'}
                    </p>

                    <div className="bg-[#0a0b12] p-4 rounded-2xl border border-gray-800 space-y-2.5">
                      <span className="font-bold text-white block">Key Security Protections:</span>
                      <ul className="list-disc list-inside space-y-1.5 text-gray-400">
                        <li>We only request public profiles (name, email) to register inside game lobby sheets.</li>
                        <li>We do not record any mobile device hardware IDs or run spyware.</li>
                        <li>Payments info (bKash/Nagad transactional IDs) are kept confidential for finance reviews.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* 2. Terms of service policy content */}
                {activePolicy === 'terms' && (
                  <div className="space-y-4 text-xs text-gray-300 leading-relaxed font-sans">
                    <h4 className="text-white text-base font-extrabold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-amber-500" />
                      Terms of Service & Fair Play Rules (শর্তাবলী ও ফেয়ার প্লে নীতি)
                    </h4>
                    <p>
                      {language === 'en'
                        ? 'To ensure a rewarding esports platform, we enforce strict lobbies policies. Any actions degrading matches fairness will result in automatic permanently locks.'
                        : 'টুর্নামেন্টে সবার জন্য সমান সুযোগ ও সুষ্ঠু পরিবেশ নিশ্চিত করতে আমরা একটি কঠোর ফেয়ার প্লে নীতি পরিচালনা করে থাকি। কোনো ধরনের অসদুপায় অবলম্বন করলে অ্যাকাউন্ট স্থায়ীভাবে বরখাস্ত করা হবে।'}
                    </p>

                    <div className="bg-[#0a0b12] p-4 rounded-2xl border border-gray-800 space-y-2.5">
                      <span className="font-bold text-rose-400 block">Strictly Forbidden Activities:</span>
                      <ul className="list-disc list-inside space-y-1.5 text-gray-400">
                        <li>Using macro tools, auto-headshot tools, wall-hacks in Free Fire / PUBG matches.</li>
                        <li>Submitting counterfeit bKash / Nagad Transaction IDs inside wallet.</li>
                        <li>Intentionally teaming up with non-lobbyists or opposing squad players during active queues.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* 3. Refund and cashout policy content */}
                {activePolicy === 'refund' && (
                  <div className="space-y-4 text-xs text-gray-300 leading-relaxed font-sans">
                    <h4 className="text-white text-base font-extrabold flex items-center gap-2">
                      <Coins className="h-5 w-5 text-amber-500" />
                      Coin Refund & Withdrawal Timelines (রিফান্ড ও ক্যাশ আউট নীতি)
                    </h4>
                    <p>
                      {language === 'en'
                        ? 'Deposits are vetted manually. If you deposit coins and the lobby fills or gets canceled, your coins are refunded instantly to your balance. All withdrawals are directly sent inside 15-30 minutes.'
                        : 'প্রত্যেক নতুন ডিপোজিট এবং টাকা উত্তোলন সিস্টেম এডমিন প্যানেল দ্বারা ম্যানুয়ালি যাচাই করা হয়। কোনো ম্যাচ বাতিল হলে প্রবেশ ফি সরাসরি আপনার ওয়ালেট ব্যালেন্সে ফেরত দেওয়া হয়।'}
                    </p>

                    <div className="bg-[#0a0b12] p-4 rounded-2xl border border-gray-800 space-y-2.5">
                      <span className="font-bold text-emerald-400 block">Withdrawals Policy Highlights:</span>
                      <ul className="list-disc list-inside space-y-1.5 text-gray-400">
                        <li>Minimal Coins deposit: 50 C (1 Coin = 1 BDT/Taka).</li>
                        <li>Minimal Winnings Cash out: 100 C.</li>
                        <li>Standard Cash Out systems take anywhere from 10 to 30 minutes. Always verify agent/personal bKash and Nagad numbers.</li>
                      </ul>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
export default ProfileSettingsView;
