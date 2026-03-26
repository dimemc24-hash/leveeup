export interface SortingRound {
  id: string;
  categoryA: string;
  categoryB: string;
  items: { text: string; category: 'A' | 'B' }[];
  subject: 'math' | 'ela' | 'science' | 'social_studies';
}

export const sortingRounds: SortingRound[] = [
  { id: 'sr1', categoryA: 'Even', categoryB: 'Odd', subject: 'math',
    items: [
      { text: '4', category: 'A' }, { text: '7', category: 'B' },
      { text: '12', category: 'A' }, { text: '9', category: 'B' },
      { text: '16', category: 'A' }, { text: '3', category: 'B' },
      { text: '20', category: 'A' }, { text: '15', category: 'B' },
      { text: '8', category: 'A' }, { text: '11', category: 'B' },
    ]},
  { id: 'sr2', categoryA: 'Less than 50', categoryB: '50 or More', subject: 'math',
    items: [
      { text: '23', category: 'A' }, { text: '67', category: 'B' },
      { text: '45', category: 'A' }, { text: '82', category: 'B' },
      { text: '11', category: 'A' }, { text: '50', category: 'B' },
      { text: '38', category: 'A' }, { text: '91', category: 'B' },
      { text: '7', category: 'A' }, { text: '55', category: 'B' },
    ]},
  { id: 'sr3', categoryA: 'Less than 10', categoryB: '10 or More', subject: 'math',
    items: [
      { text: '3 + 4', category: 'A' }, { text: '6 + 7', category: 'B' },
      { text: '5 + 2', category: 'A' }, { text: '8 + 5', category: 'B' },
      { text: '9 - 3', category: 'A' }, { text: '9 + 4', category: 'B' },
      { text: '8 - 1', category: 'A' }, { text: '7 + 6', category: 'B' },
      { text: '12 - 5', category: 'A' }, { text: '8 + 8', category: 'B' },
    ]},
  { id: 'sr4', categoryA: 'Nouns', categoryB: 'Verbs', subject: 'ela',
    items: [
      { text: 'swamp', category: 'A' }, { text: 'run', category: 'B' },
      { text: 'creature', category: 'A' }, { text: 'hide', category: 'B' },
      { text: 'footprint', category: 'A' }, { text: 'search', category: 'B' },
      { text: 'forest', category: 'A' }, { text: 'growl', category: 'B' },
      { text: 'clue', category: 'A' }, { text: 'discover', category: 'B' },
    ]},
  { id: 'sr5', categoryA: 'Real Words', categoryB: 'Nonsense', subject: 'ela',
    items: [
      { text: 'track', category: 'A' }, { text: 'plonk', category: 'B' },
      { text: 'ghost', category: 'A' }, { text: 'bloop', category: 'B' },
      { text: 'marsh', category: 'A' }, { text: 'snarfle', category: 'B' },
      { text: 'beast', category: 'A' }, { text: 'gribbet', category: 'B' },
      { text: 'creek', category: 'A' }, { text: 'zolp', category: 'B' },
    ]},
  { id: 'sr6', categoryA: 'Living', categoryB: 'Nonliving', subject: 'science',
    items: [
      { text: 'frog', category: 'A' }, { text: 'rock', category: 'B' },
      { text: 'tree', category: 'A' }, { text: 'water', category: 'B' },
      { text: 'bird', category: 'A' }, { text: 'cloud', category: 'B' },
      { text: 'fish', category: 'A' }, { text: 'mud', category: 'B' },
      { text: 'moss', category: 'A' }, { text: 'sunlight', category: 'B' },
    ]},
  { id: 'sr7', categoryA: 'Land Animals', categoryB: 'Water Animals', subject: 'science',
    items: [
      { text: 'deer', category: 'A' }, { text: 'catfish', category: 'B' },
      { text: 'bear', category: 'A' }, { text: 'crawfish', category: 'B' },
      { text: 'rabbit', category: 'A' }, { text: 'turtle', category: 'B' },
      { text: 'fox', category: 'A' }, { text: 'frog', category: 'B' },
      { text: 'squirrel', category: 'A' }, { text: 'alligator', category: 'B' },
    ]},
  { id: 'sr8', categoryA: 'Needs', categoryB: 'Wants', subject: 'social_studies',
    items: [
      { text: 'food', category: 'A' }, { text: 'toys', category: 'B' },
      { text: 'water', category: 'A' }, { text: 'candy', category: 'B' },
      { text: 'shelter', category: 'A' }, { text: 'video games', category: 'B' },
      { text: 'clothes', category: 'A' }, { text: 'stickers', category: 'B' },
      { text: 'air', category: 'A' }, { text: 'ice cream', category: 'B' },
    ]},
  { id: 'sr9', categoryA: 'Helpers', categoryB: 'Places', subject: 'social_studies',
    items: [
      { text: 'firefighter', category: 'A' }, { text: 'school', category: 'B' },
      { text: 'teacher', category: 'A' }, { text: 'hospital', category: 'B' },
      { text: 'doctor', category: 'A' }, { text: 'library', category: 'B' },
      { text: 'police', category: 'A' }, { text: 'park', category: 'B' },
      { text: 'nurse', category: 'A' }, { text: 'store', category: 'B' },
    ]},
  { id: 'sr10', categoryA: 'Long Ago', categoryB: 'Today', subject: 'social_studies',
    items: [
      { text: 'horse & buggy', category: 'A' }, { text: 'car', category: 'B' },
      { text: 'candle', category: 'A' }, { text: 'light bulb', category: 'B' },
      { text: 'quill pen', category: 'A' }, { text: 'tablet', category: 'B' },
      { text: 'well water', category: 'A' }, { text: 'faucet', category: 'B' },
      { text: 'telegram', category: 'A' }, { text: 'phone', category: 'B' },
    ]},
];
