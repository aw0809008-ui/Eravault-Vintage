"use client";

import { useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Play, Package, ExternalLink, Calendar, Tag, Ruler, Star, Share2 } from "lucide-react";
import { StatusBadge, ConditionBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ShareMenu } from "@/components/inventory/share-menu";
import type { InventoryItem } from "@/lib/supabase";

interface Props {
  item: InventoryItem;
  onClose: () => void;
}

export function ItemDetail({ item, onClose }: Props) {
  const allMedia = [
    ...(item.videos ? item.videos.split(',').filter(Boolean).map(u => ({ url: u, type: 'video' as const })) : []),
    ...(item.images ? item.images.split(',').filter(Boolean).map(u => ({ url: u, type: 'image' as const })) : []),
  ];
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const profit = item.sellingPrice && item.sourcingCost
    ? parseFloat(item.sellingPrice) - parseFloat(item.sourcingCost) : null;

  function scrollTo(idx: number) {
    setCurrent(idx);
    scrollRef.current?.children[idx]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  return (
    <div className="fixed inset-0 z-[90] bg-page overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-xl border-b border-line px-4 h-[52px] flex items-center justify-between">
        <button onClick={onClose} className="flex items-center gap-1.5 text-[13px] font-medium text-primary cursor-pointer">
          <ChevronLeft className="w-4 h-4" />Back
        </button>
        <span className="text-[13px] font-semibold text-on-surface truncate max-w-[200px]">{item.itemName}</span>
        <div className="flex items-center gap-1">
          <ShareMenu item={item} />
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-2 text-on-surface-3 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Media Carousel */}
      {allMedia.length > 0 ? (
        <div className="bg-black relative">
          <div ref={scrollRef} className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}
            onScroll={(e) => {
              const el = e.currentTarget;
              const idx = Math.round(el.scrollLeft / el.offsetWidth);
              setCurrent(idx);
            }}>
            {allMedia.map((m, i) => (
              <div key={i} className="w-full shrink-0 snap-center flex items-center justify-center" style={{ minHeight: '300px', maxHeight: '400px' }}>
                {m.type === 'video' ? (
                  <video src={m.url} controls playsInline className="w-full h-full max-h-[400px] object-contain" />
                ) : (
                  <img src={m.url} alt="" className="w-full h-full max-h-[400px] object-contain" />
                )}
              </div>
            ))}
          </div>

          {/* Dots */}
          {allMedia.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {allMedia.map((m, i) => (
                <button key={i} onClick={() => scrollTo(i)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === current ? "bg-white w-5" : "bg-white/40"}`}
                />
              ))}
            </div>
          )}

          {/* Video indicator */}
          {allMedia.length > 0 && allMedia[current]?.type === 'video' && (
            <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-semibold px-2 py-1 rounded-md flex items-center gap-1">
              <Play className="w-3 h-3 fill-white" />VIDEO
            </div>
          )}

          {/* Counter */}
          <div className="absolute top-3 right-3 bg-black/60 text-white text-[11px] font-medium px-2.5 py-1 rounded-md">
            {current + 1}/{allMedia.length}
          </div>

          {/* Arrows (desktop) */}
          {allMedia.length > 1 && <>
            <button onClick={() => scrollTo((current - 1 + allMedia.length) % allMedia.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 rounded-full hidden sm:flex items-center justify-center text-white cursor-pointer"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => scrollTo((current + 1) % allMedia.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 rounded-full hidden sm:flex items-center justify-center text-white cursor-pointer"><ChevronRight className="w-5 h-5" /></button>
          </>}
        </div>
      ) : (
        <div className="bg-surface-2 flex items-center justify-center h-[200px]">
          <Package className="w-12 h-12 text-on-surface-3" />
        </div>
      )}

      {/* Details */}
      <div className="max-w-2xl mx-auto p-5 space-y-5">
        {/* Title + Status */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-[20px] font-bold text-on-surface leading-tight">{item.itemName}</h1>
            <StatusBadge status={item.status} />
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[13px] text-on-surface-2">{item.category}</span>
            <span className="text-on-surface-3">·</span>
            <span className="text-[13px] text-on-surface-2 font-mono">{item.size}</span>
            <span className="text-on-surface-3">·</span>
            <ConditionBadge condition={item.condition} />
          </div>
        </div>

        {/* Price Card */}
        <div className="bg-surface-2 rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[11px] text-on-surface-3 font-medium">Cost</p>
              <p className="text-[18px] font-bold text-on-surface mt-0.5">{formatCurrency(item.sourcingCost)}</p>
            </div>
            <div>
              <p className="text-[11px] text-on-surface-3 font-medium">Selling Price</p>
              <p className="text-[18px] font-bold text-on-surface mt-0.5">{item.sellingPrice ? formatCurrency(item.sellingPrice) : "—"}</p>
            </div>
            <div>
              <p className="text-[11px] text-on-surface-3 font-medium">Profit</p>
              <p className={`text-[18px] font-bold mt-0.5 ${profit !== null ? (profit >= 0 ? "text-green" : "text-red") : "text-on-surface-3"}`}>
                {profit !== null ? `${profit >= 0 ? "+" : ""}${formatCurrency(profit)}` : "—"}
              </p>
              {profit !== null && parseFloat(item.sourcingCost) > 0 && (
                <p className={`text-[11px] font-semibold ${profit >= 0 ? "text-green" : "text-red"}`}>
                  {Math.round((profit / parseFloat(item.sourcingCost)) * 100)}% ROI
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Info List */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 py-2.5 border-b border-line">
            <Calendar className="w-4 h-4 text-on-surface-3 shrink-0" />
            <span className="text-[13px] text-on-surface-2 flex-1">Sourced</span>
            <span className="text-[13px] font-medium text-on-surface">{formatDate(item.sourcingDate)}</span>
          </div>
          {item.soldDate && (
            <div className="flex items-center gap-3 py-2.5 border-b border-line">
              <Tag className="w-4 h-4 text-on-surface-3 shrink-0" />
              <span className="text-[13px] text-on-surface-2 flex-1">Sold</span>
              <span className="text-[13px] font-medium text-on-surface">{formatDate(item.soldDate)}</span>
            </div>
          )}
          <div className="flex items-center gap-3 py-2.5 border-b border-line">
            <Ruler className="w-4 h-4 text-on-surface-3 shrink-0" />
            <span className="text-[13px] text-on-surface-2 flex-1">Size</span>
            <span className="text-[13px] font-mono font-medium text-on-surface">{item.size}</span>
          </div>
          <div className="flex items-center gap-3 py-2.5 border-b border-line">
            <Star className="w-4 h-4 text-on-surface-3 shrink-0" />
            <span className="text-[13px] text-on-surface-2 flex-1">Condition</span>
            <ConditionBadge condition={item.condition} />
          </div>
          {item.listingLink && (
            <a href={item.listingLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 py-2.5 border-b border-line text-primary hover:underline">
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span className="text-[13px] flex-1">View Listing</span>
              <ChevronLeft className="w-4 h-4 rotate-180" />
            </a>
          )}
        </div>

        {/* Notes */}
        {item.notes && (
          <div>
            <p className="text-[12px] text-on-surface-3 font-medium mb-1.5">Notes</p>
            <p className="text-[13px] text-on-surface-2 leading-relaxed bg-surface-2 rounded-xl p-4">{item.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
