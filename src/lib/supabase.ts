import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

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

interface DbRow {
  id: string;
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

function toFrontend(r: DbRow): InventoryItem {
  return {
    id: r.id,
    itemName: r.item_name,
    category: r.category,
    size: r.size,
    condition: r.condition,
    sourcingCost: String(r.sourcing_cost || 0),
    sellingPrice: r.selling_price ? String(r.selling_price) : '',
    status: r.status,
    sourcingDate: r.sourcing_date || '',
    soldDate: r.sold_date || '',
    notes: r.notes || '',
    listingLink: r.listing_link || '',
    images: r.images || '',
    videos: r.videos || '',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// ===== AUTH =====
export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { name } },
  });
  if (error) throw error;
  if (!data.session) {
    try {
      const r = await supabase.auth.signInWithPassword({ email, password });
      if (!r.error && r.data.session) return r.data;
    } catch { /* needs email confirm */ }
  }
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ===== INVENTORY — SHARED DATA (everyone sees same data) =====
export async function getInventory(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('Get error:', error); return []; }
  return (data || []).map(toFrontend);
}

export async function addInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem | null> {
  const user = await getUser();
  const { data, error } = await supabase
    .from('inventory')
    .insert({
      user_id: user?.id || null,
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
  if (error) { console.error('Add error:', error); return null; }
  return toFrontend(data);
}

export async function updateInventoryItem(id: string, item: Partial<InventoryItem>): Promise<InventoryItem | null> {
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

  const { data, error } = await supabase.from('inventory').update(updateData).eq('id', id).select().single();
  if (error) { console.error('Update error:', error); return null; }
  return toFrontend(data);
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  const { error } = await supabase.from('inventory').delete().eq('id', id);
  if (error) { console.error('Delete error:', error); return false; }
  return true;
}

export async function seedDemoData(): Promise<void> {
  const { data: existing } = await supabase.from('inventory').select('id').limit(1);
  if (existing && existing.length > 0) return;

  const user = await getUser();
  const items = [
    { item_name: "90s Ralph Lauren Polo - Navy", category: "Polo Shirts", size: "L", condition: "A", sourcing_cost: 8, selling_price: 45, status: "Sold", sourcing_date: "2024-11-15", sold_date: "2024-12-02", notes: "Great condition" },
    { item_name: "Y2K Flare Jeans - Low Rise", category: "Jeans", size: "W28/L32", condition: "AB", sourcing_cost: 12, selling_price: 55, status: "Active on Fleek", sourcing_date: "2024-12-01", notes: "Very trendy" },
    { item_name: "Vintage Carhartt Detroit Jacket", category: "Jackets", size: "XL", condition: "B", sourcing_cost: 25, selling_price: 120, status: "Shipped", sourcing_date: "2024-10-20", sold_date: "2024-11-18", notes: "Classic workwear" },
    { item_name: "Nike Center Swoosh Tee - Grey", category: "Tees", size: "M", condition: "A", sourcing_cost: 5, selling_price: 35, status: "Active on Fleek", sourcing_date: "2024-12-05" },
    { item_name: "Y2K Baggy Cargo Pants - Olive", category: "Pants", size: "W32/L30", condition: "AB", sourcing_cost: 10, selling_price: 48, status: "Sold", sourcing_date: "2024-11-01", sold_date: "2024-11-25" },
  ].map(i => ({ ...i, user_id: user?.id || null }));

  await supabase.from('inventory').insert(items);
}

export function isSupabaseConfigured(): boolean {
  return supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder';
}
