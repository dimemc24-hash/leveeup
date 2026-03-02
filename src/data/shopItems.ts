import type { ShopItem } from '../types';

export const shopItems: ShopItem[] = [
  // Hats
  { id: 'hat-explorer', name: 'Explorer Hat', description: 'A sturdy safari hat for fieldwork', category: 'hat', price: 100, svgIcon: '/assets/shop/hat-explorer.svg', rarity: 'common' },
  { id: 'hat-detective', name: 'Detective Cap', description: 'A classic detective cap with a magnifying glass pin', category: 'hat', price: 250, svgIcon: '/assets/shop/hat-explorer.svg', rarity: 'rare' },
  { id: 'hat-cryptid-crown', name: 'Cryptid Crown', description: 'A legendary crown made of mysterious crystals', category: 'hat', price: 1000, svgIcon: '/assets/shop/hat-explorer.svg', rarity: 'legendary' },

  // Binoculars
  { id: 'binoculars-basic', name: 'Field Binoculars', description: 'Standard-issue investigator binoculars', category: 'binoculars', price: 150, svgIcon: '/assets/shop/binoculars.svg', rarity: 'common' },
  { id: 'binoculars-night', name: 'Night Vision Goggles', description: 'See in the dark like a real cryptid hunter!', category: 'binoculars', price: 500, svgIcon: '/assets/shop/binoculars.svg', rarity: 'rare' },

  // Vests
  { id: 'vest-field', name: 'Field Vest', description: 'A vest with lots of pockets for collecting evidence', category: 'vest', price: 200, svgIcon: '/assets/shop/vest-field.svg', rarity: 'common' },
  { id: 'vest-camo', name: 'Camo Vest', description: 'Blend in with the forest to sneak up on cryptids', category: 'vest', price: 400, svgIcon: '/assets/shop/vest-field.svg', rarity: 'rare' },

  // Flashlights
  { id: 'flashlight-basic', name: 'Trusty Flashlight', description: 'Light the way through dark caves and swamps', category: 'flashlight', price: 100, svgIcon: '/assets/shop/flashlight.svg', rarity: 'common' },
  { id: 'flashlight-uv', name: 'UV Blacklight', description: 'Reveals hidden clues invisible to the naked eye!', category: 'flashlight', price: 350, svgIcon: '/assets/shop/flashlight.svg', rarity: 'rare' },

  // Journals
  { id: 'journal-leather', name: 'Leather Journal', description: 'A sturdy field journal for recording discoveries', category: 'journal', price: 150, svgIcon: '/assets/shop/journal-cover.svg', rarity: 'common' },
  { id: 'journal-ancient', name: 'Ancient Tome', description: 'A mysterious book with cryptid lore from long ago', category: 'journal', price: 750, svgIcon: '/assets/shop/journal-cover.svg', rarity: 'legendary' },

  // Stickers
  { id: 'sticker-paw', name: 'Paw Print Sticker', description: 'A bigfoot paw print for your journal', category: 'sticker', price: 50, svgIcon: '/assets/shop/sticker-paw.svg', rarity: 'common' },
  { id: 'sticker-eye', name: 'Glowing Eye Sticker', description: 'Mothman\'s glowing red eye sticker', category: 'sticker', price: 75, svgIcon: '/assets/shop/sticker-paw.svg', rarity: 'common' },
  { id: 'sticker-scale', name: 'Nessie Scale Sticker', description: 'A shimmering scale from the deep lake', category: 'sticker', price: 100, svgIcon: '/assets/shop/sticker-paw.svg', rarity: 'rare' },
  { id: 'sticker-feather', name: 'Thunderbird Feather', description: 'A legendary feather sticker that shimmers gold', category: 'sticker', price: 500, svgIcon: '/assets/shop/sticker-paw.svg', rarity: 'legendary' },
];
