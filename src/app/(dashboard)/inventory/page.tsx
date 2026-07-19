"use client";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Filter, Edit2, Trash2, Package, X, ImageIcon, Play, ArrowUpDown, ChevronUp, ChevronDown, Eye, TrendingUp, TrendingDown, LayoutGrid, List, Globe } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"list"|"grid">("list");

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
    setEditItem({ id:item.id, itemName:item.itemName, category:item.category, size:item.size, condition:item.condition, sourcingCost:item.sourcingCost, sellingPrice:item.sellingPrice||"", status:item.status, sourcingDate:item.sourcingDate?item.sourcingDate.split("T")[0]:"", soldDate:item.soldDate?item.soldDate.split("T")[0]:"", notes:item.notes||"", listingLink:item.listingLink||"", images:item.images||"", videos:item.videos||"", pieces:item.pieces||"1", saleChannel:item.saleChannel||"fleek", showOnWebsite:item.showOnWebsite??false });
    setFormOpen(true);
  }

  const af = (stFilt?1:0)+(catFilt?1:0)+(conFilt?1:0);
  const totalItems = items.length;
  const totalValue = items.reduce((s, i) => s + ((parseFloat(i.sellingPrice)||0) * (parseInt(i.pieces)||1)), 0);
  const activeItems = items.filter(i => i.status === "Active on Fleek").length;
  const soldItems = items.filter(i => i.status === "Sold" || i.status === "Shipped").length;

  if (viewItem) {
    return <ItemDetail item={viewItem} onClose={() => setViewItem(null)} />;
  }

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">
      {/* ── HEADER ── */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[20px] sm:text-[28px] font-bold text-on-surface tracking-tight">Inventory</h1>
            <p className="text-[12px] sm:text-[13px] text-on-surface-3 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''} in your vault</p>
          </div>
          <Button onClick={() => { setEditItem(null); setFormOpen(true); }} className="shrink-0"><Plus className="w-4 h-4" /><span className="hidden sm:inline">Add Item</span><span className="sm:hidden">Add</span></Button>
        </div>

        {/* ── QUICK STATS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: "Total", value: totalItems, icon: Package, color: "text-primary" },
            { label: "Value", value: formatCurrency(totalValue), icon: TrendingUp, color: "text-green" },
            { label: "Active", value: activeItems, icon: Eye, color: "text-blue" },
            { label: "Sold", value: soldItems, icon: TrendingDown, color: "text-orange" },
          ].map((s, i) => (
            <div key={i} className="bg-surface rounded-xl sm:rounded-2xl border border-line p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-surface-2 flex items-center justify-center shrink-0 ${s.color}`}>
                <s.icon className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] text-on-surface-3 leading-tight">{s.label}</p>
                <p className="text-[14px] sm:text-[17px] font-bold text-on-surface leading-tight mt-0.5 truncate">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SEARCH + FILTERS ── */}
      <Card><CardContent className="p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-0"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-3" /><Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 sm:pl-10 h-10 sm:h-11 text-[13px]" /></div>
          <div className="flex gap-1.5 sm:gap-2 shrink-0">
            <Select options={[{value:"sourcingDate",label:"Date"},{value:"itemName",label:"Name"},{value:"sourcingCost",label:"Cost"},{value:"sellingPrice",label:"Price"}]} value={sf} onChange={e => setSf(e.target.value as SF)} className="w-[70px] sm:w-24 text-[12px]" />
            <Button variant="outline" size="icon" onClick={() => setSd(d => d==="asc"?"desc":"asc")} className="shrink-0 w-10 h-10 sm:h-11"><SI field={sf} /></Button>
            <Button variant="outline" onClick={() => setShowFilt(!showFilt)} className="relative shrink-0 w-10 h-10 sm:h-auto sm:w-auto sm:px-3"><Filter className="w-4 h-4" />{af>0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-primary text-white text-[9px] sm:text-[10px] rounded-full flex items-center justify-center font-bold">{af}</span>}</Button>
            <div className="hidden sm:flex border border-line rounded-xl overflow-hidden">
              <button onClick={() => setViewMode("list")} className={`p-2.5 transition-colors cursor-pointer ${viewMode==="list" ? "bg-primary/10 text-primary" : "text-on-surface-3 hover:bg-surface-2"}`}><List className="w-4 h-4" /></button>
              <button onClick={() => setViewMode("grid")} className={`p-2.5 transition-colors cursor-pointer ${viewMode==="grid" ? "bg-primary/10 text-primary" : "text-on-surface-3 hover:bg-surface-2"}`}><LayoutGrid className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
        {showFilt && <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-3 pt-3 border-t border-line">
          <Select options={[{value:"Sourced",label:"Sourced"},{value:"Active on Fleek",label:"Active"},{value:"Sold",label:"Sold"},{value:"Shipped",label:"Shipped"}]} value={stFilt} onChange={e => setStFilt(e.target.value)} placeholder="All Status" className="flex-1" />
          <Select options={[{value:"Jeans",label:"Jeans"},{value:"Polo Shirts",label:"Polos"},{value:"Hoodies",label:"Hoodies"},{value:"Jackets",label:"Jackets"},{value:"Tees",label:"Tees"},{value:"Pants",label:"Pants"},{value:"Others",label:"Others"}]} value={catFilt} onChange={e => setCatFilt(e.target.value)} placeholder="All Categories" className="flex-1" />
          <Select options={[{value:"A",label:"Grade A"},{value:"AB",label:"AB"},{value:"B",label:"B"},{value:"BC",label:"BC"},{value:"C",label:"C"}]} value={conFilt} onChange={e => setConFilt(e.target.value)} placeholder="All Grades" className="flex-1" />
          {af>0 && <Button variant="ghost" size="sm" onClick={() => { setStFilt(""); setCatFilt(""); setConFilt(""); }}><X className="w-3.5 h-3.5" /></Button>}
        </div>}
      </CardContent></Card>

      {/* ── RESULTS ── */}
      {loading ? <div className={viewMode==="grid" ? "grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3" : "space-y-2 sm:space-y-3"}>{[1,2,3,4].map(i => <Card key={i}><CardContent className="p-3 sm:p-4"><div className="flex gap-3"><Skeleton className="w-[56px] h-[56px] sm:w-[72px] sm:h-[72px] rounded-xl shrink-0" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /><Skeleton className="h-3 w-1/3" /></div></div></CardContent></Card>)}</div>
      : filtered.length === 0 ? (
        <Card><CardContent className="py-16 sm:py-20 text-center px-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-4 sm:mb-5"><Package className="w-7 h-7 sm:w-8 sm:h-8 text-on-surface-3" /></div>
          <h3 className="text-[15px] sm:text-[18px] font-bold text-on-surface">{items.length === 0 ? "Your inventory is empty" : "No items match"}</h3>
          <p className="text-[12px] sm:text-[13px] text-on-surface-3 mt-1.5 max-w-xs mx-auto">{items.length === 0 ? "Start building your vintage vault" : "Try adjusting your search or filters"}</p>
          {items.length === 0 && <Button onClick={() => { setEditItem(null); setFormOpen(true); }} className="mt-4 sm:mt-5"><Plus className="w-4 h-4" />Add First Item</Button>}
        </CardContent></Card>
      ) : viewMode === "grid" ? (
        /* ── GRID VIEW ── */
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {filtered.map(item => {
            const imgs = item.images ? item.images.split(',').filter(Boolean) : [];
            const thumb = imgs[0] || null;
            const pcs = parseInt(item.pieces) || 1;
            const totalPrice = (parseFloat(item.sellingPrice) || 0) * pcs;
            const totalCost = (parseFloat(item.sourcingCost) || 0) * pcs;

            return (
              <Card key={item.id} className="cursor-pointer hover:border-primary/30 transition-all group overflow-hidden" onClick={() => setViewItem(item)}>
                <div className="aspect-[4/3] sm:aspect-square bg-surface-2 relative overflow-hidden">
                  {thumb ? (
                    <img src={thumb} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 sm:w-10 sm:h-10 text-on-surface-3/30" /></div>
                  )}
                  <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 scale-[0.85] sm:scale-100 origin-top-left"><StatusBadge status={item.status} /></div>
                  {item.showOnWebsite && <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2"><span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green/90 flex items-center justify-center"><Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" /></span></div>}
                </div>
                <CardContent className="p-2.5 sm:p-3">
                  <p className="text-[12px] sm:text-[13px] font-semibold text-on-surface truncate leading-tight">{item.itemName}</p>
                  <div className="flex items-center gap-1 mt-1 overflow-hidden">
                    <span className="text-[10px] sm:text-[11px] text-on-surface-3 truncate">{item.category}</span>
                    <span className="text-on-surface-3/30 text-[8px] shrink-0">•</span>
                    <span className="text-[10px] sm:text-[11px] text-on-surface-3 font-mono shrink-0">{item.size}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1.5 sm:pt-2 border-t border-line">
                    <span className="text-[13px] sm:text-[15px] font-bold text-on-surface">{item.sellingPrice ? formatCurrency(totalPrice) : formatCurrency(totalCost)}</span>
                    {pcs > 1 && <span className="text-[9px] sm:text-[10px] font-semibold text-primary bg-primary/10 px-1 sm:px-1.5 py-0.5 rounded-md">{pcs}pcs</span>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* ── LIST VIEW ── */
        <div className="space-y-2 sm:space-y-2.5">
          {filtered.map(item => {
            const imgs = item.images ? item.images.split(',').filter(Boolean) : [];
            const vids = item.videos ? item.videos.split(',').filter(Boolean) : [];
            const mediaCount = imgs.length + vids.length;
            const thumb = imgs[0] || null;
            const pcs = parseInt(item.pieces) || 1;
            const totalCost = (parseFloat(item.sourcingCost) || 0) * pcs;
            const totalPrice = (parseFloat(item.sellingPrice) || 0) * pcs;
            const fleekCut = item.saleChannel === 'fleek' ? totalPrice * 0.15 : 0;
            const profit = item.sellingPrice ? (totalPrice - fleekCut - totalCost) : null;

            return (
              <Card key={item.id} className="cursor-pointer hover:border-primary/30 transition-all group" onClick={() => setViewItem(item)}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-2.5 sm:gap-4">
                    {/* Thumbnail — smaller on mobile */}
                    {thumb ? (
                      <div className="w-[56px] h-[56px] sm:w-[80px] sm:h-[80px] rounded-xl sm:rounded-[14px] overflow-hidden border border-line shrink-0 group-hover:border-primary/20 transition-colors">
                        <img src={thumb} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : vids.length > 0 ? (
                      <div className="w-[56px] h-[56px] sm:w-[80px] sm:h-[80px] rounded-xl sm:rounded-[14px] overflow-hidden border border-line shrink-0 relative bg-black">
                        <video src={vids[0]} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" /></div>
                      </div>
                    ) : (
                      <div className="w-[56px] h-[56px] sm:w-[80px] sm:h-[80px] rounded-xl sm:rounded-[14px] bg-surface-2 flex items-center justify-center shrink-0"><Package className="w-6 h-6 sm:w-8 sm:h-8 text-on-surface-3/40" /></div>
                    )}

                    <div className="flex-1 min-w-0">
                      {/* Name + Status */}
                      <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                        <p className="text-[13px] sm:text-[15px] font-semibold text-on-surface leading-snug group-hover:text-primary transition-colors line-clamp-1">{item.itemName}</p>
                        <div className="shrink-0 scale-[0.85] sm:scale-100 origin-top-right"><StatusBadge status={item.status} /></div>
                      </div>

                      {/* Meta — compact on mobile */}
                      <div className="flex items-center gap-1 sm:gap-1.5 mt-1 sm:mt-1.5 flex-wrap">
                        <span className="text-[11px] sm:text-[12px] text-on-surface-2">{item.category}</span>
                        <span className="text-on-surface-3/30 text-[8px] sm:text-[10px]">•</span>
                        <span className="text-[11px] sm:text-[12px] text-on-surface-2 font-mono">{item.size}</span>
                        <span className="text-on-surface-3/30 text-[8px] sm:text-[10px]">•</span>
                        <ConditionBadge condition={item.condition} />
                        {pcs > 1 && <><span className="text-on-surface-3/30 text-[8px] sm:text-[10px]">•</span><span className="text-[10px] sm:text-[11px] font-bold text-primary bg-primary/10 px-1 sm:px-1.5 py-0.5 rounded-md">{pcs}pcs</span></>}
                        {item.showOnWebsite && <><span className="hidden sm:inline text-on-surface-3/30 text-[10px]">•</span><span className="hidden sm:inline text-[11px] font-bold text-green"><Globe className="w-3 h-3 inline mr-0.5" />Live</span></>}
                        {mediaCount > 0 && <><span className="hidden sm:inline text-on-surface-3/30 text-[10px]">•</span><span className="hidden sm:flex text-[11px] text-on-surface-3 items-center gap-0.5"><ImageIcon className="w-3 h-3" />{mediaCount}</span></>}
                      </div>

                      {/* Price + Actions — stacked on mobile, row on desktop */}
                      <div className="mt-2 sm:mt-3 pt-2 sm:pt-2.5 border-t border-line/50">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap min-w-0">
                            <span className="font-bold text-on-surface text-[14px] sm:text-[15px]">{item.sellingPrice ? formatCurrency(totalPrice) : formatCurrency(totalCost)}</span>
                            {pcs > 1 && <span className="hidden sm:inline text-[10px] text-on-surface-3">({pcs}×{formatCurrency(item.sellingPrice || item.sourcingCost)})</span>}
                            {profit !== null && (
                              <span className={`font-bold text-[11px] sm:text-[13px] flex items-center gap-0.5 ${profit >= 0 ? "text-green" : "text-red"}`}>
                                {profit >= 0 ? <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                                {profit >= 0 ? "+" : ""}{formatCurrency(profit)}
                              </span>
                            )}
                            {profit !== null && totalCost > 0 && <span className={`hidden sm:inline text-[11px] font-bold px-2 py-0.5 rounded-lg ${profit >= 0 ? "bg-green/10 text-green" : "bg-red/10 text-red"}`}>{profit >= 0 ? "+" : ""}{Math.round((profit / totalCost) * 100)}%</span>}
                            {fleekCut > 0 && <span className="hidden sm:inline text-[10px] text-on-surface-3">-{formatCurrency(fleekCut)} fleek</span>}
                          </div>
                          <div className="flex items-center shrink-0" onClick={e => e.stopPropagation()}>
                            <ShareMenu item={item} />
                            <button onClick={(e) => openEdit(e, item)} className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-surface-2 text-on-surface-3 cursor-pointer transition-colors" title="Edit"><Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /></button>
                            <button onClick={(e) => { e.stopPropagation(); setDelId(item.id); setDelName(item.itemName); setDelOpen(true); }} className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-red/10 text-on-surface-3 hover:text-red cursor-pointer transition-colors" title="Delete"><Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /></button>
                          </div>
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
