// Google Sheets Integration
// Sheet ID from your URL: 1AYeAU8i72yUG_l53Mg_uM7YycibnNMSeEkGYPnOLbrQ

const DEFAULT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwlo7n_imMnAaAlvw5bErl9Ehf84HSxbUPUhBxg-jfq9-b2g7JZkjlYUVitvoBaO8QnLQ/exec";

const APPS_SCRIPT_URL = typeof window !== 'undefined' 
  ? localStorage.getItem('eravault_apps_script_url') || DEFAULT_APPS_SCRIPT_URL
  : DEFAULT_APPS_SCRIPT_URL;

export interface SheetItem {
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

// Check if Google Sheets is configured
export function isSheetConfigured(): boolean {
  if (typeof window === 'undefined') return false;
  const url = localStorage.getItem('eravault_apps_script_url') || DEFAULT_APPS_SCRIPT_URL;
  return !!url && url.length > 0;
}

// Set the Apps Script URL
export function setAppsScriptUrl(url: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('eravault_apps_script_url', url);
}

// Get the Apps Script URL
export function getAppsScriptUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_APPS_SCRIPT_URL;
  return localStorage.getItem('eravault_apps_script_url') || DEFAULT_APPS_SCRIPT_URL;
}

// Fetch all items from Google Sheet
export async function fetchFromSheet(): Promise<SheetItem[]> {
  const url = getAppsScriptUrl();
  if (!url) return [];
  
  try {
    const response = await fetch(`${url}?action=getAll`, {
      method: 'GET',
      redirect: 'follow',
    });
    
    if (!response.ok) throw new Error('Failed to fetch');
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Fetch from sheet error:', error);
    return [];
  }
}

// Add item to Google Sheet
export async function addToSheet(item: Omit<SheetItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<SheetItem | null> {
  const url = getAppsScriptUrl();
  if (!url) return null;
  
  try {
    const newItem = {
      ...item,
      id: `erv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const response = await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'add', item: newItem }),
    });
    
    if (!response.ok) throw new Error('Failed to add');
    
    return newItem;
  } catch (error) {
    console.error('Add to sheet error:', error);
    return null;
  }
}

// Update item in Google Sheet
export async function updateInSheet(item: SheetItem): Promise<SheetItem | null> {
  const url = getAppsScriptUrl();
  if (!url) return null;
  
  try {
    const updatedItem = {
      ...item,
      updatedAt: new Date().toISOString(),
    };
    
    const response = await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'update', item: updatedItem }),
    });
    
    if (!response.ok) throw new Error('Failed to update');
    
    return updatedItem;
  } catch (error) {
    console.error('Update in sheet error:', error);
    return null;
  }
}

// Delete item from Google Sheet
export async function deleteFromSheet(id: string): Promise<boolean> {
  const url = getAppsScriptUrl();
  if (!url) return false;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Delete from sheet error:', error);
    return false;
  }
}

// Sync local storage with Google Sheet
export async function syncWithSheet(): Promise<{ success: boolean; count: number }> {
  const url = getAppsScriptUrl();
  if (!url) return { success: false, count: 0 };
  
  try {
    const items = await fetchFromSheet();
    if (items.length > 0) {
      localStorage.setItem('eravault_inventory', JSON.stringify(items));
      return { success: true, count: items.length };
    }
    return { success: true, count: 0 };
  } catch {
    return { success: false, count: 0 };
  }
}
