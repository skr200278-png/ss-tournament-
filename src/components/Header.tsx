import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { Trophy, Wallet, Gamepad2, Calendar, Languages, LogIn, LogOut, Menu, X, Coins, Shield, User, Download, Info, Copy, Check, MessageSquare, Share2, Home } from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    profile, 
    login, 
    logout, 
    language, 
    setLanguage, 
    currentView, 
    setCurrentView, 
    t,
    isGuest,
    showAdminSecret,
    registerLogoClick,
    deferredPrompt,
    showInstallGuide,
    setShowInstallGuide,
    handleInstallApp
  } = useApp();

  const hasAdminAccess = showAdminSecret || (profile && profile.email === 'skr200278@gmail.com');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    // Detect iOS devices for manual install tips
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIphoneOrIpad = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIphoneOrIpad);
  }, []);

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
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  const handleCopyLink = () => {
    const appUrl = window.location.origin;
    navigator.clipboard.writeText(appUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        alert(language === 'en' ? "Failed to copy. Please manually share the URL." : "লিঙ্ক কপি করা যায়নি। অনুগ্রহ করে ব্রাউজার থেকে সরাসরি কপি করুন।");
      });
  };

  const toggleLang = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  const menuItems = [
    { view: 'home' as const, label: language === 'en' ? 'Home' : 'হোম', icon: Home },
    { view: 'games' as const, label: language === 'en' ? 'Games' : 'গেমস', icon: Gamepad2 },
    { view: 'joined' as const, label: t('myMatches'), icon: Calendar },
    { view: 'results' as const, label: language === 'en' ? 'Winners' : 'ফলাফল / বিজয়ী', icon: Trophy },
    { view: 'profile' as const, label: language === 'en' ? 'Profile' : 'প্রোফাইল', icon: User },
    { view: 'chat' as const, label: language === 'en' ? 'Community Chat' : 'গ্রুপ আড্ডা', icon: MessageSquare },
  ];

  return (
    <>
      {shareCopied && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-black px-6 py-3 rounded-full font-extrabold text-xs shadow-2xl flex items-center gap-2 border border-emerald-400 animate-bounce">
          <Check className="h-4 w-4 stroke-[3]" />
          <span>{language === 'en' ? 'Sharing Link Copied! Send it to Friends!' : 'শেয়ারিং লিংক কপি হয়েছে! বন্ধুদের পাঠিয়ে দিন!'}</span>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-[#0f111a] border-b border-gray-800 backdrop-blur-md bg-opacity-95 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <nav className="hidden md:flex space-x-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.view;
                return (
                  <button
                    key={item.view}
                    id={`nav-${item.view}`}
                    onClick={() => setCurrentView(item.view)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
                        : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Centered Logo on Desktop, Left-aligned on Mobile */}
          <div 
            className="md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none"
            onClick={() => {
              setCurrentView('home');
              registerLogoClick();
            }}
          >
            <div className="p-1 sm:p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/10 shrink-0">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-black stroke-[2.5]" />
            </div>
            <div className="text-left animate-fade-in">
              <span className="font-sans font-extrabold text-sm sm:text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-amber-400 block whitespace-nowrap">
                {t('appName')}
              </span>
              <p className="hidden xs:block text-[8px] font-mono tracking-widest text-[#94a3b8] uppercase leading-none mt-0.5">
                {language === 'en' ? 'Tournament Engine' : 'টুর্নামেন্ট ইঞ্জিন'}
              </p>
            </div>
          </div>

          {/* Wallet Header Counters & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 z-10">
            {profile && (
              <div 
                onClick={() => setCurrentView('wallet')}
                className="flex items-center gap-1.5 sm:gap-3 bg-[#1e293b]/60 hover:bg-[#1e293b] border border-gray-800 rounded-2xl px-2 sm:px-3 py-1 sm:py-1.5 cursor-pointer max-w-none transition-all"
              >
                <div className="flex items-center gap-1 sm:gap-1.5 border-r border-gray-700/60 pr-1.5 sm:pr-2.5">
                  <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 shrink-0" />
                  <div className="text-right font-sans">
                    <span className="hidden sm:block text-[9px] text-gray-400 font-medium leading-none mb-0.5">
                      {language === 'en' ? 'COINS' : 'কয়েন'}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400 leading-none">
                      {profile.coins_balance}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 shrink-0" />
                  <div className="text-right font-sans">
                    <span className="hidden sm:block text-[9px] text-gray-400 leading-none font-medium mb-0.5">
                      {language === 'en' ? 'WON' : 'উইনিং'}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400 leading-none">
                      {profile.winning_balance}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Dashboard Trigger */}
            {hasAdminAccess && (
              <button
                id="admin-dashboard-btn"
                onClick={() => setCurrentView('admin')}
                className={`p-2 rounded-xl border transition-all flex items-center justify-center gap-1.5 text-xs font-sans ${
                  currentView === 'admin'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'text-gray-300 hover:text-amber-400 hover:bg-gray-800 border-gray-800'
                }`}
                title="Admin Dashboard Panel"
              >
                <Shield className="h-4 w-4 text-amber-550" />
                <span className="hidden sm:inline font-semibold">Admin</span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              id="lang-toggle-btn"
              onClick={toggleLang}
              className="hidden sm:flex p-2 text-gray-300 hover:text-amber-400 hover:bg-gray-800 rounded-xl border border-gray-800 transition-all items-center justify-center gap-1 text-xs font-sans"
              title="Switch Language"
            >
              <Languages className="h-4 w-4 text-amber-500" />
              <span className="hidden leading-none font-semibold sm:inline">{language === 'en' ? 'বাং' : 'EN'}</span>
            </button>

            {/* Share App Button */}
            <button
              id="header-share-app-btn"
              onClick={handleShareApp}
              className="hidden sm:flex px-3 py-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl border border-emerald-500/30 bg-emerald-500/5 transition-all items-center justify-center gap-1.5 text-xs font-sans font-extrabold hover:scale-[1.02]"
              title="Share App link with your Friends"
            >
              <Share2 className="h-3.5 w-3.5 shrink-0" />
              <span>
                {language === 'en' ? 'Share App' : 'শেয়ার অ্যাপ 🔗'}
              </span>
            </button>

            {/* Install App Button */}
            <button
              id="pwa-install-header-btn"
              onClick={handleInstallApp}
              className="hidden sm:flex px-3 py-2 text-amber-400 hover:text-amber-300 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-orange-500/20 rounded-xl border border-amber-500/30 bg-amber-500/10 transition-all items-center justify-center gap-1.5 text-xs font-sans font-extrabold animate-pulse"
              title="Install App directly on Home Screen as Mobile App"
            >
              <Download className="h-3.5 w-3.5 shrink-0" />
              <span>
                {language === 'en' ? 'Install' : 'ইনস্টল অ্যাপ'}
              </span>
            </button>

            {/* Auth Buttons */}
            {profile ? (
              <button
                id="signout-button"
                onClick={logout}
                className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-xs font-sans font-semibold border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                {t('signOut')}
              </button>
            ) : (
              <div className="hidden sm:flex gap-2">
                <button
                  id="login-google-btn"
                  onClick={login}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-sans font-bold bg-amber-500 text-black hover:bg-amber-400 rounded-xl transition-all shadow-md shadow-amber-500/10 cursor-pointer"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  {t('loginWithGoogle')}
                </button>
              </div>
            )}

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl border border-gray-800"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0f111a] border-b border-gray-800 px-4 pt-2 pb-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => {
                  setCurrentView(item.view);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}

          {hasAdminAccess && (
            <button
              onClick={() => {
                setCurrentView('admin');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                currentView === 'admin'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-extrabold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Shield className="h-4 w-4 text-amber-500" />
              Admin Panel Control
            </button>
          )}

          {/* Mobile Language Switcher button inside Drawer */}
          <button
            onClick={() => {
              toggleLang();
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-gray-300 hover:text-white hover:bg-white/5 border border-transparent"
          >
            <Languages className="h-4 w-4 text-amber-500" />
            <span>
              {language === 'en' ? 'Switch to Bengali (বাংলা)' : 'Switch to English (ইংরেজি)'}
            </span>
          </button>
          
          <div className="pt-3 border-t border-gray-800/80 my-3 flex flex-col gap-2">
            {/* Mobile Share App option */}
            <button
              id="mobile-share-app-btn"
              onClick={() => {
                handleShareApp();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-emerald-550/30 bg-emerald-500/10 text-emerald-400 rounded-xl font-extrabold text-xs"
            >
              <Share2 className="h-3.5 w-3.5" />
              {language === 'en' ? 'Share App with Friends' : 'বন্ধুদের সাথে অ্যাপ শেয়ার করুন 🔗'}
            </button>

            {/* Mobile PWA Install option */}
            <button
              id="mobile-pwa-install-btn"
              onClick={() => {
                handleInstallApp();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-amber-500/30 bg-amber-500/10 text-amber-400 rounded-xl font-extrabold text-xs animate-pulse"
            >
              <Download className="h-3.5 w-3.5" />
              {language === 'en' ? 'Add App to Home Screen' : 'মোবাইলে ইনস্টল করুন'}
            </button>

            {profile ? (
              <div className="px-4 py-2 bg-gray-900/60 rounded-xl flex items-center justify-between text-xs text-slate-400">
                <span className="truncate">{profile.email}</span>
                <span className="font-bold text-amber-500">
                  {isGuest ? 'TESTER' : 'USER'}
                </span>
              </div>
            ) : null}

            {profile ? (
              <button
                id="mobile-signout"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-rose-500/30 bg-rose-500/10 text-rose-300 rounded-xl font-bold text-xs"
              >
                <LogOut className="h-3.5 w-3.5" />
                {t('signOut')}
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  id="mobile-google-login-btn"
                  onClick={() => {
                    login();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-amber-500 text-black font-bold rounded-xl text-xs"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  {t('loginWithGoogle')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dynamic PWA Interactive Guide Modal */}
      {showInstallGuide && (
        <div id="pwa-unified-install-modal" className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-md bg-[#131520] border border-gray-800/70 rounded-2xl p-5 space-y-4 my-8 relative">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-0.5 font-sans">App Installation Guide</span>
                <h3 className="font-extrabold text-white text-sm">
                  📱 {language === 'en' ? 'Get Mobile Launcher App' : 'মোবাইলে ইনস্টল করুন'}
                </h3>
              </div>
              <button 
                onClick={() => setShowInstallGuide(false)}
                className="text-gray-400 hover:text-white p-1.5 rounded-xl bg-gray-950 border border-gray-800 cursor-pointer transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Application Logo & Badge */}
            <div className="flex items-center gap-3.5 bg-gray-950/45 p-3 rounded-xl border border-gray-800/60">
              <img 
                src="/icon-512.png" 
                alt="ProTournament BD" 
                className="w-12 h-12 rounded-xl object-cover shadow-lg border border-amber-500/20"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-0.5">
                <span className="font-extrabold text-xs text-white block">ProTournament BD</span>
                <span className="text-[10px] text-gray-500 font-mono tracking-wide block">PWA Standard Web App v2.4</span>
                <span className="inline-block bg-emerald-500/15 text-emerald-400 text-[8px] px-1.5 py-0.5 rounded font-extrabold">
                  LIGHTWEIGHT INSTANT SHORTCUT
                </span>
              </div>
            </div>

            {/* Core PWA Info */}
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              {language === 'en' 
                ? "This next-generation web app installs directly onto your phone screen. It acts as a lightweight launcher (takes only 1MB), bypasses Play Store limits, and lets you play tournaments smoothly." 
                : "এটি একটি লাইটওয়েট আধুনিক ওয়েব অ্যাপ (PWA), যা গুগল প্লে-স্টোরে না গিয়েও সরাসরি আপনার এন্ড্রয়েড বা আইফোন স্ক্রিনে ইনস্টল হয়ে যায়। এতে কোন অতিরিক্ত র্যাম বা স্টোরেজ খরচ হয় না এবং সাধারণ অ্যাপের মতই ফুলস্ক্রিন ওপেন হয়!"
              }
            </p>

            {/* In-App Webview Warning Trigger */}
            <div className="p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-2xl space-y-2">
              <span className="text-[10px] font-bold text-rose-450 uppercase block font-sans">
                ⚠️ {language === 'en' ? 'Special: Facebook / Messenger / In-app Users' : 'ফেসবুক/মেসেঞ্জার বা হোয়াটসঅ্যাপ ইউজারদের জন্য জরুরি নির্দেশনা:'}
              </span>
              <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
                {language === 'en'
                  ? "If you opened this link from inside Facebook/Messenger or WhatsApp, the instant browser menu is blocked by security limits. Please copy the link below and open it directly inside your Google Chrome or Safari browser!"
                  : "আপনি যদি ফেসবুক, মেসেঞ্জার বা হোয়াটসঅ্যাপের ভেতরের ব্রাউজার থেকে এই লিংকটি খুলে থাকেন, তবে ব্রাউজারের সীমাবদ্ধতার কারণে সরাসরি ইনস্টল কাজ করবে না। নিচে থাকা বাটন চেপে লিংকটি কপি করে সরাসরি গুগল ক্রোম (Chrome) বা সাফারী ব্রাউজারে পেস্ট করুন!"
                }
              </p>
              
              <button
                type="button"
                onClick={handleCopyLink}
                className={`w-full mt-2 py-2 px-3 rounded-lg font-bold text-[11px] font-sans transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  copied 
                    ? 'bg-emerald-500 text-black' 
                    : 'bg-gray-950 border border-amber-500/20 text-amber-400 hover:border-amber-400'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    <span>{language === 'en' ? 'Link Copied completed!' : 'লিঙ্ক কপি সম্পন্ন হয়েছে!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>{language === 'en' ? 'Copy Live App Link to Clipboard' : 'লিংকটি কপি করুন'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Step-by-Step guides */}
            <div className="space-y-3 pt-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block font-sans">
                {language === 'en' ? 'How to Install Manually:' : 'কিভাবে ইনস্টল করবেন:'}
              </span>

              {isIOS ? (
                /* iOS Safari instructions */
                <div className="space-y-2 text-[11px] text-gray-300 bg-black/25 p-3.5 rounded-xl border border-gray-800 font-sans">
                  <span className="text-amber-400 font-extrabold text-[12px] block">🍎 Safari (iPhone / iPad)</span>
                  <p>১. আইফোনের সাফারী (Safari) ব্রাউজারের নিচের দিকে থাকা <span className="text-amber-400 font-extrabold">"Share" (শেয়ার/তীর চিহ্ন)</span> বোতামে ক্লিক করুন।</p>
                  <p>২. শেয়ার অপশনগুলোর মধ্য থেকে একটু নিচে স্ক্রল করে <span className="text-amber-400 font-extrabold">"Add to Home Screen" (হোম স্ক্রিনে যোগ করুন)</span> অপশনটি চাপুন।</p>
                  <p>৩. এরপর উপরে ডানদিকের কোণা থেকে <span className="text-amber-400 font-extrabold">"Add"</span> বাটনে চাপ দিলেই এটি ফোনের হোম স্ক্রিনে গোল্ডেন লোগোসহ ইনস্টল হয়ে যাবে!</p>
                </div>
              ) : (
                /* Android Chrome instructions */
                <div className="space-y-2 text-[11px] text-gray-300 bg-black/25 p-3.5 rounded-xl border border-gray-800 font-sans">
                  <span className="text-amber-400 font-extrabold text-[12px] block font-sans">🤖 Android (Google Chrome)</span>
                  <p>১. আপনার ক্রোম ব্রাউজারের উপরে ডানদিকের কোণাগুছানো <span className="text-amber-400 font-extrabold">৩টি ডট (Menu)</span> চিহ্নে চাপুন।</p>
                  <p>২. অপশনগুলো থেকে একটু নিচে গিয়ে <span className="text-amber-450 font-extrabold">"Add to Home Screen" (হোম স্ক্রিনে যোগ করুন)</span> বা <span className="text-amber-450 font-extrabold">"Install App"</span> অপশনটি সিলেক্ট করুন।</p>
                  <p>৩. এরপর <span className="text-amber-400 font-extrabold">"Add"</span> বা <span className="text-amber-400 font-bold">"Install"</span> বাটনে চাপ দিন। আপনার লোগোসহ ১ সেকেন্ডের মধ্যে ফোনে শর্টকাট চলে আসবে!</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl cursor-pointer select-none transition-all shadow-md font-sans"
            >
              {language === 'en' ? 'Close & Play' : 'আমি বুঝেছি, বন্ধ করুন'}
            </button>
          </div>
        </div>
      )}
    </header>
    </>
  );
};
export default Header;
