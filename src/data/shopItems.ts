import type { ShopItem } from '../types';

export const shopItems: ShopItem[] = [
  // ═══════ HATS (head slot) ═══════
  { id: 'hat-explorer', name: 'Explorer Hat', description: 'A sturdy safari hat for fieldwork', category: 'hat', equipSlot: 'head', price: 500, svgIcon: '/assets/shop/hat-explorer.png', rarity: 'common' },
  { id: 'hat-swamp-cap', name: 'Swamp Tracker Cap', description: 'Keeps the sun out of your eyes deep in the bayou', category: 'hat', equipSlot: 'head', price: 800, svgIcon: '/assets/shop/hat-swamp-cap.png', rarity: 'common' },
  { id: 'hat-detective', name: 'Detective Cap', description: 'A classic detective cap with a magnifying glass pin', category: 'hat', equipSlot: 'head', price: 1500, svgIcon: '/assets/shop/hat-detective.png', rarity: 'rare' },
  { id: 'hat-cryptid-crown', name: 'Cryptid Crown', description: 'A legendary crown made of mysterious crystals', category: 'hat', equipSlot: 'head', price: 6000, svgIcon: '/assets/shop/hat-cryptid-crown.png', rarity: 'legendary' },

  // ═══════ BINOCULARS/OPTICS (eyes slot) ═══════
  { id: 'binoculars-basic', name: 'Field Binoculars', description: 'Standard-issue investigator binoculars', category: 'binoculars', equipSlot: 'eyes', price: 600, svgIcon: '/assets/shop/binoculars-basic.png', rarity: 'common' },
  { id: 'binoculars-night', name: 'Night Vision Goggles', description: 'See in the dark like a real cryptid hunter!', category: 'binoculars', equipSlot: 'eyes', price: 2500, svgIcon: '/assets/shop/binoculars-night.png', rarity: 'rare' },
  { id: 'binoculars-thermal', name: 'Thermal Scope', description: 'Detects heat signatures of hidden creatures', category: 'binoculars', equipSlot: 'eyes', price: 5000, svgIcon: '/assets/shop/binoculars-thermal.png', rarity: 'legendary' },

  // ═══════ VESTS (body slot) ═══════
  { id: 'vest-field', name: 'Field Vest', description: 'A vest with lots of pockets for collecting evidence', category: 'vest', equipSlot: 'body', price: 700, svgIcon: '/assets/shop/vest-field.png', rarity: 'common' },
  { id: 'vest-camo', name: 'Camo Vest', description: 'Blend in with the forest to sneak up on cryptids', category: 'vest', equipSlot: 'body', price: 2000, svgIcon: '/assets/shop/vest-camo.png', rarity: 'rare' },
  { id: 'vest-legendary', name: 'Master Investigator Coat', description: 'A legendary coat worn by the greatest cryptid hunters', category: 'vest', equipSlot: 'body', price: 8000, svgIcon: '/assets/shop/vest-legendary.png', rarity: 'legendary' },

  // ═══════ FLASHLIGHTS (hand slot) ═══════
  { id: 'flashlight-basic', name: 'Trusty Flashlight', description: 'Light the way through dark caves and swamps', category: 'flashlight', equipSlot: 'hand', price: 500, svgIcon: '/assets/shop/flashlight-basic.png', rarity: 'common' },
  { id: 'flashlight-uv', name: 'UV Blacklight', description: 'Reveals hidden clues invisible to the naked eye!', category: 'flashlight', equipSlot: 'hand', price: 1800, svgIcon: '/assets/shop/flashlight-uv.png', rarity: 'rare' },
  { id: 'flashlight-lantern', name: 'Cryptid Lantern', description: 'An ancient lantern that glows with a mysterious green light', category: 'flashlight', equipSlot: 'hand', price: 4500, svgIcon: '/assets/shop/flashlight-lantern.png', rarity: 'legendary' },

  // ═══════ JOURNALS ═══════
  { id: 'journal-leather', name: 'Leather Journal', description: 'A sturdy field journal for recording discoveries', category: 'journal', price: 600, svgIcon: '/assets/shop/journal-leather.png', rarity: 'common' },
  { id: 'journal-waterproof', name: 'Waterproof Notebook', description: 'Takes notes even in the rain or swamp!', category: 'journal', price: 1200, svgIcon: '/assets/shop/journal-waterproof.png', rarity: 'rare' },
  { id: 'journal-ancient', name: 'Ancient Tome', description: 'A mysterious book with cryptid lore from long ago', category: 'journal', price: 4000, svgIcon: '/assets/shop/journal-ancient.png', rarity: 'legendary' },

  // ═══════ STICKERS ═══════
  { id: 'sticker-paw', name: 'Paw Print Sticker', description: 'A bigfoot paw print for your journal', category: 'sticker', price: 500, svgIcon: '/assets/shop/sticker-paw.png', rarity: 'common' },
  { id: 'sticker-eye', name: 'Glowing Eye Sticker', description: 'Mothman\'s glowing red eye sticker', category: 'sticker', price: 750, svgIcon: '/assets/shop/sticker-eye.png', rarity: 'common' },
  { id: 'sticker-scale', name: 'Nessie Scale Sticker', description: 'A shimmering scale from the deep lake', category: 'sticker', price: 1500, svgIcon: '/assets/shop/sticker-scale.png', rarity: 'rare' },
  { id: 'sticker-feather', name: 'Thunderbird Feather', description: 'A legendary feather sticker that shimmers gold', category: 'sticker', price: 4000, svgIcon: '/assets/shop/sticker-feather.png', rarity: 'legendary' },

  // ═══════ ACCESSORIES (accessory slot) ═══════
  { id: 'accessory-badge-junior', name: 'Junior Investigator Badge', description: 'Your first official badge!', category: 'accessory', equipSlot: 'accessory', price: 500, svgIcon: '/assets/shop/badge-junior.png', rarity: 'common' },
  { id: 'accessory-badge-senior', name: 'Senior Investigator Badge', description: 'Proves you mean business', category: 'accessory', equipSlot: 'accessory', price: 2000, svgIcon: '/assets/shop/badge-senior.png', rarity: 'rare' },
  { id: 'accessory-badge-master', name: 'Master Investigator Badge', description: 'Only the best earn this legendary badge', category: 'accessory', equipSlot: 'accessory', price: 7000, svgIcon: '/assets/shop/badge-master.png', rarity: 'legendary' },
];
