import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

const ADMIN_EMAIL = "aw0809008@gmail.com";

export interface InventoryItem {
  id: string; itemName: string; category: string; size: string; condition: string;
  sourcingCost: string; sellingPrice: string; status: string; sourcingDate: string;
  soldDate: string; notes: string; listingLink: string; images: string; videos: string;
  pieces: string; saleChannel: string;
  createdAt: string; updatedAt: string;
  showOnWebsite: boolean;
}

interface DbRow {
  id: string; item_name: string; category: string; size: string; condition: string;
  sourcing_cost: number; selling_price: number | null; status: string; sourcing_date: string;
  sold_date: string | null; notes: string | null; listing_link: string | null;
  images: string | null; videos: string | null; pieces: number | null; sale_channel: string | null;
  created_at: string; updated_at: string;
  show_on_website: boolean;
}

function toFrontend(r: DbRow): InventoryItem {
  return {
    id: r.id, itemName: r.item_name, category: r.category, size: r.size,
    condition: r.condition, sourcingCost: String(r.sourcing_cost || 0),
    sellingPrice: r.selling_price ? String(r.selling_price) : '',
    status: r.status, sourcingDate: r.sourcing_date || '', soldDate: r.sold_date || '',
    notes: r.notes || '', listingLink: r.listing_link || '',
    images: r.images || '', videos: r.videos || '',
    pieces: String(r.pieces || 1), saleChannel: r.sale_channel || 'fleek',
    createdAt: r.created_at, updatedAt: r.updated_at,
    showOnWebsite: r.show_on_website ?? false,
  };
}

// ===== AUTH =====
export async function requestAccess(name: string, email: string, password: string) {
  const { error } = await supabase.from('pending_users').insert({ name, email: email.toLowerCase(), password_hash: password, status: 'pending' });
  if (error) { if (error.code === '23505') throw new Error('Request already submitted'); throw error; }
  return { success: true };
}

export async function approveUser(pendingId: string) {
  const user = await getUser(); if (user?.email !== ADMIN_EMAIL) throw new Error('Not authorized');
  await supabase.from('pending_users').update({ status: 'approved' }).eq('id', pendingId);
  return { success: true };
}

export async function rejectUser(pendingId: string) {
  const user = await getUser(); if (user?.email !== ADMIN_EMAIL) throw new Error('Not authorized');
  await supabase.from('pending_users').update({ status: 'rejected' }).eq('id', pendingId);
  return { success: true };
}

export async function getPendingUsers() {
  const { data } = await supabase.from('pending_users').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function checkAccessStatus(email: string): Promise<'pending' | 'approved' | 'rejected' | 'not_found'> {
  const { data } = await supabase.from('pending_users').select('status').eq('email', email.toLowerCase()).single();
  if (!data) return 'not_found';
  return data.status;
}

export async function signIn(email: string, password: string) {
  const status = await checkAccessStatus(email);
  if (status === 'pending') throw new Error('Your request is pending admin approval');
  if (status === 'rejected') throw new Error('Your request was rejected');
  if (status === 'not_found') throw new Error('No account found. Request access first.');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (status === 'approved') {
      const { data: p } = await supabase.from('pending_users').select('*').eq('email', email.toLowerCase()).single();
      if (p) {
        const { data: s, error: se } = await supabase.auth.signUp({ email, password, options: { data: { name: p.name } } });
        if (se) throw se;
        if (s.session) return s;
        const { data: r, error: re } = await supabase.auth.signInWithPassword({ email, password });
        if (re) throw re;
        return r;
      }
    }
    throw error;
  }
  return data;
}

export async function adminLogin(email: string, password: string) {
  if (email.toLowerCase() !== ADMIN_EMAIL) return signIn(email, password);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const { data: s, error: se } = await supabase.auth.signUp({ email, password, options: { data: { name: 'Admin', role: 'admin' } } });
    if (se) throw se;
    if (s.session) return s;
    const { data: r, error: re } = await supabase.auth.signInWithPassword({ email, password });
    if (re) throw re;
    return r;
  }
  return data;
}

export async function signOut() { await supabase.auth.signOut(); }
export async function getUser() { const { data: { user } } = await supabase.auth.getUser(); return user; }
export async function getSession() { const { data: { session } } = await supabase.auth.getSession(); return session; }
export function isAdmin(email: string | undefined) { return email?.toLowerCase() === ADMIN_EMAIL; }

// ===== INVENTORY (with pieces + saleChannel) =====
export async function getInventory(): Promise<InventoryItem[]> {
  const { data, error } = await supabase.from('inventory').select('*').order('created_at', { ascending: false });
  if (error) { console.error('Get error:', error); return []; }
  return (data || []).map(toFrontend);
}

export async function addInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem | null> {
  const user = await getUser();
  const { data, error } = await supabase.from('inventory').insert({
    user_id: user?.id || null, item_name: item.itemName, category: item.category,
    size: item.size, condition: item.condition, sourcing_cost: parseFloat(item.sourcingCost) || 0,
    selling_price: item.sellingPrice ? parseFloat(item.sellingPrice) : null,
    status: item.status, sourcing_date: item.sourcingDate,
    sold_date: item.soldDate || null, notes: item.notes || null,
    listing_link: item.listingLink || null, images: item.images || null, videos: item.videos || null,
    pieces: parseInt(item.pieces) || 1, sale_channel: item.saleChannel || 'fleek',
  }).select().single();
  if (error) { console.error('Add error:', error); return null; }
  return toFrontend(data);
}

export async function updateInventoryItem(id: string, item: Partial<InventoryItem>): Promise<InventoryItem | null> {
  const u: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (item.itemName !== undefined) u.item_name = item.itemName;
  if (item.category !== undefined) u.category = item.category;
  if (item.size !== undefined) u.size = item.size;
  if (item.condition !== undefined) u.condition = item.condition;
  if (item.sourcingCost !== undefined) u.sourcing_cost = parseFloat(item.sourcingCost) || 0;
  if (item.sellingPrice !== undefined) u.selling_price = item.sellingPrice ? parseFloat(item.sellingPrice) : null;
  if (item.status !== undefined) u.status = item.status;
  if (item.sourcingDate !== undefined) u.sourcing_date = item.sourcingDate;
  if (item.soldDate !== undefined) u.sold_date = item.soldDate || null;
  if (item.notes !== undefined) u.notes = item.notes || null;
  if (item.listingLink !== undefined) u.listing_link = item.listingLink || null;
  if (item.images !== undefined) u.images = item.images || null;
  if (item.videos !== undefined) u.videos = item.videos || null;
  if (item.pieces !== undefined) u.pieces = parseInt(item.pieces) || 1;
  if (item.saleChannel !== undefined) u.sale_channel = item.saleChannel || 'fleek';
  const { data, error } = await supabase.from('inventory').update(u).eq('id', id).select().single();
  if (error) { console.error('Update error:', error); return null; }
  return toFrontend(data);
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  const { error } = await supabase.from('inventory').delete().eq('id', id);
  return !error;
}

export async function seedDemoData(): Promise<void> {
  const { data: existing } = await supabase.from('inventory').select('id').limit(1);
  if (existing && existing.length > 0) return;
  const user = await getUser();
  const items = [
    { item_name: "90s Ralph Lauren Polo - Navy", category: "Polo Shirts", size: "L", condition: "A", sourcing_cost: 8, selling_price: 45, status: "Sold", sourcing_date: "2024-11-15", sold_date: "2024-12-02", pieces: 1, sale_channel: "fleek" },
    { item_name: "Y2K Flare Jeans - Low Rise", category: "Jeans", size: "W28/L32", condition: "AB", sourcing_cost: 12, selling_price: 55, status: "Active on Fleek", sourcing_date: "2024-12-01", pieces: 1, sale_channel: "fleek" },
    { item_name: "Vintage Carhartt Detroit Jacket", category: "Jackets", size: "XL", condition: "B", sourcing_cost: 25, selling_price: 120, status: "Shipped", sourcing_date: "2024-10-20", sold_date: "2024-11-18", pieces: 1, sale_channel: "offline" },
    { item_name: "Nike Center Swoosh Tee", category: "Tees", size: "M", condition: "A", sourcing_cost: 5, selling_price: 35, status: "Active on Fleek", sourcing_date: "2024-12-05", pieces: 3, sale_channel: "fleek" },
    { item_name: "Y2K Baggy Cargo Pants - Olive", category: "Pants", size: "W32/L30", condition: "AB", sourcing_cost: 10, selling_price: 48, status: "Sold", sourcing_date: "2024-11-01", sold_date: "2024-11-25", pieces: 2, sale_channel: "offline" },
  ].map(i => ({ ...i, user_id: user?.id || null }));
  await supabase.from('inventory').insert(items);
}

export function isSupabaseConfigured(): boolean {
  return supabaseUrl !== 'https://placeholder.supabase.co';
}


export async function toggleShowOnWebsite(id: string, value: boolean) {
  const { error } = await supabase
    .from('inventory')
    .update({ show_on_website: value, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) { console.error('Toggle error:', error); throw error; }
  return { success: true };
}
