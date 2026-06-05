import React, { useState } from 'react';
import { useApp } from './AppContext';
import { Beaker, Sparkles, Trash2, Coins, CalendarDays, Key, Info } from 'lucide-react';

export const DeveloperTestPanel: React.FC = () => {
  const { 
    seedSampleData, 
    clearAllDemoData, 
    addCoins, 
    profile, 
    isGuest, 
    t, 
    language 
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSeed = async () => {
    setLoading(true);
    try {
      await seedSampleData();
      triggerToast(t('toastMatchesSeeded'));
    } catch {
      triggerToast("Error seeding Firebase data.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    try {
      await clearAllDemoData();
      triggerToast(t('toastDatabaseCleared'));
    } catch {
      triggerToast("Error resetting data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoins = async (amount: number, type: 'coins' | 'winning') => {
    if (!profile) {
      triggerToast(language === 'en' ? "Please Sign-In or use Guest Mode first!" : "অনুগ্রহ করে আগে লগইন বা গেস্ট মোডে যান!");
      return;
    }
    await addCoins(amount, type);
    triggerToast(type === 'coins' ? t('toastCoinsAdded') : (language === 'en' ? "100 Winning Coins added!" : "১০০ টেস্টিং উইনিং কয়েন যুক্ত হয়েছে!"));
  };

  return (
    <div className="bg-[#121420] border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-5 cursor-pointer bg-[#1a1c2b] border-b border-gray-800/80 hover:bg-slate-800/20 select-none"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 rounded-lg">
            <Beaker className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
          </div>
          <div>
            <span className="block text-xs font-bold font-mono tracking-widest text-[#94a3b8] uppercase leading-none">DEVELOPER SUITE</span>
            <span className="block text-sm font-extrabold text-white mt-1">{t('developerTools')}</span>
          </div>
        </div>
        <span className="text-xs text-amber-500 font-bold hover:underline">
          {isOpen ? (language === 'en' ? '[ Collapse Controls ]' : '[ সংকুচিত করুন ]') : (language === 'en' ? '[ Expand Helpers ]' : '[ তালিকা প্রসারিত করুন ]')}
        </span>
      </div>

      {isOpen && (
        <div className="p-6 space-y-6">
          <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
            {t('developerToolsDesc')}{' '}
            <span className="font-semibold text-amber-500 block mt-1.5 font-mono">
              Database schema expects:
              - users: {'{'} coins_balance, winning_balance, email, name, uid {'}'}
              - tournaments: {'{'} match_id, game_category, title, entry_fee, prize_pool, per_kill, room_password, room_id, total_slots, joined_players_uids[] {'}'}
            </span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Quick Balance injecters */}
            <button
              onClick={() => handleAddCoins(100, 'coins')}
              className="py-3 px-4 bg-amber-500/10 hover:bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Coins className="h-4 w-4" />
              {t('addDemoCoins')}
            </button>

            <button
              onClick={() => handleAddCoins(100, 'winning')}
              className="py-3 px-4 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              {t('addDemoWinnings')}
            </button>

            {/* Seed test data */}
            <button
              disabled={loading}
              onClick={handleSeed}
              className="py-3 px-4 bg-[#1e1b4b] hover:bg-[#25225c] text-indigo-300 border border-indigo-500/30 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <CalendarDays className="h-4 w-4" />
              {t('seedTemplateMatches')}
            </button>

            {/* Clear database */}
            <button
              disabled={loading}
              onClick={handleClear}
              className="py-3 px-4 bg-rose-500/5 hover:bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {t('clearAllData')}
            </button>

          </div>

          {/* Quick instructions manual input */}
          <div className="bg-[#1a1c2b]/40 rounded-2xl p-4 border border-gray-800 flex gap-3 text-xs leading-relaxed text-gray-400">
            <Info className="h-5 w-5 text-indigo-400 shrink-0" />
            <div className="space-y-1">
              <span className="font-bold text-slate-200 block">Manual Console Injecting Instructions (No Code modification needed):</span>
              <p>
                To test your own custom match, open your Firebase Project (ID: <span className="text-white font-mono">{isGuest ? 'simulated' : 'gen-lang-client-0894569085'}</span>) Firestore tab and add a document into the <span className="font-semibold text-white">tournaments</span> collection. Setting <span className="font-mono text-cyan-400">game_category</span> to "Free Fire" (matching casing) will automatically list it in the Free Fire category.
              </p>
            </div>
          </div>

          {toast && (
            <div className="animate-bounce bg-amber-500 text-black font-extrabold text-xs px-4 py-2 rounded-xl text-center shadow-lg shadow-amber-500/10">
              {toast}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default DeveloperTestPanel;
