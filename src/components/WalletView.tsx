import React, { useState } from 'react';
import { useApp } from './AppContext';
import { CoinTransaction } from '../types';
import { 
  Coins, 
  Trophy, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Send, 
  Smartphone, 
  Check, 
  AlertCircle, 
  Clock, 
  ShieldCheck,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { doc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

export const WalletView: React.FC = () => {
  const { 
    profile, 
    transactions, 
    addCoins, 
    t, 
    language, 
    isGuest, 
    guestUser,
    settings,
    setTransactions
  } = useApp();

  const [walletTab, setWalletTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [selectedMethod, setSelectedMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  
  // Deposit Form
  const [depAmount, setDepAmount] = useState('');
  const [depPhone, setDepPhone] = useState('');
  const [depTxId, setDepTxId] = useState('');
  const [depMsg, setDepMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Withdraw Form
  const [wdAmount, setWdAmount] = useState('');
  const [wdPhone, setWdPhone] = useState('');
  const [wdMsg, setWdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dynamic numbers for Mobile Banking from Cloud Settings
  const billingNumbers = {
    bKash: settings.bKash_number,
    Nagad: settings.Nagad_number,
    Rocket: settings.Rocket_number
  };

  // Submit Manual Deposit (goes to pending for admin evaluation)
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepMsg(null);

    const amount = Number(depAmount);
    if (!amount || amount < 10) {
      setDepMsg({ type: 'error', text: language === 'en' ? 'Minimum deposit is 10 Coins.' : 'সর্বনিম্ন ১০টি কয়েন নিতে হবে।' });
      return;
    }

    if (!depPhone.trim() || !depTxId.trim()) {
      setDepMsg({ type: 'error', text: language === 'en' ? 'All payment form fields are required!' : 'সব কটি তথ্য সতর্কতার সাথে পূরণ করুন!' });
      return;
    }

    const currentUid = profile?.uid;
    if (!currentUid) {
      setDepMsg({ type: 'error', text: t('notLoggedIn') });
      return;
    }

    try {
      const txId = 'tx_' + Date.now();
      const newTx: CoinTransaction = {
        transaction_id: txId,
        userId: currentUid,
        userName: profile.name,
        type: 'deposit',
        amount: amount,
        payment_method: selectedMethod,
        account_number: depPhone,
        tx_id: depTxId,
        status: 'pending',
        timestamp: new Date().toISOString()
      };

      if (isGuest) {
        setTransactions(prev => [newTx, ...prev]);
      } else {
        await setDoc(doc(db, 'transactions', txId), newTx);
      }

      setDepMsg({ 
        type: 'success', 
        text: t('successTxSubmit') 
      });
      // Clear
      setDepAmount('');
      setDepPhone('');
      setDepTxId('');
    } catch {
      setDepMsg({ type: 'error', text: 'Database error. Please try again.' });
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWdMsg(null);

    const amount = Number(wdAmount);
    const winBalance = profile?.winning_balance ?? 0;

    if (!amount || amount < 50) {
      setWdMsg({ type: 'error', text: language === 'en' ? 'Minimum withdrawal is 50 Coins.' : 'সর্বনিম্ন ৫০টি কয়েন উত্তোলন করা যাবে।' });
      return;
    }

    if (amount > winBalance) {
      setWdMsg({ type: 'error', text: language === 'en' ? 'Insufficient winning balance!' : 'আপনার উইনিং ব্যালেন্স অপর্যাপ্ত!' });
      return;
    }

    if (!wdPhone.trim()) {
      setWdMsg({ type: 'error', text: language === 'en' ? 'Please provide account number.' : 'টাকা গ্রহণের একাউন্ট নাম্বার দিন।' });
      return;
    }

    const currentUid = profile?.uid;
    if (!currentUid) {
      setWdMsg({ type: 'error', text: t('notLoggedIn') });
      return;
    }

    try {
      const txId = 'tx_' + Date.now();
      const newTx: CoinTransaction = {
        transaction_id: txId,
        userId: currentUid,
        userName: profile.name,
        type: 'withdraw',
        amount: amount,
        payment_method: selectedMethod,
        account_number: wdPhone,
        tx_id: 'WD_' + Math.random().toString(36).substring(4, 10).toUpperCase(),
        status: 'pending',
        timestamp: new Date().toISOString()
      };

      if (isGuest) {
        addCoins(-amount, 'winning');
        setTransactions(prev => [newTx, ...prev]);
      } else {
        await updateDoc(doc(db, 'users', currentUid), {
          winning_balance: increment(-amount)
        });
        await setDoc(doc(db, 'transactions', txId), newTx);
      }

      setWdMsg({ 
        type: 'success', 
        text: t('successTxSubmit') 
      });
      setWdAmount('');
      setWdPhone('');
    } catch {
      setWdMsg({ type: 'error', text: 'Database connection failed.' });
    }
  };

  // DEVELOPER SHORTCUT: Self-Approve pending transaction requests for testing!
  const handleDevApprove = async (tx: CoinTransaction) => {
    if (isGuest) {
      addCoins(tx.amount, 'coins');
      alert("Simulated transaction approved successfully!");
      return;
    }

    try {
      const txRef = doc(db, 'transactions', tx.transaction_id);
      await updateDoc(txRef, { status: 'approved' });

      // If deposit, credit their balance
      if (tx.type === 'deposit') {
        const userRef = doc(db, 'users', tx.userId);
        await updateDoc(userRef, {
          coins_balance: increment(tx.amount)
        });
      }
    } catch (error) {
      console.error("Self-approval error:", error);
    }
  };

  // DEVELOPER SHORTCUT: Reject transaction requests for testing!
  const handleDevReject = async (tx: CoinTransaction) => {
    if (isGuest) return;
    try {
      const txRef = doc(db, 'transactions', tx.transaction_id);
      await updateDoc(txRef, { status: 'rejected' });

      // If approved withdrawal rejected, refund winning coins
      if (tx.type === 'withdraw') {
        const userRef = doc(db, 'users', tx.userId);
        await updateDoc(userRef, {
          winning_balance: increment(tx.amount)
        });
      }
    } catch (error) {
      console.error("Self-rejection error:", error);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Wallet Balance Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        {/* Main Coin Card */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950/80 border border-indigo-500/10 rounded-3xl p-6 relative overflow-hidden flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Coins className="h-4 w-4 text-amber-400" />
              {t('mainCoins')}
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-extrabold text-white">
              {profile?.coins_balance ?? 0} <span className="text-sm font-sans text-gray-500 font-normal">Coins</span>
            </div>
            <p className="text-[11px] text-gray-400">
              {language === 'en' ? 'Used for register game matches entry' : 'টুর্নামেন্টে জয়েন করার জন্য ব্যবহৃত হবে'}
            </p>
          </div>
          <div className="text-amber-500/10 absolute right-4 bottom-4 pointer-events-none">
            <Coins className="h-28 w-28 text-amber-500/5 stroke-[1.5]" />
          </div>
        </div>

        {/* Winning Coin Card */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950/80 border border-emerald-500/10 rounded-3xl p-6 relative overflow-hidden flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Trophy className="h-4 w-4 text-emerald-400" />
              {t('winningCoins')}
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-extrabold text-white">
              {profile?.winning_balance ?? 0} <span className="text-sm font-sans text-gray-500 font-normal">Coins</span>
            </div>
            <p className="text-[11px] text-gray-400">
              {language === 'en' ? 'Directly withdrawable to BDT cash account' : 'বিকাশ, নগদ বা রকেটে সরাসরি প্রত্যাহারযোগ্য'}
            </p>
          </div>
          <div className="text-emerald-500/10 absolute right-4 bottom-4 pointer-events-none">
            <Trophy className="h-28 w-28 text-emerald-500/5 stroke-[1.5]" />
          </div>
        </div>
      </div>

      {/* Forms & Steps Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: forms */}
        <div className="bg-[#121420] border border-gray-800 rounded-3xl overflow-hidden lg:col-span-7">
          {/* Sub tabs selector */}
          <div className="flex border-b border-gray-800/85">
            <button
              onClick={() => setWalletTab('deposit')}
              className={`flex-1 py-4 text-center font-extrabold text-sm border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                walletTab === 'deposit'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="h-4 w-4 text-amber-500" />
              {language === 'en' ? 'Deposit' : 'ডিপোজিট'}
            </button>
            <button
              onClick={() => setWalletTab('withdraw')}
              className={`flex-1 py-4 text-center font-extrabold text-sm border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                walletTab === 'withdraw'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
              {language === 'en' ? 'Withdraw' : 'উইথড্র'}
            </button>
          </div>
          <div className="p-6">
            {walletTab === 'deposit' ? (
              /* DEPOSIT FLOW */
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    {t('buyCoinsTitle')}
                  </h3>
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                    {language === 'en' 
                      ? 'Choose your payment method, copy our number, send money manually, and submit your transaction ticket below.' 
                      : 'আপনার পেমেন্ট পদ্ধতি বেছে নিন, নাম্বারটি কপি করে ম্যানুয়ালি টাকা পাঠিয়ে রশিদ সাবমিট করুন।'}
                  </p>
                </div>

                {/* Local method togglers */}
                <div className="grid grid-cols-3 gap-3">
                  {(['bKash', 'Nagad', 'Rocket'] as const).map((method) => {
                    const isSelected = selectedMethod === method;
                    const bColor = method === 'bKash' ? 'border-pink-500/40 text-pink-400' : method === 'Nagad' ? 'border-orange-500/40 text-orange-400' : 'border-purple-500/40 text-purple-400';
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setSelectedMethod(method)}
                        className={`py-3.5 rounded-2xl border font-bold text-center text-xs flex flex-col items-center gap-1 transition-all ${
                          isSelected 
                            ? `${bColor} bg-white/5 shadow-md shadow-white/5 scale-[1.02]` 
                            : 'border-gray-800 text-gray-400 hover:bg-gray-800/40 hover:text-white'
                        }`}
                      >
                        <span className="text-lg">
                          {method === 'bKash' ? '🌸' : method === 'Nagad' ? '🍊' : '🚀'}
                        </span>
                        {method}
                      </button>
                    );
                  })}
                </div>

                {/* Preset Amount Badges */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-gray-405 uppercase tracking-wider block">
                    {language === 'en' ? 'Choose Quick Amount (Preset BDT)' : 'কুইক রিচার্জ অপশন (টাকা)'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[20, 50, 100, 200, 500, 1000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDepAmount(amt.toString())}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium font-mono transition-all cursor-pointer ${
                          depAmount === amt.toString()
                            ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                            : 'bg-[#1a1c2b]/30 border-gray-805 text-gray-400 hover:bg-[#1a1c2b]/60'
                        }`}
                      >
                        ৳{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* MANUAL PAYMENT DETAILS FORM */}
                <div className="space-y-4 animate-fade-in">
                  {/* Steps banner */}
                  <div className="bg-[#1a1c2b]/50 border border-gray-800 rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      {t('paymentInstructions')} (Personal Sender)
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {t('sendMoneyTo', { amount: depAmount || '10+', method: selectedMethod })} 
                      <span className="block font-mono font-bold text-white text-sm tracking-wider mt-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-gray-800 inline-block copy-btn cursor-pointer">
                        {billingNumbers[selectedMethod]}
                      </span>
                    </p>
                    <span className="block text-[10px] text-gray-400 italic">
                      {language === 'en' ? '* 1 BDT Cash Sent = 1 Wallet Coin.' : '* ১ টাকা ম্যানুয়ালি পাঠালে ওয়ালেটে ১ কয়েন পাবেন।'}
                    </span>
                  </div>

                  {/* Form fields */}
                  <form onSubmit={handleDepositSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-gray-300 font-semibold">{t('walletFormAmount')} (BDT)</label>
                        <input
                          type="number"
                          min="10"
                          required
                          value={depAmount}
                          onChange={(e) => setDepAmount(e.target.value)}
                          placeholder="Min 10"
                          className="w-full bg-[#0e0f17] border border-gray-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-all font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[#94a3b8] text-xs font-semibold">{t('walletFormNumber')}</label>
                        <input
                          type="tel"
                          required
                          value={depPhone}
                          onChange={(e) => setDepPhone(e.target.value)}
                          placeholder="e.g., 01712345678"
                          className="w-full bg-[#0e0f17] border border-gray-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[#94a3b8] text-xs font-semibold">{t('walletFormTxId')} (ম্যানুয়াল TrxID)</label>
                      <input
                        type="text"
                        required
                        value={depTxId}
                        onChange={(e) => setDepTxId(e.target.value)}
                        placeholder="e.g., AH81928371X"
                        className="w-full bg-[#0e0f17] border border-gray-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-all font-mono"
                      />
                    </div>

                    {depMsg && (
                      <div className={`p-4 rounded-xl text-xs font-semibold ${
                        depMsg.type === 'success' 
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                          : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                      }`}>
                        {depMsg.text}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 bg-amber-500 border border-amber-500/30 text-black hover:bg-amber-400 font-extrabold text-xs tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5 leading-none" />
                      {language === 'en' ? 'Submit Manual Deposit Ticket' : 'ম্যানুয়াল ডিপোজিট টিকেট জমা দিন'}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* WITHDRAW FLOW */
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    {t('withdrawTitle')}
                  </h3>
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                    {t('withdrawDesc')}
                  </p>
                </div>

                {/* Sub toggle payment to match withdraw */}
                <div className="grid grid-cols-3 gap-3">
                  {(['bKash', 'Nagad', 'Rocket'] as const).map((method) => {
                    const isSelected = selectedMethod === method;
                    const bColor = method === 'bKash' ? 'border-pink-500/40 text-pink-400' : method === 'Nagad' ? 'border-orange-500/40 text-orange-400' : 'border-purple-500/40 text-purple-400';
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setSelectedMethod(method)}
                        className={`py-3 rounded-xl border font-bold text-center text-xs flex items-center justify-center gap-1 transition-all ${
                          isSelected 
                            ? `${bColor} bg-white/5` 
                            : 'border-gray-800 text-gray-400 hover:bg-gray-800'
                        }`}
                      >
                        {method}
                      </button>
                    );
                  })}
                </div>

                {/* Form fields */}
                <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-semibold">{t('withdrawAmountLabel')}</label>
                      <input
                        type="number"
                        min="50"
                        required
                        value={wdAmount}
                        onChange={(e) => setWdAmount(e.target.value)}
                        placeholder="Min 50"
                        className="w-full bg-[#0e0f17] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                      />
                      <span className="text-[10px] text-gray-505 font-medium">
                        {language === 'en' ? 'Available:' : 'প্রত্যাহারযোগ্য:'} {profile?.winning_balance ?? 0} {t('coins')}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 font-semibold">
                        {t('withdrawAccountLabel', { method: selectedMethod })}
                      </label>
                      <input
                        type="tel"
                        required
                        value={wdPhone}
                        onChange={(e) => setWdPhone(e.target.value)}
                        placeholder="e.g., 01712345678"
                        className="w-full bg-[#0e0f17] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  {wdMsg && (
                    <div className={`p-3 rounded-xl text-xs font-semibold ${
                      wdMsg.type === 'success' 
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                        : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                    }`}>
                      {wdMsg.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs tracking-wider rounded-xl transition-all shadow-md shadow-emerald-500/15 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ArrowDownLeft className="h-4 w-4" />
                    {t('withdrawSubmit')}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: instructions / FAQ or info banner */}
        <div className="space-y-6 lg:col-span-5">
          <div className="bg-[#121420]/80 border border-gray-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
              <ShieldCheck className="h-4.5 w-4.5 text-amber-500" />
              {language === 'en' ? 'Verified Coin System' : '১০০% নিরাপদ ট্রানজেকশন'}
            </h3>
            
            <ul className="space-y-3 text-xs text-gray-400 leading-relaxed list-disc list-inside">
              <li>
                <strong className="text-amber-400">{language === 'en' ? 'Auto Deposit' : 'অটো ডিপোজিট'}:</strong> {language === 'en' ? 'Processed in 5-10 seconds automatically. No manual validation keys required.' : 'একেবারে ৫-১০ সেকেন্ডের মধ্যে সম্পন্ন হয়ে অটোমেটিক কয়েন ব্যালেন্সে যুক্ত হবে। কোনো যাচাইকরণের অপেক্ষায় থাকতে হবে না।'}
              </li>
              <li>
                <strong className="text-amber-400">{language === 'en' ? 'Manual Deposit' : 'ম্যানুয়াল ডিপোজিট'}:</strong> {language === 'en' ? 'Check details, copy the merchant wallet BDT number, send money personal cash out, and paste TxID. Admin evaluates slow tickets in 10-30 mins.' : 'নাম্বার কপি করে ম্যানুয়ালি বিকাশ/নগদে টাকা পাঠিয়ে ট্রানজেকশন আইডি টিকেট জমা দিতে হবে। এডমিন প্যানেল খতিয়ে ১০-৩০ মিনিটে অনুমোদিত করবে।'}
              </li>
              <li>
                <strong className="text-emerald-400">{language === 'en' ? 'How to Withdraw' : 'টাকা উত্তোলন (উইথড্র)'}:</strong> {language === 'en' ? 'Winning balance coins from tournaments can be requested for Cash Out to personal bKash or Nagad. Managed manually by administrators to prevent scams.' : 'টুর্নামেন্ট জেতা উইনিং কয়েন ব্যালেন্স যেকোনো সময়ে বিকাশ বা নগদে টাকা উত্তোলনের জন্য রিকোয়েস্ট করুন। আপনার সিকিউরিটি নিশ্চিতে এডমিন প্যানেল দ্বারা ম্যানুয়ালি টাকা পেমেন্ট করা হবে।'}
              </li>
            </ul>

            {/* Quick Testing Notice */}
            <div className="bg-indigo-500/10 border border-indigo-505/20 rounded-2xl p-3.5 space-y-2">
              <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase block">
                💎 {language === 'en' ? 'REAL ADMIN MANAGEMENT' : 'প্রকৃত এডমিন প্যানেল কন্ট্রোল'}
              </span>
              <p className="text-[11px] text-gray-300 leading-normal">
                {language === 'en'
                  ? "Manual deposits and withdrawals are directly synchronized to your Admin Panel. Access the dashboard from the top navigation to view, check, approve, or decline actions."
                  : "ম্যানুয়াল ডেপোজিট ও উইথড্র উইটিলিটিগুলো এখন আপনার এডমিন প্যানেলের সাথে সরাসরি লিংক করা। স্ক্রিনের উপরে 'Admin' নেভিগেশন প্যানেল থেকে পেন্ডিং রিকোয়েস্টগুলো অনুমোদন করতে পারেন!"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TRANSACTION LISTS SECTION */}
      <section className="bg-[#121420] border border-gray-800 rounded-3xl overflow-hidden p-6 space-y-6">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-gray-400" />
          <h2 className="text-base sm:text-lg font-sans font-extrabold text-white tracking-tight">
            {t('transactionHistory')}
          </h2>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-xs">
            {t('noTransactions')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-800 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">{language === 'en' ? 'TRANSACTION ID / DATE' : 'আইডি ও তারিখ'}</th>
                  <th className="py-3 px-4">{language === 'en' ? 'TYPE' : 'ধরণ'}</th>
                  <th className="py-3 px-4">{language === 'en' ? 'METHOD / INFO' : 'টাকা প্রেরক'}</th>
                  <th className="py-3 px-4">{language === 'en' ? 'COINS AMOUNT' : 'কয়েন পরিমাণ'}</th>
                  <th className="py-3 px-4">{language === 'en' ? 'STATUS' : 'অবস্থা (স্ট্যাটাস)'}</th>
                  <th className="py-3 px-4 text-center">{language === 'en' ? 'TEST ACTION' : 'টেস্ট একশন'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-xs text-gray-300">
                {transactions.map((tx) => {
                  const isPending = tx.status === 'pending';
                  const isDeposit = tx.type === 'deposit';
                  const isJoinFee = tx.type === 'join_fee';

                  return (
                    <tr key={tx.transaction_id} className="hover:bg-slate-900/30">
                      <td className="py-4 px-4 space-y-1">
                        <span className="font-mono font-bold text-white block">
                          {tx.transaction_id}
                        </span>
                        <span className="text-[10px] text-gray-500 block">
                          {new Date(tx.timestamp).toLocaleString(language === 'en' ? 'en' : 'bn')}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 font-bold ${
                          isDeposit 
                            ? 'text-amber-400' 
                            : isJoinFee 
                              ? 'text-[#a78bfa]'
                              : 'text-emerald-400'
                        }`}>
                          {isDeposit ? (
                            <>
                              <ArrowUpRight className="h-3.5 w-3.5" />
                              {language === 'en' ? 'Deposit' : 'ক্রয় (ডেপোজিট)'}
                            </>
                          ) : isJoinFee ? (
                            <>
                              <Smartphone className="h-3.5 w-3.5" />
                              {language === 'en' ? 'Entry Fee' : 'এন্ট্রি ফি কর্তন'}
                            </>
                          ) : (
                            <>
                              <ArrowDownLeft className="h-3.5 w-3.5" />
                              {language === 'en' ? 'Withdrawal' : 'উত্তোলন (উইথড্র)'}
                            </>
                          )}
                        </span>
                        {tx.match_title && (
                          <span className="block text-[10px] text-gray-400 italic line-clamp-1">
                            {tx.match_title}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 space-y-1">
                        {isJoinFee ? (
                          <span className="text-gray-400">—</span>
                        ) : (
                          <>
                            <span className="font-sans font-semibold text-slate-200 block">
                              {tx.payment_method} ({tx.account_number})
                            </span>
                            {tx.tx_id && (
                              <span className="font-mono text-[10px] text-[#94a3b8] block">
                                TrxID: {tx.tx_id}
                              </span>
                            )}
                          </>
                        )}
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-sm text-sky-400">
                        {isDeposit ? '+' : '-'}{tx.amount} C
                      </td>

                      <td className="py-4 px-4">
                        {tx.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="h-3 w-3 animate-spin" />
                            {t('statusPending')}
                          </span>
                        ) : tx.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Check className="h-3 w-3" />
                            {t('statusApproved')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <XCircle className="h-3 w-3" />
                            {t('statusRejected')}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        {isPending ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleDevApprove(tx)}
                              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg text-[10px] transition-all flex items-center gap-0.5 cursor-pointer"
                              title="Set balance updated to active account"
                            >
                              <Check className="h-3 w-3 inline" /> Check
                            </button>
                            <button
                              onClick={() => handleDevReject(tx)}
                              className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-extrabold rounded-lg text-[10px] border border-rose-500/30 transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic text-[10px]">Verified</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
};
export default WalletView;
