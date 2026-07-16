// Local Storage Backend (fallback when Google Sheets not configured)
// Data persists in browser - perfect for PWA offline use

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
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "eravauly_inventory";
const USER_KEY = "eravauly_user";

export interface LocalUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// Get all items from local storage
export function getLocalInventory(): InventoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Save all items to local storage
export function saveLocalInventory(items: InventoryItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// Add item to local storage
export function addLocalItem(item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">): InventoryItem {
  const items = getLocalInventory();
  const newItem: InventoryItem = {
    ...item,
    id: `erv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  items.unshift(newItem);
  saveLocalInventory(items);
  return newItem;
}

// Update item in local storage
export function updateLocalItem(updatedItem: InventoryItem): InventoryItem {
  const items = getLocalInventory();
  const index = items.findIndex((i) => i.id === updatedItem.id);
  if (index !== -1) {
    items[index] = { ...updatedItem, updatedAt: new Date().toISOString() };
    saveLocalInventory(items);
  }
  return items[index] || updatedItem;
}

// Delete item from local storage
export function deleteLocalItem(id: string): boolean {
  const items = getLocalInventory();
  const filtered = items.filter((i) => i.id !== id);
  saveLocalInventory(filtered);
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

// Seed demo data with new grading system
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
      notes: "Great condition, barely any fading. Buyer loved it.",
      listingLink: "",
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
      notes: "Slight whisker fade, very trendy.",
      listingLink: "https://fleek.com/listing/y2k-flare-jeans",
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
      notes: "Classic workwear piece. Minor wear on cuffs.",
      listingLink: "",
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
      listingLink: "https://fleek.com/listing/nike-swoosh-tee",
    },
    {
      itemName: "Y2K Baggy Cargo Pants - Olive Green",
      category: "Pants",
      size: "W32/L30",
      condition: "AB",
      sourcingCost: "10.00",
      sellingPrice: "48.00",
      status: "Sold",
      sourcingDate: "2024-11-01",
      soldDate: "2024-11-25",
      notes: "Multiple pockets, great for streetwear fits.",
      listingLink: "",
    },
    {
      itemName: "Vintage Tommy Hilfiger Striped Polo",
      category: "Polo Shirts",
      size: "M",
      condition: "A",
      sourcingCost: "15.00",
      sellingPrice: "65.00",
      status: "Active on Fleek",
      sourcingDate: "2024-12-08",
      soldDate: "",
      notes: "NWT! Found at estate sale. Amazing find.",
      listingLink: "https://fleek.com/listing/tommy-polo-striped",
    },
    {
      itemName: "90s Champion Reverse Weave Hoodie - Red",
      category: "Hoodies",
      size: "L",
      condition: "B",
      sourcingCost: "18.00",
      sellingPrice: "72.00",
      status: "Sold",
      sourcingDate: "2024-10-15",
      soldDate: "2024-11-10",
      notes: "Thick fleece, logo slightly cracked but adds character.",
      listingLink: "",
    },
    {
      itemName: "Vintage Levi's 501 Jeans - Stonewash",
      category: "Jeans",
      size: "W34/L32",
      condition: "AB",
      sourcingCost: "14.00",
      sellingPrice: "58.00",
      status: "Active on Fleek",
      sourcingDate: "2024-12-10",
      soldDate: "",
      notes: "",
      listingLink: "https://fleek.com/listing/levis-501-stonewash",
    },
    {
      itemName: "Vintage Patagonia Fleece Pullover - Teal",
      category: "Knits",
      size: "M",
      condition: "A",
      sourcingCost: "20.00",
      sellingPrice: "85.00",
      status: "Sourced",
      sourcingDate: "2024-12-12",
      soldDate: "",
      notes: "Need to clean and photograph for listing.",
      listingLink: "",
    },
    {
      itemName: "Y2K Ed Hardy Graphic Tee - Dragon Print",
      category: "Tees",
      size: "L",
      condition: "B",
      sourcingCost: "7.00",
      sellingPrice: "42.00",
      status: "Active on Fleek",
      sourcingDate: "2024-12-03",
      soldDate: "",
      notes: "Iconic Y2K piece, print is vibrant.",
      listingLink: "https://fleek.com/listing/ed-hardy-dragon",
    },
    {
      itemName: "Vintage Polo Ralph Lauren Cable Knit Sweater",
      category: "Sweaters",
      size: "L",
      condition: "AB",
      sourcingCost: "12.00",
      sellingPrice: "55.00",
      status: "Sold",
      sourcingDate: "2024-09-20",
      soldDate: "2024-10-15",
      notes: "Perfect for fall/winter. Cotton knit.",
      listingLink: "",
    },
    {
      itemName: "North Face Nuptse 700 Puffer Jacket - Black",
      category: "Outerwear",
      size: "M",
      condition: "BC",
      sourcingCost: "45.00",
      sellingPrice: "150.00",
      status: "Shipped",
      sourcingDate: "2024-11-05",
      soldDate: "2024-12-01",
      notes: "Minor down leak patched. Still very warm.",
      listingLink: "",
    },
    {
      itemName: "Vintage Wrangler Bootcut Jeans - Dark Wash",
      category: "Jeans",
      size: "W30/L34",
      condition: "C",
      sourcingCost: "6.00",
      sellingPrice: "",
      status: "Sourced",
      sourcingDate: "2024-12-14",
      soldDate: "",
      notes: "Needs hem repair before listing.",
      listingLink: "",
    },
    {
      itemName: "90s Adidas Trefoil Hoodie - Black/White",
      category: "Hoodies",
      size: "XL",
      condition: "A",
      sourcingCost: "16.00",
      sellingPrice: "62.00",
      status: "Active on Fleek",
      sourcingDate: "2024-12-06",
      soldDate: "",
      notes: "",
      listingLink: "https://fleek.com/listing/adidas-trefoil-hoodie",
    },
    {
      itemName: "Vintage Lacoste Polo - Forest Green",
      category: "Polo Shirts",
      size: "S",
      condition: "A",
      sourcingCost: "9.00",
      sellingPrice: "38.00",
      status: "Sold",
      sourcingDate: "2024-10-28",
      soldDate: "2024-11-20",
      notes: "Classic croc logo, perfect condition.",
      listingLink: "",
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
