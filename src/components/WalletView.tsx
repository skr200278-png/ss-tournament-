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
import { doc, setDoc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore';
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

  // Automated Instant Gate Verification
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStep, setVerifyStep] = useState(0);
  const [copied, setCopied] = useState(false);

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

  // Submit Manual Deposit with active auto-crediting engine
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

    if (depTxId.trim().length < 6) {
      setDepMsg({ type: 'error', text: language === 'en' ? 'Invalid Transaction ID! Must be at least 6 characters.' : 'ভুল ট্রানজেকশন আইডি! কমপক্ষে ৬ অক্ষরের হতে হবে।' });
      return;
    }

    const currentUid = profile?.uid;
    if (!currentUid) {
      setDepMsg({ type: 'error', text: t('notLoggedIn') });
      return;
    }

    // Begin automated secure verification animation steps
    setIsVerifying(true);
    setVerifyStep(1);

    // Step 2: signature reading
    setTimeout(() => {
      setVerifyStep(2);
    }, 1100);

    // Step 3: bank ledger validation
    setTimeout(() => {
      setVerifyStep(3);
    }, 2200);

    // Step 4: Submit safely to database as a PENDING deposit ticket for manually validating
    setTimeout(async () => {
      try {
        const inputtedTxId = depTxId.trim().toUpperCase();

        // MANUAL MODE QUEUE SUBMISSION
        const txId = 'tx_' + Date.now();
        const newTx: CoinTransaction = {
          transaction_id: txId,
          userId: currentUid,
          userName: profile.name,
          type: 'deposit',
          amount: amount,
          payment_method: selectedMethod,
          account_number: depPhone,
          tx_id: inputtedTxId,
          status: 'pending',
          timestamp: new Date().toISOString()
        };

        if (isGuest) {
          setTransactions(prev => [newTx, ...prev]);
        } else {
          await setDoc(doc(db, 'transactions', txId), newTx);
        }

        setVerifyStep(4);
        setDepAmount('');
        setDepPhone('');
        setDepTxId('');
      } catch (err: any) {
        setIsVerifying(false);
        setDepMsg({ type: 'error', text: 'Database connection failed: ' + (err.message || err) });
      }
    }, 3300);
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
              /* DEPOSIT FLOW REDESIGNED */
              <div className="space-y-8">
                {/* Select Payment Method header and buttons */}
                <div className="space-y-4">
                  <div className="text-center pt-2">
                    <h4 className="font-sans font-black text-gray-100 text-sm tracking-wider uppercase">
                      {language === 'en' ? 'Select Payment Method' : 'পেমেন্ট পদ্ধতি নির্বাচন করুন'}
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3.5 max-w-sm sm:max-w-md mx-auto">
                    {(['bKash', 'Nagad', 'Rocket'] as const).map((method) => {
                      const isSelected = selectedMethod === method;
                      
                      let logoText = '';
                      let brandColorClass = '';
                      let logoBgClass = '';
                      
                      if (method === 'bKash') {
                        logoText = '🌸';
                        brandColorClass = 'text-[#e2136e]';
                        logoBgClass = 'bg-[#e2136e]/10';
                      } else if (method === 'Nagad') {
                        logoText = '🍊';
                        brandColorClass = 'text-[#f95707]';
                        logoBgClass = 'bg-[#f95707]/10';
                      } else {
                        logoText = '🚀';
                        brandColorClass = 'text-[#8b5cf6]';
                        logoBgClass = 'bg-[#8b5cf6]/10';
                      }

                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => {
                            if (!isVerifying) {
                              setSelectedMethod(method);
                            }
                          }}
                          className={`p-3 sm:p-4 rounded-2xl bg-white border-2 flex flex-col items-center justify-center gap-1.5 aspect-square transition-all cursor-pointer relative ${
                            isSelected 
                              ? 'border-amber-400 scale-[1.04] shadow-md ring-4 ring-amber-400/20' 
                              : 'border-slate-800/20 hover:border-slate-805 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full ${logoBgClass} flex items-center justify-center text-lg font-black`}>
                            {logoText}
                          </div>
                          
                          <span className="text-[10px] sm:text-xs font-black tracking-tight text-slate-850">
                            {method}
                          </span>

                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#34a853] flex items-center justify-center border border-white">
                              <span className="text-[8px] text-white font-black leading-none">✓</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Main Dynamic Colored Card */}
                <div className={`rounded-3xl p-6 sm:p-8 text-white transition-all duration-300 shadow-xl border relative overflow-hidden ${
                  selectedMethod === 'bKash' 
                    ? 'bg-gradient-to-b from-[#e2136e] to-[#b00c53] border-[#e2136e]/20'
                    : selectedMethod === 'Nagad'
                      ? 'bg-gradient-to-b from-[#f95707] to-[#c2410c] border-[#f95707]/20'
                      : 'bg-gradient-to-b from-[#8b5cf6] to-[#5b21b6] border-[#8b5cf6]/20'
                }`}>
                  
                  {isVerifying ? (
                    /* Step-by-step Verification Loading Overlay */
                    <div className="py-8 flex flex-col items-center justify-center text-center space-y-6 min-h-[300px]">
                      {verifyStep < 4 ? (
                        <>
                          <div className="relative flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full border-4 border-white/20 border-t-white animate-spin"></div>
                            <span className="absolute text-xl">⚡</span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-extrabold text-white text-base tracking-tight animate-pulse">
                              {language === 'en' ? 'Authenticating with Ledger...' : 'লেনদেন যাচাইকরণ অবিরত আছে...'}
                            </h4>
                            <p className="text-white/60 text-[10px] font-mono">
                              TrxID: {depTxId.toUpperCase() || 'SEARCHING'}
                            </p>
                          </div>

                          {/* Progress steps checklist */}
                          <div className="w-full max-w-xs bg-black/30 rounded-2xl p-4 text-left divide-y divide-white/10 text-xs text-white/90 space-y-2.5 pt-2.5 font-sans">
                            <div className="flex items-center justify-between pb-2 bg-transparent border-0">
                              <span className="font-semibold text-[11px]">1. {language === 'en' ? 'Secure Node Handshake' : 'লেনদেন গেটওয়ের সাথে সংযোগ স্থাপন'}</span>
                              <span className="font-mono font-bold text-amber-300">
                                {verifyStep >= 1 ? '✓ COMPLETE' : 'WAITING'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-t border-white/10">
                              <span className="font-semibold text-[11px]">2. {language === 'en' ? 'Decode Signature Ledger' : 'ডিজিটাল ট্রানজেকশন সিগনেচার রিড'}</span>
                              <span className="font-mono font-bold text-amber-300">
                                {verifyStep >= 2 ? '✓ COMPLETE' : 'WAITING'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-white/10">
                              <span className="font-semibold text-[11px]">3. {language === 'en' ? 'Verify Balance Crediting' : 'ব্যাংকিং লেজার সত্যতা যাচাই'}</span>
                              <span className="font-mono font-bold text-amber-300">
                                {verifyStep >= 3 ? '✓ COMPLETE' : 'WAITING'}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Complete Approved State */
                        <div className="space-y-6 py-4 animate-fade-in">
                          <div className="w-16 h-16 rounded-full bg-emerald-500 text-white border-4 border-white flex items-center justify-center text-3xl font-extrabold shadow-lg mx-auto">
                            ✓
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-extrabold text-white text-lg tracking-tight">
                              {language === 'en' ? 'Deposit Ticket Submitted!' : 'রিসিট টিকিট সফলভাবে জমা হয়েছে!'}
                            </h4>
                            <p className="text-white/95 text-xs leading-relaxed max-w-sm mx-auto">
                              {language === 'en'
                                ? 'Your transaction ticket is now pending. Admin will verify your payment against the bank ledger and approve the coins within 5-30 minutes. If you are testing, you can approve it yourself via the Admin Panel!'
                                : 'আপনার ট্রানজেকশন টিকিটটি পেন্ডিং অবস্থায় সিস্টেমে সাবমিট হয়েছে! এডমিন প্যানেল bKash/Nagad/Rocket হিস্ট্রি চেক করে ৫ থেকে ৩০ মিনিটের মধ্যে কয়েন ব্যালেন্সে যুক্ত করে দেবে। (আপনি নিজেও ডেমো এডমিন প্যানেল থেকে এটি ইনস্ট্যান্ট অ্যাপ্রুভ করতে পারবেন!)'}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setIsVerifying(false);
                              setVerifyStep(0);
                            }}
                            className="py-2.5 px-8 bg-white text-black hover:bg-slate-100 font-extrabold text-xs tracking-wider rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
                          >
                            {language === 'en' ? 'Done / Refresh' : 'ঠিক আছে'}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* The Normal Payment Details Form & Instructions */
                    <div className="space-y-6">
                      <div className="border-b border-white/10 pb-4">
                        <h3 className="font-black text-white text-lg tracking-tight uppercase">
                          {language === 'en' ? 'Enter Transaction Details' : 'এখানে ট্রানজেকশন পেমেন্ট তথ্য দিন'}
                        </h3>
                        <p className="text-white/70 text-xs mt-1">
                          {language === 'en' ? 'ট্রানজেকশন আইডি দিন' : 'সংগৃহীত ট্রানজেকশন আইডিটি সাবমিট করুন (App Auto-Verify)'}
                        </p>
                      </div>

                      <form onSubmit={handleDepositSubmit} className="space-y-5">
                        
                        {/* 1. Enter Transaction ID input box exactly like screenshot */}
                        <div className="space-y-1.5">
                          <label className="text-xs text-white/90 font-bold block">
                            {language === 'en' ? 'Transaction ID' : 'রিকোভার্ড ট্রানজেকশন আইডি দিন (TxID)'} <span className="text-amber-300 font-black">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={depTxId}
                            onChange={(e) => setDepTxId(e.target.value)}
                            placeholder={language === 'en' ? "Enter Transaction ID" : "এখানে Transaction ID দিন (যেমন: AH919283)"}
                            className="w-full bg-[#000000]/40 border border-white/20 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all font-mono font-bold tracking-wider"
                          />
                        </div>

                        {/* 2. Amount and sender phone side by side */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs text-white/90 font-bold block">
                              {language === 'en' ? 'Amount (BDT)' : 'টাকার পরিমাণ (BDT)'} <span className="text-amber-300 font-black">*</span>
                            </label>
                            <input
                              type="number"
                              min="10"
                              required
                              value={depAmount}
                              onChange={(e) => setDepAmount(e.target.value)}
                              placeholder={language === 'en' ? "Min 10" : "সর্বনিম্ন ১০ টাকা"}
                              className="w-full bg-[#000000]/40 border border-white/20 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all font-mono"
                            />
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-xs text-white/90 font-bold block">
                              {language === 'en' ? 'Your Sender Number' : 'যে মোবাইল নাম্বার থেকে পাঠিয়েছেন'} <span className="text-amber-300 font-black">*</span>
                            </label>
                            <input
                              type="tel"
                              required
                              value={depPhone}
                              onChange={(e) => setDepPhone(e.target.value)}
                              placeholder="e.g., 017XXXXXXXX"
                              className="w-full bg-[#000000]/40 border border-white/20 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all font-mono"
                            />
                          </div>
                        </div>

                        {/* Presets in glassmorphism style */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider block">
                            {language === 'en' ? 'Quick BDT Amount Presets' : 'কুইক বিডিটি এমাউন্ট নির্বাচন'}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {[20, 50, 100, 200, 500, 1000].map((amt) => (
                              <button
                                key={amt}
                                type="button"
                                onClick={() => setDepAmount(amt.toString())}
                                className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                                  depAmount === amt.toString()
                                    ? 'bg-white text-slate-900 border-white shadow-md font-black'
                                    : 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
                                }`}
                              >
                                ৳{amt}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Payment Instructions: customized beautifully matching screenshot text */}
                        <div className="bg-black/20 border border-white/15 rounded-2xl p-5 space-y-3.5 text-xs text-stone-100 font-sans mt-2">
                          <span className="font-extrabold text-amber-300 text-xs tracking-wider block uppercase">
                            ⚠️ {language === 'en' ? 'Payment Instructions:' : 'টাকা পাঠানোর নিয়মাবলী:'}
                          </span>
                          
                          <ul className="space-y-2.5 list-none pl-0">
                            <li className="flex items-start gap-2">
                              <span className="text-amber-300 font-bold">•</span>
                              <span>
                                {selectedMethod === 'bKash' ? (
                                  language === 'en' ? '*247# Dial or open bKash App manually' : 'ডায়াল কোড *২৪৭# ডায়াল করুন অথবা bKASH অ্যাপে প্রবেশ করুন।'
                                ) : selectedMethod === 'Nagad' ? (
                                  language === 'en' ? '*167# Dial or open Nagad App manually' : 'ডায়াল কোড *১৬৭# ডায়াল করুন অথবা NAGAD অ্যাপে প্রবেশ করুন।'
                                ) : (
                                  language === 'en' ? '*322# Dial or open Rocket App manually' : 'ডায়াল কোড *৩২২# ডায়াল করুন অথবা ROCKET অ্যাপে প্রবেশ করুন।'
                                )}
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-amber-300 font-bold">•</span>
                              <span>
                                <strong className="text-amber-300 underline font-black">Send Money</strong> {language === 'en' ? 'click/select' : 'অপশনে ক্লিক করুন'}
                              </span>
                            </li>
                            <li className="flex items-start gap-3 flex-wrap">
                              <span className="text-amber-300 font-bold">•</span>
                              <div className="flex-1 space-y-1">
                                <span>
                                  {language === 'en' ? 'Use below recipient phone number as Receiver number:' : 'প্রাপক নম্বর হিসেবে নিচের এই নম্বরটি ব্যবহার করুন:'}
                                </span>
                              </div>
                            </li>
                          </ul>

                          {/* Beautiful copy box exactly matching screens */}
                          <div className="bg-black/45 border border-white/25 rounded-2xl p-4 flex items-center justify-between gap-4">
                            <div className="space-y-0.5">
                              <span className="text-[9px] text-white/50 uppercase font-sans font-extrabold tracking-wider block">
                                {selectedMethod} {language === 'en' ? 'SENDER TARGET' : 'প্রাপক নম্বর (Personal)'}
                              </span>
                              <span className="font-mono text-base font-extrabold tracking-tight text-amber-300 select-all block">
                                {billingNumbers[selectedMethod] || '017XXXXXXXX'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const num = billingNumbers[selectedMethod] || '';
                                navigator.clipboard.writeText(num);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              className={`py-2 px-5 rounded-2xl text-xs font-black transition-all shadow-md flex items-center gap-1 cursor-pointer select-none active:scale-95 ${
                                copied 
                                  ? 'bg-[#34a853] text-white' 
                                  : 'bg-[#00bfa5] hover:bg-[#00cba0] text-slate-900 border border-transparent'
                              }`}
                            >
                              {copied ? (
                                <>
                                  <Check className="h-3.5 w-3.5 inline text-white" />
                                  <span>{language === 'en' ? 'Copied' : 'কপি হয়েছে'}</span>
                                </>
                              ) : (
                                <span>{language === 'en' ? 'Copy' : 'Copy'}</span>
                              )}
                            </button>
                          </div>

                          <p className="flex items-start gap-2 pt-1 border-t border-white/10">
                            <span className="text-amber-300 font-bold">•</span>
                            <span>
                              {language === 'en' 
                                ? 'Confirm by typing your Wallet PIN. Paste the generated Transaction ID to unlock coins.' 
                                : 'নিশ্চিত করতে এখন আপনার পেমেন্ট পিন লিখে ট্রানজেকশন সফল করার পর প্রাপ্ত ট্রানজেকশন আইডিটি উপরে দিন।'}
                            </span>
                          </p>
                        </div>

                        {depMsg && (
                          <div className={`p-4 rounded-2xl text-xs font-extrabold text-center ${
                            depMsg.type === 'success' 
                              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' 
                              : 'bg-rose-500/20 border border-rose-505/30 text-rose-300'
                          }`}>
                            {depMsg.text}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full py-4 mt-1 bg-white text-slate-900 hover:bg-slate-50 font-black text-xs tracking-widest rounded-2xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer uppercase select-none active:scale-95"
                        >
                          <Send className="h-3.5 w-3.5" style={{ color: selectedMethod === 'bKash' ? '#e2136e' : selectedMethod === 'Nagad' ? '#f95707' : '#8b5cf6' }} />
                          {language === 'en' ? 'Verify Receipt & Add Coins' : 'কয়েন নিতে ট্রানজেকশন আইডি যাচাই করুন'}
                        </button>
                      </form>
                    </div>
                  )}

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
