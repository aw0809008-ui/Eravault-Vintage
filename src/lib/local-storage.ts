// Local Storage with Google Sheets Sync

import { 
  isSheetConfigured, 
  fetchFromSheet, 
  addToSheet, 
  updateInSheet, 
  deleteFromSheet,
  type SheetItem 
} from './google-sheets';

export interface InventoryItem {
  id: string;
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
  images: string; // Comma-separated URLs
  videos: string; // Comma-separated URLs
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "eravault_inventory";
const USER_KEY = "eravault_user";

export interface LocalUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// Get all items (from Sheet if configured, else local)
export async function getInventoryAsync(): Promise<InventoryItem[]> {
  if (isSheetConfigured()) {
    try {
      const items = await fetchFromSheet();
      if (items.length > 0) {
        // Cache locally
        saveLocalInventory(items);
        return items;
      }
    } catch {
      // Fall back to local
    }
  }
  return getLocalInventory();
}

// Get from local storage only
export function getLocalInventory(): InventoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Save to local storage
export function saveLocalInventory(items: InventoryItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// Add item (to Sheet if configured, always to local)
export async function addItemAsync(item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">): Promise<InventoryItem> {
  const newItem: InventoryItem = {
    ...item,
    id: `erv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Save to local first
  const items = getLocalInventory();
  items.unshift(newItem);
  saveLocalInventory(items);
  
  // Then try to save to Sheet
  if (isSheetConfigured()) {
    try {
      await addToSheet(item as SheetItem);
    } catch (e) {
      console.error('Failed to save to sheet:', e);
    }
  }
  
  return newItem;
}

// Update item
export async function updateItemAsync(updatedItem: InventoryItem): Promise<InventoryItem> {
  const item = { ...updatedItem, updatedAt: new Date().toISOString() };
  
  // Update local
  const items = getLocalInventory();
  const index = items.findIndex((i) => i.id === item.id);
  if (index !== -1) {
    items[index] = item;
    saveLocalInventory(items);
  }
  
  // Update Sheet
  if (isSheetConfigured()) {
    try {
      await updateInSheet(item as SheetItem);
    } catch (e) {
      console.error('Failed to update in sheet:', e);
    }
  }
  
  return item;
}

// Delete item
export async function deleteItemAsync(id: string): Promise<boolean> {
  // Delete from local
  const items = getLocalInventory();
  const filtered = items.filter((i) => i.id !== id);
  saveLocalInventory(filtered);
  
  // Delete from Sheet
  if (isSheetConfigured()) {
    try {
      await deleteFromSheet(id);
    } catch (e) {
      console.error('Failed to delete from sheet:', e);
    }
  }
  
  return true;
}

// Legacy sync functions for backward compatibility
export function addLocalItem(item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">): InventoryItem {
  const newItem: InventoryItem = {
    ...item,
    images: item.images || '',
    videos: item.videos || '',
    id: `erv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const items = getLocalInventory();
  items.unshift(newItem);
  saveLocalInventory(items);
  
  // Also save to sheet in background
  if (isSheetConfigured()) {
    addToSheet(newItem as SheetItem).catch(() => {});
  }
  
  return newItem;
}

export function updateLocalItem(item: InventoryItem): InventoryItem {
  const updated = { ...item, updatedAt: new Date().toISOString() };
  const items = getLocalInventory();
  const index = items.findIndex((i) => i.id === item.id);
  if (index !== -1) {
    items[index] = updated;
    saveLocalInventory(items);
  }
  
  // Also update sheet in background
  if (isSheetConfigured()) {
    updateInSheet(updated as SheetItem).catch(() => {});
  }
  
  return updated;
}

export function deleteLocalItem(id: string): boolean {
  const items = getLocalInventory();
  const filtered = items.filter((i) => i.id !== id);
  saveLocalInventory(filtered);
  
  // Also delete from sheet in background
  if (isSheetConfigured()) {
    deleteFromSheet(id).catch(() => {});
  }
  
  return filtered.length < items.length;
}

// User management
export function getLocalUser(): LocalUser | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setLocalUser(user: LocalUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearLocalUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
}

// Seed demo data with new fields
export function seedDemoData(): void {
  const existing = getLocalInventory();
  if (existing.length > 0) return;

  const demoItems: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">[] = [
    {
      itemName: "90s Ralph Lauren Polo Shirt - Navy",
      category: "Polo Shirts",
      size: "L",
      condition: "A",
      sourcingCost: "8.00",
      sellingPrice: "45.00",
      status: "Sold",
      sourcingDate: "2024-11-15",
      soldDate: "2024-12-02",
      notes: "Great condition, barely any fading",
      listingLink: "",
      images: "",
      videos: "",
    },
    {
      itemName: "Y2K Women's Flare Jeans - Low Rise",
      category: "Jeans",
      size: "W28/L32",
      condition: "AB",
      sourcingCost: "12.00",
      sellingPrice: "55.00",
      status: "Active on Fleek",
      sourcingDate: "2024-12-01",
      soldDate: "",
      notes: "Slight whisker fade, very trendy",
      listingLink: "https://fleek.com/listing/y2k-flare-jeans",
      images: "",
      videos: "",
    },
    {
      itemName: "Vintage Carhartt Detroit Jacket - Brown",
      category: "Jackets",
      size: "XL",
      condition: "B",
      sourcingCost: "25.00",
      sellingPrice: "120.00",
      status: "Shipped",
      sourcingDate: "2024-10-20",
      soldDate: "2024-11-18",
      notes: "Classic workwear piece",
      listingLink: "",
      images: "",
      videos: "",
    },
    {
      itemName: "Vintage Nike Center Swoosh Tee - Grey",
      category: "Tees",
      size: "M",
      condition: "A",
      sourcingCost: "5.00",
      sellingPrice: "35.00",
      status: "Active on Fleek",
      sourcingDate: "2024-12-05",
      soldDate: "",
      notes: "",
      listingLink: "",
      images: "",
      videos: "",
    },
    {
      itemName: "Y2K Baggy Cargo Pants - Olive",
      category: "Pants",
      size: "W32/L30",
      condition: "AB",
      sourcingCost: "10.00",
      sellingPrice: "48.00",
      status: "Sold",
      sourcingDate: "2024-11-01",
      soldDate: "2024-11-25",
      notes: "Multiple pockets",
      listingLink: "",
      images: "",
      videos: "",
    },
  ];

  const items: InventoryItem[] = demoItems.map((item, index) => ({
    ...item,
    id: `erv_demo_${index}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(Date.now() - index * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - index * 86400000).toISOString(),
  }));

  saveLocalInventory(items);
}
