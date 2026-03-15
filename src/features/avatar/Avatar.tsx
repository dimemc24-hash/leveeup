import { useGameStore } from '../../hooks/useGameStore';
import { shopItems } from '../../data/shopItems';
import type { EquipmentSlot, SkinTone, HairColor } from '../../types';

const SKIN_COLORS: Record<SkinTone, string> = {
  light: '#FDDBB4',
  medium: '#D4956A',
  brown: '#A0522D',
  dark: '#5C3317',
};

const HAIR_COLORS: Record<HairColor, string> = {
  blonde: '#F5D569',
  brown: '#6B3A2A',
  black: '#1C1C1C',
  red: '#C0392B',
};

interface AvatarProps {
  size?: number;
  showName?: boolean;
}

const SLOT_ITEMS: Record<EquipmentSlot, { zIndex: number }> = {
  body: { zIndex: 1 },
  head: { zIndex: 3 },
  eyes: { zIndex: 4 },
  hand: { zIndex: 2 },
  accessory: { zIndex: 5 },
};

function getEquippedBySlot(equippedItems: string[]): Partial<Record<EquipmentSlot, typeof shopItems[0]>> {
  const result: Partial<Record<EquipmentSlot, typeof shopItems[0]>> = {};
  for (const itemId of equippedItems) {
    const item = shopItems.find((s) => s.id === itemId);
    if (item?.equipSlot) {
      result[item.equipSlot] = item;
    }
  }
  return result;
}

export function Avatar({ size = 160, showName = false }: AvatarProps) {
  const { profile } = useGameStore();
  if (!profile) return null;

  const equipped = getEquippedBySlot(profile.equippedItems);
  const scale = size / 160;
  const skinColor = SKIN_COLORS[profile.skinTone] ?? SKIN_COLORS.medium;
  const hairColor = HAIR_COLORS[profile.hairColor] ?? HAIR_COLORS.brown;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative"
        style={{ width: size, height: size }}
        role="img"
        aria-label={`${profile.name}'s avatar`}
      >
        {/* Base character body */}
        <svg
          viewBox="0 0 160 160"
          width={size}
          height={size}
          className="absolute inset-0"
          style={{ zIndex: 0 }}
        >
          {/* Background circle */}
          <circle cx="80" cy="80" r="76" fill="#e8dcc8" stroke="#d4a843" strokeWidth="2" />
          {/* Body */}
          <rect x="52" y="85" width="56" height="50" rx="8" fill="#4a7c23" />
          {/* Neck */}
          <rect x="68" y="78" width="24" height="14" rx="4" fill={skinColor} />
          {/* Head */}
          <circle cx="80" cy="58" r="24" fill={skinColor} />
          {/* Hair — rounded cap on top 40% of head */}
          <path d="M56 58 Q56 34 80 34 Q104 34 104 58" fill={hairColor} />
          {/* Eyes */}
          <circle cx="72" cy="54" r="3" fill="#3d2b1f" />
          <circle cx="88" cy="54" r="3" fill="#3d2b1f" />
          {/* Eye shine */}
          <circle cx="73" cy="53" r="1" fill="white" />
          <circle cx="89" cy="53" r="1" fill="white" />
          {/* Mouth */}
          <path d="M73 66 Q80 72 87 66" fill="none" stroke="#3d2b1f" strokeWidth="1.5" strokeLinecap="round" />
          {/* Arms */}
          <rect x="38" y="90" width="14" height="36" rx="7" fill={skinColor} />
          <rect x="108" y="90" width="14" height="36" rx="7" fill={skinColor} />
          {/* Legs */}
          <rect x="58" y="130" width="16" height="20" rx="5" fill="#6b5a4e" />
          <rect x="86" y="130" width="16" height="20" rx="5" fill="#6b5a4e" />
          {/* Boots */}
          <rect x="55" y="145" width="22" height="10" rx="5" fill="#3d2b1f" />
          <rect x="83" y="145" width="22" height="10" rx="5" fill="#3d2b1f" />
        </svg>

        {/* Equipment layers */}
        {equipped.body && (
          <svg
            viewBox="0 0 160 160"
            width={size}
            height={size}
            className="absolute inset-0"
            style={{ zIndex: SLOT_ITEMS.body.zIndex }}
          >
            {/* Vest/coat overlay */}
            <rect x="50" y="84" width="60" height="52" rx="8" fill="none" stroke="#2d5016" strokeWidth="2" strokeDasharray={equipped.body.rarity === 'legendary' ? '0' : '4 2'} />
            {equipped.body.rarity === 'legendary' && (
              <>
                <rect x="50" y="84" width="60" height="52" rx="8" fill="#2d5016" opacity="0.3" />
                <path d="M62 95 L80 88 L98 95" fill="none" stroke="#d4a843" strokeWidth="1.5" />
              </>
            )}
            {equipped.body.rarity === 'rare' && (
              <>
                <rect x="52" y="86" width="56" height="48" rx="6" fill="#4a5e23" opacity="0.4" />
                <rect x="56" y="90" width="8" height="8" rx="1" fill="#2d5016" opacity="0.3" />
                <rect x="68" y="98" width="8" height="8" rx="1" fill="#2d5016" opacity="0.3" />
                <rect x="88" y="92" width="8" height="8" rx="1" fill="#2d5016" opacity="0.3" />
              </>
            )}
            {/* Pocket detail */}
            <rect x="58" y="100" width="12" height="10" rx="2" fill="none" stroke="#2d5016" strokeWidth="1" opacity="0.5" />
            <rect x="90" y="100" width="12" height="10" rx="2" fill="none" stroke="#2d5016" strokeWidth="1" opacity="0.5" />
          </svg>
        )}

        {equipped.head && (
          <svg
            viewBox="0 0 160 160"
            width={size}
            height={size}
            className="absolute inset-0"
            style={{ zIndex: SLOT_ITEMS.head.zIndex }}
          >
            {equipped.head.rarity === 'legendary' ? (
              <>
                {/* Crown */}
                <path d="M58 40 L65 28 L72 38 L80 22 L88 38 L95 28 L102 40 Z" fill="#d4a843" />
                <path d="M58 40 L102 40 L102 46 L58 46 Z" fill="#d4a843" />
                <circle cx="72" cy="35" r="2" fill="#c0392b" />
                <circle cx="80" cy="28" r="2" fill="#4a7c23" />
                <circle cx="88" cy="35" r="2" fill="#2980b9" />
              </>
            ) : equipped.head.rarity === 'rare' ? (
              <>
                {/* Detective cap */}
                <ellipse cx="80" cy="38" rx="28" ry="8" fill="#3d2b1f" />
                <path d="M55 38 Q55 28 80 28 Q105 28 105 38" fill="#5a4030" />
                <path d="M55 38 L48 42 L64 38" fill="#3d2b1f" />
              </>
            ) : (
              <>
                {/* Explorer hat */}
                <ellipse cx="80" cy="38" rx="30" ry="8" fill="#c4a060" />
                <path d="M56 38 Q56 24 80 24 Q104 24 104 38" fill="#d4b070" />
                <rect x="70" y="28" width="20" height="4" rx="2" fill="#8B7355" />
              </>
            )}
          </svg>
        )}

        {equipped.eyes && (
          <svg
            viewBox="0 0 160 160"
            width={size}
            height={size}
            className="absolute inset-0"
            style={{ zIndex: SLOT_ITEMS.eyes.zIndex }}
          >
            {equipped.eyes.rarity === 'legendary' ? (
              <>
                {/* Thermal scope - one eye */}
                <circle cx="72" cy="54" r="8" fill="none" stroke="#c0392b" strokeWidth="2" />
                <circle cx="72" cy="54" r="5" fill="#c0392b" opacity="0.2" />
                <line x1="64" y1="54" x2="58" y2="50" stroke="#555" strokeWidth="1.5" />
              </>
            ) : equipped.eyes.rarity === 'rare' ? (
              <>
                {/* Night vision goggles */}
                <rect x="62" y="48" width="16" height="12" rx="6" fill="#2d5016" stroke="#1a3010" strokeWidth="1" />
                <rect x="82" y="48" width="16" height="12" rx="6" fill="#2d5016" stroke="#1a3010" strokeWidth="1" />
                <rect x="78" y="52" width="4" height="4" rx="1" fill="#555" />
                <circle cx="70" cy="54" r="5" fill="#4a7c23" opacity="0.6" />
                <circle cx="90" cy="54" r="5" fill="#4a7c23" opacity="0.6" />
              </>
            ) : (
              <>
                {/* Basic binoculars - hanging on neck */}
                <ellipse cx="70" cy="100" rx="8" ry="6" fill="#555" stroke="#333" strokeWidth="1" />
                <ellipse cx="90" cy="100" rx="8" ry="6" fill="#555" stroke="#333" strokeWidth="1" />
                <rect x="78" y="96" width="4" height="8" rx="1" fill="#444" />
                <path d="M70 94 L74 78" fill="none" stroke="#666" strokeWidth="1" />
                <path d="M90 94 L86 78" fill="none" stroke="#666" strokeWidth="1" />
              </>
            )}
          </svg>
        )}

        {equipped.hand && (
          <svg
            viewBox="0 0 160 160"
            width={size}
            height={size}
            className="absolute inset-0"
            style={{ zIndex: SLOT_ITEMS.hand.zIndex }}
          >
            {equipped.hand.rarity === 'legendary' ? (
              <>
                {/* Mystical lantern */}
                <rect x="112" y="92" width="10" height="18" rx="3" fill="#8B7355" />
                <rect x="110" y="86" width="14" height="8" rx="2" fill="#d4a843" />
                <circle cx="117" cy="90" r="6" fill="#4a7c23" opacity="0.4" />
                <line x1="117" y1="82" x2="117" y2="78" stroke="#8B7355" strokeWidth="2" />
              </>
            ) : equipped.hand.rarity === 'rare' ? (
              <>
                {/* UV Blacklight */}
                <rect x="114" y="88" width="6" height="28" rx="3" fill="#333" />
                <circle cx="117" cy="86" r="5" fill="#8B00FF" opacity="0.5" />
                <circle cx="117" cy="86" r="3" fill="#8B00FF" opacity="0.3" />
              </>
            ) : (
              <>
                {/* Basic flashlight */}
                <rect x="114" y="90" width="6" height="24" rx="3" fill="#d4a843" />
                <rect x="112" y="86" width="10" height="6" rx="2" fill="#c4a060" />
                <circle cx="117" cy="84" r="4" fill="#fffde0" opacity="0.6" />
              </>
            )}
          </svg>
        )}

        {equipped.accessory && (
          <svg
            viewBox="0 0 160 160"
            width={size}
            height={size}
            className="absolute inset-0"
            style={{ zIndex: SLOT_ITEMS.accessory.zIndex }}
          >
            {/* Badge on vest */}
            <circle
              cx="68"
              cy="96"
              r="6"
              fill={equipped.accessory.rarity === 'legendary' ? '#d4a843' : equipped.accessory.rarity === 'rare' ? '#8B7355' : '#aaa'}
              stroke={equipped.accessory.rarity === 'legendary' ? '#b8922e' : '#666'}
              strokeWidth="1"
            />
            <text
              x="68"
              y="99"
              textAnchor="middle"
              fill="white"
              fontSize="7"
              fontWeight="bold"
            >
              {equipped.accessory.rarity === 'legendary' ? 'M' : equipped.accessory.rarity === 'rare' ? 'S' : 'J'}
            </text>
          </svg>
        )}
      </div>

      {showName && (
        <div className="text-center">
          <div className="font-display font-bold text-forest text-sm">{profile.name}</div>
          <div className="text-xs text-bark-light">Level {useGameStore.getState().progress.level} Investigator</div>
        </div>
      )}
    </div>
  );
}
