import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
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
  currentView: 'home' | 'wallet' | 'joined' | 'admin' | 'results' | 'profile';
  setCurrentView: (view: 'home' | 'wallet' | 'joined' | 'admin' | 'results' | 'profile') => void;
  selectedCategory: string; // "All" or a game name
  setSelectedCategory: (cat: string) => void;
  tournaments: Tournament[];
  transactions: CoinTransaction[];
  loading: boolean;
  t: any; // Translation function
  login: () => Promise<void>;
  loginAsGuest: () => void;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  addCoins: (amount: number, type: 'coins' | 'winning') => Promise<void>;
  joinTournament: (tournament: Tournament, inGameId: string) => Promise<{ success: boolean; message: string }>;
  seedSampleData: () => Promise<void>;
  clearAllDemoData: () => Promise<void>;
  settings: {
    bKash_number: string;
    Nagad_number: string;
    Rocket_number: string;
    notice: string;
    banner_url: string;
  };
  updateSettings: (newSettings: any) => Promise<void>;
  showAdminSecret: boolean;
  registerLogoClick: () => void;
  setTournaments: React.Dispatch<React.SetStateAction<Tournament[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<CoinTransaction[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [guestUser, setGuestUser] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>('en');
  const [currentView, setCurrentView] = useState<'home' | 'wallet' | 'joined' | 'admin' | 'results' | 'profile'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
    banner_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200"
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
            // Create user document with 2000 welcome coins so they can play-test directly!
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Gamer-' + firebaseUser.uid.substring(0, 5),
              email: firebaseUser.email || '',
              coins_balance: 2000,
              winning_balance: 0,
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          } else {
            setProfile(userDoc.data() as UserProfile);
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
        setProfile(snapshot.data() as UserProfile);
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
          banner_url: data.banner_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200"
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
  const login = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Popup interaction was either blocked or cancelled:", error);
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
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        name: name,
        email: email,
        coins_balance: 2000, // Pre-seeded 2000 welcome coins!
        winning_balance: 0,
        createdAt: new Date().toISOString()
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

  // Join Tournament Logic
  const joinTournament = async (tournament: Tournament, inGameId: string): Promise<{ success: boolean; message: string }> => {
    const activeProfile = profile;
    const activeUid = isGuest ? guestUser?.uid : user?.uid;
    if (!activeUid || !activeProfile) {
      return { success: false, message: t('notLoggedIn') };
    }

    if (activeProfile.coins_balance < tournament.entry_fee) {
      return { success: false, message: t('insufficientBalance') };
    }

    if (tournament.joined_count >= tournament.total_slots) {
      return { success: false, message: t('matchFull') };
    }

    const joinedUids = Array.isArray(tournament.joined_players_uids) ? tournament.joined_players_uids : [];

    if (joinedUids.includes(activeUid)) {
      return { success: false, message: t('alreadyJoined') };
    }

    const nextCount = (tournament.joined_count || 0) + 1;
    const nextList = [...joinedUids, activeUid];

    if (isGuest && guestUser) {
      // Simulated State Deduction
      const updatedProfile = {
        ...guestUser,
        coins_balance: guestUser.coins_balance - tournament.entry_fee
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
        amount: tournament.entry_fee,
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
          amount: tournament.entry_fee,
          status: 'approved',
          timestamp: new Date().toISOString(),
          match_title: tournament.title
        };
        await setDoc(txRef, joinTx);

        // Deduct balance
        await updateDoc(userRef, {
          coins_balance: increment(-tournament.entry_fee)
        });

        // Add user list & details to tournament map
        const updateDetailKey = `joined_players_details.${activeUid}`;
        await updateDoc(tourRef, {
          joined_count: increment(1),
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
      setTransactions
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
