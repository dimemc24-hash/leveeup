import { useState } from 'react';
import { useGameStore } from '../../hooks/useGameStore';
import { shopItems } from '../../data/shopItems';
import { Avatar } from './Avatar';
import type { EquipmentSlot, SkinTone, HairColor } from '../../types';

const SKIN_TONES: { id: SkinTone; label: string; hex: string }[] = [
  { id: 'light', label: 'Light', hex: '#FDDBB4' },
  { id: 'medium', label: 'Medium', hex: '#D4956A' },
  { id: 'brown', label: 'Brown', hex: '#A0522D' },
  { id: 'dark', label: 'Dark', hex: '#5C3317' },
];

const HAIR_COLORS: { id: HairColor; label: string; hex: string }[] = [
  { id: 'blonde', label: 'Blonde', hex: '#F5D569' },
  { id: 'brown', label: 'Brown', hex: '#6B3A2A' },
  { id: 'black', label: 'Black', hex: '#1C1C1C' },
  { id: 'red', label: 'Red', hex: '#C0392B' },
];

const SLOTS: { slot: EquipmentSlot; label: string; icon: string }[] = [
  { slot: 'head', label: 'Head', icon: '🎩' },
  { slot: 'eyes', label: 'Eyes', icon: '🥽' },
  { slot: 'body', label: 'Body', icon: '🦺' },
  { slot: 'hand', label: 'Hand', icon: '🔦' },
  { slot: 'accessory', label: 'Badge', icon: '🏅' },
];

export function AvatarCustomize() {
  const { profile, ownedItems, equipItem, unequipItem, setSkinTone, setHairColor } = useGameStore();
  const [activeSlot, setActiveSlot] = useState<EquipmentSlot>('head');

  if (!profile) return null;

  const slotItems = shopItems.filter(
    (item) => item.equipSlot === activeSlot && ownedItems.includes(item.id)
  );

  const equippedInSlot = profile.equippedItems.find((id) => {
    const item = shopItems.find((s) => s.id === id);
    return item?.equipSlot === activeSlot;
  });

  const handleEquip = (itemId: string) => {
    // Unequip current item in this slot first
    if (equippedInSlot) {
      unequipItem(equippedInSlot);
    }
    if (equippedInSlot !== itemId) {
      equipItem(itemId);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 animate-slide-up">
      <div className="journal-card bg-white/90 rounded-2xl p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold text-forest">Customize Your Investigator</h2>
        <p className="text-sm text-bark-light mt-1">Equip gear from your inventory!</p>
      </div>

      {/* Avatar preview */}
      <div className="journal-card bg-white/90 rounded-2xl p-6 shadow-sm flex justify-center">
        <Avatar size={200} showName />
      </div>

      {/* Skin tone picker */}
      <div className="journal-card bg-white/90 rounded-2xl p-4 shadow-sm">
        <h3 className="font-display font-bold text-forest mb-3">Choose Skin Tone</h3>
        <div className="flex gap-3 justify-center">
          {SKIN_TONES.map(({ id, label, hex }) => {
            const active = profile.skinTone === id;
            return (
              <button
                key={id}
                onClick={() => setSkinTone(id)}
                className={`w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center ${
                  active ? 'ring-3 ring-forest scale-110' : 'ring-2 ring-paper-dark hover:scale-105'
                }`}
                style={{ backgroundColor: hex }}
                aria-label={`${label} skin tone${active ? ' (selected)' : ''}`}
              >
                {active && (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M4 9l3.5 3.5L14 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hair color picker */}
      <div className="journal-card bg-white/90 rounded-2xl p-4 shadow-sm">
        <h3 className="font-display font-bold text-forest mb-3">Choose Hair Color</h3>
        <div className="flex gap-3 justify-center">
          {HAIR_COLORS.map(({ id, label, hex }) => {
            const active = profile.hairColor === id;
            return (
              <button
                key={id}
                onClick={() => setHairColor(id)}
                className={`w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center ${
                  active ? 'ring-3 ring-forest scale-110' : 'ring-2 ring-paper-dark hover:scale-105'
                }`}
                style={{ backgroundColor: hex }}
                aria-label={`${label} hair color${active ? ' (selected)' : ''}`}
              >
                {active && (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M4 9l3.5 3.5L14 5" stroke={id === 'black' ? '#ccc' : 'white'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slot tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Equipment slots">
        {SLOTS.map(({ slot, label, icon }) => (
          <button
            key={slot}
            onClick={() => setActiveSlot(slot)}
            className={`flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              activeSlot === slot
                ? 'bg-forest text-white'
                : 'bg-white text-bark-light border border-paper-dark hover:bg-paper'
            }`}
            role="tab"
            aria-selected={activeSlot === slot}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Items for selected slot */}
      <div className="journal-card bg-white/90 rounded-2xl p-4 shadow-sm">
        <h3 className="font-display font-bold text-forest mb-3">
          {SLOTS.find((s) => s.slot === activeSlot)?.label} Gear
        </h3>
        {slotItems.length === 0 ? (
          <p className="text-sm text-bark-light text-center py-4">
            No {activeSlot} items owned yet. Visit the Shop to buy some!
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {slotItems.map((item) => {
              const isEquipped = equippedInSlot === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleEquip(item.id)}
                  className={`rounded-xl p-3 min-h-[48px] border-2 transition-all text-left ${
                    isEquipped
                      ? 'border-gold bg-gold/10'
                      : 'border-paper-dark bg-white hover:border-forest/40'
                  }`}
                  aria-label={isEquipped ? `Unequip ${item.name}` : `Equip ${item.name}`}
                >
                  <div className="w-full aspect-square bg-paper rounded-lg mb-2 flex items-center justify-center p-2">
                    <img src={item.svgIcon} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="font-bold text-xs text-bark truncate">{item.name}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        item.rarity === 'legendary'
                          ? 'bg-gold/20 text-gold'
                          : item.rarity === 'rare'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-paper text-bark-light'
                      }`}
                    >
                      {item.rarity}
                    </span>
                    {isEquipped && (
                      <span className="text-[10px] text-gold font-bold">Equipped</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
