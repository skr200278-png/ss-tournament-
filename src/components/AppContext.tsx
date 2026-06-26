import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect,
  GoogleAuthProvider, 
  signOut, 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  onSnapshot, 
  collection, 
  query, 
  where,
  updateDoc,
  increment,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError } from '../firebase';
import { UserProfile, Tournament, CoinTransaction, Language } from '../types';
import { translations } from '../translations';

interface AppContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  guestUser: UserProfile | null;
  isGuest: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentView: 'home' | 'games' | 'all_tournaments' | 'wallet' | 'joined' | 'admin' | 'results' | 'profile' | 'chat';
  setCurrentView: (view: 'home' | 'games' | 'all_tournaments' | 'wallet' | 'joined' | 'admin' | 'results' | 'profile' | 'chat') => void;
  selectedCategory: string; // "All" or a game name
  setSelectedCategory: (cat: string) => void;
  tournaments: Tournament[];
  transactions: CoinTransaction[];
  loading: boolean;
  t: any; // Translation function
  login: () => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => void;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  addCoins: (amount: number, type: 'coins' | 'winning') => Promise<void>;
  joinTournament: (tournament: Tournament, inGameId: string, customFeeMultiplier?: number) => Promise<{ success: boolean; message: string }>;
  seedSampleData: () => Promise<void>;
  clearAllDemoData: () => Promise<void>;
  settings: {
    bKash_number: string;
    Nagad_number: string;
    Rocket_number: string;
    notice: string;
    banner_url: string;
    payment_mode?: 'manual' | 'auto';
    gateway_type?: 'sms_forwarder' | 'third_party_api_sim';
    third_party_api_key?: string;
    whatsapp_group_url?: string;
    facebook_page_url?: string;
    facebook_group_url?: string;
    youtube_channel_url?: string;
    telegram_channel_url?: string;
  };
  updateSettings: (newSettings: any) => Promise<void>;
  showAdminSecret: boolean;
  registerLogoClick: () => void;
  setTournaments: React.Dispatch<React.SetStateAction<Tournament[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<CoinTransaction[]>>;
  applyReferralCode: (code: string) => Promise<{ success: boolean; message: string }>;
  updateUserProfile: (updatedFields: Partial<UserProfile>) => Promise<{ success: boolean; message: string }>;
  notificationPermission: string;
  requestNotificationPermission: () => Promise<string>;
  deferredPrompt: any;
  showInstallGuide: boolean;
  setShowInstallGuide: (show: boolean) => void;
  handleInstallApp: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const generateReferralCode = (name: string, uid: string): string => {
  const cleanName = name.replace(/[^A-Z0-9]/ig, "").toUpperCase().substring(0, 4);
  const cleanUid = uid.substring(0, 4).toUpperCase();
  const fallback = Math.floor(1000 + Math.random() * 9000).toString();
  return `${cleanName || 'GAME'}${cleanUid || fallback}`;
};

const generateNumericId = (): number => {
  return Math.floor(100000000 + Math.random() * 900000000);
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [guestUser, setGuestUser] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved === 'en' || saved === 'bn') ? (saved as Language) : 'bn';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);
  const [currentView, setCurrentView] = useState<'home' | 'games' | 'all_tournaments' | 'wallet' | 'joined' | 'admin' | 'results' | 'profile' | 'chat'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Notification Management Setup
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const prevTourIdsRef = React.useRef<string[]>([]);
  const notifiedStartsRef = React.useRef<string[]>([]);

  // Global PWA State Variables
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState<boolean>(false);

  useEffect(() => {
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
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted global PWA install prompt');
          setDeferredPrompt(null);
        } else {
          console.log('User dismissed global PWA install prompt');
        }
      } catch (err) {
        console.warn('Global PWA prompt failed, fallback to guide:', err);
        setShowInstallGuide(true);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async (): Promise<string> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
          try {
            new Notification(language === 'en' ? "🔔 Notifications Activated!" : "🔔 নোটিফিকেশন চালু হয়েছে!", {
              body: language === 'en' 
                ? "You will now receive alerts 10 minutes before joined matches and for new tournaments!"
                : "নতুন টুর্নামেন্ট যোগ হলে এবং খেলা শুরুর ১০ মিনিট আগে আপনি এখন ফোনে সিগন্যাল পাবেন!",
              icon: '/favicon.ico'
            });
          } catch (err) {
            console.warn("Native Notification test failed:", err);
          }
        }
        return perm;
      } catch (e) {
        console.error("Failed to request notification permission:", e);
      }
    }
    return 'default';
  };

  // Trigger notification when a new tournament is detected in real-time
  useEffect(() => {
    if (tournaments.length > 0) {
      const currentIds = tournaments.map(t => t.match_id);
      if (prevTourIdsRef.current.length > 0) {
        const added = tournaments.filter(t => !prevTourIdsRef.current.includes(t.match_id));
        if (added.length > 0 && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          added.forEach(t => {
            try {
              new Notification(
                language === 'en' ? "🆕 New Match Added!" : "🆕 নতুন ম্যাচ এড করা হয়েছে!", 
                {
                  body: `${t.title} (${t.game_category}) - ${language === 'en' ? 'Fee:' : 'এন্ট্রি ফি:'} ${t.entry_fee} ${language === 'en' ? 'Coins' : 'কয়েন'}`,
                  icon: '/favicon.ico'
                }
              );
            } catch (err) {
              console.warn("New tournament Notification popup was blocked:", err);
            }
          });
        }
      }
      prevTourIdsRef.current = currentIds;
    }
  }, [tournaments, language]);

  // BG check for joined matches starting soon (10 min warning as requested)
  useEffect(() => {
    const activeUid = isGuest ? guestUser?.uid : user?.uid;
    if (!activeUid || tournaments.length === 0) return;

    const checkStartingSoonMatches = () => {
      const now = Date.now();
      const tenMins = 10 * 60 * 1000;
      
      tournaments.forEach(t => {
        // Only warn for joined matches
        if (t.joined_players_uids?.includes(activeUid)) {
          const matchTime = new Date(t.time).getTime();
          const diff = matchTime - now;
          
          if (diff > 0 && diff <= tenMins && !notifiedStartsRef.current.includes(t.match_id)) {
            notifiedStartsRef.current.push(t.match_id);
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                const minutesLeft = Math.ceil(diff / 60000);
                new Notification(
                  language === 'en' ? "⏳ Match Starting Soon!" : "⏳ আপনার গেম শুরু হতে যাচ্ছে!",
                  {
                    body: language === 'en'
                      ? `Your registered match "${t.title}" starts in ${minutesLeft} minutes. Open room info now!`
                      : `আপনার টুর্নামেন্ট খেলা "${t.title}" আগামী ${minutesLeft} মিনিটের মধ্যে শুরু হচ্ছে। এখনই রুম কার্ড দেখুন!`,
                    icon: '/favicon.ico'
                  }
                );
              } catch (err) {
                console.warn("Start alert Notification was blocked:", err);
              }
            }
          }
        }
      });
    };

    checkStartingSoonMatches();
    const interval = setInterval(checkStartingSoonMatches, 15000);
    return () => clearInterval(interval);
  }, [tournaments, user, guestUser, isGuest, language]);

  // Hidden admin activation feature (clicks logo 5 times to reveal)
  const [logoClicks, setLogoClicks] = useState<number>(0);
  const [showAdminSecret, setShowAdminSecret] = useState<boolean>(() => {
    try {
      return localStorage.getItem('show_admin_secret') === 'true';
    } catch {
      return false;
    }
  });

  const registerLogoClick = () => {
    setLogoClicks(prev => {
      const nextClicks = prev + 1;
      if (nextClicks >= 5) {
        const nextSecretState = !showAdminSecret;
        setShowAdminSecret(nextSecretState);
        try {
          localStorage.setItem('show_admin_secret', String(nextSecretState));
        } catch (e) {
          console.warn("Storage blocked: ", e);
        }
        return 0; // reset counter
      }
      return nextClicks;
    });
  };

  // Settings State with standard fallback placeholders dynamically synchronized
  const [settings, setSettings] = useState({
    bKash_number: "01726591002",
    Nagad_number: "01948110394",
    Rocket_number: "01827491024",
    notice: "🔥 Welcome to ProTournament BD! Free Fire, PUBG & Ludo cash prize matches are online. Deposit is instant with personal Cash Out services.",
    banner_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=50&w=600",
    payment_mode: "manual" as "manual" | "auto",
    gateway_type: "sms_forwarder" as "sms_forwarder" | "third_party_api_sim",
    third_party_api_key: "",
    whatsapp_group_url: "https://chat.whatsapp.com/EsportsEliteLobbyBD"
  });

  // Translation Helper
  const t = (key: string, replacements?: { [key: string]: string | number }) => {
    const dict = translations[language];
    let text = (dict as any)[key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  // 1. Listen for Real-time Auth Status changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsGuest(false);
        setGuestUser(null);
        
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          // Check if profile exists
          const userDoc = await getDoc(userDocRef);
          if (!userDoc.exists()) {
            // Create user document with 20 welcome coins so they can register directly!
            const pName = firebaseUser.displayName || 'Gamer-' + firebaseUser.uid.substring(0, 5);
            const rCode = generateReferralCode(pName, firebaseUser.uid);
            const numId = generateNumericId();
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: pName,
              email: firebaseUser.email || '',
              coins_balance: 20,
              winning_balance: 0,
              referralCode: rCode,
              numericId: numId,
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          } else {
            const data = userDoc.data() as UserProfile;
            let needsUpdate = false;
            const updatePayload: any = {};
            
            if (data.coins_balance === 2000) {
              updatePayload.coins_balance = 20;
              data.coins_balance = 20;
              needsUpdate = true;
            }
            if (!data.referralCode) {
              const code = generateReferralCode(data.name, firebaseUser.uid);
              updatePayload.referralCode = code;
              data.referralCode = code;
              needsUpdate = true;
            }
            if (!data.numericId) {
              const numId = generateNumericId();
              updatePayload.numericId = numId;
              data.numericId = numId;
              needsUpdate = true;
            }
            
            if (needsUpdate) {
              await updateDoc(userDocRef, updatePayload);
            }
            setProfile(data);
          }
        } catch (error) {
          console.error("Auth Document Sync Error:", error);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Setup Real-time Profile snapshots if real user is logged in
  useEffect(() => {
    if (!user || isGuest) return;
    const userDocRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        if (data.coins_balance === 2000) {
          updateDoc(userDocRef, { coins_balance: 20 }).catch((err) => {
            console.error("Failed to migrate balance in snapshot listener:", err);
          });
          data.coins_balance = 20;
        }
        setProfile(data);
      }
    }, (error) => {
      console.warn("Snapshot subscription failed for user doc, likely permission rules before seed:", error);
    });

    return () => unsubscribe();
  }, [user, isGuest]);

  // 3. Setup real-time Tournaments Snapshot subscription
  useEffect(() => {
    if (isGuest) return; // Ignore Firestore real-time snapshots in guest/simulator mode to protect simulated local state edits

    const tourRef = collection(db, 'tournaments');
    const unsubscribe = onSnapshot(tourRef, (snapshot) => {
      const list: Tournament[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Tournament);
      });
      // Sort tournaments by match start time ascending
      list.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      
      if (isGuest && guestUser) {
        // Merge guest joined status from previous simulated local state to prevent remote wipe
        setTournaments(prev => {
          return list.map(t => {
            const currentLocal = prev.find(lt => lt.match_id === t.match_id);
            if (currentLocal && currentLocal.joined_players_uids?.includes(guestUser.uid)) {
              return {
                ...t,
                joined_count: Math.max(t.joined_count, currentLocal.joined_count),
                joined_players_uids: Array.from(new Set([...(t.joined_players_uids || []), guestUser.uid])),
                joined_players_details: {
                  ...(t.joined_players_details || {}),
                  [guestUser.uid]: currentLocal.joined_players_details?.[guestUser.uid] || {
                    inGameId: 'Tester',
                    joinedAt: new Date().toISOString()
                  }
                }
              };
            }
            return t;
          });
        });
      } else {
        setTournaments(list);
      }
    }, (error) => {
      console.warn("Failed to subscribe to tournaments snapshots:", error);
    });

    return () => unsubscribe();
  }, [isGuest, guestUser]);

  // 4. Setup real-time Transactions list subscription based on active user/guest
  useEffect(() => {
    if (isGuest) {
      // Keep simulated transactions in Guest mode to prevent overwriting with empty query results
      return;
    }

    const currentUid = user?.uid;
    if (!currentUid) {
      setTransactions([]);
      return;
    }

    const txRef = collection(db, 'transactions');
    const q = query(txRef, where('userId', '==', currentUid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: CoinTransaction[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as CoinTransaction);
      });
      // Sort by newest timestamp descending
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setTransactions(list);
    }, (error) => {
      console.warn("Failed to subscribe to transactions snapshots:", error);
    });

    return () => unsubscribe();
  }, [user, isGuest]);

  // 4b. Subscribe to General System Settings
  useEffect(() => {
    const settingRef = doc(db, 'settings', 'general');
    const unsubscribe = onSnapshot(settingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSettings({
          bKash_number: data.bKash_number || "01726591002",
          Nagad_number: data.Nagad_number || "01948110394",
          Rocket_number: data.Rocket_number || "01827491024",
          notice: data.notice || "🔥 Welcome to ProTournament BD! Free Fire, PUBG & Ludo cash prize matches are online.",
          banner_url: data.banner_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=50&w=600",
          payment_mode: data.payment_mode || "manual",
          gateway_type: data.gateway_type || "sms_forwarder",
          third_party_api_key: data.third_party_api_key || "",
          whatsapp_group_url: data.whatsapp_group_url || "https://chat.whatsapp.com/EsportsEliteLobbyBD",
          facebook_page_url: data.facebook_page_url || "https://www.facebook.com/ProTournamentBD",
          facebook_group_url: data.facebook_group_url || "https://www.facebook.com/groups/protournamentbd",
          youtube_channel_url: data.youtube_channel_url || "https://www.youtube.com/@ProTournamentBD",
          telegram_channel_url: data.telegram_channel_url || "https://t.me/ProTournamentBD"
        });
      }
    }, (error) => {
      console.warn("Failed to subscribe to settings snapshot: ", error);
    });
    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: any) => {
    const settingRef = doc(db, 'settings', 'general');
    try {
      if (isGuest) {
        setSettings(prev => ({ ...prev, ...newSettings }));
      } else {
        await setDoc(settingRef, newSettings, { merge: true });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/general');
    }
  };

  // Handle Google Auth Login
  const login = async (): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    try {
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (error: any) {
      console.warn("Popup interaction failed, trying Redirect fallback:", error);
      
      // Let's analyze the exact error code
      // If it's blocked by user, popup blocker, in-app browser webview constraints or similar:
      if (
        error?.code === 'auth/popup-blocked' ||
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request' ||
        error?.message?.toLowerCase().includes('popup') ||
        error?.message?.toLowerCase().includes('iframe')
      ) {
        try {
          await signInWithRedirect(auth, provider);
          return { success: true };
        } catch (redirectError: any) {
          console.error("Redirect login also failed:", redirectError);
          const msg = language === 'en'
            ? "Google Login blocked on this browser limit. Copy the link and open in Google Chrome/Safari!"
            : "গুগল সাইন-ইন আপনার ফোনে ব্লকড আছে। থ্রি-ডট মেনু থেকে ওপেন ইন ক্রোম বা ব্রাউজারে লিংকটি খুলুন!";
          return { success: false, error: redirectError?.message || msg };
        }
      }
      
      const friendlyMsg = language === 'en'
        ? `Google Auth failed: ${error?.message || 'Check connection'}`
        : `গুগল সাইন-ইন ব্যর্থ হয়েছে: ${error?.message || 'কানেকশন চেক করুন'}`;
      return { success: false, error: friendlyMsg };
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      setLoading(false);
      let errorMsg = language === 'en' ? 'Invalid email or password' : 'ভুল ইমেইল বা পাসওয়ার্ড';
      if (error && error.code) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          errorMsg = language === 'en' ? 'No account found or invalid credentials' : 'অ্যাকাউন্ট পাওয়া যায়নি বা ভুল পাসওয়ার্ড';
        } else if (error.code === 'auth/wrong-password') {
          errorMsg = language === 'en' ? 'Incorrect password' : 'পাসওয়ার্ডটি সঠিক নয়';
        } else if (error.code === 'auth/invalid-email') {
          errorMsg = language === 'en' ? 'Invalid email format' : 'ইমেইল ফরম্যাট সঠিক নয়';
        }
      }
      return { success: false, error: errorMsg };
    }
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update display name
      await updateProfile(firebaseUser, { displayName: name });
      
      // Explicitly create firestore path immediately to prevent race conditions
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const rCode = generateReferralCode(name, firebaseUser.uid);
      const numId = generateNumericId();
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        name: name,
        email: email,
        coins_balance: 20, // Pre-seeded 20 welcome coins!
        winning_balance: 0,
        createdAt: new Date().toISOString(),
        referralCode: rCode,
        numericId: numId,
      };
      await setDoc(userDocRef, newProfile);
      setProfile(newProfile);
      setIsGuest(false);
      setGuestUser(null);
      
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      setLoading(false);
      let errorMsg = language === 'en' ? 'Registration failed. Try again.' : 'অ্যাকাউন্ট তৈরি করা যায়নি, আবার চেষ্টা করুন।';
      if (error && error.code) {
        if (error.code === 'auth/email-already-in-use') {
          errorMsg = language === 'en' ? 'Email is already registered' : 'এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে';
        } else if (error.code === 'auth/weak-password') {
          errorMsg = language === 'en' ? 'Password should be at least 6 characters' : 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে';
        } else if (error.code === 'auth/invalid-email') {
          errorMsg = language === 'en' ? 'Invalid email address' : 'ভুল ইমেইল এড্রেস';
        }
      }
      return { success: false, error: errorMsg };
    }
  };

  // Simple simulator login for bypass limits/testing in sandboxed frames
  const loginAsGuest = () => {
    setLoading(true);
    setIsGuest(true);
    setUser(null);
    const mockGuest: UserProfile = {
      uid: 'guest_12345',
      name: 'Mobile Tester BD',
      email: 'm_gamer@gmail.com',
      coins_balance: 5000,
      winning_balance: 1000,
      numericId: 582019482,
      avatar: 'ninja',
      inGameName: 'ProTester_X',
      favoriteGame: 'Free Fire',
      devicePlatform: 'Mobile',
      statusBio: 'Spectator Agent & Pro Lobbyist!',
    };
    setGuestUser(mockGuest);
    setProfile(mockGuest);

    // Pre-initialize rich tournament list featuring some pre-joined matches for instant guest testing
    const now = new Date();
    const sampleMatches: Tournament[] = [
      {
        match_id: "match_ff_1",
        game_category: "Free Fire",
        title: "Free Fire Daily Clash Squad",
        entry_fee: 25,
        prize_pool: 200,
        per_kill: 5,
        time: new Date(now.getTime() + 11 * 60 * 1000).toISOString(), // 11 mins from now
        room_id: "1098471",
        room_password: "pass_ff_clash",
        joined_count: 32,
        total_slots: 48,
        joined_players_uids: ["sample_uid_1", "sample_uid_2", "guest_12345"], // Pre-registered
        joined_players_details: {
          "guest_12345": {
            inGameId: "TesterFF_99",
            joinedAt: now.toISOString()
          }
        },
        map_name: "Bermuda",
        format: "Solo"
      },
      {
        match_id: "match_ff_2",
        game_category: "Free Fire",
        title: "Elite Pro Bermuda Cup",
        entry_fee: 50,
        prize_pool: 500,
        per_kill: 10,
        time: new Date(now.getTime() + 120 * 60 * 1000).toISOString(), // 2 hrs from now
        room_id: "",
        room_password: "",
        joined_count: 45,
        total_slots: 50,
        joined_players_uids: [],
        map_name: "Purgatory",
        format: "Squad"
      },
      {
        match_id: "match_pubg_1",
        game_category: "PUBG/BGMI",
        title: "Erangel Squad War League",
        entry_fee: 40,
        prize_pool: 400,
        per_kill: 8,
        time: new Date(now.getTime() + 13 * 60 * 1000).toISOString(), // 13 mins from now
        room_id: "", // Empty Room ID so they can test publishing from Admin
        room_password: "",
        joined_count: 89,
        total_slots: 100,
        joined_players_uids: ["guest_12345"], // Pre-registered
        joined_players_details: {
          "guest_12345": {
            inGameId: "TesterPUBG",
            joinedAt: now.toISOString()
          }
        },
        map_name: "Erangel",
        format: "Squad"
      },
      {
        match_id: "match_ludo_1",
        game_category: "Ludo",
        title: "Ludo King Quick 1v1 Battle",
        entry_fee: 20,
        prize_pool: 70,
        per_kill: 0,
        time: new Date(now.getTime() + 45 * 60 * 1000).toISOString(), // 45 mins from now
        room_id: "",
        room_password: "",
        joined_count: 2,
        total_slots: 4,
        joined_players_uids: [],
        map_name: "Classic Board",
        format: "4-Player"
      }
    ];
    setTournaments(sampleMatches);
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    if (isGuest) {
      setIsGuest(false);
      setGuestUser(null);
      setProfile(null);
    } else {
      await signOut(auth);
    }
    setLoading(false);
  };

  // Add Coins for convenient testing
  const addCoins = async (amount: number, type: 'coins' | 'winning') => {
    const activeUid = isGuest ? guestUser?.uid : user?.uid;
    if (!activeUid) return;

    if (isGuest && guestUser) {
      const updated = {
        ...guestUser,
        coins_balance: type === 'coins' ? guestUser.coins_balance + amount : guestUser.coins_balance,
        winning_balance: type === 'winning' ? guestUser.winning_balance + amount : guestUser.winning_balance,
      };
      setGuestUser(updated);
      setProfile(updated);

      // Add a simulated transaction log inside local transactions state as well
      const newTx: CoinTransaction = {
        transaction_id: 'tx_sim_' + Date.now(),
        userId: activeUid,
        userName: guestUser.name,
        type: 'deposit',
        amount: amount,
        payment_method: 'bKash',
        account_number: '018XXXXXX',
        tx_id: 'SIM_TX_' + Math.random().toString(36).substring(4, 10).toUpperCase(),
        status: 'approved',
        timestamp: new Date().toISOString()
      };
      setTransactions(prev => [newTx, ...prev]);
    } else {
      // Update in real Firebase
      const userRef = doc(db, 'users', activeUid);
      try {
        await updateDoc(userRef, {
          [type === 'coins' ? 'coins_balance' : 'winning_balance']: increment(amount)
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}`);
      }
    }
  };

  // Update User Profile Custom Fields Logic (for custom Game Profile settings)
  const updateUserProfile = async (updatedFields: Partial<UserProfile>): Promise<{ success: boolean; message: string }> => {
    try {
      const activeUid = isGuest ? guestUser?.uid : user?.uid;
      if (!activeUid || !profile) {
        return { success: false, message: language === 'en' ? 'User not authenticated' : 'ব্যবহারকারী অথেনটিকেটেড নয়' };
      }

      if (isGuest) {
        const updated = { ...profile, ...updatedFields } as UserProfile;
        setProfile(updated);
        setGuestUser(updated);
        return { 
          success: true, 
          message: language === 'en' ? 'Gaming profile updated successfully!' : 'গেমিং প্রোফাইল সফলভাবে আপডেট করা হয়েছে!' 
        };
      } else {
        const userDocRef = doc(db, 'users', activeUid);
        await updateDoc(userDocRef, updatedFields);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        }
        return { 
          success: true, 
          message: language === 'en' ? 'Gaming profile updated successfully!' : 'গেমিং প্রোফাইল সফলভাবে আপডেট করা হয়েছে!' 
        };
      }
    } catch (err) {
      console.error("Profile update error: ", err);
      return { 
        success: false, 
        message: language === 'en' ? 'Database update failed.' : 'ডাটাবেজ আপডেট করতে ব্যর্থ হয়েছে।' 
      };
    }
  };

  // Apply Referral Code Logic
  const applyReferralCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    const activeProfile = profile;
    const activeUid = isGuest ? guestUser?.uid : user?.uid;
    if (!activeUid || !activeProfile) {
      return { success: false, message: language === 'en' ? 'Please log in first' : 'দয়া করে আগে লগইন করুন' };
    }

    if (activeProfile.referredBy) {
      return { 
        success: false, 
        message: language === 'en' ? 'You have already used a referral code!' : 'আপনি ইতিমধ্যে একটি রেফার কোড ব্যবহার করেছেন!' 
      };
    }

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: language === 'en' ? 'Enter a valid code.' : 'সঠিক কোড প্রবেশ করান।' };
    }

    if (activeProfile.referralCode === cleanCode) {
      return { 
        success: false, 
        message: language === 'en' ? 'You cannot refer yourself!' : 'আপনি নিজের কোড নিজেই ব্যবহার করতে পারবেন না!' 
      };
    }

    if (isGuest) {
      // Simulate guest mode referral application
      const updatedProfile = {
        ...activeProfile,
        referredBy: 'SimulatedReferrer',
        coins_balance: activeProfile.coins_balance + 20,
      };
      if (isGuest && guestUser) {
        setGuestUser(updatedProfile);
      }
      setProfile(updatedProfile);

      // Add dummy transaction log to help user preview/visualize immediately
      const newTx: CoinTransaction = {
        transaction_id: 'tx_ref_' + Date.now(),
        userId: activeUid,
        userName: activeProfile.name,
        type: 'deposit',
        amount: 20,
        payment_method: 'Referral Code Applied',
        account_number: 'N/A',
        tx_id: 'REF_' + Math.random().toString(36).substring(4, 10).toUpperCase(),
        status: 'approved',
        timestamp: new Date().toISOString()
      };
      setTransactions(prev => [newTx, ...prev]);

      return { 
        success: true, 
        message: language === 'en' 
          ? 'Referral applied! You received 20 coins successfully.' 
          : 'রেফার কোড সফলভাবে যুক্ত হয়েছে! আপনি ২০ কয়েন পেয়েছেন।' 
      };
    }

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', cleanCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { 
          success: false, 
          message: language === 'en' ? 'Invalid referral code. Please check again!' : 'ভুল রেফার কোড। দয়া করে আবার চেক করুন!' 
        };
      }

      // Found the referrer!
      const referrerDoc = querySnapshot.docs[0];
      const referrerData = referrerDoc.data();
      const referrerUid = referrerDoc.id;

      if (referrerUid === activeUid) {
        return { 
          success: false, 
          message: language === 'en' ? 'You cannot refer yourself!' : 'আপনি নিজের কোড নিজেই ব্যবহার করতে পারবেন না!' 
        };
      }

      // 1. Reward the referrer: +50 coins, update referrals_count
      const referrerRef = doc(db, 'users', referrerUid);
      await updateDoc(referrerRef, {
        coins_balance: increment(50),
        referrals_count: increment(1)
      });

      // Log transaction for referrer
      const referrerTxRef = doc(collection(db, 'transactions'));
      await setDoc(referrerTxRef, {
        transaction_id: referrerTxRef.id,
        userId: referrerUid,
        userName: referrerData.name || 'Referrer',
        type: 'deposit',
        amount: 50,
        payment_method: 'Referral Bonus',
        account_number: 'N/A',
        tx_id: 'REF_EARN_' + Math.random().toString(36).substring(4, 10).toUpperCase(),
        status: 'approved',
        timestamp: new Date().toISOString()
      });

      // 2. Reward the active user (referee): +20 coins, update referredBy
      const userRef = doc(db, 'users', activeUid);
      await updateDoc(userRef, {
        coins_balance: increment(20),
        referredBy: referrerUid
      });

      // Log transaction for active user (referee)
      const userTxRef = doc(collection(db, 'transactions'));
      await setDoc(userTxRef, {
        transaction_id: userTxRef.id,
        userId: activeUid,
        userName: activeProfile.name,
        type: 'deposit',
        amount: 20,
        payment_method: 'Referral Code Entered',
        account_number: 'N/A',
        tx_id: 'REF_CLAIM_' + Math.random().toString(36).substring(4, 10).toUpperCase(),
        status: 'approved',
        timestamp: new Date().toISOString()
      });

      return { 
        success: true, 
        message: language === 'en' 
          ? 'Referral applied successfully! You got 20 coins, and your referrer earned 50 coins.' 
          : 'রেফার কোড সফল হয়েছে! আপনার একাউন্টে ২০ কয়েন এবং সফল রেফারকারীকে ৫০ কয়েন প্রদান করা হয়েছে।' 
      };

    } catch (error) {
      console.error("Referral application error:", error);
      return { 
        success: false, 
        message: language === 'en' ? 'Database/Network error. Try again.' : 'সার্ভার ত্রুটি। দয়া করে আবার চেষ্টা করুন।' 
      };
    }
  };

  // Join Tournament Logic
  const joinTournament = async (tournament: Tournament, inGameId: string, customFeeMultiplier?: number): Promise<{ success: boolean; message: string }> => {
    const multiplier = customFeeMultiplier && customFeeMultiplier > 0 ? customFeeMultiplier : 1;
    const computedFee = tournament.entry_fee * multiplier;

    const activeProfile = profile;
    const activeUid = isGuest ? guestUser?.uid : user?.uid;
    if (!activeUid || !activeProfile) {
      return { success: false, message: t('notLoggedIn') };
    }

    if (activeProfile.coins_balance < computedFee) {
      return { success: false, message: t('insufficientBalance') };
    }

    if (tournament.joined_count + multiplier > tournament.total_slots) {
      return { success: false, message: t('matchFull') };
    }

    const joinedUids = Array.isArray(tournament.joined_players_uids) ? tournament.joined_players_uids : [];

    if (joinedUids.includes(activeUid)) {
      return { success: false, message: t('alreadyJoined') };
    }

    const nextCount = (tournament.joined_count || 0) + multiplier;
    const nextList = [...joinedUids, activeUid];

    if (isGuest && guestUser) {
      // Simulated State Deduction
      const updatedProfile = {
        ...guestUser,
        coins_balance: guestUser.coins_balance - computedFee
      };
      setGuestUser(updatedProfile);
      setProfile(updatedProfile);

      // Local Tournament mutation for instant feedback
      const updatedTournaments = tournaments.map(t => {
        if (t.match_id === tournament.match_id) {
          return {
            ...t,
            joined_count: nextCount,
            joined_players_uids: nextList,
            joined_players_details: {
              ...(t.joined_players_details || {}),
              [activeUid]: {
                inGameId: inGameId,
                joinedAt: new Date().toISOString()
              }
            }
          };
        }
        return t;
      });
      setTournaments(updatedTournaments);

      // Simulated transaction log
      const logTx: CoinTransaction = {
        transaction_id: 'tx_join_' + Date.now(),
        userId: activeUid,
        userName: guestUser.name,
        type: 'join_fee',
        amount: computedFee,
        status: 'approved',
        timestamp: new Date().toISOString(),
        match_title: tournament.title
      };
      setTransactions(prev => [logTx, ...prev]);

      return { success: true, message: t('joiningSuccess') };
    } else {
      // Write to Firebase Firestore
      const userRef = doc(db, 'users', activeUid);
      const tourRef = doc(db, 'tournaments', tournament.match_id);
      const txRef = doc(collection(db, 'transactions'));

      try {
        // Create matching Transaction doc
        const joinTx: CoinTransaction = {
          transaction_id: txRef.id,
          userId: activeUid,
          userName: activeProfile.name,
          type: 'join_fee',
          amount: computedFee,
          status: 'approved',
          timestamp: new Date().toISOString(),
          match_title: tournament.title
        };
        await setDoc(txRef, joinTx);

        // Deduct balance
        await updateDoc(userRef, {
          coins_balance: increment(-computedFee)
        });

        // Add user list & details to tournament map
        const updateDetailKey = `joined_players_details.${activeUid}`;
        await updateDoc(tourRef, {
          joined_count: increment(multiplier),
          joined_players_uids: arrayUnion(activeUid),
          [updateDetailKey]: {
            inGameId: inGameId,
            joinedAt: new Date().toISOString()
          }
        });

        return { success: true, message: t('joiningSuccess') };
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `tournaments/${tournament.match_id}`);
        return { success: false, message: "Server database update failed." };
      }
    }
  };

  // Seed rich templates for easy user-testing
  const seedSampleData = async () => {
    // Generate matches starting from 30 mins to 2 days from now
    const now = new Date();
    
    const sampleMatches: Tournament[] = [
      {
        match_id: "match_ff_1",
        game_category: "Free Fire",
        title: "Free Fire Daily Clash Squad",
        entry_fee: 25,
        prize_pool: 200,
        per_kill: 5,
        time: new Date(now.getTime() + 11 * 60 * 1000).toISOString(), // 11 mins from now (triggers room countdown)
        room_id: "1098471",
        room_password: "pass_ff_clash",
        joined_count: 32,
        total_slots: 48,
        joined_players_uids: ["sample_uid_1", "sample_uid_2"],
        map_name: "Bermuda",
        format: "Solo"
      },
      {
        match_id: "match_ff_2",
        game_category: "Free Fire",
        title: "Elite Pro Bermuda Cup",
        entry_fee: 50,
        prize_pool: 500,
        per_kill: 10,
        time: new Date(now.getTime() + 120 * 60 * 1000).toISOString(), // 2 hrs from now
        room_id: "2283941",
        room_password: "lobby_pro_cup",
        joined_count: 45,
        total_slots: 50,
        joined_players_uids: [],
        map_name: "Purgatory",
        format: "Squad"
      },
      {
        match_id: "match_pubg_1",
        game_category: "PUBG/BGMI",
        title: "Erangel Squad War League",
        entry_fee: 40,
        prize_pool: 400,
        per_kill: 8,
        time: new Date(now.getTime() + 13 * 60 * 1000).toISOString(), // 13 mins from now (ready!)
        room_id: "9005411",
        room_password: "pubg_war_88",
        joined_count: 89,
        total_slots: 100,
        joined_players_uids: [],
        map_name: "Erangel",
        format: "Squad"
      },
      {
        match_id: "match_ludo_1",
        game_category: "Ludo",
        title: "Ludo King Quick 1v1 Battle",
        entry_fee: 20,
        prize_pool: 70,
        per_kill: 0,
        time: new Date(now.getTime() + 45 * 60 * 1000).toISOString(), // 45 mins from now
        room_id: "LUDO_RM_99",
        room_password: "click_to_join",
        joined_count: 2,
        total_slots: 4,
        joined_players_uids: [],
        map_name: "Classic Board",
        format: "4-Player"
      },
      {
        match_id: "match_cod_1",
        game_category: "Call of Duty",
        title: "CODM Search & Destroy Cup",
        entry_fee: 30,
        prize_pool: 280,
        per_kill: 6,
        time: new Date(now.getTime() + 180 * 60 * 1000).toISOString(), // 3 hrs from now
        room_id: "",
        room_password: "",
        joined_count: 14,
        total_slots: 20,
        joined_players_uids: [],
        map_name: "Crash",
        format: "5v5"
      },
      {
        match_id: "match_ml_1",
        game_category: "Mobile Legends",
        title: "MLBB Grand Tournament 5v5",
        entry_fee: 35,
        prize_pool: 350,
        per_kill: 5,
        time: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
        room_id: "",
        room_password: "",
        joined_count: 8,
        total_slots: 10,
        joined_players_uids: [],
        map_name: "Land of Dawn",
        format: "5v5"
      },
      {
        match_id: "match_dls_1",
        game_category: "DLS",
        title: "Dream League Soccer Pro Tournament",
        entry_fee: 15,
        prize_pool: 120,
        per_kill: 0,
        time: new Date(now.getTime() + 300 * 60 * 1000).toISOString(), // 5 hrs from now
        room_id: "",
        room_password: "",
        joined_count: 6,
        total_slots: 16,
        joined_players_uids: [],
        map_name: "Stadium 1",
        format: "1v1"
      }
    ];

    if (isGuest) {
      setTournaments(sampleMatches);
    } else {
      // Upload directly to real Firebase Firestore in parrallel
      await Promise.all(sampleMatches.map(async (match) => {
        const docRef = doc(db, 'tournaments', match.match_id);
        return setDoc(docRef, match);
      }));
    }
  };

  const clearAllDemoData = async () => {
    if (isGuest) {
      setTournaments([]);
      setTransactions([]);
    } else {
      // Clear standard test-seeded elements and also fully remove any winner fields
      await Promise.all(tournaments.map(async (t) => {
        const docRef = doc(db, 'tournaments', t.match_id);
        const {
          winner_name,
          winner_uid,
          winner_prize,
          winner_kills,
          winner_banner_image,
          winner_banner_theme,
          ...cleanMatch
        } = t;
        return setDoc(docRef, { 
          ...cleanMatch, 
          joined_count: 0, 
          joined_players_uids: [], 
          joined_players_details: {} 
        });
      }));
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      profile,
      guestUser,
      isGuest,
      showAdminSecret,
      registerLogoClick,
      language,
      setLanguage,
      currentView,
      setCurrentView,
      selectedCategory,
      setSelectedCategory,
      tournaments,
      transactions,
      loading,
      t,
      login,
      loginAsGuest,
      loginWithEmail,
      registerWithEmail,
      logout,
      addCoins,
      joinTournament,
      seedSampleData,
      clearAllDemoData,
      settings,
      updateSettings,
      setTournaments,
      setTransactions,
      applyReferralCode,
      updateUserProfile,
      notificationPermission,
      requestNotificationPermission,
      deferredPrompt,
      showInstallGuide,
      setShowInstallGuide,
      handleInstallApp
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
