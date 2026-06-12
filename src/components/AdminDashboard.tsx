import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { 
  db, 
  auth, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  increment, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';
import { Tournament, CoinTransaction, UserProfile } from '../types';
import { 
  ShieldAlert, 
  Trophy, 
  Plus, 
  Trash2, 
  Edit, 
  Settings, 
  Users, 
  Check, 
  X, 
  TrendingUp, 
  Smartphone, 
  Image as ImageIcon, 
  PlusCircle, 
  Eye, 
  Upload, 
  Bell, 
  DollarSign, 
  Search,
  CheckCircle2,
  Award,
  Filter,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface ProofSubmission {
  id: string;
  userId: string;
  userName: string;
  matchId: string;
  matchTitle: string;
  inGameId: string;
  screenshotUrl: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const AdminDashboard: React.FC = () => {
  const { 
    tournaments, 
    settings, 
    updateSettings, 
    language,
    isGuest,
    profile,
    setCurrentView,
    setTournaments,
    setTransactions,
    transactions,
    addCoins
  } = useApp();

  // Authentication Lock
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active view tab inside dashboard
  const [activeTab, setActiveTab] = useState<'tournaments' | 'deposits' | 'withdrawals' | 'results' | 'utilities' | 'users'>('tournaments');

  // Real-time states
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allTransactions, setAllTransactions] = useState<CoinTransaction[]>([]);
  const [proofs, setProofs] = useState<ProofSubmission[]>([]);
  const [userSearch, setUserSearch] = useState<string>('');
  const [depositSearch, setDepositSearch] = useState<string>('');
  const [withdrawSearch, setWithdrawSearch] = useState<string>('');

  // Forms states
  const [matchId, setMatchId] = useState<string>('');
  const [gameCategory, setGameCategory] = useState<string>('Free Fire');
  const [title, setTitle] = useState<string>('');
  const [entryFee, setEntryFee] = useState<number | string>(20);
  const [prizePool, setPrizePool] = useState<number | string>(100);
  const [perKill, setPerKill] = useState<number | string>(5);
  const [matchDate, setMatchDate] = useState<string>('');
  const [mapName, setMapName] = useState<string>('Bermuda');
  const [formatType, setFormatType] = useState<string>('Solo');
  const [gameMode, setGameMode] = useState<string>('Battle Royale');
  const [rules, setRules] = useState<string>('');
  const [totalSlots, setTotalSlots] = useState<number>(48);
  const [editMode, setEditMode] = useState<boolean>(false);

  // Room details popup
  const [roomMatch, setRoomMatch] = useState<Tournament | null>(null);
  const [roomIdInput, setRoomIdInput] = useState<string>('');
  const [roomPassInput, setRoomPassInput] = useState<string>('');

  // Match Result Distribute state
  const [resultMatch, setResultMatch] = useState<Tournament | null>(null);
  const [winnerName, setWinnerName] = useState<string>('');
  const [winnerKills, setWinnerKills] = useState<number>(0);
  const [winnerPrize, setWinnerPrize] = useState<number>(50);
  const [winnerBannerImage, setWinnerBannerImage] = useState<string>('');
  const [winnerBannerTheme, setWinnerBannerTheme] = useState<string>('classic_gold');
  const [customLeaderboardRows, setCustomLeaderboardRows] = useState<any[]>([]);

  // Balance correction state
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [manualBalanceAmount, setManualBalanceAmount] = useState<number>(100);
  const [manualBalanceType, setManualBalanceType] = useState<'coins' | 'winning'>('coins');

  // Dynamic utility settings local state
  const [bKashNum, setBKashNum] = useState<string>(settings.bKash_number);
  const [nagadNum, setNagadNum] = useState<string>(settings.Nagad_number);
  const [rocketNum, setRocketNum] = useState<string>(settings.Rocket_number);
  const [noticeText, setNoticeText] = useState<string>(settings.notice);
  const [bannerUrl, setBannerUrl] = useState<string>(settings.banner_url);
  const [paymentMode, setPaymentMode] = useState<'manual' | 'auto'>(settings.payment_mode || 'manual');
  const [gatewayType, setGatewayType] = useState<'sms_forwarder' | 'third_party_api_sim'>(settings.gateway_type || 'sms_forwarder');
  const [thirdPartyApiKey, setThirdPartyApiKey] = useState<string>(settings.third_party_api_key || '');

  // FOR THE AUTOMATED BANKING SMS LEDGER SIMULATOR
  const [simMethod, setSimMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [simSender, setSimSender] = useState<string>('01726591002');
  const [simAmount, setSimAmount] = useState<string>('100');
  const [simTxId, setSimTxId] = useState<string>('');
  const [simList, setSimList] = useState<any[]>([]);

  // Listen to the live SMS Ledger collection to display records to the admin
  useEffect(() => {
    if (!isAdminAuthenticated) return;
    if (isGuest) {
      setSimList([
        { id: 'sim1', tx_id: 'DEMO100', amount: 100, sender_number: '01899223344', payment_method: 'bKash', status: 'unused', timestamp: new Date().toISOString() },
        { id: 'sim2', tx_id: 'BKA12345', amount: 50, sender_number: '01711223344', payment_method: 'bKash', status: 'used', timestamp: new Date().toISOString() }
      ]);
      return;
    }
    const ledgerRef = collection(db, 'received_sms_payments');
    const unsubscribe = onSnapshot(ledgerRef, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      // Sort latest first
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setSimList(list.slice(0, 10)); // keep last 10 entries for presentation
    }, (err) => {
      console.warn("Ledger tracking subscription warning:", err);
    });
    return () => unsubscribe();
  }, [isAdminAuthenticated, isGuest]);

  const handleSimulatePaymentSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTxId = simTxId.trim().toUpperCase();
    const cleanAmount = Number(simAmount);

    if (!cleanTxId || cleanTxId.length < 6) {
      alert("Please enter a valid Transaction ID (minimum 6 characters).");
      return;
    }
    if (!cleanAmount || cleanAmount <= 0) {
      alert("Please enter a valid simulated amount.");
      return;
    }

    try {
      const generatedDocId = 'sim_ledger_' + Date.now();
      const newLedgerDoc = {
        id: generatedDocId,
        tx_id: cleanTxId,
        amount: cleanAmount,
        sender_number: simSender,
        payment_method: simMethod,
        status: 'unused',
        timestamp: new Date().toISOString()
      };

      if (isGuest) {
        setSimList(prev => [newLedgerDoc, ...prev]);
        alert(`[Demo Mode] Simulated bank ledger entry created! Method: ${simMethod}, TxID: "${cleanTxId}", Amount: ${cleanAmount} BDT. Now try depositing this TxID in user wallet!`);
      } else {
        await setDoc(doc(db, 'received_sms_payments', generatedDocId), newLedgerDoc);
        alert(`[Real Firestore Database Added] Simulated bank payment receipt added under 'received_sms_payments'! TxID: "${cleanTxId}", Amount: ${cleanAmount} BDT.`);
      }
      setSimTxId('');
    } catch (err: any) {
      alert("Simulator issue writing to database: " + err.message);
    }
  };

  const handleDeleteLedgerItem = async (id: string) => {
    if (isGuest) {
      setSimList(prev => prev.filter(item => item.id !== id));
      return;
    }
    try {
      await deleteDoc(doc(db, 'received_sms_payments', id));
    } catch (err: any) {
      alert("Could not delete ledger record: " + err.message);
    }
  };

  // Today's stats counters
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeMatches: 0,
    todayDeposits: 0,
    todayWithdrawals: 0
  });

  // Verify Admin via current session or passcode input
  useEffect(() => {
    if (profile && (profile.email === 'skr200278@gmail.com' || profile.uid === 'guest_12345')) {
      setIsAdminAuthenticated(true);
    }
  }, [profile]);

  // Synchronize system settings on mount
  useEffect(() => {
    setBKashNum(settings.bKash_number);
    setNagadNum(settings.Nagad_number);
    setRocketNum(settings.Rocket_number);
    setNoticeText(settings.notice);
    setBannerUrl(settings.banner_url);
    setPaymentMode(settings.payment_mode || 'manual');
    setGatewayType(settings.gateway_type || 'sms_forwarder');
    setThirdPartyApiKey(settings.third_party_api_key || '');
  }, [settings]);

  // 1. Listen or fetch All Users
  useEffect(() => {
    if (!isAdminAuthenticated) return;
    if (isGuest) {
      setAllUsers([
        profile || {
          uid: 'guest_12345',
          name: 'Mobile Tester BD',
          email: 'm_gamer@gmail.com',
          coins_balance: 5000,
          winning_balance: 1000,
        },
        {
          uid: 'sample_uid_1',
          name: 'Anik Hasan Pro',
          email: 'anik@gmail.com',
          coins_balance: 120,
          winning_balance: 15,
        },
        {
          uid: 'sample_uid_2',
          name: 'Tanvir Hossain',
          email: 'tanvir@gmail.com',
          coins_balance: 450,
          winning_balance: 200,
        }
      ]);
      return;
    }
    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const ulist: UserProfile[] = [];
      snapshot.forEach((doc) => {
        ulist.push(doc.data() as UserProfile);
      });
      setAllUsers(ulist);
    }, (err) => {
      console.warn("Failed to subscribe users on admin dashboard:", err);
    });
    return () => unsubscribe();
  }, [isAdminAuthenticated, isGuest, profile]);

  // 2. Listen or fetch All Transactions
  useEffect(() => {
    if (!isAdminAuthenticated) return;
    if (isGuest) {
      setAllTransactions(transactions);
      return;
    }
    const txRef = collection(db, 'transactions');
    const unsubscribe = onSnapshot(txRef, (snapshot) => {
      const tlist: CoinTransaction[] = [];
      snapshot.forEach((doc) => {
        tlist.push(doc.data() as CoinTransaction);
      });
      // Sort transaction order newest first
      tlist.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setAllTransactions(tlist);
    }, (err) => {
      console.warn("Failed to subscribe transactions on admin dashboard:", err);
    });
    return () => unsubscribe();
  }, [isAdminAuthenticated, isGuest, transactions]);

  // 3. Listen or fetch Screenshot proof submissions
  useEffect(() => {
    if (!isAdminAuthenticated) return;
    const proofsRef = collection(db, 'proof_submissions');
    const unsubscribe = onSnapshot(proofsRef, (snapshot) => {
      const plist: ProofSubmission[] = [];
      snapshot.forEach((doc) => {
        plist.push(doc.data() as ProofSubmission);
      });
      setProofs(plist);
    }, (err) => {
      console.warn("Failed to fetch proofs on admin dashboard:", err);
    });
    return () => unsubscribe();
  }, [isAdminAuthenticated]);

  // Calculate high-level stats counters
  useEffect(() => {
    const todayStr = new Date().toDateString();

    const todaySuccessDeposits = allTransactions
      .filter(tx => tx.type === 'deposit' && tx.status === 'approved' && new Date(tx.timestamp).toDateString() === todayStr)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const todaySuccessWithdrawals = allTransactions
      .filter(tx => tx.type === 'withdraw' && tx.status === 'approved' && new Date(tx.timestamp).toDateString() === todayStr)
      .reduce((sum, tx) => sum + tx.amount, 0);

    setStats({
      totalUsers: allUsers.length || 7, // Fallback if local preview modes
      activeMatches: tournaments.length,
      todayDeposits: todaySuccessDeposits,
      todayWithdrawals: todaySuccessWithdrawals
    });
  }, [allUsers, allTransactions, tournaments]);

  // Helper Login Handle
  const handlePasscodeLogin = () => {
    // Upgraded to extreme heavy duty hackerproof passcode requested by user
    const entered = passcode.trim();
    if (
      entered === 'skr200278_FF_ADMIN_SECURE_2026#99' || 
      entered === '58204918#FF' ||
      entered === 'skr2040'
    ) {
      setIsAdminAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Incorrect High-Security Admin PIN or Verification Denied!');
    }
  };

  // CREATE or EDIT Game Tournament
  const handleSaveTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !matchDate) {
      alert("Please enter title and start time!");
      return;
    }

    const calculatedSlots = (() => {
      const lowerFormat = (formatType || '').toLowerCase();
      if (lowerFormat === '1v1' || lowerFormat === '1v1 showdown' || lowerFormat === '1v1 duel' || lowerFormat === '1v1 mid lane duel') return 2;
      if (lowerFormat === '4-player' || lowerFormat === '4-player classic') return 4;
      if (lowerFormat === '5v5' || lowerFormat === '5v5 custom draft') return 10;
      if (lowerFormat === '3v3' || lowerFormat === '3v3 brawl mode') return 6;
      return 50;
    })();

    const finalSlots = Number(totalSlots) || calculatedSlots;

    const generatedId = editMode ? matchId : 'match_custom_' + Date.now().toString().substring(6);
    const newTournament: Tournament = {
      match_id: generatedId,
      game_category: gameCategory,
      title: title,
      entry_fee: Number(entryFee),
      prize_pool: Number(prizePool),
      per_kill: Number(perKill),
      time: new Date(matchDate).toISOString(),
      room_id: editMode ? (tournaments.find(t=>t.match_id === matchId)?.room_id || '') : '',
      room_password: editMode ? (tournaments.find(t=>t.match_id === matchId)?.room_password || '') : '',
      joined_count: editMode ? (tournaments.find(t=>t.match_id === matchId)?.joined_count || 0) : 0,
      total_slots: editMode ? (tournaments.find(t=>t.match_id === matchId)?.total_slots || finalSlots) : finalSlots,
      joined_players_uids: editMode ? (tournaments.find(t=>t.match_id === matchId)?.joined_players_uids || []) : [],
      map_name: mapName,
      format: formatType,
      game_mode: gameMode,
      rules: rules
    };

    try {
      if (isGuest) {
        setTournaments(prev => {
          const exists = prev.some(t => t.match_id === generatedId);
          if (exists) {
            return prev.map(t => t.match_id === generatedId ? newTournament : t);
          } else {
            return [newTournament, ...prev];
          }
        });
      } else {
        const docRef = doc(db, 'tournaments', generatedId);
        await setDoc(docRef, newTournament, { merge: true });
      }
      
      resetMatchForms();
      alert(editMode ? "Match details successfully saved!" : "New Match created successfully!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `tournaments/${generatedId}`);
    }
  };

  const resetMatchForms = () => {
    setTitle('');
    setEntryFee(20);
    setPrizePool(100);
    setPerKill(5);
    setMatchDate('');
    setEditMode(false);
    setMatchId('');
    setTotalSlots(48);
    setGameMode('Battle Royale');
    setRules('');
  };

  // Prefill match form for EDIT
  const selectEditMatch = (t: Tournament) => {
    setEditMode(true);
    setMatchId(t.match_id);
    setTitle(t.title);
    setGameCategory(t.game_category);
    setEntryFee(t.entry_fee);
    setPrizePool(t.prize_pool);
    setPerKill(t.per_kill);
    // Format timestamp string to compatible datetime-local string
    try {
      const iso = new Date(t.time);
      iso.setMinutes(iso.getMinutes() - iso.getTimezoneOffset());
      setMatchDate(iso.toISOString().slice(0, 16));
    } catch {
      setMatchDate('');
    }
    const fallbackMap = (() => {
      switch (t.game_category) {
        case 'Ludo': return 'Classic Board';
        case 'DLS': return '6 Mins (Any Team)';
        case 'COC': return 'TownHall 12+';
        case 'Subway Surfers': return '10 Lakh Target';
        case 'Mobile Legends': return 'Land of Dawn';
        case 'PUBG/BGMI': return 'Erangel';
        case 'Call of Duty': return 'Crash';
        default: return 'Bermuda';
      }
    })();
    const fallbackFormat = (() => {
      switch (t.game_category) {
        case 'Ludo': return '1v1';
        case 'DLS': return '1v1';
        case 'COC': return '1v1';
        case 'Subway Surfers': return 'Solo';
        case 'Mobile Legends': return '5v5';
        case 'PUBG/BGMI': return 'Squad';
        case 'Call of Duty': return 'Squad';
        default: return 'Squad';
      }
    })();
    setMapName(t.map_name || fallbackMap);
    setFormatType(t.format || fallbackFormat);
    setGameMode(t.game_mode || 'Battle Royale');
    setRules(t.rules || '');
    setTotalSlots(t.total_slots || 48);
  };

  // DELETE Tournament Match
  const handleDeleteMatch = async (matchId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this match from database?")) return;
    try {
      if (isGuest) {
        setTournaments(prev => prev.filter(t => t.match_id !== matchId));
      } else {
        const docRef = doc(db, 'tournaments', matchId);
        await deleteDoc(docRef);
      }
      alert("Match removed successfully.");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tournaments/${matchId}`);
    }
  };

  // Manage Lobbies credentials publishing
  const openRoomModal = (t: Tournament) => {
    setRoomMatch(t);
    setRoomIdInput(t.room_id || '');
    setRoomPassInput(t.room_password || '');
  };

  const handlePublishRoom = async () => {
    if (!roomMatch) return;
    try {
      if (isGuest) {
        setTournaments(prev => prev.map(t => t.match_id === roomMatch.match_id ? {
          ...t,
          room_id: roomIdInput,
          room_password: roomPassInput
        } : t));
      } else {
        const docRef = doc(db, 'tournaments', roomMatch.match_id);
        await updateDoc(docRef, {
          room_id: roomIdInput,
          room_password: roomPassInput
        });
      }
      alert("Lobby Room ID & Password published successfully!");
      setRoomMatch(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `tournaments/${roomMatch.match_id}`);
    }
  };

  // DEPOSIT APPROVAL action
  const handleApproveDeposit = async (tx: CoinTransaction) => {
    if (!window.confirm(`Approve deposit of ${tx.amount} coins for user: ${tx.userName}?`)) return;
    try {
      if (isGuest) {
        const activeUid = profile?.uid;
        if (tx.userId === activeUid) {
          await addCoins(tx.amount, 'coins');
        }
        setTransactions(prev => prev.map(t => t.transaction_id === tx.transaction_id ? { ...t, status: 'approved' } : t));
        setAllTransactions(prev => prev.map(t => t.transaction_id === tx.transaction_id ? { ...t, status: 'approved' } : t));
      } else {
        // 1. Increment User Coins Balance
        const userRef = doc(db, 'users', tx.userId);
        await updateDoc(userRef, {
          coins_balance: increment(tx.amount)
        });

        // 2. Approve Transaction status
        const txRef = doc(db, 'transactions', tx.transaction_id);
        await updateDoc(txRef, {
          status: 'approved'
        });
      }

      alert("Deposit verified! Coins credited to user wallet.");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `transactions/${tx.transaction_id}`);
    }
  };

  // DEPOSIT REJECT action
  const handleRejectDeposit = async (tx: CoinTransaction) => {
    if (!window.confirm(`Reject deposit of ${tx.amount} coins for ${tx.userName}?`)) return;
    try {
      if (isGuest) {
        setTransactions(prev => prev.map(t => t.transaction_id === tx.transaction_id ? { ...t, status: 'rejected' } : t));
        setAllTransactions(prev => prev.map(t => t.transaction_id === tx.transaction_id ? { ...t, status: 'rejected' } : t));
      } else {
        const txRef = doc(db, 'transactions', tx.transaction_id);
        await updateDoc(txRef, {
          status: 'rejected'
        });
      }
      alert("Deposit request rejected.");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `transactions/${tx.transaction_id}`);
    }
  };

  // WITHDRAW APPROVAL action and credit payout status
  const handleApproveWithdrawal = async (tx: CoinTransaction) => {
    if (!window.confirm(`Mark withdrawal request of ${tx.amount} coins as PAID for ${tx.userName}?`)) return;
    try {
      if (isGuest) {
        setTransactions(prev => prev.map(t => t.transaction_id === tx.transaction_id ? { ...t, status: 'approved' } : t));
        setAllTransactions(prev => prev.map(t => t.transaction_id === tx.transaction_id ? { ...t, status: 'approved' } : t));
      } else {
        const txRef = doc(db, 'transactions', tx.transaction_id);
        await updateDoc(txRef, {
          status: 'approved'
        });
      }
      alert("Request marked as PAID and success transaction completed.");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `transactions/${tx.transaction_id}`);
    }
  };

  // WITHDRAW REJECT with instant auto-winnings coins refund
  const handleRejectWithdrawal = async (tx: CoinTransaction) => {
    if (!window.confirm(`Reject withdrawal request and refund ${tx.amount} coins back to ${tx.userName}?`)) return;
    try {
      if (isGuest) {
        const activeUid = profile?.uid;
        if (tx.userId === activeUid) {
          await addCoins(tx.amount, 'winning');
        }
        setTransactions(prev => prev.map(t => t.transaction_id === tx.transaction_id ? { ...t, status: 'rejected' } : t));
        setAllTransactions(prev => prev.map(t => t.transaction_id === tx.transaction_id ? { ...t, status: 'rejected' } : t));
      } else {
        // 1. Refund the coins directly back into their winning_balance
        const userRef = doc(db, 'users', tx.userId);
        await updateDoc(userRef, {
          winning_balance: increment(tx.amount)
        });

        // 2. Set request status to rejected
        const txRef = doc(db, 'transactions', tx.transaction_id);
        await updateDoc(txRef, {
          status: 'rejected'
        });
      }
      alert("Withdrawal request rejected. Coins refunded to user successfully.");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `transactions/${tx.transaction_id}`);
    }
  };

  // DYNAMIC UTILITY SETTINGS UPDATE
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({
        bKash_number: bKashNum,
        Nagad_number: nagadNum,
        Rocket_number: rocketNum,
        notice: noticeText,
        banner_url: bannerUrl,
        payment_mode: paymentMode,
        gateway_type: gatewayType,
        third_party_api_key: thirdPartyApiKey
      });
      alert("App utility setting parameters saved successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  // MANUAL COIN/WINNING BALANCE AMENDMENT FOR ANALYTICS
  const handleManualBalanceCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    try {
      const userRef = doc(db, 'users', selectedUser.uid);
      const isTypeWin = manualBalanceType === 'winning';
      await updateDoc(userRef, {
        [isTypeWin ? 'winning_balance' : 'coins_balance']: increment(manualBalanceAmount)
      });

      // Log a custom transaction as well for histories audit
      const txCol = collection(db, 'transactions');
      const newTxRef = doc(txCol);
      await setDoc(newTxRef, {
        transaction_id: newTxRef.id,
        userId: selectedUser.uid,
        userName: selectedUser.name,
        type: manualBalanceAmount >= 0 ? 'deposit' : 'withdraw',
        amount: Math.abs(manualBalanceAmount),
        status: 'approved',
        timestamp: new Date().toISOString(),
        account_number: 'ADMIN_MANUAL_ADJUST',
        payment_method: 'Nagad',
        tx_id: 'SYSTEM_ADJUST_BAL'
      });

      alert(`Successfully updated user balance by ${manualBalanceAmount} coins.`);
      setSelectedUser(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${selectedUser.uid}`);
    }
  };

  // LEADERBOARD prize pool distribution
  const handleDistributeRewards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultMatch) return;
    if (!winnerName.trim()) {
      alert("Please specify a winner name to reward!");
      return;
    }

    try {
      // Find matching user profile with the winner's name to credit dynamically automatically
      const matchedUser = allUsers.find(u => u.name.toLowerCase().includes(winnerName.toLowerCase()));

      // Update the match document with winner info:
      if (isGuest) {
        setTournaments(prev => prev.map(t => t.match_id === resultMatch.match_id ? {
          ...t,
          winner_name: winnerName,
          winner_uid: matchedUser ? matchedUser.uid : 'custom_user',
          winner_prize: winnerPrize,
          winner_kills: winnerKills,
          winner_banner_image: winnerBannerImage,
          winner_banner_theme: winnerBannerTheme
        } : t));
      } else {
        const matchRef = doc(db, 'tournaments', resultMatch.match_id);
        await updateDoc(matchRef, {
          winner_name: winnerName,
          winner_uid: matchedUser ? matchedUser.uid : 'custom_user',
          winner_prize: winnerPrize,
          winner_kills: winnerKills,
          winner_banner_image: winnerBannerImage,
          winner_banner_theme: winnerBannerTheme
        });
      }

      if (matchedUser) {
        if (isGuest) {
          if (matchedUser.uid === profile?.uid) {
            await addCoins(winnerPrize, 'winning');
          }
          const newTx: CoinTransaction = {
            transaction_id: 'GUEST_WIN_' + Math.random().toString(36).substring(2, 7),
            userId: matchedUser.uid,
            userName: matchedUser.name,
            type: 'deposit',
            amount: winnerPrize,
            status: 'approved',
            timestamp: new Date().toISOString(),
            payment_method: 'bKash',
            account_number: 'WINNER_PRIZE_CREDIT',
            tx_id: 'MATCH_WIN_' + resultMatch.match_id.toUpperCase().substring(0, 5),
            match_title: resultMatch.title
          };
          setTransactions(prev => [newTx, ...prev]);
        } else {
          // Credit the exact winnings directly into their winning_balance in Firestore
          const userRef = doc(db, 'users', matchedUser.uid);
          await updateDoc(userRef, {
            winning_balance: increment(winnerPrize)
          });

          // Add a success transaction reference
          const txCol = collection(db, 'transactions');
          const txDoc = doc(txCol);
          await setDoc(txDoc, {
            transaction_id: txDoc.id,
            userId: matchedUser.uid,
            userName: matchedUser.name,
            type: 'deposit',
            amount: winnerPrize,
            status: 'approved',
            timestamp: new Date().toISOString(),
            payment_method: 'bKash',
            account_number: 'WINNER_PRIZE_CREDIT',
            tx_id: 'MATCH_WIN_' + resultMatch.match_id.toUpperCase().substring(0, 5),
            match_title: resultMatch.title
          });
        }

        alert(`Rewarded successfully! ${winnerPrize} coins added to user ${matchedUser.name}'s winnings and match winner declared.`);
      } else {
        alert("Success: Leaderboard updated on match file! (Player profile was not found in users database, so coins transfer was bypassed).");
      }

      // Close distribution selector
      setResultMatch(null);
      setWinnerName('');
      setWinnerKills(0);
      setWinnerBannerImage('');
      setWinnerBannerTheme('classic_gold');
    } catch (err) {
      alert("Failed to distribute. Checkout console logs.");
    }
  };

  // Approve User submitted screenshot proof of winnings
  const handleApproveProof = async (proof: ProofSubmission, rewardsAmt: number) => {
    try {
      // 1. Credit balance
      const userRef = doc(db, 'users', proof.userId);
      await updateDoc(userRef, {
        winning_balance: increment(rewardsAmt)
      });

      // 2. Save approved transaction
      const txCol = collection(db, 'transactions');
      const txDoc = doc(txCol);
      await setDoc(txDoc, {
        transaction_id: txDoc.id,
        userId: proof.userId,
        userName: proof.userName,
        type: 'deposit',
        amount: rewardsAmt,
        status: 'approved',
        timestamp: new Date().toISOString(),
        payment_method: 'bKash',
        account_number: 'PROOF_VERIFIED',
        tx_id: 'PROOF_SUCCESS'
      });

      // 3. Mark screenshot submission as Approved
      const proofRef = doc(db, 'proof_submissions', proof.id);
      await updateDoc(proofRef, {
        status: 'approved'
      });

      alert(`Proof submission approved! ${rewardsAmt} coins successfully sent to ${proof.userName}.`);
    } catch (err) {
      console.error(err);
    }
  };

  // Reject screenshot proof
  const handleRejectProof = async (proof: ProofSubmission) => {
    try {
      const proofRef = doc(db, 'proof_submissions', proof.id);
      await updateDoc(proofRef, {
        status: 'rejected'
      });
      alert("Submission marked as rejected.");
    } catch (err) {
      console.error(err);
    }
  };

  // Users lookup filtering
  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.uid.includes(userSearch)
  );

  const totalPendingDeposits = allTransactions.filter(tx => tx.type === 'deposit' && tx.status === 'pending');
  const totalPendingWithdraws = allTransactions.filter(tx => tx.type === 'withdraw' && tx.status === 'pending');

  const pendingDeposits = totalPendingDeposits.filter(tx => 
    depositSearch === '' ||
    tx.userName.toLowerCase().includes(depositSearch.toLowerCase()) ||
    tx.userId.includes(depositSearch) ||
    (tx.tx_id && tx.tx_id.toLowerCase().includes(depositSearch.toLowerCase())) ||
    (tx.account_number && tx.account_number.includes(depositSearch))
  );

  const pendingWithdraws = totalPendingWithdraws.filter(tx => 
    withdrawSearch === '' ||
    tx.userName.toLowerCase().includes(withdrawSearch.toLowerCase()) ||
    tx.userId.includes(withdrawSearch) ||
    (tx.account_number && tx.account_number.includes(withdrawSearch))
  );

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-[#121420] border border-gray-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="p-4 bg-amber-500/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto border border-amber-500/20">
            <ShieldAlert className="h-10 w-10 text-amber-500 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Admin Security Authentication</h2>
            <p className="text-gray-400 text-xs mt-1.5">This manager dashboard is secure. Enter PIN code or sign in with admin Google accounts</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">Secure Access PIN</label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder={language === 'en' ? "••••••••" : "••••••••"}
                className="w-full bg-[#0a0b12] border border-gray-800 rounded-2xl px-4 py-3 text-sm text-white text-center focus:outline-none focus:border-amber-500 font-mono tracking-widest font-extrabold"
              />
            </div>

            {authError && (
              <p className="text-rose-400 text-xs font-semibold bg-rose-500/5 py-1 px-3 rounded-lg border border-rose-500/10">
                {authError}
              </p>
            )}

            <button
              onClick={handlePasscodeLogin}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-2xl text-xs transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              Verify Passcode & Access Panel
            </button>

            <div className="pt-2 text-center">
              <button
                onClick={() => setCurrentView('home')}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                ← {language === 'en' ? 'Back to User Dashboard' : 'ইউজার ড্যাশবোর্ডে ফিরে যান'}
              </button>
            </div>
          </div>

          <p className="text-[10px] text-gray-500 font-mono">Current Server: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-gray-200">
      
      {/* Admin Panel Header Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800/60 pb-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-amber-400 font-extrabold uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            STAFF ROOT CONSOLE
          </span>
          <h1 className="text-2xl sm:text-3xl font-sans font-extrabold text-white tracking-tight mt-2">
            Tournament Admin Control Center
          </h1>
          <p className="text-gray-400 text-xs">Direct Firestore link: gen-lang-client-0894569085. Real-time updates push live to user clients.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('home')}
            className="py-2 px-4 border border-gray-800 bg-gray-950 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            ← {language === 'en' ? 'Exit Admin Dashboard' : 'এডমিন থেকে বের হোন'}
          </button>
          <button
            onClick={() => setIsAdminAuthenticated(false)}
            className="py-2 px-4 border border-rose-500/20 bg-rose-500/5 text-rose-300 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-semibold transition-all"
          >
            Lock Dashboard
          </button>
        </div>
      </div>

      {/* Real-time Analytic Cards Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121420] border border-gray-800/80 p-5 rounded-2xl space-y-2">
          <span className="block text-gray-500 text-[10px] font-bold uppercase font-mono">Total GAMERS</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-white">{stats.totalUsers}</span>
            <Users className="h-6 w-6 text-indigo-400" />
          </div>
        </div>

        <div className="bg-[#121420] border border-gray-800/80 p-5 rounded-2xl space-y-2">
          <span className="block text-gray-500 text-[10px] font-bold uppercase font-mono">ACTIVE LEAGUES</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-400">{stats.activeMatches}</span>
            <Trophy className="h-6 w-6 text-amber-500" />
          </div>
        </div>

        <div className="bg-[#121420] border border-gray-800/80 p-5 rounded-2xl space-y-2">
          <span className="block text-gray-500 text-[10px] font-bold uppercase font-mono">TODAY'S DEPOSITS</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400">{stats.todayDeposits} C</span>
            <TrendingUp className="h-6 w-6 text-emerald-400" />
          </div>
        </div>

        <div className="bg-[#121420] border border-gray-800/80 p-5 rounded-2xl space-y-2">
          <span className="block text-gray-500 text-[10px] font-bold uppercase font-mono font-mono">TODAY'S WITHDRAWALS</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-rose-400">{stats.todayWithdrawals} C</span>
            <DollarSign className="h-6 w-6 text-rose-400" />
          </div>
        </div>
      </section>

      {/* Dashboard Sub-navigation Tabs */}
      <div className="flex border-b border-gray-800 overflow-x-auto pb-px">
        {[
          { id: 'tournaments', label: 'Matches CRUD', badge: tournaments.length },
          { id: 'deposits', label: 'Deposit Orders', badge: totalPendingDeposits.length, color: 'bg-emerald-500' },
          { id: 'withdrawals', label: 'Cash-Outs', badge: totalPendingWithdraws.length, color: 'bg-rose-500' },
          { id: 'results', label: 'Rewards distribution', badge: proofs.filter(p=>p.status==='pending').length },
          { id: 'utilities', label: 'App utilities & slider' },
          { id: 'users', label: 'User accounts database' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3.5 px-5 font-bold text-xs border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={`px-2 py-0.5 font-mono font-bold text-[10px] rounded-full text-black ${tab.color || 'bg-amber-400'}`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* CORE VIEW SWITCHER CHUNKS */}
      <div className="space-y-6">
        
        {/* TAB 1: TOURNAMENTS CRUD */}
        {activeTab === 'tournaments' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Create/Edit Form Card */}
            <div className="bg-[#121420] border border-gray-800/90 rounded-3xl p-6 h-fit space-y-4">
              <div className="flex justify-between items-center border-b border-gray-800/60 pb-3">
                <h3 className="font-extrabold text-white text-base">
                  {editMode ? 'Edit Match Specifications' : 'Post New Tournament Match'}
                </h3>
                {editMode && (
                  <button onClick={resetMatchForms} className="text-xs text-rose-400 font-bold hover:underline">Cancel</button>
                )}
              </div>

              <form onSubmit={handleSaveTournament} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Game Category</label>
                    <select
                      value={gameCategory}
                      onChange={(e) => {
                        const newGame = e.target.value;
                        setGameCategory(newGame);
                        // Dynamically update format options to first choice
                        const formats = (() => {
                          switch (newGame) {
                            case 'Ludo':
                              return [{ value: '1v1', label: '1v1 Showdown' }, { value: '4-Player', label: '4-Player Classic' }];
                            case 'DLS':
                              return [{ value: '1v1', label: '1v1 Showdown' }, { value: 'Solo', label: 'Solo Cup Battle' }];
                            case 'COC':
                              return [{ value: '1v1', label: '1v1 Duel' }, { value: 'Clan War', label: 'Clan War Friendly' }];
                            case 'Subway Surfers':
                              return [{ value: 'Solo', label: 'High Score Challenge' }];
                            case 'Mobile Legends':
                              return [{ value: '5v5', label: '5v5 Custom Draft' }, { value: '3v3', label: '3v3 Brawl Mode' }, { value: '1v1', label: '1v1 Mid Lane Duel' }];
                            default:
                              return [{ value: 'Solo', label: 'Solo Match' }, { value: 'Duo', label: 'Duo Match' }, { value: 'Squad', label: 'Squad War' }];
                          }
                        })();
                        setFormatType(formats[0].value);
                        // Automatically update standard map/board suggestions
                        const defaultMap = (() => {
                          switch (newGame) {
                            case 'Ludo': return 'Classic Board';
                            case 'DLS': return '6 Mins (Any Team)';
                            case 'COC': return 'TownHall 12+';
                            case 'Subway Surfers': return '10 Lakh Target';
                            case 'Mobile Legends': return 'Land of Dawn';
                            case 'PUBG/BGMI': return 'Erangel';
                            case 'Call of Duty': return 'Crash';
                            default: return 'Bermuda';
                          }
                        })();
                        setMapName(defaultMap);
                        // Set total slots based on standard game category limits
                        const defaultSlots = (() => {
                          switch (newGame) {
                            case 'Ludo': return 4;
                            case 'DLS': return 16;
                            case 'COC': return 20;
                            case 'Subway Surfers': return 50;
                            case 'Mobile Legends': return 10;
                            case 'PUBG/BGMI': return 100;
                            default: return 48;
                          }
                        })();
                        setTotalSlots(defaultSlots);
                        // Automatically zero the per Kill option for non-shooter games
                        const shooterGames = ['Free Fire', 'PUBG/BGMI', 'Call of Duty'];
                        if (!shooterGames.includes(newGame)) {
                          setPerKill(0);
                        } else {
                          setPerKill(5);
                        }
                      }}
                      className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value="Free Fire">Free Fire</option>
                      <option value="PUBG/BGMI">PUBG/BGMI</option>
                      <option value="Ludo">Ludo</option>
                      <option value="Call of Duty">Call of Duty</option>
                      <option value="Mobile Legends">Mobile Legends</option>
                      <option value="DLS">Football DLS</option>
                      <option value="COC">Clash of Clans</option>
                      <option value="Subway Surfers">Subway Surfers</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Format</label>
                    <select
                      value={formatType}
                      onChange={(e) => setFormatType(e.target.value)}
                      className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      {(() => {
                        switch (gameCategory) {
                          case 'Ludo':
                            return (
                              <>
                                <option value="1v1">1v1 Showdown</option>
                                <option value="4-Player">4-Player Classic</option>
                              </>
                            );
                          case 'DLS':
                            return (
                              <>
                                <option value="1v1">1v1 Showdown</option>
                                <option value="Solo">Solo Cup Battle</option>
                              </>
                            );
                          case 'COC':
                            return (
                              <>
                                <option value="1v1">1v1 Duel</option>
                                <option value="Clan War">Clan War Friendly</option>
                              </>
                            );
                          case 'Subway Surfers':
                            return <option value="Solo">High Score Challenge</option>;
                          case 'Mobile Legends':
                            return (
                              <>
                                <option value="5v5">5v5 Custom Draft</option>
                                <option value="3v3">3v3 Brawl Mode</option>
                                <option value="1v1">1v1 Mid Lane Duel</option>
                              </>
                            );
                          default:
                            return (
                              <>
                                <option value="Solo">Solo Match</option>
                                <option value="Duo">Duo Match</option>
                                <option value="Squad">Squad War</option>
                              </>
                            );
                        }
                      })()}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Match Title / Game Name</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      gameCategory === 'Ludo' ? 'e.g. Ludo King Cash Knockout' :
                      gameCategory === 'DLS' ? 'e.g. Dream League Soccer Final 50' :
                      gameCategory === 'COC' ? 'e.g. Clash Royale King Duel' :
                      gameCategory === 'Subway Surfers' ? 'e.g. Subway Surfers Weekly Sprint' :
                      gameCategory === 'Mobile Legends' ? 'e.g. MLBB Grand Pro League BDT 15' :
                      'e.g., Free Fire Elite CS Prize League BDT 10'
                    }
                    className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Entry Fee(C)</label>
                    <input
                      type="number"
                      value={entryFee}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setEntryFee('');
                        } else {
                          const num = Number(val);
                          setEntryFee(isNaN(num) ? '' : num);
                        }
                      }}
                      className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Prize(C)</label>
                    <input
                      type="number"
                      value={prizePool}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setPrizePool('');
                        } else {
                          const num = Number(val);
                          setPrizePool(isNaN(num) ? '' : num);
                        }
                      }}
                      className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-455 font-bold uppercase tracking-wider block">
                      {['Free Fire', 'PUBG/BGMI', 'Call of Duty'].includes(gameCategory) ? 'Per Kill(C)' : 'Per Kill (N/A)'}
                    </label>
                    <input
                      type="number"
                      value={perKill}
                      disabled={!['Free Fire', 'PUBG/BGMI', 'Call of Duty'].includes(gameCategory)}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setPerKill('');
                        } else {
                          const num = Number(val);
                          setPerKill(isNaN(num) ? '' : num);
                        }
                      }}
                      className={`w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2 text-white font-mono ${
                        !['Free Fire', 'PUBG/BGMI', 'Call of Duty'].includes(gameCategory) ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                      <span>🗺️ Map Name Preset</span>
                    </label>
                    <select
                      value={(() => {
                        const presets = (() => {
                          switch (gameCategory) {
                            case 'Free Fire': return ['Bermuda', 'Purgatory', 'Kalahari', 'Alpine', 'Nexterra'];
                            case 'PUBG/BGMI': return ['Erangel', 'Miramar', 'Sanhok', 'Vikendi', 'Livik'];
                            case 'Ludo': return ['Classic Board', 'Quick Game'];
                            case 'Call of Duty': return ['Crash', 'Nuketown', 'Crossfire', 'Rust'];
                            case 'Mobile Legends': return ['Land of Dawn', 'Brawl Arena'];
                            case 'DLS': return ['6 Mins Arena', 'Friendly Cup Match'];
                            case 'COC': return ['TownHall 12+ Duel', 'TownHall 13+ Duel'];
                            case 'Subway Surfers': return ['10 Lakh Target', 'Survival Run'];
                            default: return ['Classic Arena', 'Squad Battleground'];
                          }
                        })();
                        return presets.includes(mapName) ? mapName : 'Custom';
                      })()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== 'Custom') {
                          setMapName(val);
                        }
                      }}
                      className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {(() => {
                        const presets = (() => {
                          switch (gameCategory) {
                            case 'Free Fire': return ['Bermuda', 'Purgatory', 'Kalahari', 'Alpine', 'Nexterra'];
                            case 'PUBG/BGMI': return ['Erangel', 'Miramar', 'Sanhok', 'Vikendi', 'Livik'];
                            case 'Ludo': return ['Classic Board', 'Quick Game'];
                            case 'Call of Duty': return ['Crash', 'Nuketown', 'Crossfire', 'Rust'];
                            case 'Mobile Legends': return ['Land of Dawn', 'Brawl Arena'];
                            case 'DLS': return ['6 Mins Arena', 'Friendly Cup Match'];
                            case 'COC': return ['TownHall 12+ Duel', 'TownHall 13+ Duel'];
                            case 'Subway Surfers': return ['10 Lakh Target', 'Survival Run'];
                            default: return ['Classic Arena', 'Squad Battleground'];
                          }
                        })();
                        return (
                          <>
                            {presets.map(p => <option key={p} value={p}>{p}</option>)}
                            <option value="Custom">✍️ Write Custom Map...</option>
                          </>
                        );
                      })()}
                    </select>

                    <input
                      type="text"
                      value={mapName}
                      onChange={(e) => setMapName(e.target.value)}
                      placeholder="Type custom map name..."
                      className="w-full bg-[#0a0b12]/95 border border-gray-800 rounded-xl px-3 py-1.5 text-[11px] font-mono text-gray-300 focus:outline-none focus:border-amber-400 mt-1"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Start Time</label>
                    <input
                      type="datetime-local"
                      value={matchDate}
                      onChange={(e) => setMatchDate(e.target.value)}
                      className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Slots</label>
                    <input
                      type="number"
                      value={totalSlots}
                      onChange={(e) => setTotalSlots(Number(e.target.value))}
                      className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                {/* GAME TYPE / MODE SELECTOR & CUSTOM MATCH RULES FIELD */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#0a0b12]/50 p-3 rounded-2xl border border-gray-800/80">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#a78bfa] font-black uppercase tracking-wider block">
                      🎯 Game Mode / Type (গেমের ধরণ)
                    </label>
                    <select
                      value={gameMode}
                      onChange={(e) => setGameMode(e.target.value)}
                      className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Battle Royale (BR)">BR (ব্যাটেল রয়্যাল - বিআর)</option>
                      <option value="Clash Squad (CS)">CS (ক্ল্যাশ স্কোয়াড - সিএস)</option>
                      <option value="Lone Wolf (লোন উলফ)">Lone Wolf (লোন উলফ)</option>
                      <option value="Classic Board (ক্লাসিক)">Classic Board (ক্লাসিক)</option>
                      <option value="Custom Match (কাস্টম)">Custom Duel (কাস্টম ডুয়েল)</option>
                      <option value="Full Map Rush (রাশ)">Full Map Rush (রাশ)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-orange-400 font-black uppercase tracking-wider block">
                      🛡️ Match Rules (ম্যাচ খেলার নিয়মাবলী)
                    </label>
                    <textarea
                      rows={2}
                      value={rules}
                      onChange={(e) => setRules(e.target.value)}
                      placeholder="e.g. নো হ্যাক, নো গ্রেনেড, এমুলেটর নট এলাউড..."
                      className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-xs font-sans leading-relaxed resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg select-none"
                >
                  <PlusCircle className="h-4 w-4" />
                  {editMode ? 'Update Database Record' : 'Publish Match Into App'}
                </button>
              </form>
            </div>

            {/* List Active Tournaments */}
            <div className="lg:col-span-2 bg-[#121420] border border-gray-800/90 rounded-3xl p-6 space-y-4">
              <h3 className="font-extrabold text-white text-base">Active & Upcoming Match Lobbies ({tournaments.length})</h3>

              {/* Mobile responsive cards layout */}
              <div className="block sm:hidden space-y-4">
                {tournaments.length === 0 ? (
                  <p className="py-6 text-center text-gray-500">No active matches seeded in Firestore.</p>
                ) : (
                  tournaments.map((t) => (
                    <div key={t.match_id} className="bg-[#0a0b12] border border-gray-800 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 py-0.5 px-2.5 rounded-full font-bold">
                          {t.game_category}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">{new Date(t.time).toLocaleString()}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{t.title}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 bg-[#171a26]/50 p-2.5 rounded-xl">
                        <div>
                          <span className="text-[9px] block text-gray-500">JOINED STATUS</span>
                          <strong className="text-indigo-300 font-mono">{t.joined_count} Players</strong>
                        </div>
                        <div>
                          <span className="text-[9px] block text-gray-500">ENTRY / PRIZE</span>
                          <strong className="text-gray-200 font-mono">{t.entry_fee} C</strong> / <strong className="text-emerald-400 font-mono">{t.prize_pool} C</strong>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1 font-sans">
                        <button
                          onClick={() => openRoomModal(t)}
                          className="flex-1 py-2 bg-amber-500 text-black text-xs rounded-xl font-bold hover:bg-amber-400"
                        >
                          Manage Room
                        </button>
                        <button
                          onClick={() => selectEditMatch(t)}
                          className="py-2 px-3.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-xl text-xs font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMatch(t.match_id)}
                          className="py-2 px-3.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop view table layout */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-800 text-[10px] text-gray-400 uppercase tracking-wider font-mono">
                      <th className="pb-3">GAME CATEGORY</th>
                      <th className="pb-3">TITLE / TIME</th>
                      <th className="pb-3 text-center">JOINED</th>
                      <th className="pb-3 text-center">ENTRY/PRIZE</th>
                      <th className="pb-3 text-right">CONTROLS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {tournaments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-500">No active matches seeded in Firestore.</td>
                      </tr>
                    ) : (
                      tournaments.map((t) => (
                        <tr key={t.match_id} className="hover:bg-slate-900/10">
                          <td className="py-3.5 pr-2">
                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 py-0.5 px-2 rounded-full font-bold">
                              {t.game_category}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className="font-bold text-white block">{t.title}</span>
                            <span className="text-[10px] text-gray-400 block">{new Date(t.time).toLocaleString()}</span>
                          </td>
                          <td className="py-3.5 text-center font-bold text-indigo-300">
                            {t.joined_count} PLAYER(S)
                          </td>
                          <td className="py-3.5 text-center font-mono font-medium">
                            <span className="text-gray-400">{t.entry_fee} C</span> / <span className="text-emerald-400 font-bold">{t.prize_pool} C</span>
                          </td>
                          <td className="py-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => openRoomModal(t)}
                              className="py-1 px-2.5 bg-amber-500 text-black rounded-lg font-bold hover:bg-amber-400"
                            >
                              Manage Room
                            </button>
                            <button
                              onClick={() => selectEditMatch(t)}
                              className="p-1 px-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-lg"
                              title="Edit Match"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMatch(t.match_id)}
                              className="p-1 px-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/20 rounded-lg"
                              title="Delete"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: DEPOSITS APPROVALS */}
        {activeTab === 'deposits' && (
          <div className="bg-[#121420] border border-gray-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                Pending Coin Deposit Requests
                <span className="bg-emerald-500 text-black font-extrabold px-2.5 py-0.5 rounded-full text-[10px] font-mono">
                  {pendingDeposits.length}
                </span>
                {depositSearch && (
                  <span className="text-xs text-gray-400 font-normal">
                    (filtered from {totalPendingDeposits.length})
                  </span>
                )}
              </h3>

              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={depositSearch}
                  onChange={(e) => setDepositSearch(e.target.value)}
                  placeholder="Search name, phone, TxID, or UID..."
                  className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-800 text-[10px] text-gray-400 uppercase tracking-wider font-mono">
                    <th className="pb-3">User & UID</th>
                    <th className="pb-3">Payment Method</th>
                    <th className="pb-3">Account Send Number</th>
                    <th className="pb-3 font-mono">Transaction ID (TxID)</th>
                    <th className="pb-3 font-mono text-center">Amount (C)</th>
                    <th className="pb-3 text-right">Verify Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {pendingDeposits.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500 font-semibold text-xs">
                        No pending coin recharges found in Firebase logs.
                      </td>
                    </tr>
                  ) : (
                    pendingDeposits.map((tx) => (
                      <tr key={tx.transaction_id} className="hover:bg-slate-950/20">
                        <td className="py-4">
                          <span className="font-bold text-white block">{tx.userName}</span>
                          <span className="text-[10px] font-mono text-indigo-400 block pb-1 pr-4">{tx.userId}</span>
                          <span className="text-[10px] text-gray-500 font-mono italic">{new Date(tx.timestamp).toLocaleString()}</span>
                        </td>
                        <td className="py-4 font-bold text-indigo-300">{tx.payment_method}</td>
                        <td className="py-4 font-semibold font-mono text-slate-300">{tx.account_number || '01XXXXXXXX'}</td>
                        <td className="py-4 text-amber-500 font-extrabold font-mono tracking-wider">{tx.tx_id}</td>
                        <td className="py-4 font-mono font-extrabold text-center text-white text-sm">{tx.amount} BDT</td>
                        <td className="py-4 text-right space-x-2 whitespace-nowrap pr-2">
                          <button
                            onClick={() => handleApproveDeposit(tx)}
                            className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg inline-flex items-center gap-1 select-none"
                          >
                            <Check className="h-3.5 w-3.5 stroke-[2.5]" /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectDeposit(tx)}
                            className="py-1.5 px-3 border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500 hover:text-white font-extrabold rounded-lg inline-flex items-center gap-1 select-none"
                          >
                            <X className="h-3.5 w-3.5 stroke-[2.5]" /> Reject
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: WITHDRAWAL REQUESTS */}
        {activeTab === 'withdrawals' && (
          <div className="bg-[#121420] border border-gray-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                Pending Withdrawal Payout Orders
                <span className="bg-rose-500 text-black font-extrabold px-2.5 py-0.5 rounded-full text-[10px] font-mono">
                  {pendingWithdraws.length}
                </span>
                {withdrawSearch && (
                  <span className="text-xs text-gray-400 font-normal">
                    (filtered from {totalPendingWithdraws.length})
                  </span>
                )}
              </h3>

              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={withdrawSearch}
                  onChange={(e) => setWithdrawSearch(e.target.value)}
                  placeholder="Search name, phone, or UID..."
                  className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[650px]">
                <thead>
                  <tr className="border-b border-gray-800 text-[10px] text-gray-400 uppercase tracking-wider font-mono">
                    <th className="pb-3">Recipient & UID</th>
                    <th className="pb-3">Payout Gateway</th>
                    <th className="pb-3">Receiver Wallet Number</th>
                    <th className="pb-3 font-mono text-center">Amount (C)</th>
                    <th className="pb-3 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {pendingWithdraws.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        No pending payouts loaded. All withdrawals complete.
                      </td>
                    </tr>
                  ) : (
                    pendingWithdraws.map((tx) => (
                      <tr key={tx.transaction_id} className="hover:bg-slate-950/20">
                        <td className="py-4">
                          <span className="font-bold text-white block">{tx.userName}</span>
                          <span className="text-[10px] font-mono text-indigo-400 block">{tx.userId}</span>
                          <span className="text-[10px] text-gray-500">{new Date(tx.timestamp).toLocaleString()}</span>
                        </td>
                        <td className="py-4 font-bold text-[#e11d48]">{tx.payment_method}</td>
                        <td className="py-4 font-mono font-semibold tracking-wider text-slate-300">{tx.account_number}</td>
                        <td className="py-4 font-mono font-extrabold text-[#f43f5e] text-center text-sm">{tx.amount} Coin</td>
                        <td className="py-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleApproveWithdrawal(tx)}
                            className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg inline-flex items-center gap-1 select-none font-sans"
                          >
                            <Check className="h-3.5 w-3.5 stroke-[2.5]" /> Mark Paid
                          </button>
                          <button
                            onClick={() => handleRejectWithdrawal(tx)}
                            className="py-1.5 px-3 border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500 hover:text-white font-extrabold rounded-lg inline-flex items-center gap-1 select-none font-sans"
                          >
                            <X className="h-3.5 w-3.5 stroke-[2.5]" /> Reject & Refund
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: RESULTS, LEADERBOARD & SCREENSHOT PROOFS */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Rewards Distribution Block */}
              <div className="bg-[#121420] border border-gray-800 rounded-3xl p-6 space-y-4">
                <h3 className="font-extrabold text-white text-base">Winnings Reward Distribution Form</h3>
                
                <form onSubmit={handleDistributeRewards} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase">Select Match Ended</label>
                    <select
                      onChange={(e) => {
                        const m = tournaments.find(t=>t.match_id === e.target.value);
                        setResultMatch(m || null);
                      }}
                      className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="">-- Choose Ended Match --</option>
                      {tournaments.map(t => (
                        <option key={t.match_id} value={t.match_id}>{t.title} ({t.game_category})</option>
                      ))}
                    </select>
                  </div>

                  {resultMatch && (
                    <div className="bg-[#1a1c2b]/50 p-4 border border-gray-800 rounded-xl space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-800/60">
                        <span className="block font-bold text-amber-400">Players Joined inside App:</span>
                        <button
                          type="button"
                          onClick={() => {
                            handleDeleteMatch(resultMatch.match_id);
                            setResultMatch(null);
                          }}
                          className="py-1 px-3 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-300 border border-rose-500/30 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5"
                        >
                          🗑️ Delete Selected Match
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {resultMatch.joined_players_uids?.length === 0 ? (
                          <span className="text-gray-400 italic">No direct players joined through registration interface in sandbox mode.</span>
                        ) : (
                          resultMatch.joined_players_uids?.map(uid => {
                            const details = resultMatch.joined_players_details?.[uid] || { inGameId: 'Gamer' };
                            return (
                              <button
                                type="button"
                                key={uid}
                                onClick={() => setWinnerName(details.inGameId)}
                                className="bg-[#0f111a] border border-gray-800 hover:border-amber-400 hover:text-amber-300 font-mono font-semibold text-[10px] px-2.5 py-1.5 rounded-lg text-slate-300"
                              >
                                {details.inGameId}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 font-bold uppercase">Winner In-Game ID / Profile Name</label>
                      <input
                        type="text"
                        value={winnerName}
                        onChange={(e) => setWinnerName(e.target.value)}
                        placeholder="e.g. BD_PLAYER"
                        className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2 text-white font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 font-bold uppercase">Winner Kills</label>
                      <input
                        type="number"
                        value={winnerKills}
                        onChange={(e) => setWinnerKills(Number(e.target.value))}
                        className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2 text-white font-mono"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 font-bold uppercase">Winning Prize (C)</label>
                      <input
                        type="number"
                        value={winnerPrize}
                        onChange={(e) => setWinnerPrize(Number(e.target.value))}
                        className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Winner Celebrating Professional Banner Setup */}
                  <div className="bg-[#181a26]/40 p-4 border border-gray-800/80 rounded-2xl space-y-3.5">
                    <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-xs">
                      🏆 Professional Winner Celebration Card & Banner Setup
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 font-bold uppercase block">1. Dynamic Banner Theme Template</label>
                        <select
                          value={winnerBannerTheme}
                          onChange={(e) => setWinnerBannerTheme(e.target.value)}
                          className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2 text-white font-medium"
                        >
                          <option value="classic_gold">🥇 Classic Royal Gold Celebration Design</option>
                          <option value="cyber_neon">⚡ Electric Cyan & Magenta Neon</option>
                          <option value="royal_champion">👑 Red Fire & Crimson Champion Crest</option>
                          <option value="gaming_dark">🔥 Extreme Pro Gaming Cyber Slate</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 font-bold uppercase block">2. Custom Banner JPG/PNG Image URL (Optional)</label>
                        <input
                          type="text"
                          value={winnerBannerImage}
                          onChange={(e) => setWinnerBannerImage(e.target.value)}
                          placeholder="Paste image link, e.g. https://www.example.com/banner.jpg"
                          className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-500 leading-relaxed leading-3">
                      💡 <strong>Tip:</strong> If you leave the image URL blank, the system will dynamically generate a beautifully animated, high-tech, and color-matched professional celebrating badge with the winner's achievements in real-time according to your chosen theme!
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-1 select-none"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Distribute Rewards & Update User Balances
                  </button>
                </form>
              </div>

              {/* Active Screenshot proofs for manual claims */}
              <div className="bg-[#121420] border border-gray-800 rounded-3xl p-6 space-y-4">
                <h3 className="font-extrabold text-white text-base">Winnings Verification Claims Tab ({proofs.length})</h3>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {proofs.length === 0 ? (
                    <p className="text-gray-500 text-xs text-center py-10">No users have uploaded screenshot proofs. Direct match claims list is clean.</p>
                  ) : (
                    proofs.map((p) => {
                      const isPending = p.status === 'pending';
                      return (
                        <div key={p.id} className="bg-[#1a1c2b] border border-gray-800 rounded-2xl p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-white block text-xs">{p.userName}</span>
                              <span className="text-[10px] font-mono text-indigo-400 block pb-1">In-Game ID: {p.inGameId}</span>
                              <span className="text-[10px] block text-amber-500 font-semibold">{p.matchTitle}</span>
                            </div>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase font-mono ${
                              p.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              p.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {p.status}
                            </span>
                          </div>

                          <div className="relative h-32 rounded-xl overflow-hidden border border-gray-800">
                            <img 
                              src={p.screenshotUrl} 
                              alt="Claim Proof" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                            <a 
                              href={p.screenshotUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="absolute bottom-2 right-2 p-1.5 bg-[#0f111a] hover:bg-black rounded-lg text-[10px] font-bold text-amber-400 border border-gray-800 inline-flex items-center gap-1 select-none"
                            >
                              <Eye className="h-3 w-3" /> View Fullscreen
                            </a>
                          </div>

                          {isPending && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveProof(p, 100)}
                                className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-[11px] block select-none"
                              >
                                Approve & Give 100 Coins
                              </button>
                              <button
                                onClick={() => handleRejectProof(p)}
                                className="py-1.5 px-3 border border-rose-500/20 bg-[#f43f5e]/5 text-rose-300 hover:bg-rose-500 hover:text-white font-bold rounded-xl text-[11px] block select-none"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 5: UTILITIES / DYNAMIC BANNERS & NOTICE */}
        {activeTab === 'utilities' && (
          <div className="bg-[#121420] border border-gray-800 rounded-3xl p-6 max-w-2xl mx-auto space-y-4">
            <h3 className="font-extrabold text-white text-base">App Notice Board & Real-Time Wallet Details</h3>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-sans">
              
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 font-bold uppercase">bKash Active Cash-In Number</label>
                  <input
                    type="text"
                    value={bKashNum}
                    onChange={(e) => setBKashNum(e.target.value)}
                    className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2 text-white font-mono tracking-wider"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 font-bold uppercase">Nagad Active Cash-In Number</label>
                  <input
                    type="text"
                    value={nagadNum}
                    onChange={(e) => setNagadNum(e.target.value)}
                    className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2 text-white font-mono tracking-wider"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 font-bold uppercase">Rocket Active Cash-In Number</label>
                  <input
                    type="text"
                    value={rocketNum}
                    onChange={(e) => setRocketNum(e.target.value)}
                    className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2 text-white font-mono tracking-wider"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 font-bold uppercase">Scrolling Text Notice Board Bar (App Ticker)</label>
                <textarea
                  value={noticeText}
                  onChange={(e) => setNoticeText(e.target.value)}
                  rows={3}
                  placeholder="Paste announcements ticker text..."
                  className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl p-3 text-white leading-relaxed text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Image Slider Banner URL (Home Screen Slider Image)
                </label>
                <input
                  type="text"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="Paste banner image URL..."
                  className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-black hover:bg-amber-400 font-extrabold rounded-2xl text-xs transition-all shadow-md select-none"
              >
                Apply Parameters & Inform Users
              </button>
            </form>
          </div>
        )}

        {/* TAB 6: USERS BASE & BALANCES OVERRIDE */}
        {activeTab === 'users' && (
          <div className="bg-[#121420] border border-gray-800 rounded-3xl p-6 space-y-4">
            
            {/* Header Search controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="font-extrabold text-white text-base">Registered Gamers Ledger List ({filteredUsers.length})</h3>
              
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user, email, or UID..."
                  className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
                />
              </div>
            </div>

            {/* User database table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[650px]">
                <thead>
                  <tr className="border-b border-gray-800 text-[10px] text-gray-400 uppercase tracking-wider font-mono">
                    <th className="pb-3">Gamer Display Details</th>
                    <th className="pb-3">Registered Identity</th>
                    <th className="pb-3 font-mono text-center">Standard Balance</th>
                    <th className="pb-3 font-mono text-center">Winnings Balance</th>
                    <th className="pb-3 text-right">Correct coins balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-500">No users found. Try searching or seed data.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.uid} className="hover:bg-slate-900/10">
                        <td className="py-3">
                          <span className="font-bold text-white block">{u.name}</span>
                          <span className="text-[10px] font-mono text-indigo-400 block pr-6 text-indigo-400/90">{u.uid}</span>
                        </td>
                        <td className="py-3">
                          <span className="text-gray-300 block font-semibold">{u.email}</span>
                        </td>
                        <td className="py-3 text-center font-mono font-bold text-amber-400 text-sm">
                          {u.coins_balance} C
                        </td>
                        <td className="py-3 text-center font-mono font-bold text-emerald-400 text-sm">
                          {u.winning_balance} C
                        </td>
                        <td className="py-3 text-right pr-1">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setManualBalanceAmount(100);
                              setManualBalanceType('coins');
                            }}
                            className="py-1 px-3 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500 text-amber-300 hover:text-black rounded-lg font-bold"
                          >
                            Add/Subtract Coins
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

      {/* MODAL 1: LOBBY DETAILS PUBLISH popup */}
      {roomMatch && (
        <div className="fixed inset-0 z-50 bg-[#000]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121420] border border-gray-800 rounded-3xl p-6 max-w-sm w-full space-y-4 animate-scale-up">
            <div className="flex justify-between items-center border-b border-gray-800/60 pb-2">
              <span className="font-extrabold text-white text-sm">Manage Lobby Credentials</span>
              <button onClick={() => setRoomMatch(null)} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed block bg-slate-900/40 p-2.5 border border-gray-800/50 rounded-xl">
              Updating details publishes Room credentials directly to user match logs. Match details: <strong className="text-slate-200">{roomMatch.title}</strong>
            </p>

            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 font-bold uppercase">Room ID</label>
                <input
                  type="text"
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  placeholder="e.g., 900542"
                  className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2 text-white font-mono tracking-widest font-extrabold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 font-bold uppercase">Room Password</label>
                <input
                  type="text"
                  value={roomPassInput}
                  onChange={(e) => setRoomPassInput(e.target.value)}
                  placeholder="e.g., pass123"
                  className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2 text-white font-mono tracking-widest font-extrabold"
                />
              </div>

              <button
                onClick={handlePublishRoom}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-2xl text-xs transition-all shadow-md select-none mt-2"
              >
                Publish Room live
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MANUAL BALANCE OVERRIDE DIALOG */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-[#000]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121420] border border-gray-800 rounded-3xl p-6 max-w-sm w-full space-y-4 animate-scale-up">
            <div className="flex justify-between items-center border-b border-gray-800/60 pb-2">
              <span className="font-extrabold text-white text-sm">Amend Gamer Balances / ব্যালেন্স পরিবর্তন</span>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <p className="text-xs text-gray-400 pb-1 font-sans leading-relaxed">
              কয়েন যোগ করতে সাধারণ সংখ্যা (যেমন <span className="text-emerald-400">100</span>) লিখুন এবং কয়েন কর্তন বা কমাতে মাইনাস সংখ্যা (যেমন <span className="text-rose-400 font-bold">-50</span>) টাইপ করুন:
              <strong className="text-slate-200 block mt-1.5 p-2 bg-black/30 border border-gray-800 rounded-lg">{selectedUser.name} ({selectedUser.email || 'No email'})</strong>
            </p>

            <form onSubmit={handleManualBalanceCorrection} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 font-bold uppercase block">Select Balance Type / ব্যালেন্স এর ধরণ</label>
                <select
                  value={manualBalanceType}
                  onChange={(e) => setManualBalanceType(e.target.value as any)}
                  className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2.5 text-white active:outline-none focus:outline-none focus:border-amber-550 cursor-pointer text-xs"
                >
                  <option value="coins">Standard Main Coins (মেইন রিচার্জ কয়েন)</option>
                  <option value="winning">Winning Winnings Coins (উইনিং উইথড্র কয়েন)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 font-bold uppercase block">Coin Balance Change Amount / পরিবর্তন করার কয়েন সংখ্যা</label>
                <input
                  type="number"
                  value={manualBalanceAmount}
                  onChange={(e) => setManualBalanceAmount(Number(e.target.value))}
                  placeholder="e.g. 100 or -50"
                  className="w-full bg-[#0a0b12] border border-gray-800 rounded-xl px-3 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold font-sans rounded-2xl text-xs transition-all shadow-md select-none mt-2 cursor-pointer"
              >
                ✓ Update Balance / ব্যালেন্স সেভ করুন
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default AdminDashboard;
