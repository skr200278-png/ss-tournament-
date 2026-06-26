import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { 
  Share2, 
  Download, 
  Check, 
  Gamepad2, 
  Trophy, 
  Users, 
  MessageSquare, 
  Flame, 
  Smartphone, 
  Info, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';
import { TournamentDetailModal } from './TournamentDetailModal';
import { getGameFallbackBanner } from './Dashboard';

export const HomeView: React.FC = () => {
  const { 
    profile, 
    language, 
    t, 
    setCurrentView, 
    settings, 
    handleInstallApp,
    tournaments
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);

  // In-app webview warning detection
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

  // Rotating game highlights for the banner
  const slides = [
    {
      titleEn: "Free Fire Clash Squad",
      titleBn: "ফ্রি ফায়ার ক্ল্যাশ স্কোয়াড",
      subtitleEn: "Show your raw skills & earn coins every match!",
      subtitleBn: "আপনার গেমিং স্কিল দেখান এবং প্রতি ম্যাচে কয়েন জিতুন!",
      img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=60&w=600&auto=format&fit=crop",
      badge: "HOT"
    },
    {
      titleEn: "PUBG Mobile Showdown",
      titleBn: "পাবজি মোবাইল শোডাউন",
      subtitleEn: "Join Classic Erangel rooms & claim the chicken dinner!",
      subtitleBn: "ক্লাসিক ইরাঙ্গেল রুমে যোগ দিন ও চিকেন ডিনার জিতে নিন!",
      img: "https://images.unsplash.com/photo-1553481187-be93c21490a9?q=60&w=600&auto=format&fit=crop",
      badge: "POPULAR"
    },
    {
      titleEn: "Ludo King 1v1 Arena",
      titleBn: "লুডু কিং ১ বনাম ১ লড়াই",
      subtitleEn: "Quick matches, instant winnings and direct cashouts!",
      subtitleBn: "কুইক ম্যাচ, সাথে সাথে বিজয় নির্ধারণ এবং উইথড্র!",
      img: "https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?q=60&w=600&auto=format&fit=crop",
      badge: "EASY"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* 1. BRAND NEW HERO CAROUSEL / SLIDER BANNER */}
      <div className="relative rounded-3xl overflow-hidden border border-gray-800 bg-[#0c0d14] shadow-2xl h-[240px] sm:h-[320px]">
        {/* Active Banner Image */}
        <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
          <img 
            src={slides[activeSlide].img} 
            alt="Hero Banner" 
            className="w-full h-full object-cover opacity-35 filter brightness-90 transition-transform duration-700 hover:scale-105"
            referrerPolicy="no-referrer"
          />
          {/* Gradients to merge text */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-black/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07080d]/80 via-transparent to-transparent" />
        </div>

        {/* Floating Accent Badge */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <span className="bg-amber-500 text-black text-[9px] font-black px-2.5 py-1 rounded-lg tracking-widest font-mono uppercase shadow-md animate-pulse">
            {slides[activeSlide].badge}
          </span>
          <span className="bg-black/60 backdrop-blur-md text-white border border-gray-800 text-[9px] font-bold px-2.5 py-1 rounded-lg">
            ESPORTS LOBBY
          </span>
        </div>

        {/* Slide Content */}
        <div className="absolute bottom-6 left-6 right-6 z-10 space-y-2 max-w-lg">
          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-none drop-shadow-lg">
            {language === 'en' ? slides[activeSlide].titleEn : slides[activeSlide].titleBn}
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm drop-shadow-md leading-relaxed font-medium">
            {language === 'en' ? slides[activeSlide].subtitleEn : slides[activeSlide].subtitleBn}
          </p>
          
          <div className="pt-2">
            <button
              onClick={() => setCurrentView('games')}
              className="px-4.5 py-2 bg-amber-500 hover:bg-amber-450 text-black text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
            >
              <Gamepad2 className="h-4 w-4" />
              <span>{language === 'en' ? 'Explore Rooms' : 'রুমে প্রবেশ করুন'}</span>
              <ArrowRight className="h-3 w-3 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="absolute bottom-4 right-6 z-10 flex gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeSlide === idx ? 'bg-amber-500 w-5' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 2. NOTICE TICKER */}
      {settings.notice && (
        <div className="bg-amber-500/10 border border-amber-500/15 text-amber-300 px-4 py-2.5 rounded-2xl flex items-center gap-3 overflow-hidden text-xs font-semibold shadow-md">
          <span className="flex items-center gap-1 bg-amber-500 text-black px-2 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider shrink-0 font-mono">
            NOTICE
          </span>
          <marquee className="font-mono text-xs text-slate-350 w-full font-bold" scrollamount="4">
            {settings.notice}
          </marquee>
        </div>
      )}

      {/* 3. HERO CONTENT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
        
        {/* A. Install Launcher Card */}
        {isInAppBrowser() ? (
          <div className="bg-gradient-to-br from-red-950 via-[#1e0a14] to-[#12050b] border-2 border-red-500/50 p-5 rounded-3xl space-y-3 shadow-2xl animate-pulse">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-red-650 text-white rounded-2xl flex items-center justify-center text-xl shrink-0 border border-red-500 shadow-md">
                ⚠️
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-red-400 text-xs sm:text-sm uppercase tracking-wider leading-none">
                  {language === 'en' ? 'FB / MESSENGER IN-APP DETECTED' : 'ইন-অ্যাপ ব্রাউজার সতর্কবার্তা ⚠️'}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-300 font-bold leading-relaxed">
                  {language === 'en' 
                    ? 'You are running inside FB/Messenger in-app browser. Installing the app directly is blockaded there. Click the top-right 3 DOTS (Menu) and select "Open in Chrome".' 
                    : 'আপনি ফেসবুক/মেসেঞ্জার ব্রাউজারে রয়েছেন! সেফ পিন ও ডাউনলোড সুরক্ষিত রাখতে দয়া করে ৩টি ডটে ক্লিক করে "Open in Chrome" সিলেক্ট করুন।'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#121420] border border-gray-800 p-6 rounded-3xl relative overflow-hidden shadow-xl flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors pointer-events-none" />
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl flex items-center justify-center text-2xl">
                  📲
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-none">
                    {language === 'en' ? 'Download Mobile App' : 'অফিসিয়াল অ্যাপ ইনস্টল করুন'}
                  </h3>
                  <span className="inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-550/20 text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded font-extrabold font-mono tracking-wide uppercase">
                    Lightweight (1MB) shortcuts
                  </span>
                </div>
              </div>

              <p className="text-gray-400 text-xs leading-relaxed">
                {language === 'en' 
                  ? 'Add ProTournament BD directly to your Android/iOS home screen. Run gameplay matches with zero lag and receive push notifications on room ID updates!'
                  : 'প্রোটুর্নামেন্ট বিডি অ্যাপটি ক্রোম বা সাফারী ব্রাউজার ব্যবহার করে সরাসরি আপনার মোবাইলের হোম স্ক্রিনে ইনস্টল করে নিন। এতে কোন র্যাম ক্ষয় বা লেগ ছাড়াই দ্রুত নোটিফিকেশন পাবেন।'}
              </p>
            </div>

            <div className="pt-6">
              <button
                onClick={handleInstallApp}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black rounded-xl text-xs tracking-wider uppercase cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Download className="h-4 w-4" />
                <span>{language === 'en' ? 'INSTALL NOW' : 'ইনস্টল অ্যাপ 📲'}</span>
              </button>
            </div>
          </div>
        )}

        {/* B. Refer and Earn / Share Card */}
        <div className="bg-[#121420] border border-gray-800 p-6 rounded-3xl relative overflow-hidden shadow-xl flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 bg-emerald-500/10 text-emerald-400 border border-emerald-550/20 rounded-2xl flex items-center justify-center text-2xl">
                🔗
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-none">
                  {language === 'en' ? 'Share App & Earn Coins' : 'বন্ধুদের শেয়ার করে কয়েন আর্ন করুন!'}
                </h3>
                <span className="inline-block bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded font-extrabold font-mono tracking-wide uppercase">
                  Earn 50 coins per referral
                </span>
              </div>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed">
              {language === 'en' 
                ? 'Invite your squad to play together! Share the game link using the button below. When a friend signs up using your code, they get 20 free starting coins, and you get 50 coins instantly.'
                : 'আপনার ফ্রি ফায়ার, পাবজি ও লুডু খেলার টিমমেট বন্ধুদের কাছে শেয়ার করুন! আপনার রেফার কোড ব্যবহার করে তারা যোগ দিলেই তারা পাবে ২০ কয়েন ফ্রি এবং আপনি পাবেন ৫০ কয়েন সরাসরি ব্যালেন্সে।'}
            </p>
          </div>

          <div className="pt-6">
            <button
              onClick={handleShareApp}
              className={`w-full py-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-md select-none ${
                copied 
                  ? 'bg-emerald-500 text-black font-extrabold' 
                  : 'bg-[#181a26] hover:bg-black/60 text-white border border-gray-800 hover:border-gray-750'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>{language === 'en' ? 'Link Copied completed!' : 'লিঙ্ক কপি সম্পন্ন!'}</span>
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  <span>{language === 'en' ? 'Share with Friends' : 'লিংক শেয়ার ও কপি 🔗'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* 4. SEAMLESS INTERACTION PLATFORM STATS */}
      <div className="bg-gradient-to-r from-gray-900 to-[#100e2b] border border-gray-800 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left relative overflow-hidden shadow-xl">
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-1.5 flex-1 select-none">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-400 font-extrabold font-mono uppercase">
            <Flame className="h-3 w-3 animate-pulse" />
            {language === 'en' ? 'Live Lobby Status' : 'চলতি মাসের এলিট তথ্য'}
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-white leading-none">
            {language === 'en' ? 'ProTournament BD Esports Lobby' : 'প্রো-টুর্নামেন্ট বিডি এলিটস'}
          </h2>
          <p className="text-gray-400 text-[11px] leading-relaxed max-w-sm">
            {language === 'en' 
              ? 'Authorized platform for custom lobbies with automated instant verify banking.'
              : 'মোবাইল ব্যাংক দ্বারা কয়েন ডিপোজিট ও উইনিং টাকা ৫-১৫ মিনিটে তুলতে পারবেন।'
            }
          </p>
        </div>

        {/* Bento grid sub counters */}
        <div className="grid grid-cols-2 gap-4 w-full sm:w-auto shrink-0 font-mono text-center sm:text-left">
          <div className="bg-black/25 border border-gray-800 p-3 rounded-2xl min-w-[125px]">
            <span className="text-[9px] text-gray-500 block font-bold uppercase">{language === 'en' ? 'Lobbies' : 'মোট টুর্নামেন্ট'}</span>
            <span className="text-amber-500 font-black text-sm block mt-0.5">{tournaments.length} Matches</span>
          </div>
          <div className="bg-black/25 border border-gray-800 p-3 rounded-2xl min-w-[125px]">
            <span className="text-[9px] text-gray-500 block font-bold uppercase">{language === 'en' ? 'Exchange Rate' : 'মুদ্রার হার'}</span>
            <span className="text-emerald-400 font-black text-sm block mt-0.5">1 BDT = 1 Coin</span>
          </div>
        </div>
      </div>

      {/* 5. QUICK SHORTCUTS ROW GUIDING PLAYERS */}
      <div className="bg-[#121420] border border-gray-800 rounded-3xl p-4 sm:p-6 space-y-4">
        <h3 className="text-white font-extrabold text-sm sm:text-base flex items-center gap-1.5 select-none font-sans">
          <Zap className="h-4 w-4 text-amber-500" />
          <span>{language === 'en' ? 'Quick Gaming Shortcuts' : 'ঝটপট নেভিগেশন ও গাইড'}</span>
        </h3>
        
        <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
          <button
            onClick={() => setCurrentView('games')}
            className="p-1.5 sm:p-3 bg-black/25 rounded-2xl border border-gray-800 hover:border-amber-500/40 hover:bg-black/40 text-center transition-all cursor-pointer group select-none active:scale-95"
          >
            <Gamepad2 className="h-4.5 w-4.5 text-amber-500 mx-auto mb-1" />
            <span className="block text-[8px] xs:text-[9.5px] font-bold text-gray-300 group-hover:text-amber-400 truncate">
              {language === 'en' ? 'Games' : 'গেমস'}
            </span>
          </button>

          <button
            onClick={() => {
              setCurrentView('all_tournaments');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="p-1.5 sm:p-3 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-2xl border border-amber-500/30 hover:border-amber-500/70 hover:bg-[#1a1c2d] text-center transition-all cursor-pointer group select-none active:scale-95 relative"
          >
            <span className="absolute -top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-450 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <Trophy className="h-4.5 w-4.5 text-amber-500 mx-auto mb-1 animate-pulse" />
            <span className="block text-[8px] xs:text-[9.5px] font-extrabold text-amber-400 group-hover:text-amber-300 truncate">
              {language === 'en' ? 'Join Match' : 'জয়েন টুর্নামেন্ট'}
            </span>
          </button>

          <button
            onClick={() => setCurrentView('joined')}
            className="p-1.5 sm:p-3 bg-black/25 rounded-2xl border border-gray-800 hover:border-amber-500/40 hover:bg-black/40 text-center transition-all cursor-pointer group select-none active:scale-95"
          >
            <Smartphone className="h-4.5 w-4.5 text-indigo-400 mx-auto mb-1" />
            <span className="block text-[8px] xs:text-[9.5px] font-bold text-gray-300 group-hover:text-indigo-400 truncate">
              {language === 'en' ? 'My Matches' : 'আমার ম্যাচ'}
            </span>
          </button>

          <button
            onClick={() => setCurrentView('results')}
            className="p-1.5 sm:p-3 bg-black/25 rounded-2xl border border-gray-800 hover:border-amber-500/40 hover:bg-black/40 text-center transition-all cursor-pointer group select-none active:scale-95"
          >
            <Trophy className="h-4.5 w-4.5 text-rose-450 mx-auto mb-1" />
            <span className="block text-[8px] xs:text-[9.5px] font-bold text-gray-300 group-hover:text-rose-400 truncate">
              {language === 'en' ? 'Winners' : 'ফলাফল 🏆'}
            </span>
          </button>

          <button
            onClick={() => setCurrentView('profile')}
            className="p-1.5 sm:p-3 bg-black/25 rounded-2xl border border-gray-800 hover:border-amber-500/40 hover:bg-black/40 text-center transition-all cursor-pointer group select-none active:scale-95"
          >
            <Users className="h-4.5 w-4.5 text-emerald-450 mx-auto mb-1" />
            <span className="block text-[8px] xs:text-[9.5px] font-bold text-gray-300 group-hover:text-emerald-400 truncate">
              {language === 'en' ? 'Support' : 'সাপোর্ট নিন'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
