export interface MatchPair {
  id: string;
  front: string;
  back: string;
  subject: 'math' | 'ela' | 'science';
}

export const matchPairs: MatchPair[] = [
  // Math pairs — problem to answer
  { id: 'm1', front: '7 + 8', back: '15', subject: 'math' },
  { id: 'm2', front: '12 - 5', back: '7', subject: 'math' },
  { id: 'm3', front: '9 + 6', back: '15', subject: 'math' },
  { id: 'm4', front: '14 - 8', back: '6', subject: 'math' },
  { id: 'm5', front: '6 + 7', back: '13', subject: 'math' },
  { id: 'm6', front: '16 - 9', back: '7', subject: 'math' },
  { id: 'm7', front: '8 + 5', back: '13', subject: 'math' },
  { id: 'm8', front: '11 - 4', back: '7', subject: 'math' },
  { id: 'm9', front: '15 - 6', back: '9', subject: 'math' },
  { id: 'm10', front: '4 + 9', back: '13', subject: 'math' },
  { id: 'm11', front: '17 - 8', back: '9', subject: 'math' },
  { id: 'm12', front: '5 + 8', back: '13', subject: 'math' },
  { id: 'm13', front: '3 + 9', back: '12', subject: 'math' },
  { id: 'm14', front: '18 - 9', back: '9', subject: 'math' },
  { id: 'm15', front: '6 + 6', back: '12', subject: 'math' },

  // ELA pairs — word to definition
  { id: 'e1', front: 'habitat', back: 'where an animal lives', subject: 'ela' },
  { id: 'e2', front: 'predator', back: 'an animal that hunts', subject: 'ela' },
  { id: 'e3', front: 'nocturnal', back: 'active at night', subject: 'ela' },
  { id: 'e4', front: 'evidence', back: 'proof or clues', subject: 'ela' },
  { id: 'e5', front: 'camouflage', back: 'hiding by blending in', subject: 'ela' },
  { id: 'e6', front: 'investigate', back: 'to look into something', subject: 'ela' },
  { id: 'e7', front: 'creature', back: 'a living thing', subject: 'ela' },
  { id: 'e8', front: 'mysterious', back: 'hard to explain', subject: 'ela' },
  { id: 'e9', front: 'expedition', back: 'a journey to explore', subject: 'ela' },
  { id: 'e10', front: 'legend', back: 'an old famous story', subject: 'ela' },

  // Science pairs
  { id: 's1', front: 'plants need', back: 'sunlight & water', subject: 'science' },
  { id: 's2', front: 'caterpillar becomes', back: 'a butterfly', subject: 'science' },
  { id: 's3', front: 'largest planet', back: 'Jupiter', subject: 'science' },
  { id: 's4', front: 'water freezes at', back: '32 degrees F', subject: 'science' },
  { id: 's5', front: 'bones make up the', back: 'skeleton', subject: 'science' },
  { id: 's6', front: 'Earth orbits the', back: 'Sun', subject: 'science' },
  { id: 's7', front: 'baby frog', back: 'tadpole', subject: 'science' },
  { id: 's8', front: 'animals breathe', back: 'oxygen', subject: 'science' },
];
