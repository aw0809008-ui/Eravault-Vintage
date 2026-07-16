"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Filter, ArrowUpDown, Edit2, Trash2, ExternalLink, Package, X, ChevronDown, ChevronUp, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, ConditionBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ItemForm, type ItemFormData } from "@/components/inventory/item-form";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, type InventoryItem } from "@/lib/supabase";

type SortField = "itemName" | "category" | "sourcingCost" | "sellingPrice" | "status" | "sourcingDate";
type SortDir = "asc" | "desc";

const CATEGORY_OPTIONS = [{ value: "Jeans", label: "Jeans" }, { value: "Polo Shirts", label: "Polo Shirts" }, { value: "Hoodies", label: "Hoodies" }, { value: "Jackets", label: "Jackets" }, { value: "Tees", label: "Tees" }, { value: "Knits", label: "Knits" }, { value: "Shirts", label: "Shirts" }, { value: "Pants", label: "Pants" }, { value: "Others", label: "Others" }];
const CONDITION_OPTIONS = [{ value: "A", label: "A" }, { value: "AB", label: "AB" }, { value: "B", label: "B" }, { value: "BC", label: "BC" }, { value: "C", label: "C" }];

export default function InventoryPage() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>("sourcingDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemFormData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState("");

  const fetchItems = useCallback(async () => {
    const data = await getInventory();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { if (searchParams.get("add") === "true") setFormOpen(true); }, [searchParams]);

  const filteredAndSorted = useMemo(() => {
    let result = [...items];
    if (search) { const q = search.toLowerCase(); result = result.filter(item => item.itemName.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.size.toLowerCase().includes(q)); }
    if (statusFilter) result = result.filter(item => item.status === statusFilter);
    if (categoryFilter) result = result.filter(item => item.category === categoryFilter);
    if (conditionFilter) result = result.filter(item => item.condition === conditionFilter);
    result.sort((a, b) => {
      let aV: string | number = "", bV: string | number = "";
      switch (sortField) { case "itemName": aV = a.itemName.toLowerCase(); bV = b.itemName.toLowerCase(); break; case "category": aV = a.category; bV = b.category; break; case "sourcingCost": aV = parseFloat(a.sourcingCost||"0"); bV = parseFloat(b.sourcingCost||"0"); break; case "sellingPrice": aV = parseFloat(a.sellingPrice||"0"); bV = parseFloat(b.sellingPrice||"0"); break; case "status": aV = a.status; bV = b.status; break; case "sourcingDate": aV = new Date(a.sourcingDate).getTime(); bV = new Date(b.sourcingDate).getTime(); break; }
      if (aV < bV) return sortDir === "asc" ? -1 : 1; if (aV > bV) return sortDir === "asc" ? 1 : -1; return 0;
    });
    return result;
  }, [items, search, statusFilter, categoryFilter, conditionFilter, sortField, sortDir]);

  function toggleSort(f: SortField) { if (sortField === f) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortField(f); setSortDir("asc"); } }
  function SortIcon({ field }: { field: SortField }) { if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />; return sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />; }

  async function handleAddOrEdit(data: ItemFormData) {
    if (data.id) {
      const updated = await updateInventoryItem(data.id, data);
      if (updated) setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
    } else {
      const newItem = await addInventoryItem(data);
      if (newItem) setItems(prev => [newItem, ...prev]);
    }
    setEditingItem(null);
  }

  async function handleDelete() {
    if (!deletingId) return;
    const ok = await deleteInventoryItem(deletingId);
    if (ok) setItems(prev => prev.filter(i => i.id !== deletingId));
    setDeleteDialogOpen(false); setDeletingId(null);
  }

  function openEdit(item: InventoryItem) {
    setEditingItem({ id: item.id, itemName: item.itemName, category: item.category, size: item.size, condition: item.condition, sourcingCost: item.sourcingCost, sellingPrice: item.sellingPrice || "", status: item.status, sourcingDate: item.sourcingDate ? item.sourcingDate.split("T")[0] : "", soldDate: item.soldDate ? item.soldDate.split("T")[0] : "", notes: item.notes || "", listingLink: item.listingLink || "", images: item.images || "", videos: item.videos || "" });
    setFormOpen(true);
  }

  const activeFilters = (statusFilter ? 1 : 0) + (categoryFilter ? 1 : 0) + (conditionFilter ? 1 : 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Inventory</h1><p className="mt-1" style={{ color: 'var(--text-muted)' }}>{items.length} items</p></div>
        <Button onClick={() => { setEditingItem(null); setFormOpen(true); }}><Plus className="w-4 h-4" />Add Item</Button>
      </div>

      <Card><CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} /><Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="relative"><Filter className="w-4 h-4" />Filters{activeFilters > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{activeFilters}</span>}</Button>
        </div>
        {showFilters && <div className="mt-4 flex flex-col sm:flex-row gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <Select options={[{ value: "Sourced", label: "Sourced" }, { value: "Active on Fleek", label: "Active" }, { value: "Sold", label: "Sold" }, { value: "Shipped", label: "Shipped" }]} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} placeholder="Status" className="flex-1" />
          <Select options={CATEGORY_OPTIONS} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} placeholder="Category" className="flex-1" />
          <Select options={CONDITION_OPTIONS} value={conditionFilter} onChange={e => setConditionFilter(e.target.value)} placeholder="Grade" className="flex-1" />
          {activeFilters > 0 && <Button variant="ghost" size="sm" onClick={() => { setStatusFilter(""); setCategoryFilter(""); setConditionFilter(""); }}><X className="w-3 h-3" />Clear</Button>}
        </div>}
      </CardContent></Card>

      {loading ? <Card><CardContent className="p-0">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex items-center gap-4 p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}><Skeleton className="h-10 w-10 rounded-lg" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-24" /></div><Skeleton className="h-6 w-16 rounded-full" /></div>)}</CardContent></Card>
      : filteredAndSorted.length === 0 ? <Card><CardContent className="py-16 text-center"><Package className="w-14 h-14 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} /><p className="font-medium" style={{ color: 'var(--text-secondary)' }}>{items.length === 0 ? "Add your first item" : "No matching items"}</p>{items.length === 0 && <Button onClick={() => { setEditingItem(null); setFormOpen(true); }} className="mt-4"><Plus className="w-4 h-4" />Add Item</Button>}</CardContent></Card>
      : (
        <>
          <Card className="hidden md:block overflow-hidden"><div className="overflow-x-auto"><table className="w-full">
            <thead><tr className="border-b" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
              <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}><button onClick={() => toggleSort("itemName")} className="flex items-center gap-1 cursor-pointer">Item <SortIcon field="itemName" /></button></th>
              <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Category</th>
              <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Size</th>
              <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Grade</th>
              <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}><button onClick={() => toggleSort("sourcingCost")} className="flex items-center gap-1 cursor-pointer">Cost <SortIcon field="sourcingCost" /></button></th>
              <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}><button onClick={() => toggleSort("sellingPrice")} className="flex items-center gap-1 cursor-pointer">Price <SortIcon field="sellingPrice" /></button></th>
              <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Actions</th>
            </tr></thead>
            <tbody>{filteredAndSorted.map(item => {
              const imgCount = item.images ? item.images.split(',').filter(Boolean).length : 0;
              const profit = item.sellingPrice && item.sourcingCost ? parseFloat(item.sellingPrice) - parseFloat(item.sourcingCost) : null;
              return <tr key={item.id} className="border-b hover:bg-[--bg-hover] transition-colors" style={{ borderColor: 'var(--border-primary)' }}>
                <td className="px-4 py-3"><div className="flex items-center gap-3">
                  {imgCount > 0 ? <img src={item.images.split(',')[0]} alt="" className="w-10 h-10 rounded-lg object-cover border" style={{ borderColor: 'var(--border-primary)' }} /> : <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}><Package className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></div>}
                  <div><p className="text-sm font-medium truncate max-w-[180px]" style={{ color: 'var(--text-primary)' }}>{item.itemName}</p>{imgCount > 0 && <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><Image className="w-3 h-3" />{imgCount}</span>}</div>
                </div></td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{item.category}</td>
                <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{item.size}</td>
                <td className="px-4 py-3"><ConditionBadge condition={item.condition} /></td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(item.sourcingCost)}</td>
                <td className="px-4 py-3"><span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.sellingPrice ? formatCurrency(item.sellingPrice) : "—"}</span>{profit !== null && <span className={`block text-xs ${profit >= 0 ? "text-green-500" : "text-red-500"}`}>{profit >= 0 ? "+" : ""}{formatCurrency(profit)}</span>}</td>
                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                  {item.listingLink && <a href={item.listingLink} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-[--bg-hover]"><ExternalLink className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></a>}
                  <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-[--bg-hover] cursor-pointer"><Edit2 className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></button>
                  <button onClick={() => { setDeletingId(item.id); setDeletingName(item.itemName); setDeleteDialogOpen(true); }} className="p-2 rounded-lg hover:bg-red-500/10 cursor-pointer"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div></td>
              </tr>;
            })}</tbody>
          </table></div></Card>

          <div className="md:hidden space-y-3">{filteredAndSorted.map(item => {
            const imgCount = item.images ? item.images.split(',').filter(Boolean).length : 0;
            const profit = item.sellingPrice && item.sourcingCost ? parseFloat(item.sellingPrice) - parseFloat(item.sourcingCost) : null;
            return <Card key={item.id}><CardContent className="p-4">
              <div className="flex items-start gap-3">
                {imgCount > 0 ? <img src={item.images.split(',')[0]} alt="" className="w-14 h-14 rounded-lg object-cover border flex-shrink-0" style={{ borderColor: 'var(--border-primary)' }} /> : <div className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--bg-tertiary)' }}><Package className="w-6 h-6" style={{ color: 'var(--text-muted)' }} /></div>}
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.itemName}</p><p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{item.category} · {item.size} · <ConditionBadge condition={item.condition} /></p>
                  <div className="flex items-center gap-3 mt-2"><span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(item.sourcingCost)}</span><span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.sellingPrice ? formatCurrency(item.sellingPrice) : "—"}</span>{profit !== null && <span className={`text-xs font-medium ${profit >= 0 ? "text-green-500" : "text-red-500"}`}>{profit >= 0 ? "+" : ""}{formatCurrency(profit)}</span>}</div>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <div className="flex justify-end gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-primary)' }}><Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Edit2 className="w-3 h-3" />Edit</Button><Button variant="ghost" size="sm" className="text-red-500" onClick={() => { setDeletingId(item.id); setDeletingName(item.itemName); setDeleteDialogOpen(true); }}><Trash2 className="w-3 h-3" /></Button></div>
            </CardContent></Card>;
          })}</div>
        </>
      )}

      <ItemForm open={formOpen} onOpenChange={open => { setFormOpen(open); if (!open) setEditingItem(null); }} onSubmit={handleAddOrEdit} initialData={editingItem} />
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Delete</DialogTitle><DialogDescription>Delete &quot;{deletingName}&quot;?</DialogDescription></DialogHeader><div className="flex justify-end gap-3 mt-4"><Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></div></DialogContent></Dialog>
    </div>
  );
}
