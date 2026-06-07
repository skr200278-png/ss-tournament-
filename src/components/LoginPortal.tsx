import React, { useState } from 'react';
import { useApp } from './AppContext';
import { Trophy, Mail, Lock, User, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const LoginPortal: React.FC = () => {
  const { 
    login, 
    loginWithEmail, 
    registerWithEmail, 
    language, 
    setLanguage
  } = useApp();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleLang = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg(language === 'en' ? 'Please fill in all core fields.' : 'দয়া করে সবগুলো তথ্য পূরণ করুন।');
      return;
    }

    if (isSignUp && !name) {
      setErrorMsg(language === 'en' ? 'Please enter your gamer username.' : 'দয়া করে আপনার গেমার নাম দিন।');
      return;
    }

    if (password.length < 6) {
      setErrorMsg(language === 'en' ? 'Password must be at least 6 characters.' : 'পাসওয়ার্ড অত্যন্ত ৬ অক্ষরের হতে হবে।');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const result = await registerWithEmail(name, email, password);
        if (!result.success) {
          setErrorMsg(result.error || (language === 'en' ? 'Registration failed.' : 'অ্যাকাউন্ট তৈরি করা যায়নি।'));
        }
      } else {
        const result = await loginWithEmail(email, password);
        if (!result.success) {
          setErrorMsg(result.error || (language === 'en' ? 'Login failed.' : 'লগইন ব্যর্থ হয়েছে।'));
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (language === 'en' ? 'An unexpected error occurred.' : 'একটি অপ্রত্যাশিত সমস্যা হয়েছে।'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-6 px-4">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none z-0"></div>
      
      {/* Dynamic Language toggle strictly in corner of portal card */}
      <div className="w-full max-w-md flex justify-end mb-4 z-10">
        <button
          onClick={toggleLang}
          className="text-xs px-3 py-1.5 rounded-xl border border-gray-800 bg-[#0f111a]/80 text-gray-300 hover:text-amber-400 font-mono transition-all"
        >
          {language === 'en' ? 'বাং (Switch to Bangla)' : 'EN (Switch to English)'}
        </button>
      </div>

      <div className="w-full max-w-md bg-gradient-to-b from-[#131524] to-[#0d0e1a] rounded-[32px] border border-gray-800/90 shadow-[0_12px_45px_rgba(0,0,0,0.8)] p-6 sm:p-8 relative overflow-hidden z-10">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"></div>

        {/* Logo Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/10 mx-auto">
            <Trophy className="h-7 w-7 text-black stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {language === 'en' ? 'ProTournament BD' : 'প্রো-টুর্নামেন্ট বিডি'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {language === 'en' 
                ? 'The Ultimate Elite Esports Tournament Arena' 
                : 'এলিট এস্পোর্টস টুর্নামেন্ট ও লবিং এন্টারপ্রাইজ'}
            </p>
          </div>
        </div>

        {/* Auth Mode Tabs Selector */}
        <div className="grid grid-cols-2 p-1 bg-[#0b0c16] rounded-2xl border border-gray-800/60 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg(null);
            }}
            className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer select-none ${
              !isSignUp 
                ? 'bg-amber-500 text-black shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {language === 'en' ? 'Sign In / লগইন' : 'লগইন'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg(null);
            }}
            className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer select-none ${
              isSignUp 
                ? 'bg-amber-500 text-black shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {language === 'en' ? 'Create Account' : 'রেজিস্ট্রেশন'}
          </button>
        </div>

        {/* Display Status Errors if any */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {language === 'en' ? 'Gamer Username / গেমার নাম' : 'গেমার ইউজারনেম'}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder={language === 'en' ? 'e.g. SharpShooter' : 'যেমন: SharpShooter'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0b0c16] border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition-all font-sans"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {language === 'en' ? 'Email Address' : 'ইমেইল ঠিকানা'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
              <input
                type="email"
                placeholder={language === 'en' ? 'gamer@example.com' : 'gamer@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0b0c16] border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition-all font-sans"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {language === 'en' ? 'Password' : 'পাসওয়ার্ড'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={language === 'en' ? '••••••••' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0b0c16] border border-gray-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition-all font-sans"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10 cursor-pointer select-none border-t border-white/20 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                {language === 'en' ? 'Processing...' : 'কাজ হচ্ছে...'}
              </span>
            ) : (
              <>
                <LogIn className="h-4.5 w-4.5" />
                {isSignUp 
                  ? (language === 'en' ? 'REGISTER NOW & CLAIM 2000 COINS' : 'রেজিস্ট্রেশন করুন ও ২০০০ কয়েন নিন')
                  : (language === 'en' ? 'LOG IN TO YOUR ACCOUNT' : 'অ্যাকাউন্টে লগইন করুন')}
              </>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800/80"></div>
          </div>
          <span className="relative bg-[#0d0e1a] px-3.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
            {language === 'en' ? 'OR CONNECT' : 'অথবা সংযোগ করুন'}
          </span>
        </div>

        {/* Google Authentication Section */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={login}
            className="w-full py-3 px-4 bg-[#0a0b12] hover:bg-[#111222] border border-gray-800 text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer select-none"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.98 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3C6.27 7.57 8.92 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.46c-.28 1.46-1.1 2.69-2.34 3.51l3.63 2.82c2.13-1.97 3.74-4.86 3.74-8.43z"
              />
              <path
                fill="#FBBC05"
                d="M5.36 14.5c-.24-.71-.38-1.47-.38-2.5s.14-1.79.38-2.5L1.5 6.5C.54 8.42 0 10.51 0 12s.54 3.58 1.5 5.5l3.86-3z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.63-2.82c-1.01.68-2.31 1.09-3.96 1.09-3.08 0-5.73-2.53-6.64-5.46L1.87 15.9C3.77 19.75 7.72 23 12 23z"
              />
            </svg>
            {language === 'en' ? 'Continue with Google Account' : 'গুগল একাউন্ট দিয়ে সরাসরি প্রবেশ'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default LoginPortal;
