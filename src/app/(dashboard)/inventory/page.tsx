"use client";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Filter, Edit2, Trash2, Package, X, ImageIcon, Play, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, ConditionBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ItemForm, type ItemFormData } from "@/components/inventory/item-form";
import { ItemDetail } from "@/components/inventory/item-detail";
import { ShareMenu } from "@/components/inventory/share-menu";
import { formatCurrency, profitPercent } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, type InventoryItem } from "@/lib/supabase";

type SF = "itemName"|"category"|"sourcingCost"|"sellingPrice"|"status"|"sourcingDate";
type SD = "asc"|"desc";

export default function InventoryPage() {
  const sp = useSearchParams();
  const addHandled = useRef(false);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(""); const [stFilt, setStFilt] = useState(""); const [catFilt, setCatFilt] = useState(""); const [conFilt, setConFilt] = useState("");
  const [showFilt, setShowFilt] = useState(false);
  const [sf, setSf] = useState<SF>("sourcingDate"); const [sd, setSd] = useState<SD>("desc");
  const [formOpen, setFormOpen] = useState(false); const [editItem, setEditItem] = useState<ItemFormData | null>(null);
  const [delOpen, setDelOpen] = useState(false); const [delId, setDelId] = useState<string | null>(null); const [delName, setDelName] = useState("");
  const [viewItem, setViewItem] = useState<InventoryItem | null>(null);

  const fetchData = useCallback(async () => { setItems(await getInventory()); setLoading(false); }, []);
  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (sp.get("add") === "true" && !addHandled.current) { addHandled.current = true; setFormOpen(true); window.history.replaceState({}, '', '/inventory'); } }, [sp]);

  const filtered = useMemo(() => {
    let r = [...items];
    if (search) { const q = search.toLowerCase(); r = r.filter(i => i.itemName.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) || i.size.toLowerCase().includes(q)); }
    if (stFilt) r = r.filter(i => i.status === stFilt);
    if (catFilt) r = r.filter(i => i.category === catFilt);
    if (conFilt) r = r.filter(i => i.condition === conFilt);
    r.sort((a, b) => {
      let av: string|number = "", bv: string|number = "";
      switch (sf) { case "itemName": av=a.itemName.toLowerCase();bv=b.itemName.toLowerCase();break; case "category": av=a.category;bv=b.category;break; case "sourcingCost": av=parseFloat(a.sourcingCost||"0");bv=parseFloat(b.sourcingCost||"0");break; case "sellingPrice": av=parseFloat(a.sellingPrice||"0");bv=parseFloat(b.sellingPrice||"0");break; case "status": av=a.status;bv=b.status;break; case "sourcingDate": av=new Date(a.sourcingDate).getTime();bv=new Date(b.sourcingDate).getTime();break; }
      return av < bv ? (sd==="asc"?-1:1) : av > bv ? (sd==="asc"?1:-1) : 0;
    });
    return r;
  }, [items, search, stFilt, catFilt, conFilt, sf, sd]);

  function toggleSort(f: SF) { if (sf === f) setSd(d => d==="asc"?"desc":"asc"); else { setSf(f); setSd("asc"); } }
  function SI({ field }: { field: SF }) { return sf !== field ? <ArrowUpDown className="w-3 h-3 opacity-30" /> : sd==="asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />; }

  async function handleSubmit(d: ItemFormData) {
    if (d.id) { const u = await updateInventoryItem(d.id, d); if (u) setItems(p => p.map(i => i.id===u.id?u:i)); }
    else { const n = await addInventoryItem(d); if (n) setItems(p => [n,...p]); }
    setEditItem(null);
  }
  async function handleDelete() { if (!delId) return; if (await deleteInventoryItem(delId)) setItems(p => p.filter(i => i.id!==delId)); setDelOpen(false); }

  function openEdit(e: React.MouseEvent, item: InventoryItem) {
    e.stopPropagation();
    setEditItem({ id:item.id, itemName:item.itemName, category:item.category, size:item.size, condition:item.condition, sourcingCost:item.sourcingCost, sellingPrice:item.sellingPrice||"", status:item.status, sourcingDate:item.sourcingDate?item.sourcingDate.split("T")[0]:"", soldDate:item.soldDate?item.soldDate.split("T")[0]:"", notes:item.notes||"", listingLink:item.listingLink||"", images:item.images||"", videos:item.videos||"", pieces: "1", saleChannel: "fleek" });
    setFormOpen(true);
  }

  const af = (stFilt?1:0)+(catFilt?1:0)+(conFilt?1:0);

  // If viewing item detail
  if (viewItem) {
    return <ItemDetail item={viewItem} onClose={() => setViewItem(null)} />;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-on-surface tracking-tight">Inventory</h1>
          <p className="text-[13px] text-on-surface-3 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => { setEditItem(null); setFormOpen(true); }}><Plus className="w-4 h-4" />Add Item</Button>
      </div>

      <Card><CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-3" /><Input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-10" /></div>
          <div className="flex gap-2">
            <Select options={[{value:"sourcingDate",label:"Date"},{value:"itemName",label:"Name"},{value:"sourcingCost",label:"Cost"},{value:"sellingPrice",label:"Price"}]} value={sf} onChange={e => setSf(e.target.value as SF)} className="w-24" />
            <Button variant="outline" size="icon" onClick={() => setSd(d => d==="asc"?"desc":"asc")}><SI field={sf} /></Button>
            <Button variant="outline" onClick={() => setShowFilt(!showFilt)} className="relative"><Filter className="w-4 h-4" />{af>0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center">{af}</span>}</Button>
          </div>
        </div>
        {showFilt && <div className="mt-3 flex flex-col sm:flex-row gap-3 pt-3 border-t border-line">
          <Select options={[{value:"Sourced",label:"Sourced"},{value:"Active on Fleek",label:"Active"},{value:"Sold",label:"Sold"},{value:"Shipped",label:"Shipped"}]} value={stFilt} onChange={e => setStFilt(e.target.value)} placeholder="All Status" className="flex-1" />
          <Select options={[{value:"Jeans",label:"Jeans"},{value:"Polo Shirts",label:"Polos"},{value:"Hoodies",label:"Hoodies"},{value:"Jackets",label:"Jackets"},{value:"Tees",label:"Tees"},{value:"Pants",label:"Pants"},{value:"Others",label:"Others"}]} value={catFilt} onChange={e => setCatFilt(e.target.value)} placeholder="All Categories" className="flex-1" />
          <Select options={[{value:"A",label:"Grade A"},{value:"AB",label:"AB"},{value:"B",label:"B"},{value:"BC",label:"BC"},{value:"C",label:"C"}]} value={conFilt} onChange={e => setConFilt(e.target.value)} placeholder="All Grades" className="flex-1" />
          {af>0 && <Button variant="ghost" size="sm" onClick={() => { setStFilt(""); setCatFilt(""); setConFilt(""); }}><X className="w-3.5 h-3.5" /></Button>}
        </div>}
      </CardContent></Card>

      {loading ? <div className="space-y-3">{[1,2,3,4].map(i => <Card key={i}><CardContent className="p-4"><div className="flex gap-3.5"><Skeleton className="w-[72px] h-[72px] rounded-xl shrink-0" /><div className="flex-1 space-y-2.5"><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-32" /><Skeleton className="h-3 w-24" /></div></div></CardContent></Card>)}</div>
      : filtered.length === 0 ? (
        <Card><CardContent className="py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-5"><Package className="w-7 h-7 text-on-surface-3" /></div>
          <h3 className="text-[16px] font-semibold text-on-surface">{items.length === 0 ? "Your inventory is empty" : "No items match"}</h3>
          <p className="text-[13px] text-on-surface-3 mt-1.5">{items.length === 0 ? "Add your first vintage piece" : "Try different filters"}</p>
          {items.length === 0 && <Button onClick={() => { setEditItem(null); setFormOpen(true); }} className="mt-5"><Plus className="w-4 h-4" />Add First Item</Button>}
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const imgs = item.images ? item.images.split(',').filter(Boolean) : [];
            const vids = item.videos ? item.videos.split(',').filter(Boolean) : [];
            const mediaCount = imgs.length + vids.length;
            const thumb = imgs[0] || null;
            const profit = item.sellingPrice && item.sourcingCost ? parseFloat(item.sellingPrice) - parseFloat(item.sourcingCost) : null;

            return (
              <Card key={item.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setViewItem(item)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3.5">
                    {/* Thumbnail */}
                    {thumb ? (
                      <div className="w-[72px] h-[72px] rounded-xl overflow-hidden border border-line shrink-0">
                        <img src={thumb} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : vids.length > 0 ? (
                      <div className="w-[72px] h-[72px] rounded-xl overflow-hidden border border-line shrink-0 relative bg-black">
                        <video src={vids[0]} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Play className="w-5 h-5 text-white fill-white" /></div>
                      </div>
                    ) : (
                      <div className="w-[72px] h-[72px] rounded-xl bg-surface-2 flex items-center justify-center shrink-0"><Package className="w-7 h-7 text-on-surface-3" /></div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[15px] font-semibold text-on-surface leading-snug">{item.itemName}</p>
                        <StatusBadge status={item.status} />
                      </div>

                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className="text-[12px] text-on-surface-2">{item.category}</span>
                        <span className="text-on-surface-3 text-[10px]">•</span>
                        <span className="text-[12px] text-on-surface-2 font-mono">{item.size}</span>
                        <span className="text-on-surface-3 text-[10px]">•</span>
                        <ConditionBadge condition={item.condition} />
                        {mediaCount > 0 && <><span className="text-on-surface-3 text-[10px]">•</span><span className="text-[11px] text-on-surface-3 flex items-center gap-0.5">{vids.length > 0 && <Play className="w-3 h-3" />}<ImageIcon className="w-3 h-3" />{mediaCount}</span></>}
                      </div>

                        <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center gap-3 text-[13px]">
                          <span className="font-semibold text-on-surface">{item.sellingPrice ? formatCurrency(item.sellingPrice) : formatCurrency(item.sourcingCost)}</span>
                          {profit !== null && <span className={`font-bold text-[12px] ${profit >= 0 ? "text-green" : "text-red"}`}>{profit >= 0 ? "+" : ""}{formatCurrency(profit)}</span>}
                          {(() => { const pct = profitPercent(item.sourcingCost, item.sellingPrice); return pct !== null ? <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${pct >= 0 ? "bg-green/10 text-green" : "bg-red/10 text-red"}`}>{pct >= 0 ? "+" : ""}{pct}%</span> : null; })()}
                        </div>
                        <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                          <ShareMenu item={item} />
                          <button onClick={(e) => openEdit(e, item)} className="p-2 rounded-lg hover:bg-surface-2 text-on-surface-3 cursor-pointer transition-colors" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={(e) => { e.stopPropagation(); setDelId(item.id); setDelName(item.itemName); setDelOpen(true); }} className="p-2 rounded-lg hover:bg-red/10 text-red cursor-pointer transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ItemForm open={formOpen} onOpenChange={o => { setFormOpen(o); if (!o) setEditItem(null); }} onSubmit={handleSubmit} initialData={editItem} />
      <Dialog open={delOpen} onOpenChange={setDelOpen}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Delete Item</DialogTitle><DialogDescription>Delete &quot;{delName}&quot;? Can&apos;t be undone.</DialogDescription></DialogHeader><div className="flex justify-end gap-3 mt-4"><Button variant="outline" onClick={() => setDelOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></div></DialogContent></Dialog>
    </div>
  );
}
