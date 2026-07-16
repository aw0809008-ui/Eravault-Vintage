"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  ExternalLink,
  Package,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, ConditionBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ItemForm, type ItemFormData } from "@/components/inventory/item-form";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  getLocalInventory,
  addLocalItem,
  updateLocalItem,
  deleteLocalItem,
  type InventoryItem,
} from "@/lib/local-storage";

type SortField = "itemName" | "category" | "sourcingCost" | "sellingPrice" | "status" | "sourcingDate";
type SortDir = "asc" | "desc";

const CATEGORY_OPTIONS = [
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

const CONDITION_OPTIONS = [
  { value: "A", label: "Grade A" },
  { value: "AB", label: "Grade AB" },
  { value: "B", label: "Grade B" },
  { value: "BC", label: "Grade BC" },
  { value: "C", label: "Grade C" },
  { value: "ABC", label: "Grade ABC" },
];

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

  const fetchItems = useCallback(() => {
    const localItems = getLocalInventory();
    setItems(localItems);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setFormOpen(true);
    }
  }, [searchParams]);

  const filteredAndSorted = useMemo(() => {
    let result = [...items];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.itemName.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.size.toLowerCase().includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter) {
      result = result.filter((item) => item.status === statusFilter);
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter((item) => item.category === categoryFilter);
    }

    // Condition filter
    if (conditionFilter) {
      result = result.filter((item) => item.condition === conditionFilter);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "itemName":
          aVal = a.itemName.toLowerCase();
          bVal = b.itemName.toLowerCase();
          break;
        case "category":
          aVal = a.category;
          bVal = b.category;
          break;
        case "sourcingCost":
          aVal = parseFloat(a.sourcingCost || "0");
          bVal = parseFloat(b.sourcingCost || "0");
          break;
        case "sellingPrice":
          aVal = parseFloat(a.sellingPrice || "0");
          bVal = parseFloat(b.sellingPrice || "0");
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        case "sourcingDate":
          aVal = new Date(a.sourcingDate).getTime();
          bVal = new Date(b.sourcingDate).getTime();
          break;
      }

      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [items, search, statusFilter, categoryFilter, conditionFilter, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  }

  async function handleAddOrEdit(data: ItemFormData) {
    if (data.id) {
      // Update
      const updated = updateLocalItem({
        id: data.id,
        itemName: data.itemName,
        category: data.category,
        size: data.size,
        condition: data.condition,
        sourcingCost: data.sourcingCost,
        sellingPrice: data.sellingPrice,
        status: data.status,
        sourcingDate: data.sourcingDate,
        soldDate: data.soldDate,
        notes: data.notes,
        listingLink: data.listingLink,
        createdAt: "",
        updatedAt: "",
      });
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } else {
      // Create
      const newItem = addLocalItem({
        itemName: data.itemName,
        category: data.category,
        size: data.size,
        condition: data.condition,
        sourcingCost: data.sourcingCost,
        sellingPrice: data.sellingPrice,
        status: data.status,
        sourcingDate: data.sourcingDate,
        soldDate: data.soldDate,
        notes: data.notes,
        listingLink: data.listingLink,
      });
      setItems((prev) => [newItem, ...prev]);
    }
    setEditingItem(null);
  }

  function handleDelete() {
    if (!deletingId) return;
    deleteLocalItem(deletingId);
    setItems((prev) => prev.filter((i) => i.id !== deletingId));
    setDeleteDialogOpen(false);
    setDeletingId(null);
  }

  function openEdit(item: InventoryItem) {
    setEditingItem({
      id: item.id,
      itemName: item.itemName,
      category: item.category,
      size: item.size,
      condition: item.condition,
      sourcingCost: item.sourcingCost,
      sellingPrice: item.sellingPrice || "",
      status: item.status,
      sourcingDate: item.sourcingDate ? new Date(item.sourcingDate).toISOString().split("T")[0] : "",
      soldDate: item.soldDate
        ? new Date(item.soldDate).toISOString().split("T")[0]
        : "",
      notes: item.notes || "",
      listingLink: item.listingLink || "",
    });
    setFormOpen(true);
  }

  function openAdd() {
    setEditingItem(null);
    setFormOpen(true);
  }

  const activeFilters =
    (statusFilter ? 1 : 0) + (categoryFilter ? 1 : 0) + (conditionFilter ? 1 : 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900">
            Inventory
          </h1>
          <p className="text-stone-500 mt-1">
            {items.length} item{items.length !== 1 ? "s" : ""} in your collection
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilters > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-600 text-white text-[10px] rounded-full flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 flex flex-col sm:flex-row gap-3 pt-4 border-t border-stone-100">
              <div className="flex-1">
                <Select
                  options={[
                    { value: "Sourced", label: "Sourced" },
                    { value: "Active on Fleek", label: "Active on Fleek" },
                    { value: "Sold", label: "Sold" },
                    { value: "Shipped", label: "Shipped" },
                  ]}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  placeholder="All Statuses"
                />
              </div>
              <div className="flex-1">
                <Select
                  options={CATEGORY_OPTIONS}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  placeholder="All Categories"
                />
              </div>
              <div className="flex-1">
                <Select
                  options={CONDITION_OPTIONS}
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  placeholder="All Grades"
                />
              </div>
              {activeFilters > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("");
                    setCategoryFilter("");
                    setConditionFilter("");
                  }}
                  className="text-stone-500"
                >
                  <X className="w-3 h-3" />
                  Clear
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      {loading ? (
        <Card>
          <CardContent className="p-0">
            <div className="space-y-0">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 border-b border-stone-100 last:border-0"
                >
                  <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : filteredAndSorted.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            {items.length === 0 ? (
              <>
                <h3 className="text-lg font-semibold text-stone-700">
                  Add your first item
                </h3>
                <p className="text-stone-400 mt-2 max-w-sm mx-auto">
                  Start building your vintage inventory. Track sourcing costs,
                  list on Fleek, and watch your profits grow.
                </p>
                <Button onClick={openAdd} className="mt-6">
                  <Plus className="w-4 h-4" />
                  Add Your First Item
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-stone-700">
                  No matching items
                </h3>
                <p className="text-stone-400 mt-2">
                  Try adjusting your search or filters
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("");
                    setCategoryFilter("");
                    setConditionFilter("");
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="hidden md:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/80">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      <button
                        onClick={() => toggleSort("itemName")}
                        className="flex items-center gap-1 cursor-pointer hover:text-stone-900"
                      >
                        Item <SortIcon field="itemName" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      <button
                        onClick={() => toggleSort("category")}
                        className="flex items-center gap-1 cursor-pointer hover:text-stone-900"
                      >
                        Category <SortIcon field="category" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      <button
                        onClick={() => toggleSort("sourcingCost")}
                        className="flex items-center gap-1 cursor-pointer hover:text-stone-900"
                      >
                        Cost <SortIcon field="sourcingCost" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      <button
                        onClick={() => toggleSort("sellingPrice")}
                        className="flex items-center gap-1 cursor-pointer hover:text-stone-900"
                      >
                        Price <SortIcon field="sellingPrice" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      <button
                        onClick={() => toggleSort("status")}
                        className="flex items-center gap-1 cursor-pointer hover:text-stone-900"
                      >
                        Status <SortIcon field="status" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      <button
                        onClick={() => toggleSort("sourcingDate")}
                        className="flex items-center gap-1 cursor-pointer hover:text-stone-900"
                      >
                        Date <SortIcon field="sourcingDate" />
                      </button>
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSorted.map((item) => {
                    const profit =
                      item.sellingPrice && item.sourcingCost
                        ? parseFloat(item.sellingPrice) -
                          parseFloat(item.sourcingCost)
                        : null;
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700 flex-shrink-0">
                              <Package className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-stone-900 truncate max-w-[200px]">
                                {item.itemName}
                              </p>
                              {item.listingLink && (
                                <a
                                  href={item.listingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-amber-600 hover:underline flex items-center gap-1"
                                >
                                  Fleek Link
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-stone-600">
                          {item.category}
                        </td>
                        <td className="px-4 py-3 text-sm text-stone-600 font-mono">
                          {item.size}
                        </td>
                        <td className="px-4 py-3">
                          <ConditionBadge condition={item.condition} />
                        </td>
                        <td className="px-4 py-3 text-sm text-stone-600">
                          {formatCurrency(item.sourcingCost)}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <span className="text-sm font-medium text-stone-900">
                              {item.sellingPrice
                                ? formatCurrency(item.sellingPrice)
                                : "—"}
                            </span>
                            {profit !== null && (
                              <span
                                className={`block text-xs ${
                                  profit >= 0
                                    ? "text-emerald-600"
                                    : "text-red-500"
                                }`}
                              >
                                {profit >= 0 ? "+" : ""}
                                {formatCurrency(profit)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-4 py-3 text-sm text-stone-500">
                          {formatDate(item.sourcingDate)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEdit(item)}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setDeletingId(item.id);
                                setDeletingName(item.itemName);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredAndSorted.map((item) => {
              const profit =
                item.sellingPrice && item.sourcingCost
                  ? parseFloat(item.sellingPrice) -
                    parseFloat(item.sourcingCost)
                  : null;
              return (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5">
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-stone-900 leading-tight">
                            {item.itemName}
                          </p>
                          <p className="text-xs text-stone-400 mt-1">
                            {item.category} · {item.size} · <ConditionBadge condition={item.condition} />
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-stone-400 text-xs">Cost: </span>
                          <span className="font-medium">
                            {formatCurrency(item.sourcingCost)}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-400 text-xs">Price: </span>
                          <span className="font-medium">
                            {item.sellingPrice
                              ? formatCurrency(item.sellingPrice)
                              : "—"}
                          </span>
                        </div>
                        {profit !== null && (
                          <span
                            className={`text-xs font-semibold ${
                              profit >= 0
                                ? "text-emerald-600"
                                : "text-red-500"
                            }`}
                          >
                            {profit >= 0 ? "+" : ""}
                            {formatCurrency(profit)}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(item)}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => {
                            setDeletingId(item.id);
                            setDeletingName(item.itemName);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Item Form Dialog */}
      <ItemForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingItem(null);
        }}
        onSubmit={handleAddOrEdit}
        initialData={editingItem}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deletingName}&rdquo;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
