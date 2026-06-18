import React, { useState } from 'react';
import { useApp } from './AppContext';
import { 
  Facebook, 
  Youtube, 
  Send as TelegramIcon, 
  MessageCircle, 
  ExternalLink, 
  Video, 
  Users, 
  Tv, 
  Heart, 
  Zap, 
  Sparkles,
  Check
} from 'lucide-react';

export const CommunityChat: React.FC = () => {
  const { language, settings } = useApp();
  const [copied, setCopied] = useState<string | null>(null);

  const fbPage = settings.facebook_page_url || "https://www.facebook.com/ProTournamentBD";
  const fbGroup = settings.facebook_group_url || "https://www.facebook.com/groups/protournamentbd";
  const ytChannel = settings.youtube_channel_url || "https://www.youtube.com/@ProTournamentBD";
  const telegram = settings.telegram_channel_url || "https://t.me/ProTournamentBD";
  const whatsApp = settings.whatsapp_group_url || "https://chat.whatsapp.com/EsportsEliteLobbyBD";

  const handleCopyLink = (url: string, name: string) => {
    navigator.clipboard.writeText(url);
    setCopied(name);
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in font-sans pb-12 text-left">
      
      {/* Visual Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#111322] via-[#10142D] to-[#120f26] border border-gray-800 p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="space-y-2.5 z-10 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/15 text-[10px] text-amber-400 font-extrabold font-mono uppercase tracking-wider">
            <Sparkles className="h-3 w-3 animate-pulse text-amber-400" />
            {language === 'en' ? 'Community & Video Stream Hub' : 'অফিশিয়াল সোশ্যাল ও মিডিয়া হাব'}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none uppercase">
            {language === 'en' ? 'Keep Connected ⚡' : 'আমাদের সাথে সংযুক্ত থাকুন ⚡'}
          </h2>
          <p className="text-xs text-gray-400 max-w-lg leading-relaxed font-medium">
            {language === 'en' 
              ? 'Get daily room codes, play with premium support channels, and watch all active matches broadcasts or clips directly on our social feeds.' 
              : 'প্রতিদিনের ম্যাচের প্রতিটি টুর্নামেন্টের ভিডিও রেকর্ডিং বা লাইভ ব্রডকাস্ট দেখতে এবং জরুরি দরকারে সরাসরি অ্যাডমিনের সাথে যোগাযোগ রাখুন।'}
          </p>
        </div>
        <div className="relative shrink-0 flex items-center justify-center">
          <div className="absolute h-24 w-24 bg-amber-500/10 rounded-full blur-2xl animate-pulse" />
          <Tv className="h-14 w-14 text-amber-500 z-10 animate-bounce" style={{ animationDuration: '4s' }} />
        </div>
      </div>

      {/* 2. DEDICATED PRESTIGE CARD FOR THE OFFICIAL FACEBOOK PAGE */}
      <div className="bg-gradient-to-br from-[#1877f2]/15 via-[#0e111c] to-[#0d0e14] border-2 border-[#1877f2]/25 rounded-3xl p-5 sm:p-7 relative overflow-hidden shadow-2xl group">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#1877f2]/5 rounded-full blur-3xl group-hover:bg-[#1877f2]/10 transition-all duration-300" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4 text-left">
            <div className="h-14 w-14 bg-[#1877f2] hover:scale-105 transition-all duration-200 text-white rounded-2xl flex items-center justify-center text-3xl font-extrabold shadow-lg shadow-[#1877f2]/25 shrink-0 select-none">
              <Facebook className="h-7 w-7 stroke-[2.2]" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase font-black tracking-widest text-[#1877f2] bg-[#1877f2]/10 px-2.5 py-0.5 rounded-full font-mono border border-[#1877f2]/20">
                {language === 'en' ? '★ TOURNAMENT VIDEOS HUB' : '★ টুর্নামেন্ট ভিডিও ও লাইভ সম্প্রচার'}
              </span>
              <h3 className="font-black text-white text-base sm:text-lg tracking-tight flex items-center gap-1.5">
                {language === 'en' ? 'ProTournament BD Facebook Page' : 'প্রোটুর্নামেন্ট বিডি অফিসিয়াল ফেসবুক পেজ'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl font-medium">
                {language === 'en' 
                  ? 'All matches played on our platform are streamed live or published as highlight videos. Follow our brand-new page to watch custom Free Fire, PUBG, and Ludo gameplay highlights and support our growing community!' 
                  : 'আমাদের টুর্নামেন্টের সকল ম্যাচগুলোর প্রিমিয়াম গেমপ্লে ভিডিও ও লাইভ স্ট্রিম এই পেজে আপলোড করা হয়। এখনই ফলো করে আপনার নিজের খেলার ভিডিও দেখে নিন এবং বন্ধুদের সাথে শেয়ার করুন!'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-48 shrink-0">
            <a 
              href={fbPage}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-3 px-5 bg-gradient-to-r from-[#1877f2] to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#1877f2]/15 active:scale-95"
            >
              <Video className="h-4 w-4" />
              <span>{language === 'en' ? 'Watch Videos & Follow' : 'ভিডিও দেখুন ও ফলো করুন 🎞️'}</span>
            </a>
            <button
              onClick={() => handleCopyLink(fbPage, 'fbPage')}
              className="w-full text-center py-2.5 px-4 bg-gray-900/60 hover:bg-gray-800 text-gray-300 font-bold rounded-xl text-[11px] border border-gray-800 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              {copied === 'fbPage' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{language === 'en' ? 'Link Copied!' : 'লিংক কপি হয়েছে!'}</span>
                </>
              ) : (
                <>
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>{language === 'en' ? 'Copy Page Link' : 'লিংক কপি করুন'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Other Channels (WhatsApp, FB Group, YouTube, Telegram) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* WhatsApp Channel */}
        <div className="bg-[#0c0d15] border border-emerald-500/20 p-5 rounded-3xl flex flex-col justify-between gap-4 text-left shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 bg-emerald-505 bg-emerald-500 text-black rounded-xl flex items-center justify-center text-xl shrink-0 font-extrabold shadow-md">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[9px] text-[#10b981] font-bold uppercase tracking-wider block font-mono">SUPPORT DESK</span>
                <h4 className="text-white text-sm font-extrabold">{language === 'en' ? 'WhatsApp Support Line' : 'হোয়াটসঅ্যাপ হেল্প লাইন'}</h4>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed font-semibold">
              {language === 'en'
                ? 'Directly message our live admin panel for fast coin loading additions, payment approvals, or custom room questions.'
                : 'যেকোনো কয়েন ডিপোজিট, উইথড্রয়াল এপ্রুভাল কিংবা ম্যাচে জয়েন করা সংক্রান্ত সমস্যা সমাধানে সরাসরি হোয়াটসঅ্যাপে কথা বলুন।'}
            </p>
          </div>
          <div className="flex gap-2">
            <a 
              href={whatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>{language === 'en' ? 'Message Support' : 'সরাসরি যোগাযোগ করুন'}</span>
            </a>
            <button
              onClick={() => handleCopyLink(whatsApp, 'whatsapp')}
              className="px-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-all text-xs"
            >
              {copied === 'whatsapp' ? <Check className="h-4 w-4 text-emerald-400" /> : <ExternalLink className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Facebook Community Group */}
        <div className="bg-[#0c0d15] border border-blue-500/20 p-5 rounded-3xl flex flex-col justify-between gap-4 text-left shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 bg-[#1877f2] text-white rounded-xl flex items-center justify-center text-xl shrink-0 font-extrabold shadow-md">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider block font-mono">COMMUNITY FORUM</span>
                <h4 className="text-white text-sm font-extrabold">{language === 'en' ? 'Facebook Player Group' : 'ফেসবুক মেম্বার গ্রুপ'}</h4>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed font-semibold">
              {language === 'en'
                ? 'Join 5000+ top gamers to share custom tournament screenshots, locate team partners, and vote on game changes.'
                : 'দেশসেরা হাজারো ফ্রি ফায়ার ও পাবজি স্কোয়াড মেম্বারদের গ্রুপে আজই যোগ দিন এবং আপনার খেলার স্ক্রিনশট শেয়ার করুন।'}
            </p>
          </div>
          <div className="flex gap-2">
            <a 
              href={fbGroup}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 bg-[#1877f2] hover:bg-blue-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>{language === 'en' ? 'Join Community' : 'মেম্বার গ্রুপে যোগ দিন'}</span>
            </a>
            <button
              onClick={() => handleCopyLink(fbGroup, 'fbGroup')}
              className="px-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-all text-xs"
            >
              {copied === 'fbGroup' ? <Check className="h-4 w-4 text-emerald-400" /> : <ExternalLink className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* YouTube Channel */}
        <div className="bg-[#0c0d15] border border-red-500/20 p-5 rounded-3xl flex flex-col justify-between gap-4 text-left shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 bg-red-600 text-white rounded-xl flex items-center justify-center text-xl shrink-0 font-extrabold shadow-md">
                <Youtube className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider block font-mono">LIVE STREAMS</span>
                <h4 className="text-white text-sm font-extrabold">{language === 'en' ? 'Official YouTube Channel' : 'অফিশিয়াল ইউটিউব চ্যানেল'}</h4>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed font-semibold">
              {language === 'en'
                ? 'Subscribe to watch pristine HD livestream tournament broadcasts, professional guide videos, and winners prize clips.'
                : 'আমাদের ইউটিউব চ্যানেলে ম্যাচের লাইভ স্ট্রিম ও কিভাবে টুর্নামেন্টে জয়েন ও উইথড্র করবেন তার গাইড ভিডিও পাবেন।'}
            </p>
          </div>
          <div className="flex gap-2">
            <a 
              href={ytChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 bg-[#ff0000] hover:bg-red-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>{language === 'en' ? 'Subscribe Now' : 'সাবস্ক্রাইব করুন'}</span>
            </a>
            <button
              onClick={() => handleCopyLink(ytChannel, 'ytChannel')}
              className="px-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-all text-xs"
            >
              {copied === 'ytChannel' ? <Check className="h-4 w-4 text-emerald-400" /> : <ExternalLink className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Telegram Hub */}
        <div className="bg-[#0c0d15] border border-sky-500/20 p-5 rounded-3xl flex flex-col justify-between gap-4 text-left shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 bg-[#229ed9] text-white rounded-xl flex items-center justify-center text-xl shrink-0 font-extrabold shadow-md">
                <TelegramIcon className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[9px] text-sky-400 font-bold uppercase tracking-wider block font-mono">FAST NOTICES</span>
                <h4 className="text-white text-sm font-extrabold">{language === 'en' ? 'Telegram Alerts' : 'টেলিগ্রাম নোটিশ চ্যানেল'}</h4>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed font-semibold">
              {language === 'en'
                ? 'Get instantaneous custom notifications when new slots or matches are loaded, plus quick room password details.'
                : 'নতুন টুর্নামেন্ট স্লট ওপেন হওয়া মাত্রই বা ম্যাচের রুম আইডি ছাড়া হলেই সবচেয়ে দ্রুত নোটিফিকেশন পেতে যুক্ত হোন।'}
            </p>
          </div>
          <div className="flex gap-2">
            <a 
              href={telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 bg-[#229ed9] hover:bg-[#1a82b4] text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>{language === 'en' ? 'Join Channel' : 'চ্যানেলে যোগ দিন'}</span>
            </a>
            <button
              onClick={() => handleCopyLink(telegram, 'telegram')}
              className="px-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-all text-xs"
            >
              {copied === 'telegram' ? <Check className="h-4 w-4 text-emerald-400" /> : <ExternalLink className="h-4 w-4" />}
            </button>
          </div>
        </div>

      </div>

      {/* Safety Notice and Guidelines bottom card */}
      <div className="bg-[#0b0c13] border border-gray-850 p-4 sm:p-5 rounded-2xl flex items-start gap-3.5 shadow-xl">
        <Heart className="h-6 w-6 text-amber-500 shrink-0 fill-amber-500/10" />
        <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
          <strong>{language === 'en' ? 'Core Updates Notification' : 'একটি বিশেষ ঘোষণা:'}</strong> {language === 'en' 
            ? 'We have retired the standard in-app lobby chat system to prevent spam links, scams, and slow load times. Please utilize the WhatsApp Support Desk for transactions, and follow ProTournament BD Facebook Page to support your highlight videos!' 
            : 'চ্যাটরুমের অননুমোদিত লিংক প্রচার বা অপ্রয়োজনীয় জ্যাম কমাতে আমাদের ইন-অ্যাপ সাধারণ চ্যাটরুম সিস্টেমটি অফ করে দেওয়া হয়েছে। যেকোনো প্রকার সাপোর্ট বা কয়েন সংক্রান্ত তথ্যের জন্য আমাদের অফিশিয়াল হোয়াটসঅ্যাপ বা ফেসবুক পেজে যোগাযোগ করুন। ধন্যবাদ!'}
        </p>
      </div>

    </div>
  );
};
export default CommunityChat;
