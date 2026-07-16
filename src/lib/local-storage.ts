// Local Storage - used only as offline cache
// Main data lives in Supabase

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
  images: string;
  videos: string;
  createdAt: string;
  updatedAt: string;
}

const USER_KEY = "eravault_user";

export interface LocalUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

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
