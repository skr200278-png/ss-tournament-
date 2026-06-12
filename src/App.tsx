import React, { useEffect } from 'react';
import { AppProvider, useApp } from './components/AppContext';
import { testFirestoreConnection } from './firebase';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { WalletView } from './components/WalletView';
import { MyMatchesList } from './components/MyMatchesList';
import { AdminDashboard } from './components/AdminDashboard';
import { WinnersList } from './components/WinnersList';
import { LoginPortal } from './components/LoginPortal';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { 
  Trophy, 
  HelpCircle, 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  Sparkles, 
  UserCheck,
  Gamepad2,
  Calendar,
  Wallet,
  Settings,
  Shield,
  User
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView, profile, t, language, showAdminSecret } = useApp();
  const hasAdminAccess = showAdminSecret || (profile && profile.email === 'skr200278@gmail.com');

  // Test client connection on initialization
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  const renderView = () => {
    if (!profile) {
      return <LoginPortal />;
    }

    switch (currentView) {
      case 'home':
        return <Dashboard />;
      case 'wallet':
        return <WalletView />;
      case 'joined':
        return <MyMatchesList />;
      case 'results':
        return <WinnersList />;
      case 'profile':
        return <ProfileSettingsView />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#07080d] text-gray-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      
      {/* Top sticky header */}
      <Header />

      {/* Main Body Grid Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 md:pb-8">
        
        {/* Dynamic Route views */}
        <div className="py-2">
          {renderView()}
        </div>

      </main>

      {/* Footer Area */}
      <footer className="bg-[#0f111a] border-t border-gray-800 text-gray-500 py-10 mt-12 text-xs font-sans pb-28 md:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <span className="font-extrabold text-white text-sm tracking-wide">
                {t('appName')}
              </span>
              <p className="text-[11px] text-gray-500 mt-1">
                © {new Date().getFullYear()} {language === 'en' ? 'ProTournament BD. Developed for Web, Android & Esports players.' : 'প্রো-টুর্নামেন্ট বিডি। বাংলাদেশ এস্পোর্টস এলিট লবি।'}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-[11px]">
              <span className="hover:text-white cursor-pointer transition-all flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Security
              </span>
              <span className="hover:text-white cursor-pointer transition-all flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5" /> FAQ & Rules
              </span>
              <span className="hover:text-white cursor-pointer transition-all flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> Support: skr200278@gmail.com
              </span>
            </div>
          </div>

          <p className="text-center font-mono text-[10px] text-gray-600 border-t border-gray-800/60 pt-4 leading-relaxed max-w-4xl mx-auto">
            {language === 'en' 
              ? 'Disclaimers: Outlets, games, titles Free Fire, PUBG or Ludo references belong to respective developers. All currency is in simulated Coins. 1 BDT = 1 Coin. Ready for direct APK wrappers standard configuration (Capacitor/Cordova) layout.'
              : 'দাবিত্যাগ: ফ্রি ফায়ার, পাবজি বা লুডু গেমের মালিকানা ও ট্রেডমার্ক যথাক্রমে তাদের নিজস্ব গেম স্টুডিওর। এখানে ব্যবহৃত সকল কারেন্সি টুর্নামেন্ট কয়েনের মাধ্যমে নিয়ন্ত্রিত এবং সরাসরি মোবাইল ব্যাংকিং দ্বারা রিডিম করা হয়।'}
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Phone-style persistent layout) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f111a] border-t border-gray-800/80 backdrop-blur-lg bg-opacity-95 shadow-[0_-8px_30px_rgb(0,0,0,0.8)] pb-safe">
        <div className="grid grid-cols-5 h-16 items-center">
          <button
            onClick={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center h-full transition-all ${
              currentView === 'home' ? 'text-amber-400 font-bold scale-105' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="h-5 w-5" />
            <span className="text-[10px] mt-1 font-bold">
              {language === 'en' ? 'Games' : 'হোম গেম'}
            </span>
          </button>

          <button
            onClick={() => {
              setCurrentView('joined');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center h-full transition-all ${
              currentView === 'joined' ? 'text-amber-400 font-bold scale-105' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-[10px] mt-1 font-bold">
              {language === 'en' ? 'Matches' : 'আমার ম্যাচ'}
            </span>
          </button>

          <button
            onClick={() => {
              setCurrentView('results');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center h-full transition-all ${
              currentView === 'results' ? 'text-amber-400 font-bold scale-105' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Trophy className="h-5 w-5" />
            <span className="text-[10px] mt-1 font-bold">
              {language === 'en' ? 'Winners' : 'বিজয়ী'}
            </span>
          </button>

          <button
            onClick={() => {
              setCurrentView('wallet');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center h-full transition-all ${
              currentView === 'wallet' ? 'text-amber-400 font-bold scale-105' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wallet className="h-5 w-5 animate-pulse" style={{ animationDuration: '3s' }} />
            <span className="text-[10px] mt-1 font-bold">
              {language === 'en' ? 'Wallet' : 'ওয়ালেট'}
            </span>
          </button>

          <button
            onClick={() => {
              setCurrentView('profile');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center h-full transition-all ${
              currentView === 'profile' ? 'text-amber-400 font-bold scale-105' : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="h-5 w-5" />
            <span className="text-[10px] mt-1 font-bold">
              {language === 'en' ? 'Profile' : 'প্রোফাইল'}
            </span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
