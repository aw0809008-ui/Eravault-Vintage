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
import { Loader2, Plus } from "lucide-react";

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
  { value: "A", label: "A - Excellent/Like New" },
  { value: "AB", label: "AB - Very Good" },
  { value: "B", label: "B - Good" },
  { value: "BC", label: "BC - Fair" },
  { value: "C", label: "C - Acceptable" },
  { value: "ABC", label: "ABC - Mixed Condition" },
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
};

// Get custom categories from localStorage
function getCustomCategories(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("eravauly_custom_categories");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Save custom category to localStorage
function saveCustomCategory(category: string): void {
  if (typeof window === "undefined") return;
  const existing = getCustomCategories();
  if (!existing.includes(category)) {
    existing.push(category);
    localStorage.setItem("eravauly_custom_categories", JSON.stringify(existing));
  }
}

interface ItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ItemFormData) => Promise<void>;
  initialData?: ItemFormData | null;
}

export function ItemForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: ItemFormProps) {
  const [form, setForm] = useState<ItemFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    // Load custom categories
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
  }, [initialData, open]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.itemName.trim()) errs.itemName = "Item name is required";
    if (!form.size.trim()) errs.size = "Size is required";
    if (!form.sourcingCost || parseFloat(form.sourcingCost) < 0)
      errs.sourcingCost = "Valid sourcing cost is required";
    if (!form.sourcingDate) errs.sourcingDate = "Sourcing date is required";
    if (
      (form.status === "Sold" || form.status === "Shipped") &&
      !form.sellingPrice
    )
      errs.sellingPrice = "Selling price required for sold/shipped items";
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
      // error handled upstream
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
      const newCategories = [...categories.filter(c => c.value !== "Others"), { value: trimmed, label: trimmed }, { value: "Others", label: "Others" }];
      setCategories(newCategories);
      updateField("category", trimmed);
    }
    setShowCustomCategory(false);
    setCustomCategoryInput("");
  }

  const isEditing = !!initialData?.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Item" : "Add New Item"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of your vintage item"
              : "Add a new vintage piece to your inventory"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name *</Label>
            <Input
              id="itemName"
              placeholder='e.g., "Vintage Y2K Baggy Cargo Pants"'
              value={form.itemName}
              onChange={(e) => updateField("itemName", e.target.value)}
            />
            {errors.itemName && (
              <p className="text-xs text-red-500">{errors.itemName}</p>
            )}
          </div>

          {/* Row: Category, Size, Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              {showCustomCategory ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="New category name"
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomCategory();
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={handleAddCustomCategory}
                    className="shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select
                    id="category"
                    options={categories}
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowCustomCategory(true)}
                    title="Add custom category"
                    className="shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Size *</Label>
              <Input
                id="size"
                placeholder="e.g., W32/L30, L, M"
                value={form.size}
                onChange={(e) => updateField("size", e.target.value)}
              />
              {errors.size && (
                <p className="text-xs text-red-500">{errors.size}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Grade *</Label>
              <Select
                id="condition"
                options={CONDITIONS}
                value={form.condition}
                onChange={(e) => updateField("condition", e.target.value)}
              />
            </div>
          </div>

          {/* Row: Costs & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sourcingCost">Sourcing Cost ($) *</Label>
              <Input
                id="sourcingCost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.sourcingCost}
                onChange={(e) => updateField("sourcingCost", e.target.value)}
              />
              {errors.sourcingCost && (
                <p className="text-xs text-red-500">{errors.sourcingCost}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price ($)</Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.sellingPrice}
                onChange={(e) => updateField("sellingPrice", e.target.value)}
              />
              {errors.sellingPrice && (
                <p className="text-xs text-red-500">{errors.sellingPrice}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                id="status"
                options={STATUSES}
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
              />
            </div>
          </div>

          {/* Row: Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sourcingDate">Sourcing Date *</Label>
              <Input
                id="sourcingDate"
                type="date"
                value={form.sourcingDate}
                onChange={(e) => updateField("sourcingDate", e.target.value)}
              />
              {errors.sourcingDate && (
                <p className="text-xs text-red-500">{errors.sourcingDate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="soldDate">Sold Date</Label>
              <Input
                id="soldDate"
                type="date"
                value={form.soldDate}
                onChange={(e) => updateField("soldDate", e.target.value)}
              />
            </div>
          </div>

          {/* Listing Link */}
          <div className="space-y-2">
            <Label htmlFor="listingLink">Fleek Listing Link</Label>
            <Input
              id="listingLink"
              type="url"
              placeholder="https://fleek.com/listing/..."
              value={form.listingLink}
              onChange={(e) => updateField("listingLink", e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about the item, condition details, etc."
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditing ? "Updating..." : "Adding..."}
                </>
              ) : isEditing ? (
                "Update Item"
              ) : (
                "Add Item"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
