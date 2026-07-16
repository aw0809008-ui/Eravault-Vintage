import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DbInventoryItem {
  id: string;
  user_id: string;
  item_name: string;
  category: string;
  size: string;
  condition: string;
  sourcing_cost: number;
  selling_price: number | null;
  status: string;
  sourcing_date: string;
  sold_date: string | null;
  notes: string | null;
  listing_link: string | null;
  images: string | null;
  videos: string | null;
  created_at: string;
  updated_at: string;
}

// Frontend-friendly type
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

// Convert DB row to frontend format
function toFrontend(row: DbInventoryItem): InventoryItem {
  return {
    id: row.id,
    itemName: row.item_name,
    category: row.category,
    size: row.size,
    condition: row.condition,
    sourcingCost: String(row.sourcing_cost || 0),
    sellingPrice: String(row.selling_price || ''),
    status: row.status,
    sourcingDate: row.sourcing_date || '',
    soldDate: row.sold_date || '',
    notes: row.notes || '',
    listingLink: row.listing_link || '',
    images: row.images || '',
    videos: row.videos || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ==================== AUTH ====================

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { 
      data: { name },
      emailRedirectTo: typeof window !== 'undefined' ? window.location.origin + '/dashboard' : undefined,
    },
  });
  if (error) throw error;
  
  // If email confirmation is required, user won't be auto-logged in
  // Try to sign in immediately (works if autoconfirm is enabled)
  if (!data.session) {
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!signInError && signInData.session) return signInData;
    } catch {
      // Email confirmation required - that's ok
    }
  }
  
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ==================== INVENTORY CRUD ====================

export async function getInventory(): Promise<InventoryItem[]> {
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get inventory error:', error);
    return [];
  }

  return (data || []).map(toFrontend);
}

export async function addInventoryItem(
  item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<InventoryItem | null> {
  const user = await getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('inventory')
    .insert({
      user_id: user.id,
      item_name: item.itemName,
      category: item.category,
      size: item.size,
      condition: item.condition,
      sourcing_cost: parseFloat(item.sourcingCost) || 0,
      selling_price: item.sellingPrice ? parseFloat(item.sellingPrice) : null,
      status: item.status,
      sourcing_date: item.sourcingDate,
      sold_date: item.soldDate || null,
      notes: item.notes || null,
      listing_link: item.listingLink || null,
      images: item.images || null,
      videos: item.videos || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Add item error:', error);
    return null;
  }

  return toFrontend(data);
}

export async function updateInventoryItem(
  id: string,
  item: Partial<InventoryItem>
): Promise<InventoryItem | null> {
  const user = await getUser();
  if (!user) return null;

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (item.itemName !== undefined) updateData.item_name = item.itemName;
  if (item.category !== undefined) updateData.category = item.category;
  if (item.size !== undefined) updateData.size = item.size;
  if (item.condition !== undefined) updateData.condition = item.condition;
  if (item.sourcingCost !== undefined) updateData.sourcing_cost = parseFloat(item.sourcingCost) || 0;
  if (item.sellingPrice !== undefined) updateData.selling_price = item.sellingPrice ? parseFloat(item.sellingPrice) : null;
  if (item.status !== undefined) updateData.status = item.status;
  if (item.sourcingDate !== undefined) updateData.sourcing_date = item.sourcingDate;
  if (item.soldDate !== undefined) updateData.sold_date = item.soldDate || null;
  if (item.notes !== undefined) updateData.notes = item.notes || null;
  if (item.listingLink !== undefined) updateData.listing_link = item.listingLink || null;
  if (item.images !== undefined) updateData.images = item.images || null;
  if (item.videos !== undefined) updateData.videos = item.videos || null;

  const { data, error } = await supabase
    .from('inventory')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Update item error:', error);
    return null;
  }

  return toFrontend(data);
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  const user = await getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Delete item error:', error);
    return false;
  }

  return true;
}

// ==================== SEED DEMO DATA ====================

export async function seedDemoData(): Promise<void> {
  const user = await getUser();
  if (!user) return;

  // Check if user already has items
  const { data: existing } = await supabase
    .from('inventory')
    .select('id')
    .eq('user_id', user.id)
    .limit(1);

  if (existing && existing.length > 0) return;

  const demoItems = [
    { item_name: "90s Ralph Lauren Polo Shirt - Navy", category: "Polo Shirts", size: "L", condition: "A", sourcing_cost: 8, selling_price: 45, status: "Sold", sourcing_date: "2024-11-15", sold_date: "2024-12-02", notes: "Great condition, barely any fading" },
    { item_name: "Y2K Women's Flare Jeans - Low Rise", category: "Jeans", size: "W28/L32", condition: "AB", sourcing_cost: 12, selling_price: 55, status: "Active on Fleek", sourcing_date: "2024-12-01", sold_date: null, notes: "Slight whisker fade, very trendy", listing_link: "https://fleek.com/listing/y2k-flare-jeans" },
    { item_name: "Vintage Carhartt Detroit Jacket - Brown", category: "Jackets", size: "XL", condition: "B", sourcing_cost: 25, selling_price: 120, status: "Shipped", sourcing_date: "2024-10-20", sold_date: "2024-11-18", notes: "Classic workwear piece" },
    { item_name: "Vintage Nike Center Swoosh Tee - Grey", category: "Tees", size: "M", condition: "A", sourcing_cost: 5, selling_price: 35, status: "Active on Fleek", sourcing_date: "2024-12-05", sold_date: null, notes: "" },
    { item_name: "Y2K Baggy Cargo Pants - Olive", category: "Pants", size: "W32/L30", condition: "AB", sourcing_cost: 10, selling_price: 48, status: "Sold", sourcing_date: "2024-11-01", sold_date: "2024-11-25", notes: "Multiple pockets" },
    { item_name: "Vintage Tommy Hilfiger Striped Polo", category: "Polo Shirts", size: "M", condition: "A", sourcing_cost: 15, selling_price: 65, status: "Active on Fleek", sourcing_date: "2024-12-08", sold_date: null, notes: "NWT! Estate sale find" },
    { item_name: "90s Champion Reverse Weave Hoodie - Red", category: "Hoodies", size: "L", condition: "B", sourcing_cost: 18, selling_price: 72, status: "Sold", sourcing_date: "2024-10-15", sold_date: "2024-11-10", notes: "Thick fleece, logo slightly cracked" },
    { item_name: "Vintage Levi's 501 Jeans - Stonewash", category: "Jeans", size: "W34/L32", condition: "AB", sourcing_cost: 14, selling_price: 58, status: "Active on Fleek", sourcing_date: "2024-12-10", sold_date: null, notes: "" },
    { item_name: "Vintage Patagonia Fleece - Teal", category: "Knits", size: "M", condition: "A", sourcing_cost: 20, selling_price: 85, status: "Sourced", sourcing_date: "2024-12-12", sold_date: null, notes: "Need to photograph" },
    { item_name: "Vintage Lacoste Polo - Forest Green", category: "Polo Shirts", size: "S", condition: "A", sourcing_cost: 9, selling_price: 38, status: "Sold", sourcing_date: "2024-10-28", sold_date: "2024-11-20", notes: "Classic croc logo" },
  ];

  const rows = demoItems.map((item) => ({
    user_id: user.id,
    ...item,
  }));

  await supabase.from('inventory').insert(rows);
}

// ==================== CHECK CONFIG ====================

export function isSupabaseConfigured(): boolean {
  return !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== '';
}
