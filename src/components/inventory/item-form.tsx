"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Loader2, Plus, X, Camera, Video, Upload } from "lucide-react";
import { uploadFiles } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";

const CATEGORIES = [
  { value: "Jeans", label: "Jeans" },{ value: "Polo Shirts", label: "Polo Shirts" },
  { value: "Hoodies", label: "Hoodies" },{ value: "Jackets", label: "Jackets" },
  { value: "Tees", label: "Tees" },{ value: "Knits", label: "Knits" },
  { value: "Shirts", label: "Shirts" },{ value: "Pants", label: "Pants" },
  { value: "Shorts", label: "Shorts" },{ value: "Sweaters", label: "Sweaters" },
  { value: "Outerwear", label: "Outerwear" },{ value: "Accessories", label: "Accessories" },
  { value: "Footwear", label: "Footwear" },{ value: "Dresses", label: "Dresses" },
  { value: "Skirts", label: "Skirts" },{ value: "Others", label: "Others" },
];
const CONDITIONS = [
  { value: "A", label: "A - Excellent" },{ value: "AB", label: "AB - Very Good" },
  { value: "B", label: "B - Good" },{ value: "BC", label: "BC - Fair" },
  { value: "C", label: "C - Acceptable" },{ value: "ABC", label: "ABC - Mixed" },
];
const STATUSES = [
  { value: "Sourced", label: "Sourced" },{ value: "Active on Fleek", label: "Active on Fleek" },
  { value: "Sold", label: "Sold" },{ value: "Shipped", label: "Shipped" },
];
const SALE_CHANNELS = [
  { value: "fleek", label: "Fleek (15% commission)" },
  { value: "offline", label: "Offline / Direct Sale" },
];

export interface ItemFormData {
  id?: string; itemName: string; category: string; size: string; condition: string;
  sourcingCost: string; sellingPrice: string; status: string; sourcingDate: string;
  soldDate: string; notes: string; listingLink: string; images: string; videos: string;
  pieces: string; saleChannel: string;
}

const empty: ItemFormData = {
  itemName: "", category: "Tees", size: "", condition: "B", sourcingCost: "", sellingPrice: "",
  status: "Sourced", sourcingDate: new Date().toISOString().split("T")[0], soldDate: "",
  notes: "", listingLink: "", images: "", videos: "", pieces: "1", saleChannel: "fleek",
};

function getCustomCats(): string[] { if (typeof window === "undefined") return []; try { return JSON.parse(localStorage.getItem("ev_cats") || "[]"); } catch { return []; } }
function saveCustomCat(c: string) { if (typeof window === "undefined") return; const e = getCustomCats(); if (!e.includes(c)) { e.push(c); localStorage.setItem("ev_cats", JSON.stringify(e)); } }

interface Props { open: boolean; onOpenChange: (o: boolean) => void; onSubmit: (d: ItemFormData) => Promise<void>; initialData?: ItemFormData | null; }

export function ItemForm({ open, onOpenChange, onSubmit, initialData }: Props) {
  const [form, setForm] = useState<ItemFormData>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCustomCat, setShowCustomCat] = useState(false);
  const [customCat, setCustomCat] = useState("");
  const [cats, setCats] = useState(CATEGORIES);
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const c = getCustomCats().map(c => ({ value: c, label: c }));
    setCats([...CATEGORIES.filter(x => x.value !== "Others"), ...c, { value: "Others", label: "Others" }]);
  }, [open]);

  useEffect(() => {
    setForm(initialData ? { ...empty, ...initialData, pieces: initialData.pieces || "1", saleChannel: initialData.saleChannel || "fleek" } : empty);
    setErrors({}); setShowCustomCat(false); setCustomCat("");
  }, [initialData, open]);

  const imageList = form.images ? form.images.split(',').filter(Boolean) : [];
  const videoList = form.videos ? form.videos.split(',').filter(Boolean) : [];

  // Calculations
  const pieces = parseInt(form.pieces) || 1;
  const pricePerPiece = parseFloat(form.sellingPrice) || 0;
  const costPerPiece = parseFloat(form.sourcingCost) || 0;
  const totalSaleAmount = pricePerPiece * pieces;
  const totalCostAmount = costPerPiece * pieces;
  const fleekCommission = form.saleChannel === "fleek" ? totalSaleAmount * 0.15 : 0;
  const netRevenue = totalSaleAmount - fleekCommission;
  const netProfit = netRevenue - totalCostAmount;

  async function handleFileUpload(files: FileList | null, type: 'images' | 'videos') {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await uploadFiles(Array.from(files), type === 'images' ? 'photos' : 'videos');
      if (uploaded.length > 0) {
        const current = type === 'images' ? imageList : videoList;
        const updated = [...current, ...uploaded].join(',');
        setForm(prev => ({ ...prev, [type]: updated }));
      }
    } catch (e) { console.error('Upload failed:', e); }
    setUploading(false);
  }

  function removeMedia(type: 'images' | 'videos', index: number) {
    const list = type === 'images' ? [...imageList] : [...videoList];
    list.splice(index, 1);
    setForm(prev => ({ ...prev, [type]: list.join(',') }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.itemName.trim()) e.itemName = "Required";
    if (!form.size.trim()) e.size = "Required";
    if (!form.sourcingCost || parseFloat(form.sourcingCost) < 0) e.sourcingCost = "Required";
    if (!form.sourcingDate) e.sourcingDate = "Required";
    if ((form.status === "Sold" || form.status === "Shipped") && !form.sellingPrice) e.sellingPrice = "Required for sold items";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try { await onSubmit(form); onOpenChange(false); }
    catch { /* */ }
    finally { setLoading(false); }
  }

  function uf(f: keyof ItemFormData, v: string) {
    setForm(p => ({ ...p, [f]: v }));
    if (errors[f]) setErrors(p => { const n = { ...p }; delete n[f]; return n; });
  }

  function addCat() {
    const t = customCat.trim();
    if (t && !cats.find(c => c.value.toLowerCase() === t.toLowerCase())) {
      saveCustomCat(t);
      setCats(p => [...p.filter(c => c.value !== "Others"), { value: t, label: t }, { value: "Others", label: "Others" }]);
      uf("category", t);
    }
    setShowCustomCat(false); setCustomCat("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? "Edit Item" : "Add Item"}</DialogTitle>
          <DialogDescription>{initialData?.id ? "Update details" : "Add a new piece"}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label>Item Name *</Label>
            <Input placeholder="e.g. Vintage Y2K Cargo Pants" value={form.itemName} onChange={e => uf("itemName", e.target.value)} className="h-10" />
            {errors.itemName && <p className="text-xs text-red">{errors.itemName}</p>}
          </div>

          {/* Cat, Size, Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Category *</Label>
              {showCustomCat ? (
                <div className="flex gap-2"><Input placeholder="New category" value={customCat} onChange={e => setCustomCat(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCat(); }}} autoFocus className="h-10" /><Button type="button" size="icon" onClick={addCat}><Plus className="w-4 h-4" /></Button></div>
              ) : (
                <div className="flex gap-2"><Select options={cats} value={form.category} onChange={e => uf("category", e.target.value)} className="flex-1" /><Button type="button" variant="outline" size="icon" onClick={() => setShowCustomCat(true)}><Plus className="w-4 h-4" /></Button></div>
              )}
            </div>
            <div className="space-y-1.5"><Label>Size *</Label><Input placeholder="W32/L30, L, M" value={form.size} onChange={e => uf("size", e.target.value)} className="h-10" />{errors.size && <p className="text-xs text-red">{errors.size}</p>}</div>
            <div className="space-y-1.5"><Label>Grade *</Label><Select options={CONDITIONS} value={form.condition} onChange={e => uf("condition", e.target.value)} /></div>
          </div>

          {/* Pieces + Cost per piece + Price per piece */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5"><Label>Pieces</Label><Input type="number" min="1" placeholder="1" value={form.pieces} onChange={e => uf("pieces", e.target.value)} className="h-10" /></div>
            <div className="space-y-1.5"><Label>Cost/Piece (£) *</Label><Input type="number" step="0.01" min="0" placeholder="0.00" value={form.sourcingCost} onChange={e => uf("sourcingCost", e.target.value)} className="h-10" />{errors.sourcingCost && <p className="text-xs text-red">{errors.sourcingCost}</p>}</div>
            <div className="space-y-1.5"><Label>Price/Piece (£)</Label><Input type="number" step="0.01" min="0" placeholder="0.00" value={form.sellingPrice} onChange={e => uf("sellingPrice", e.target.value)} className="h-10" />{errors.sellingPrice && <p className="text-xs text-red">{errors.sellingPrice}</p>}</div>
            <div className="space-y-1.5"><Label>Sell Via</Label><Select options={SALE_CHANNELS} value={form.saleChannel} onChange={e => uf("saleChannel", e.target.value)} /></div>
          </div>

          {/* Profit Calculator */}
          {pricePerPiece > 0 && (
            <div className="bg-surface-2 rounded-xl p-3.5 space-y-2">
              <p className="text-[12px] font-semibold text-on-surface-3 uppercase tracking-wider">Profit Calculator</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px]">
                <div><p className="text-on-surface-3 text-[11px]">Total Sale</p><p className="font-bold text-on-surface">{formatCurrency(totalSaleAmount)}</p><p className="text-[10px] text-on-surface-3">{pieces} × {formatCurrency(pricePerPiece)}</p></div>
                {form.saleChannel === "fleek" && <div><p className="text-on-surface-3 text-[11px]">Fleek 15%</p><p className="font-bold text-red">-{formatCurrency(fleekCommission)}</p></div>}
                <div><p className="text-on-surface-3 text-[11px]">Total Cost</p><p className="font-bold text-on-surface">{formatCurrency(totalCostAmount)}</p><p className="text-[10px] text-on-surface-3">{pieces} × {formatCurrency(costPerPiece)}</p></div>
                <div><p className="text-on-surface-3 text-[11px]">Net Profit</p><p className={`font-bold text-[16px] ${netProfit >= 0 ? "text-green" : "text-red"}`}>{netProfit >= 0 ? "+" : ""}{formatCurrency(netProfit)}</p>
                  {totalCostAmount > 0 && <p className={`text-[10px] font-semibold ${netProfit >= 0 ? "text-green" : "text-red"}`}>{Math.round((netProfit / totalCostAmount) * 100)}% ROI</p>}
                </div>
              </div>
            </div>
          )}

          {/* Status + Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5"><Label>Status *</Label><Select options={STATUSES} value={form.status} onChange={e => uf("status", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Sourcing Date *</Label><DatePicker value={form.sourcingDate} onChange={e => uf("sourcingDate", e.target.value)} placeholder="Select date" /></div>
            <div className="space-y-1.5"><Label>Sold Date</Label><DatePicker value={form.soldDate} onChange={e => uf("soldDate", e.target.value)} placeholder="Select date" /></div>
          </div>

          {/* Photos */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Camera className="w-4 h-4" />Photos</Label>
            <input ref={photoRef} type="file" accept="image/*" multiple capture="environment" className="hidden" onChange={e => handleFileUpload(e.target.files, 'images')} />
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => photoRef.current?.click()} disabled={uploading}>{uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}Camera</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => { if (photoRef.current) { photoRef.current.removeAttribute('capture'); photoRef.current.click(); photoRef.current.setAttribute('capture', 'environment'); }}} disabled={uploading}><Upload className="w-3.5 h-3.5" />Gallery</Button>
            </div>
            {imageList.length > 0 && <div className="flex flex-wrap gap-2 mt-2">{imageList.map((url, i) => (
              <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-line bg-surface-2">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeMedia('images', i)} className="absolute top-1 right-1 w-5 h-5 bg-red text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><X className="w-3 h-3" /></button>
              </div>
            ))}</div>}
          </div>

          {/* Videos */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Video className="w-4 h-4" />Videos</Label>
            <input ref={videoRef} type="file" accept="video/*" multiple capture="environment" className="hidden" onChange={e => handleFileUpload(e.target.files, 'videos')} />
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => videoRef.current?.click()} disabled={uploading}>{uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Video className="w-3.5 h-3.5" />}Record</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => { if (videoRef.current) { videoRef.current.removeAttribute('capture'); videoRef.current.click(); videoRef.current.setAttribute('capture', 'environment'); }}} disabled={uploading}><Upload className="w-3.5 h-3.5" />Gallery</Button>
            </div>
            {videoList.length > 0 && <div className="space-y-2 mt-2">{videoList.map((url, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border border-line bg-surface-2">
                <video src={url} controls className="w-full max-h-40 rounded-xl" />
                <button type="button" onClick={() => removeMedia('videos', i)} className="absolute top-2 right-2 w-6 h-6 bg-red text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}</div>}
          </div>

          {uploading && <div className="flex items-center gap-2 text-[13px] text-primary"><Loader2 className="w-4 h-4 animate-spin" />Uploading...</div>}

          {/* Link & Notes */}
          <div className="space-y-1.5"><Label>Listing Link</Label><Input type="url" placeholder="https://fleek.com/listing/..." value={form.listingLink} onChange={e => uf("listingLink", e.target.value)} className="h-10" /></div>
          <div className="space-y-1.5"><Label>Notes</Label><Textarea placeholder="Condition details, measurements..." value={form.notes} onChange={e => uf("notes", e.target.value)} rows={2} /></div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-line">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{initialData?.id ? "Saving..." : "Adding..."}</> : initialData?.id ? "Save Changes" : "Add Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
