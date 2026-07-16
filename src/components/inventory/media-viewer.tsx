"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { isVideo } from "@/lib/storage";

interface MediaViewerProps {
  urls: string[];
  onClose: () => void;
}

export function MediaViewer({ urls, onClose }: MediaViewerProps) {
  const [current, setCurrent] = useState(0);
  if (urls.length === 0) return null;

  const url = urls[current];
  const video = isVideo(url);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <div className="relative max-w-4xl w-full mx-4" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button onClick={onClose} className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white cursor-pointer transition-colors z-10">
          <X className="w-5 h-5" />
        </button>

        {/* Media */}
        <div className="rounded-2xl overflow-hidden bg-black">
          {video ? (
            <video src={url} controls autoPlay className="w-full max-h-[80vh] mx-auto" />
          ) : (
            <img src={url} alt="" className="w-full max-h-[80vh] object-contain mx-auto" />
          )}
        </div>

        {/* Navigation */}
        {urls.length > 1 && (
          <>
            <button onClick={() => setCurrent(p => (p - 1 + urls.length) % urls.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white cursor-pointer transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setCurrent(p => (p + 1) % urls.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white cursor-pointer transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="flex justify-center gap-1.5 mt-4">
              {urls.map((u, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${i === current ? "bg-white" : "bg-white/30"}`}
                />
              ))}
            </div>
          </>
        )}

        <p className="text-center text-white/50 text-xs mt-3">{current + 1} / {urls.length}</p>
      </div>
    </div>
  );
}

// Thumbnail grid for inventory items
export function MediaThumbnails({ images, videos, onClick }: { images: string; videos: string; onClick: () => void }) {
  const imgList = images ? images.split(',').filter(Boolean) : [];
  const vidList = videos ? videos.split(',').filter(Boolean) : [];
  const total = imgList.length + vidList.length;

  if (total === 0) return null;

  return (
    <div className="flex gap-1.5 mt-2 cursor-pointer" onClick={onClick}>
      {imgList.slice(0, 3).map((url, i) => (
        <div key={`img-${i}`} className="w-12 h-12 rounded-lg overflow-hidden border border-line bg-surface-2 shrink-0">
          <img src={url} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
      {vidList.slice(0, 1).map((url, i) => (
        <div key={`vid-${i}`} className="w-12 h-12 rounded-lg overflow-hidden border border-line bg-surface-2 shrink-0 relative">
          <video src={url} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Play className="w-4 h-4 text-white fill-white" />
          </div>
        </div>
      ))}
      {total > 4 && (
        <div className="w-12 h-12 rounded-lg border border-line bg-surface-2 shrink-0 flex items-center justify-center text-[11px] font-semibold text-on-surface-3">
          +{total - 4}
        </div>
      )}
    </div>
  );
}
