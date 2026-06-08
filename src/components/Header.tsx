import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { Trophy, Wallet, Gamepad2, Calendar, Languages, LogIn, LogOut, Menu, X, Coins, Shield, User, Download, Info } from 'lucide-react';

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
    registerLogoClick
  } = useApp();

  const hasAdminAccess = showAdminSecret || (profile && profile.email === 'skr200278@gmail.com');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS devices for manual install tips
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIphoneOrIpad = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIphoneOrIpad);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
      } else {
        console.log('User dismissed the PWA install prompt');
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSHint(true);
    } else {
      // General fall-back info
      alert(language === 'en' 
        ? "To install, tap the three dots (More options) at the top-right of your Chrome/browser screen, then click 'Add to Home Screen' or 'Install App'." 
        : "অ্যাপটি মোবাইলে সরাসরি ডাউনলোড করতে আপনার ব্রাউজারের উপরে ডানদিকের তিনটি ফোঁটা (৩ ডট মেনু) ক্লিক করুন এবং 'Add to Home screen' বা 'Install App' বোতামটি চাপুন।"
      );
    }
  };

  const toggleLang = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  const menuItems = [
    { view: 'home' as const, label: t('allGames'), icon: Gamepad2 },
    { view: 'joined' as const, label: t('myMatches'), icon: Calendar },
    { view: 'results' as const, label: language === 'en' ? 'Winners' : 'ফলাফল / বিজয়ী', icon: Trophy },
    { view: 'wallet' as const, label: t('balance'), icon: Wallet },
    { view: 'profile' as const, label: language === 'en' ? 'Support' : 'সাপোর্ট', icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0f111a] border-b border-gray-800 backdrop-blur-md bg-opacity-95 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => {
              setCurrentView('home');
              registerLogoClick();
            }}
          >
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/10">
              <Trophy className="h-6 w-6 text-black stroke-[2.5]" />
            </div>
            <div>
              <span className="font-sans font-extrabold text-lg sm:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-amber-400">
                {t('appName')}
              </span>
              <p className="hidden xs:block text-[9px] font-mono tracking-widest text-[#94a3b8] uppercase">
                {language === 'en' ? 'Tournament Engine' : 'টুর্নামেন্ট ইঞ্জিন'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
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

          {/* Wallet Header Counters & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {profile && (
              <div 
                onClick={() => setCurrentView('wallet')}
                className="flex items-center gap-3 bg-[#1e293b]/60 hover:bg-[#1e293b] border border-gray-800 rounded-2xl px-3 py-1.5 cursor-pointer max-w-[170px] sm:max-w-none transition-all"
              >
                <div className="flex items-center gap-1.5 border-r border-gray-700/60 pr-2.5">
                  <Coins className="h-4 w-4 text-amber-400" />
                  <div className="text-right">
                    <span className="block text-[9px] text-gray-400 font-medium leading-none">
                      {language === 'en' ? 'COINS' : 'কয়েন'}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {profile.coins_balance}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-emerald-400" />
                  <div className="text-right max-w-[50px] sm:max-w-none truncate">
                    <span className="block text-[9px] text-gray-400 leading-none font-medium">
                      {language === 'en' ? 'WON' : 'উইনিং'}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
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
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-bold'
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
              className="p-2 text-gray-300 hover:text-amber-400 hover:bg-gray-800 rounded-xl border border-gray-800 transition-all flex items-center justify-center gap-1 text-xs font-sans"
              title="Switch Language"
            >
              <Languages className="h-4 w-4 text-amber-500" />
              <span className="hidden leading-none font-semibold sm:inline">{language === 'en' ? 'বাং' : 'EN'}</span>
            </button>

            {/* Install App Button */}
            <button
              id="pwa-install-header-btn"
              onClick={handleInstallApp}
              className="px-3 py-2 text-amber-400 hover:text-amber-300 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-orange-500/20 rounded-xl border border-amber-500/30 bg-amber-500/10 transition-all flex items-center justify-center gap-1.5 text-xs font-sans font-extrabold animate-pulse"
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
          
          <div className="pt-3 border-t border-gray-800/80 my-3 flex flex-col gap-2">
            {/* Mobile PWA Install option */}
            <button
              id="mobile-pwa-install-btn"
              onClick={() => {
                handleInstallApp();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-amber-500/30 bg-amber-500/10 text-amber-400 rounded-xl font-extrabold text-xs"
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

      {/* iOS Safari Share Sheet Guidelines */}
      {showIOSHint && (
        <div id="ios-pwa-hint-modal" className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#131520] border border-gray-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-extrabold text-amber-400 text-sm flex items-center gap-2">
                <Info className="h-4 w-4 text-amber-400" />
                iOS (iPhone / iPad) এ ইনস্টল করুন
              </h3>
              <button 
                onClick={() => setShowIOSHint(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg bg-gray-900 border border-gray-800 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="text-gray-300 text-xs leading-relaxed space-y-3 font-sans">
              <p>আইফোনের জন্য নিচের সহজ পদক্ষেপগুলো অনুসরন করুন:</p>
              <div className="space-y-2 text-[11px] text-gray-400 bg-black/30 p-3 rounded-xl border border-gray-800/80">
                <p>১. সাফারী (Safari) ব্রাউজারের নিচে থাকা <span className="text-amber-400 font-bold font-mono">"Share" (শেয়ার)</span> আইকনটিতে চাপুন।</p>
                <p>২. শেয়ার অপশনগুলোর মধ্য থেকে একটু নিচে গিয়ে <span className="text-amber-400 font-bold">"Add to Home Screen" (হোম স্ক্রিনে যোগ করুন)</span> অপশনটি সিলেক্ট করুন।</p>
                <p>৩. এরপর উপরে ডানদিকের কোণা থেকে <span className="text-amber-400 font-bold">"Add"</span> বাটনে চাপ দিলেই অ্যাপটি মোবাইলের হোম স্ক্রিনে আইকনসহ চলে আসবে!</p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSHint(false)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl cursor-pointer select-none"
            >
              বুঝতে পেরেছি
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
export default Header;
