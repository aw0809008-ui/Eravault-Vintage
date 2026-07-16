"use client";

import { useState } from "react";
import { Share2, MessageCircle, Camera, Copy, Check, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shareWhatsApp, shareInstagram, copyShareText, nativeShare } from "@/lib/share";
import type { InventoryItem } from "@/lib/supabase";

interface Props {
  item: InventoryItem;
  variant?: "icon" | "button";
}

export function ShareMenu({ item, variant = "icon" }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    // Try native share first (mobile)
    const shared = await nativeShare(item);
    if (!shared) setOpen(true);
  }

  async function handleCopy() {
    const ok = await copyShareText(item);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  return (
    <>
      {variant === "icon" ? (
        <button onClick={(e) => { e.stopPropagation(); handleShare(); }} className="p-2 rounded-lg hover:bg-surface-2 text-on-surface-3 cursor-pointer transition-colors" title="Share">
          <Share2 className="w-3.5 h-3.5" />
        </button>
      ) : (
        <Button variant="outline" size="sm" onClick={handleShare}><Share2 className="w-3.5 h-3.5" />Share</Button>
      )}

      {/* Share Modal */}
      {open && (
        <div className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm mx-4 mb-4 sm:mb-0 bg-surface border border-line rounded-2xl p-5 shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-on-surface">Share Listing</h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-surface-2 text-on-surface-3 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            {/* Item preview */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 mb-4">
              {item.images ? (
                <img src={item.images.split(',')[0]} alt="" className="w-12 h-12 rounded-lg object-cover border border-line" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-surface-3 flex items-center justify-center text-on-surface-3">📦</div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-on-surface truncate">{item.itemName}</p>
                <p className="text-[12px] text-on-surface-3">{item.sellingPrice ? `£${item.sellingPrice}` : 'No price'} · {item.size}</p>
              </div>
            </div>

            {/* Share options */}
            <div className="space-y-2">
              <button onClick={() => { shareWhatsApp(item); setOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-2 transition-colors cursor-pointer text-left">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0"><MessageCircle className="w-5 h-5 text-green-500" /></div>
                <div><p className="text-[13px] font-semibold text-on-surface">WhatsApp</p><p className="text-[11px] text-on-surface-3">Share with photo + details</p></div>
              </button>

              <button onClick={() => { shareInstagram(item); setOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-2 transition-colors cursor-pointer text-left">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center shrink-0"><Camera className="w-5 h-5 text-pink-500" /></div>
                <div><p className="text-[13px] font-semibold text-on-surface">Instagram</p><p className="text-[11px] text-on-surface-3">Copy caption with hashtags</p></div>
              </button>

              <button onClick={() => { handleCopy(); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-2 transition-colors cursor-pointer text-left">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-blue-500" />}
                </div>
                <div><p className="text-[13px] font-semibold text-on-surface">{copied ? "Copied!" : "Copy Text"}</p><p className="text-[11px] text-on-surface-3">Copy listing details</p></div>
              </button>

              <button onClick={async () => { await nativeShare(item); setOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-2 transition-colors cursor-pointer text-left">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Send className="w-5 h-5 text-primary" /></div>
                <div><p className="text-[13px] font-semibold text-on-surface">More Options</p><p className="text-[11px] text-on-surface-3">Telegram, Email, etc.</p></div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
