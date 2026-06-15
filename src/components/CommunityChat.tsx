import React, { useState, useEffect, useRef } from 'react';
import { useApp } from './AppContext';
import { db, auth } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Trash2, 
  ExternalLink, 
  Shield, 
  User, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface ChatMessage {
  id: string;
  userId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  timestamp: any;
  isAdmin?: boolean;
}

export const CommunityChat: React.FC = () => {
  const { profile, isGuest, guestUser, language, settings, showAdminSecret } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatLoading, setChatLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeUser = isGuest ? guestUser : profile;
  const hasAdminAccess = showAdminSecret || (profile && profile.email === 'skr200278@gmail.com');
  const whatsAppLink = settings.whatsapp_group_url || "https://chat.whatsapp.com/EsportsEliteLobbyBD";

  // Subscribe to real-time chat messages
  useEffect(() => {
    const chatRef = collection(db, 'chats');
    const q = query(chatRef, orderBy('timestamp', 'asc'), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({
          id: doc.id,
          userId: data.userId || 'unknown',
          senderName: data.senderName || 'Anonymous Player',
          senderAvatar: data.senderAvatar || 'preset_1',
          message: data.message || '',
          timestamp: data.timestamp,
          isAdmin: data.isAdmin || false,
        });
      });
      setMessages(msgs);
      setChatLoading(false);
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, (error) => {
      console.error("Error reading chat snapshot:", error);
      setChatLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUser || isSending) return;

    setIsSending(true);
    const textToSend = newMessage.trim().substring(0, 300);

    try {
      await addDoc(collection(db, 'chats'), {
        userId: activeUser.uid,
        senderName: activeUser.name,
        senderAvatar: activeUser.avatar || 'preset_1',
        message: textToSend,
        timestamp: serverTimestamp(),
        isAdmin: hasAdminAccess,
      });
      setNewMessage('');
    } catch (err) {
      console.error("Failed to post message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!hasAdminAccess) return;
    if (confirm(language === 'en' ? "Delete this message?" : "এই মেসেজটি ডিলিট করতে চান?")) {
      try {
        await deleteDoc(doc(db, 'chats', msgId));
      } catch (err) {
        console.error("Failed to delete chat message:", err);
      }
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto animate-fade-in font-sans">
      
      {/* Dynamic WhatsApp Group Invitation Card */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-[#0f111a] to-teal-500/10 border border-emerald-500/20 p-4 sm:p-5 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl">
        <div className="flex items-center gap-3.5 text-left w-full md:w-auto">
          <div className="h-11 w-11 bg-emerald-500 hover:scale-105 transition-all text-black rounded-2xl flex items-center justify-center text-xl font-extrabold shadow-lg shrink-0 select-none">
            💬
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              {language === 'en' ? 'OFFICIAL GROUP' : 'অফিশিয়াল পাবলিক গ্রুপ'}
            </span>
            <h4 className="font-extrabold text-white text-sm mt-1">
              {language === 'en' ? 'Connect via Official WhatsApp Group' : 'আমাদের অফিশিয়াল হোয়াটসঅ্যাপ গ্রুপে যোগ দিন'}
            </h4>
            <p className="text-[11px] text-gray-400 leading-snug mt-0.5 max-w-md">
              {language === 'en' 
                ? 'Discuss layout rules, match schedules, tournament rooms, and quick payments with 2000+ elite players.' 
                : 'সব খেলোয়াড়দের সাথে সরাসরি চ্যাট করতে, পেমেন্ট ট্র্যাকিং ও ইনস্ট্যান্ট সাপের্ট পেতে গ্রুপে যুক্ত থাকুন।'}
            </p>
          </div>
        </div>
        <a 
          href={whatsAppLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-auto text-center shrink-0 py-3 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 select-none pointer-events-auto cursor-pointer"
        >
          <ExternalLink className="h-4 w-4 stroke-[2.5]" />
          {language === 'en' ? 'JOIN WHATSAPP GROUP' : 'গ্রুপে জয়েন করুন'}
        </a>
      </div>

      {whatsAppLink === "https://chat.whatsapp.com/EsportsEliteLobbyBD" && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl text-[11px] text-amber-300 leading-relaxed text-left">
          ⚠️ <strong>এডমিন সাইনপেট নোট (Admin Setup Reminder):</strong> বর্তমানে এখানে একটি ডেমো লিংক সেট করা আছে, যার জন্য হোয়াটসঅ্যাপে <em>"Failed to get group info"</em> দেখাচ্ছে। অ্যাডমিন প্যানেল (Admin Panel) &rarr; Settings ট্যাবে গিয়ে <strong>"Official Community WhatsApp Group Link"</strong> অপশনটিতে আপনার নিজের হোয়াটসঅ্যাপ গ্রুপের লিংকটি পেস্ট করে আপডেট করুন।
        </div>
      )}

      {/* Main Realtime Chat Interface */}
      <div className="bg-[#0f111a] border border-gray-800 rounded-3xl h-[480px] sm:h-[540px] flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Chat Room Header Info */}
        <div className="px-5 py-3.5 border-b border-gray-800 bg-slate-950/40 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Users className="h-4 w-4 text-amber-400" />
              {language === 'en' ? 'Live Community Chat' : 'গ্লোবাল আড্ডা ও সাপোর্ট রুম'}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-gray-400 bg-gray-800/40 px-2.5 py-1 rounded-full">
            {messages.length} {language === 'en' ? 'online messages' : 'টি মেসেজ'}
          </span>
        </div>

        {/* Message feed bubble board */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gradient-to-b from-[#07080d]/30 to-[#0e0f17]/30 custom-scrollbar">
          {chatLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-2 text-gray-500">
              <div className="h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono">{language === 'en' ? 'Connecting to lobby chat...' : 'সার্ভার আড্ডার সাথে সংযুক্ত হচ্ছে...'}</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <span className="text-3xl select-none">💬</span>
              <p className="text-xs text-gray-400 font-medium">
                {language === 'en' ? 'No messages yet. Be the first to start the chat!' : 'কোনো বার্তা নেই। এই রিয়েল-টাইম আড্ডায় প্রথম মেসেজটি আপনিই করুন!'}
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.userId === activeUser?.uid;
              const formattedTime = msg.timestamp
                ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';

              return (
                <div 
                  key={msg.id} 
                  id={`chat-msg-${msg.id}`}
                  className={`flex items-start gap-2.5 text-xs ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Sender Avatar placeholder */}
                  <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-br from-gray-800 to-gray-950 border border-gray-700/50 flex items-center justify-center font-extrabold text-amber-500 shadow-md shrink-0">
                    {msg.senderName.substring(0, 1).toUpperCase()}
                  </div>

                  {/* Message details layout */}
                  <div className="max-w-[75%] space-y-1">
                    <div className={`flex items-center gap-1.5 text-[10px] ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <span className="font-bold text-gray-300 hover:text-white transition-all">
                        {msg.senderName}
                      </span>
                      {msg.isAdmin && (
                        <span className="bg-rose-500/10 text-rose-400 px-1.5 py-0.2 rounded text-[8px] font-bold border border-rose-500/20 flex items-center gap-0.5">
                          <Shield className="h-2 w-2" /> ADMIN
                        </span>
                      )}
                      {formattedTime && (
                        <span className="text-gray-500 font-mono flex items-center gap-0.5 text-[9px]">
                          <Clock className="h-2.5 w-2.5" />
                          {formattedTime}
                        </span>
                      )}
                    </div>

                    <div className={`p-3.5 rounded-2xl leading-relaxed text-[11.5px] break-words shadow-md select-text ${
                      isMe 
                        ? 'bg-amber-500 text-black font-semibold rounded-tr-none' 
                        : 'bg-[#1b1c2b] text-gray-100 rounded-tl-none border border-gray-800'
                    }`}>
                      {msg.message}
                    </div>
                  </div>

                  {/* Admin specific action helper - trash/cleanup button */}
                  {hasAdminAccess && (
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="self-center p-1.5 hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 rounded-lg transition-all cursor-pointer select-none"
                      title="Admin: Delete message"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Form */}
        <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-gray-800 flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              !activeUser 
                ? (language === 'en' ? "Please login to chat" : "চ্যাট করতে অনুগ্রহ করে লগইন করুন")
                : (language === 'en' ? "Type a community message (max 300 chars)..." : "গ্লোবাল বা বন্ধুদের সাথে আড্ডা শুরু করুন...")
            }
            disabled={!activeUser || isSending}
            maxLength={300}
            className="flex-grow py-3 px-4 bg-[#0a0b12] border border-gray-800 text-white rounded-2xl text-[11.5px] outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !activeUser || isSending}
            className="h-[40px] px-4 bg-amber-500 text-black hover:bg-amber-400 disabled:bg-gray-800 disabled:text-gray-500 font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md select-none"
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{language === 'en' ? 'Send' : 'সেন্ড'}</span>
          </button>
        </form>
      </div>

      {/* Safety Notice and Guidelines bottom card */}
      <div className="bg-slate-950/60 border border-gray-800/80 p-3.5 rounded-2xl flex items-center gap-2.5">
        <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
        <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
          <strong>Community Guidelines:</strong> {language === 'en' 
            ? 'Spamming, promotions, abusive language, or false tournament results reports will result in instant life-time account ban. Please stay respectful.' 
            : 'চ্যাটরুমে অপশব্দ ব্যবহার, অননুমোদিত লিংক শেয়ার করা কিংবা কোনো প্রকার ট্রল করলে আপনার প্রো-টুর্নামেন্ট বিডি একাউন্ট আজীবন নিষিদ্ধ করা হবে।'}
        </p>
      </div>
    </div>
  );
};
