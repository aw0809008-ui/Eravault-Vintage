"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

// 🔔 Sound Alert for new messages
function playNotifSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    // Two-tone chime: do-mi
    osc.frequency.setValueAtTime(523, ctx.currentTime);      // C5
    osc.frequency.setValueAtTime(659, ctx.currentTime + 0.12); // E5
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

interface ChatSession {
  id?: number;
  chat_id: string;
  buyer_name: string;
  buyer_email: string;
  last_message?: string;
  unread_admin: number;
  unread_buyer: number;
  created_at?: string;
  updated_at?: string;
}

interface ChatMessage {
  id?: number;
  chat_id: string;
  sender: "buyer" | "admin";
  message: string;
  created_at?: string;
}

const CHAT_KEY = "EraVault2024SecretKey!@#";
function decrypt(encoded: string): string {
  try {
    const text = decodeURIComponent(escape(atob(encoded)));
    let result = "";
    for (let i = 0; i < text.length; i++)
      result += String.fromCharCode(
        text.charCodeAt(i) ^ CHAT_KEY.charCodeAt(i % CHAT_KEY.length)
      );
    return result;
  } catch {
    return "[encrypted]";
  }
}
function encrypt(text: string): string {
  let result = "";
  for (let i = 0; i < text.length; i++)
    result += String.fromCharCode(
      text.charCodeAt(i) ^ CHAT_KEY.charCodeAt(i % CHAT_KEY.length)
    );
  return btoa(unescape(encodeURIComponent(result)));
}

async function getAllChats(): Promise<ChatSession[]> {
  const { data } = await supabase
    .from("chats")
    .select("*")
    .order("updated_at", { ascending: false });
  return data || [];
}
async function getMessages(chatId: string): Promise<ChatMessage[]> {
  const { data } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });
  return (data || []).map((m: ChatMessage) => ({ ...m, message: decrypt(m.message) }));
}
async function sendMsg(chatId: string, text: string) {
  const enc = encrypt(text);
  await supabase.from("chat_messages").insert([{ chat_id: chatId, sender: "admin", message: enc }]);
  await supabase.from("chats").update({ last_message: text.slice(0, 50), updated_at: new Date().toISOString() }).eq("chat_id", chatId);
  const { data } = await supabase.from("chats").select("unread_buyer").eq("chat_id", chatId).single();
  if (data) await supabase.from("chats").update({ unread_buyer: (data.unread_buyer || 0) + 1 }).eq("chat_id", chatId);
}

function ago(d?: string) {
  if (!d) return "";
  const ms = Date.now() - new Date(d).getTime();
  if (ms < 60000) return "now";
  if (ms < 3600000) return Math.floor(ms / 60000) + "m";
  if (ms < 86400000) return new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return new Date(d).toLocaleDateString([], { day: "numeric", month: "short" });
}

export default function ChatPage() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [pick, setPick] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [boot, setBoot] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try { setChats(await getAllChats()); } catch {}
    setBoot(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!pick) return;
    getMessages(pick).then(setMsgs).catch(() => {});
    supabase.from("chats").update({ unread_admin: 0 }).eq("chat_id", pick).then(() => {});
    setChats((p) => p.map((c) => (c.chat_id === pick ? { ...c, unread_admin: 0 } : c)));

    const ch = supabase
      .channel("chat-v-" + pick)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: "chat_id=eq." + pick },
        (payload) => {
          const m = payload.new as ChatMessage;
          setMsgs((p) => [...p, { ...m, message: decrypt(m.message) }]);
          load();
        }
      )
      .subscribe();

    return () => { ch.unsubscribe(); };
  }, [pick]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  useEffect(() => { if (pick) setTimeout(() => inputRef.current?.focus(), 100); }, [pick]);

  const send = async () => {
    if (!text.trim() || !pick || busy) return;
    setBusy(true);
    await sendMsg(pick, text.trim());
    setText("");
    getMessages(pick).then(setMsgs).catch(() => {});
    load();
    setBusy(false);
  };

  const cur = chats.find((c) => c.chat_id === pick);
  const unread = chats.reduce((s, c) => s + (c.unread_admin || 0), 0);

  return (
    <div className="flex h-[calc(100vh-60px)] lg:h-screen bg-surface rounded-2xl overflow-hidden border border-line">
      {/* ─── Sidebar ─── */}
      <div className={`${pick ? "hidden md:flex" : "flex"} flex-col w-full md:w-[320px] lg:w-[340px] border-r border-line shrink-0 bg-surface`}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-line flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-md shadow-primary/20">
            <span className="text-white font-bold text-xs">💬</span>
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-sm text-on-surface">Chat Inbox</h2>
            <p className="text-[10px] text-on-surface-2">🔒 Encrypted Messages</p>
          </div>
          {unread > 0 && (
            <span className="w-6 h-6 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">{unread}</span>
          )}
          <button onClick={load} title="Refresh" className="w-8 h-8 rounded-lg bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-on-surface-2 hover:text-on-surface transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {boot ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 rounded-full border-[3px] border-primary/25 border-t-primary animate-spin" />
            </div>
          ) : chats.length === 0 ? (
            <div className="p-8 text-center text-on-surface-2/50">
              <span className="text-4xl block mb-3">💬</span>
              <p className="font-semibold text-sm mb-1">No chats yet</p>
              <p className="text-[11px]">Buyer messages from your store will show here.</p>
            </div>
          ) : (
            chats.map((c) => {
              const active = c.chat_id === pick;
              const hasU = (c.unread_admin || 0) > 0;
              return (
                <button key={c.chat_id} onClick={() => { setPick(c.chat_id); setMsgs([]); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${active ? "bg-primary/10 border-l-[3px] border-primary" : "border-l-[3px] border-transparent hover:bg-surface-2"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${hasU ? "bg-gradient-to-br from-primary to-purple-600 text-white ring-2 ring-primary/30" : "bg-surface-2 text-on-surface-2"}`}>
                    {c.buyer_name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[13px] truncate ${hasU ? "font-bold text-on-surface" : "font-medium text-on-surface/75"}`}>{c.buyer_name}</span>
                      <span className="text-[10px] text-on-surface-2/50 shrink-0">{ago(c.updated_at)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-px">
                      <span className={`text-[11px] truncate ${hasU ? "text-on-surface-2" : "text-on-surface-2/50"}`}>{c.last_message || "—"}</span>
                      {hasU && <span className="w-[18px] h-[18px] rounded-full bg-primary text-[9px] font-bold text-white flex items-center justify-center shrink-0">{c.unread_admin}</span>}
                    </div>
                    <span className="text-[9px] text-on-surface-2/30 mt-0.5 block truncate">{c.buyer_email}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Chat Pane ─── */}
      {pick ? (
        <div className="flex-1 flex flex-col min-w-0 bg-page">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-line bg-surface/60 backdrop-blur-sm shrink-0">
            <button onClick={() => setPick(null)} className="md:hidden w-8 h-8 rounded-lg bg-surface-2 hover:bg-surface-3 flex items-center justify-center cursor-pointer">
              <svg className="w-5 h-5 text-on-surface-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center font-bold text-sm text-white shrink-0">
              {cur?.buyer_name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-on-surface truncate">{cur?.buyer_name || "Buyer"}</p>
              <p className="text-[11px] text-on-surface-2/50 truncate">{cur?.buyer_email}</p>
            </div>
            {cur?.buyer_email && (
              <a href={`mailto:${cur.buyer_email}`} title="Email" className="w-8 h-8 rounded-lg bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-on-surface-2/50 hover:text-on-surface transition-colors shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </a>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-2">
            {msgs.length === 0 && (
              <div className="flex items-center justify-center h-full text-on-surface-2/30 text-sm">
                <div className="w-5 h-5 rounded-full border-2 border-primary/20 border-t-primary animate-spin mr-2" />
                Loading…
              </div>
            )}
            {msgs.map((m, i) => {
              const mine = m.sender === "admin";
              return (
                <div key={m.id ?? i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] sm:max-w-[65%] px-3.5 py-2 text-[13px] leading-relaxed ${mine
                    ? "bg-gradient-to-br from-primary to-purple-600 text-white rounded-2xl rounded-br-md shadow-md shadow-primary/15"
                    : "bg-surface-2 text-on-surface border border-line rounded-2xl rounded-bl-md"}`}>
                    <p className="break-words whitespace-pre-wrap">{m.message}</p>
                    <p className={`text-[9px] mt-1 ${mine ? "text-white/50" : "text-on-surface-2/40"}`}>
                      {mine ? "✓ You" : cur?.buyer_name} · {ago(m.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="px-4 sm:px-5 py-3 border-t border-line bg-surface shrink-0">
            <div className="flex gap-2">
              <input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Type a reply…"
                className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-surface-2 border border-line text-sm text-on-surface placeholder-on-surface-2/40 outline-none focus:border-primary/50 transition-colors" />
              <button onClick={send} disabled={!text.trim() || busy}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white text-sm font-semibold disabled:opacity-30 hover:shadow-lg hover:shadow-primary/20 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer">
                {busy ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>}
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-page">
          <div className="text-center max-w-xs text-on-surface-2/30">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <p className="font-semibold text-sm mb-1">Chat Inbox</p>
            <p className="text-[12px]">Select a conversation to reply.</p>
          </div>
        </div>
      )}
    </div>
  );
}
