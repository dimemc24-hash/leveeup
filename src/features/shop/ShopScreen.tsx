import { useState } from 'react';
import { useGameStore } from '../../hooks/useGameStore';
import { shopItems } from '../../data/shopItems';
import type { ShopItem } from '../../types';

export function ShopScreen() {
  const { progress, ownedItems, buyItem, equipItem, unequipItem, profile } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [justBought, setJustBought] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'hat', label: 'Hats' },
    { id: 'binoculars', label: 'Optics' },
    { id: 'vest', label: 'Vests' },
    { id: 'flashlight', label: 'Lights' },
    { id: 'journal', label: 'Journals' },
    { id: 'sticker', label: 'Stickers' },
    { id: 'accessory', label: 'Badges' },
  ];

  const filtered = selectedCategory === 'all'
    ? shopItems
    : shopItems.filter((item) => item.category === selectedCategory);

  const handleBuy = (item: ShopItem) => {
    const success = buyItem(item.id, item.price);
    if (success) {
      setJustBought(item.id);
      setTimeout(() => setJustBought(null), 1500);
    }
  };

  const isEquipped = (id: string) => profile?.equippedItems.includes(id) ?? false;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 animate-slide-up">
      {/* Header */}
      <div className="journal-card bg-white/90 rounded-2xl p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold text-forest">Field Supply Shop</h2>
        <p className="text-sm text-bark-light mt-1">Spend your hard-earned XP on gear!</p>
        <div className="flex items-center gap-1 mt-2">
          <img src="/assets/ui/xp-star.svg" alt="" className="w-5 h-5" />
          <span className="font-bold text-gold text-lg">{progress.xp} XP</span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Shop categories">
        {categories.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSelectedCategory(id)}
            className={`px-4 py-2 rounded-full text-sm min-h-[40px] font-bold whitespace-nowrap transition-colors ${
              selectedCategory === id ? 'bg-forest text-white' : 'bg-white text-bark-light border border-paper-dark hover:bg-paper'
            }`}
            role="tab"
            aria-selected={selectedCategory === id}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((item) => {
          const owned = ownedItems.includes(item.id);
          const equipped = isEquipped(item.id);
          const canAfford = progress.xp >= item.price;
          const wasBought = justBought === item.id;

          return (
            <div
              key={item.id}
              className={`journal-card bg-white/90 rounded-xl p-3 shadow-sm transition-all ${
                wasBought ? 'border-forest-light animate-bounce-in' :
                equipped ? 'border-gold border-2' :
                'border-paper-dark'
              }`}
            >
              <div className="w-full aspect-square bg-paper rounded-lg mb-2 flex items-center justify-center p-3">
                <img src={item.svgIcon} alt="" className="w-full h-full object-contain" />
              </div>
              <h4 className="font-bold text-sm text-bark truncate">{item.name}</h4>
              <p className="text-xs text-bark-light line-clamp-2 h-8">{item.description}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  item.rarity === 'legendary' ? 'bg-gold/20 text-gold' :
                  item.rarity === 'rare' ? 'bg-purple-100 text-purple-600' :
                  'bg-paper text-bark-light'
                }`}>{item.rarity}</span>
              </div>
              <div className="mt-2">
                {owned ? (
                  <button
                    onClick={() => equipped ? unequipItem(item.id) : equipItem(item.id)}
                    className={`w-full text-sm font-bold rounded-lg py-2.5 min-h-[40px] transition-colors ${
                      equipped ? 'bg-gold text-white' : 'bg-paper text-forest hover:bg-forest/10'
                    }`}
                    aria-label={equipped ? `Unequip ${item.name}` : `Equip ${item.name}`}
                  >
                    {equipped ? 'Equipped ✓' : 'Equip'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford}
                    className="w-full text-sm font-bold rounded-lg py-2.5 min-h-[40px] bg-forest text-white hover:bg-forest-light transition-colors disabled:opacity-40"
                    aria-label={`Buy ${item.name} for ${item.price} XP`}
                  >
                    {item.price} XP
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
