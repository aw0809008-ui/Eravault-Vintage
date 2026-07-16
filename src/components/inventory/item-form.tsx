"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Plus, X, Image, Video } from "lucide-react";

const DEFAULT_CATEGORIES = [
  { value: "Jeans", label: "Jeans" },
  { value: "Polo Shirts", label: "Polo Shirts" },
  { value: "Hoodies", label: "Hoodies" },
  { value: "Jackets", label: "Jackets" },
  { value: "Tees", label: "Tees" },
  { value: "Knits", label: "Knits" },
  { value: "Shirts", label: "Shirts" },
  { value: "Pants", label: "Pants" },
  { value: "Shorts", label: "Shorts" },
  { value: "Sweaters", label: "Sweaters" },
  { value: "Outerwear", label: "Outerwear" },
  { value: "Accessories", label: "Accessories" },
  { value: "Footwear", label: "Footwear" },
  { value: "Dresses", label: "Dresses" },
  { value: "Skirts", label: "Skirts" },
  { value: "Others", label: "Others" },
];

const CONDITIONS = [
  { value: "A", label: "Grade A - Excellent" },
  { value: "AB", label: "Grade AB - Very Good" },
  { value: "B", label: "Grade B - Good" },
  { value: "BC", label: "Grade BC - Fair" },
  { value: "C", label: "Grade C - Acceptable" },
  { value: "ABC", label: "Grade ABC - Mixed" },
];

const STATUSES = [
  { value: "Sourced", label: "Sourced" },
  { value: "Active on Fleek", label: "Active on Fleek" },
  { value: "Sold", label: "Sold" },
  { value: "Shipped", label: "Shipped" },
];

export interface ItemFormData {
  id?: string;
  itemName: string;
  category: string;
  size: string;
  condition: string;
  sourcingCost: string;
  sellingPrice: string;
  status: string;
  sourcingDate: string;
  soldDate: string;
  notes: string;
  listingLink: string;
  images: string;
  videos: string;
}

const emptyForm: ItemFormData = {
  itemName: "",
  category: "Tees",
  size: "",
  condition: "B",
  sourcingCost: "",
  sellingPrice: "",
  status: "Sourced",
  sourcingDate: new Date().toISOString().split("T")[0],
  soldDate: "",
  notes: "",
  listingLink: "",
  images: "",
  videos: "",
};

function getCustomCategories(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("eravault_custom_categories");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCustomCategory(category: string): void {
  if (typeof window === "undefined") return;
  const existing = getCustomCategories();
  if (!existing.includes(category)) {
    existing.push(category);
    localStorage.setItem("eravault_custom_categories", JSON.stringify(existing));
  }
}

interface ItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ItemFormData) => Promise<void>;
  initialData?: ItemFormData | null;
}

export function ItemForm({ open, onOpenChange, onSubmit, initialData }: ItemFormProps) {
  const [form, setForm] = useState<ItemFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");

  useEffect(() => {
    const custom = getCustomCategories();
    const customOptions = custom.map(c => ({ value: c, label: c }));
    setCategories([...DEFAULT_CATEGORIES.filter(c => c.value !== "Others"), ...customOptions, { value: "Others", label: "Others" }]);
  }, [open]);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm(emptyForm);
    }
    setErrors({});
    setShowCustomCategory(false);
    setCustomCategoryInput("");
    setNewImageUrl("");
    setNewVideoUrl("");
  }, [initialData, open]);

  const imageList = form.images ? form.images.split(',').filter(Boolean) : [];
  const videoList = form.videos ? form.videos.split(',').filter(Boolean) : [];

  function addImage() {
    if (!newImageUrl.trim()) return;
    const updated = [...imageList, newImageUrl.trim()].join(',');
    setForm(prev => ({ ...prev, images: updated }));
    setNewImageUrl("");
  }

  function removeImage(index: number) {
    const updated = imageList.filter((_, i) => i !== index).join(',');
    setForm(prev => ({ ...prev, images: updated }));
  }

  function addVideo() {
    if (!newVideoUrl.trim()) return;
    const updated = [...videoList, newVideoUrl.trim()].join(',');
    setForm(prev => ({ ...prev, videos: updated }));
    setNewVideoUrl("");
  }

  function removeVideo(index: number) {
    const updated = videoList.filter((_, i) => i !== index).join(',');
    setForm(prev => ({ ...prev, videos: updated }));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.itemName.trim()) errs.itemName = "Required";
    if (!form.size.trim()) errs.size = "Required";
    if (!form.sourcingCost || parseFloat(form.sourcingCost) < 0) errs.sourcingCost = "Required";
    if (!form.sourcingDate) errs.sourcingDate = "Required";
    if ((form.status === "Sold" || form.status === "Shipped") && !form.sellingPrice)
      errs.sellingPrice = "Required for sold items";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }

  function updateField(field: keyof ItemFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function handleAddCustomCategory() {
    const trimmed = customCategoryInput.trim();
    if (trimmed && !categories.find(c => c.value.toLowerCase() === trimmed.toLowerCase())) {
      saveCustomCategory(trimmed);
      setCategories(prev => [...prev.filter(c => c.value !== "Others"), { value: trimmed, label: trimmed }, { value: "Others", label: "Others" }]);
      updateField("category", trimmed);
    }
    setShowCustomCategory(false);
    setCustomCategoryInput("");
  }

  const isEditing = !!initialData?.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Item" : "Add Item"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update item details" : "Add a new piece to your collection"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name *</Label>
            <Input
              id="itemName"
              placeholder="e.g., Vintage Y2K Cargo Pants"
              value={form.itemName}
              onChange={(e) => updateField("itemName", e.target.value)}
            />
            {errors.itemName && <p className="text-xs text-red-500">{errors.itemName}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              {showCustomCategory ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="New category"
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCustomCategory(); }}}
                    autoFocus
                  />
                  <Button type="button" size="icon" onClick={handleAddCustomCategory}><Plus className="w-4 h-4" /></Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select id="category" options={categories} value={form.category} onChange={(e) => updateField("category", e.target.value)} className="flex-1" />
                  <Button type="button" variant="outline" size="icon" onClick={() => setShowCustomCategory(true)}><Plus className="w-4 h-4" /></Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Size *</Label>
              <Input id="size" placeholder="e.g., W32/L30, L" value={form.size} onChange={(e) => updateField("size", e.target.value)} />
              {errors.size && <p className="text-xs text-red-500">{errors.size}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Grade *</Label>
              <Select id="condition" options={CONDITIONS} value={form.condition} onChange={(e) => updateField("condition", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="sourcingCost">Cost (£) *</Label>
              <Input id="sourcingCost" type="number" step="0.01" min="0" placeholder="0.00" value={form.sourcingCost} onChange={(e) => updateField("sourcingCost", e.target.value)} />
              {errors.sourcingCost && <p className="text-xs text-red-500">{errors.sourcingCost}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Price (£)</Label>
              <Input id="sellingPrice" type="number" step="0.01" min="0" placeholder="0.00" value={form.sellingPrice} onChange={(e) => updateField("sellingPrice", e.target.value)} />
              {errors.sellingPrice && <p className="text-xs text-red-500">{errors.sellingPrice}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select id="status" options={STATUSES} value={form.status} onChange={(e) => updateField("status", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="sourcingDate">Sourcing Date *</Label>
              <Input id="sourcingDate" type="date" value={form.sourcingDate} onChange={(e) => updateField("sourcingDate", e.target.value)} />
              {errors.sourcingDate && <p className="text-xs text-red-500">{errors.sourcingDate}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="soldDate">Sold Date</Label>
              <Input id="soldDate" type="date" value={form.soldDate} onChange={(e) => updateField("soldDate", e.target.value)} />
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Image className="w-4 h-4" /> Images
            </Label>
            <div className="flex gap-2">
              <Input 
                placeholder="Paste image URL..." 
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); }}}
              />
              <Button type="button" variant="outline" size="icon" onClick={addImage}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {imageList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {imageList.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border" style={{ borderColor: 'var(--border-primary)' }} />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Upload images to Google Drive/Photos, then paste the shareable link
            </p>
          </div>

          {/* Videos Section */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Video className="w-4 h-4" /> Videos
            </Label>
            <div className="flex gap-2">
              <Input 
                placeholder="Paste video URL (YouTube, etc)..." 
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addVideo(); }}}
              />
              <Button type="button" variant="outline" size="icon" onClick={addVideo}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {videoList.length > 0 && (
              <div className="space-y-1 mt-2">
                {videoList.map((url, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <Video className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <span className="truncate flex-1" style={{ color: 'var(--text-secondary)' }}>{url}</span>
                    <button type="button" onClick={() => removeVideo(i)} className="text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="listingLink">Listing Link</Label>
            <Input id="listingLink" type="url" placeholder="https://..." value={form.listingLink} onChange={(e) => updateField("listingLink", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Add notes..." value={form.notes} onChange={(e) => updateField("notes", e.target.value)} rows={2} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{isEditing ? "Saving..." : "Adding..."}</> : isEditing ? "Save" : "Add Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
