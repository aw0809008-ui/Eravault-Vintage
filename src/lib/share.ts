import type { InventoryItem } from './supabase';
import { formatCurrency } from './utils';

function buildShareText(item: InventoryItem): string {
  const pieces = parseInt(item.pieces) || 1;
  const price = item.sellingPrice ? formatCurrency(item.sellingPrice) : 'DM for price';
  
  let text = `🏷️ *${item.itemName}*\n\n`;
  text += `📦 Category: ${item.category}\n`;
  text += `📏 Size: ${item.size}\n`;
  text += `⭐ Condition: Grade ${item.condition}\n`;
  if (pieces > 1) text += `🔢 Pieces: ${pieces}\n`;
  text += `💰 Price: ${price}${pieces > 1 ? ' /piece' : ''}\n`;
  if (item.notes) text += `\n📝 ${item.notes}\n`;
  text += `\n🛒 Available now!`;
  if (item.listingLink) text += `\n🔗 ${item.listingLink}`;
  
  return text;
}

function buildInstaCaption(item: InventoryItem): string {
  const price = item.sellingPrice ? formatCurrency(item.sellingPrice) : 'DM for price';
  const pieces = parseInt(item.pieces) || 1;
  
  let text = `${item.itemName}\n\n`;
  text += `💰 ${price}${pieces > 1 ? ' /piece' : ''}\n`;
  text += `📏 Size: ${item.size}\n`;
  text += `⭐ Grade ${item.condition}\n`;
  if (pieces > 1) text += `📦 ${pieces} pieces available\n`;
  text += `\n`;
  text += `#vintage #vintageclothing #${item.category.replace(/\s/g, '').toLowerCase()} #fleek #eravault #vintagefashion #y2k #streetwear #thrift`;
  
  return text;
}

export function shareWhatsApp(item: InventoryItem) {
  const text = buildShareText(item);
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

export function shareWhatsAppDirect(item: InventoryItem, phone: string) {
  const text = buildShareText(item);
  const clean = phone.replace(/\D/g, '');
  const url = `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

export function shareInstagram(item: InventoryItem) {
  const caption = buildInstaCaption(item);
  // Instagram doesn't have a direct share URL, so we copy caption
  navigator.clipboard.writeText(caption).then(() => {
    alert('Caption copied! Open Instagram and paste it with your photo.');
  });
}

export async function copyShareText(item: InventoryItem): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(buildShareText(item));
    return true;
  } catch {
    return false;
  }
}

export async function nativeShare(item: InventoryItem): Promise<boolean> {
  if (!navigator.share) return false;
  
  const text = buildShareText(item).replace(/\*/g, ''); // Remove markdown bold
  const firstImage = item.images ? item.images.split(',')[0] : null;
  
  try {
    const shareData: ShareData = {
      title: item.itemName,
      text: text,
    };
    
    // Try to share with image
    if (firstImage) {
      try {
        const response = await fetch(firstImage);
        const blob = await response.blob();
        const file = new File([blob], 'item.jpg', { type: blob.type });
        shareData.files = [file];
      } catch {
        // Image fetch failed, share without image
      }
    }
    
    await navigator.share(shareData);
    return true;
  } catch {
    return false;
  }
}
