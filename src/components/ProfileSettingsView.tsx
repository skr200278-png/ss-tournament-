import React, { useState } from 'react';
import { useApp } from './AppContext';
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
  ArrowRight
} from 'lucide-react';

export const ProfileSettingsView: React.FC = () => {
  const { profile, language, t, setCurrentView } = useApp();
  const [copiedUid, setCopiedUid] = useState(false);
  const [activeTab, setActiveTab] = useState<'policy' | 'support'>('support');
  const [activePolicy, setActivePolicy] = useState<'privacy' | 'terms' | 'refund'>('privacy');

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
        
        {/* Left column: Profile card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#121420] border border-gray-800 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center text-center">
            
            {/* Ambient Background Glow */}
            <div className="absolute -top-12 -left-12 w-28 h-28 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
            
            {/* Avatar Shield */}
            <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/10 mb-4 border border-amber-400/20">
              <User className="h-10 w-10 text-black stroke-[2.5]" />
            </div>

            <h3 className="text-white font-extrabold text-lg truncate max-w-full">
              {profile.name}
            </h3>
            <span className="text-[10px] bg-amber-500/15 border border-amber-500/20 text-amber-400 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider block mt-1">
              🎖️ Elite Gamer Lobbyist
            </span>

            {/* Email */}
            <p className="text-gray-400 text-xs mt-3 select-all font-sans font-medium">
              {profile.email || "No email available"}
            </p>

            {/* Balances summary */}
            <div className="w-full mt-6 grid grid-cols-2 gap-2 text-xs">
              <div 
                onClick={() => setCurrentView('wallet')}
                className="bg-[#181a26]/70 border border-gray-800 rounded-2xl p-3 text-center cursor-pointer hover:border-amber-500/30 transition-all"
              >
                <Coins className="h-4 w-4 text-amber-500 mx-auto mb-1 animate-pulse" />
                <span className="block text-[8px] text-gray-500 font-bold uppercase">{language === 'en' ? 'COINS' : 'কয়েন'}</span>
                <span className="text-white font-extrabold text-sm font-mono mt-0.5 block">{profile.coins_balance}</span>
              </div>

              <div 
                onClick={() => setCurrentView('wallet')}
                className="bg-[#181a26]/70 border border-gray-800 rounded-2xl p-3 text-center cursor-pointer hover:border-emerald-500/30 transition-all"
              >
                <Trophy className="h-4 w-4 text-emerald-400 mx-auto mb-1 animate-pulse" />
                <span className="block text-[8px] text-gray-500 font-bold uppercase">{language === 'en' ? 'WINNINGS' : 'উইনিং'}</span>
                <span className="text-[#10b981] font-extrabold text-sm font-mono mt-0.5 block">{profile.winning_balance}</span>
              </div>
            </div>

            {/* UID Copy action */}
            <div className="w-full mt-6 pt-6 border-t border-gray-800/80 space-y-2 text-left">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Unique Account UID</label>
              <div className="bg-[#0a0b12] rounded-xl px-3 py-2 border border-gray-800 flex justify-between items-center overflow-hidden">
                <span className="text-[11px] font-mono text-gray-300 truncate tracking-wide max-w-[150px]">{profile.uid}</span>
                <button
                  onClick={handleCopyUid}
                  className="p-1 text-gray-400 hover:text-white shrink-0 transition-colors"
                  title="Copy UID"
                >
                  {copiedUid ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right column: Tabbed settings panels */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Navigation Tab links */}
          <div className="flex border-b border-gray-800 bg-[#0c0d14]/40 rounded-t-2xl p-1">
            <button
              onClick={() => setActiveTab('support')}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'support'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <PhoneCall className="h-4 w-4" />
              {language === 'en' ? 'Direct Developer Support' : 'ডেভেলপার ও এডমিন সাপোর্ট'}
            </button>
            <button
              onClick={() => setActiveTab('policy')}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'policy'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              {language === 'en' ? 'Official Policies' : 'অফিসিয়াল নীতিমালাসমুহ'}
            </button>
          </div>

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
