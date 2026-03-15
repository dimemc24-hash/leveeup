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
          {/* ── BACKGROUND BADGE ── */}
          <circle cx="80" cy="80" r="76" fill="#ece4d4" />
          <circle cx="80" cy="72" r="60" fill="#f2eadb" opacity="0.5" />
          <circle cx="80" cy="80" r="76" fill="none" stroke="#d4a843" strokeWidth="2.5" />

          {/* ── LEGS / PANTS ── */}
          <rect x="64" y="126" width="13" height="20" rx="5" fill="#6b7a5a" />
          <rect x="83" y="126" width="13" height="20" rx="5" fill="#6b7a5a" />
          <ellipse cx="70.5" cy="133" rx="4" ry="2" fill="#5e6d4e" opacity="0.35" />
          <ellipse cx="89.5" cy="133" rx="4" ry="2" fill="#5e6d4e" opacity="0.35" />

          {/* ── BOOTS ── */}
          <rect x="58" y="142" width="20" height="12" rx="5" fill="#3d2b1f" />
          <rect x="82" y="142" width="20" height="12" rx="5" fill="#3d2b1f" />
          <rect x="57" y="150" width="22" height="4" rx="2" fill="#2a1c10" />
          <rect x="81" y="150" width="22" height="4" rx="2" fill="#2a1c10" />
          <rect x="65" y="144" width="6" height="3" rx="1" fill="#8B7355" />
          <rect x="89" y="144" width="6" height="3" rx="1" fill="#8B7355" />

          {/* ── BODY / EXPLORER JACKET ── */}
          <path d="M54 80 C52 82 50 128 62 130 L98 130 C110 128 108 82 106 80 Q96 76 80 76 Q64 76 54 80 Z" fill="#5c7a3a" />
          {/* Side shading */}
          <path d="M54 80 C52 82 50 128 62 130 L68 130 L68 80 Q60 76 54 80 Z" fill="#4e6b30" opacity="0.5" />
          <path d="M106 80 C108 82 110 128 98 130 L92 130 L92 80 Q100 76 106 80 Z" fill="#4e6b30" opacity="0.5" />
          {/* Collar flaps */}
          <path d="M68 78 L75 72 L80 80 L85 72 L92 78" fill="#6b8f45" stroke="#4e6b30" strokeWidth="0.8" />
          {/* Center line */}
          <line x1="80" y1="80" x2="80" y2="130" stroke="#4e6b30" strokeWidth="0.8" />
          {/* Buttons */}
          <circle cx="80" cy="90" r="1.5" fill="#d4a843" />
          <circle cx="80" cy="100" r="1.5" fill="#d4a843" />
          <circle cx="80" cy="110" r="1.5" fill="#d4a843" />
          {/* Chest pocket */}
          <rect x="86" y="88" width="12" height="10" rx="2" fill="none" stroke="#4e6b30" strokeWidth="1" />
          <line x1="86" y1="91" x2="98" y2="91" stroke="#4e6b30" strokeWidth="0.8" />
          {/* Belt */}
          <rect x="52" y="122" width="56" height="5" rx="2" fill="#8B7355" />
          <rect x="76" y="121" width="8" height="7" rx="1.5" fill="#c4a060" stroke="#8B7355" strokeWidth="0.5" />

          {/* ── ARMS ── */}
          {/* Left arm: sleeve + forearm + hand */}
          <rect x="36" y="80" width="18" height="24" rx="9" fill="#5c7a3a" />
          <rect x="38" y="100" width="14" height="18" rx="7" fill={skinColor} />
          <circle cx="45" cy="120" r="6" fill={skinColor} />
          {/* Right arm: sleeve + forearm + hand */}
          <rect x="106" y="80" width="18" height="24" rx="9" fill="#5c7a3a" />
          <rect x="108" y="100" width="14" height="18" rx="7" fill={skinColor} />
          <circle cx="115" cy="120" r="6" fill={skinColor} />

          {/* ── NECK ── */}
          <rect x="72" y="70" width="16" height="12" rx="5" fill={skinColor} />

          {/* ── EARS ── */}
          <ellipse cx="52" cy="54" rx="5" ry="7" fill={skinColor} />
          <ellipse cx="108" cy="54" rx="5" ry="7" fill={skinColor} />
          <ellipse cx="52" cy="54" rx="3" ry="4.5" fill="#e8a0a0" opacity="0.15" />
          <ellipse cx="108" cy="54" rx="3" ry="4.5" fill="#e8a0a0" opacity="0.15" />

          {/* ── HAIR BACK VOLUME (behind head) ── */}
          <ellipse cx="80" cy="44" rx="31" ry="28" fill={hairColor} />

          {/* ── HEAD / FACE ── */}
          <circle cx="80" cy="52" r="27" fill={skinColor} />

          {/* Blush cheeks */}
          <circle cx="62" cy="60" r="5" fill="#ff9999" opacity="0.15" />
          <circle cx="98" cy="60" r="5" fill="#ff9999" opacity="0.15" />

          {/* ── EYES ── */}
          {/* Whites */}
          <ellipse cx="71" cy="52" rx="6.5" ry="6" fill="white" />
          <ellipse cx="89" cy="52" rx="6.5" ry="6" fill="white" />
          {/* Iris */}
          <circle cx="72" cy="53" r="4" fill="#3d2b1f" />
          <circle cx="90" cy="53" r="4" fill="#3d2b1f" />
          {/* Pupil */}
          <circle cx="72" cy="53" r="2" fill="#0d0905" />
          <circle cx="90" cy="53" r="2" fill="#0d0905" />
          {/* Specular highlights */}
          <circle cx="74" cy="51" r="1.5" fill="white" />
          <circle cx="92" cy="51" r="1.5" fill="white" />
          <circle cx="71" cy="54.5" r="0.7" fill="white" opacity="0.6" />
          <circle cx="89" cy="54.5" r="0.7" fill="white" opacity="0.6" />

          {/* Eyebrows */}
          <path d="M64 44 Q68 41 76 44" fill="none" stroke={hairColor} strokeWidth="2" strokeLinecap="round" />
          <path d="M84 44 Q92 41 96 44" fill="none" stroke={hairColor} strokeWidth="2" strokeLinecap="round" />

          {/* Nose — subtle curve */}
          <path d="M79 58 Q80 60.5 81 58" fill="none" stroke="#3d2b1f" strokeWidth="1" strokeLinecap="round" opacity="0.2" />

          {/* ── MOUTH — open happy smile ── */}
          <path d="M73 63 Q80 70 87 63 Z" fill="#c0392b" opacity="0.8" />
          {/* Teeth */}
          <rect x="76" y="63" width="8" height="2.5" rx="0.5" fill="white" />
          {/* Mouth outline */}
          <path d="M73 63 Q80 70 87 63" fill="none" stroke="#992020" strokeWidth="0.8" />

          {/* ── HAIR TOP (on top of face) ── */}
          {/* Main cap with natural hairline (~15% down from top) */}
          <path d="M53 52 C53 30 65 20 80 20 C95 20 107 30 107 52 C104 40 94 32 80 32 C66 32 56 40 53 52 Z" fill={hairColor} />
          {/* Side-swept bangs */}
          <path d="M58 42 C60 32 68 26 78 24 C70 28 64 34 60 42 Z" fill={hairColor} />
          <path d="M92 32 C96 26 101 28 105 36 C101 30 96 26 88 27 Z" fill={hairColor} />
          {/* Extra volume tuft */}
          <path d="M82 22 C88 17 96 19 101 25 C95 21 87 19 82 22 Z" fill={hairColor} />
          {/* Side wraps around head */}
          <path d="M53 42 C52 48 52 54 53 58 C54 52 54 46 55 40 Z" fill={hairColor} />
          <path d="M107 42 C108 48 108 54 107 58 C106 52 106 46 105 40 Z" fill={hairColor} />
          {/* Hair highlights */}
          <path d="M64 26 C72 21 88 21 96 26" fill="none" stroke="white" strokeWidth="2.5" opacity="0.2" strokeLinecap="round" />
          <path d="M60 34 C66 27 76 24 84 23" fill="none" stroke="white" strokeWidth="1.5" opacity="0.12" strokeLinecap="round" />
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
