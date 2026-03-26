export interface BuilderPuzzle {
  id: string;
  type: 'sentence' | 'equation';
  pieces: string[];
  display: string;
  subject: 'math' | 'ela';
}

export const builderPuzzles: BuilderPuzzle[] = [
  // ELA sentences
  { id: 'b-e1', type: 'sentence', pieces: ['The', 'dog', 'ran', 'fast'], display: 'The dog ran fast.', subject: 'ela' },
  { id: 'b-e2', type: 'sentence', pieces: ['She', 'found', 'a', 'clue'], display: 'She found a clue.', subject: 'ela' },
  { id: 'b-e3', type: 'sentence', pieces: ['The', 'swamp', 'was', 'dark'], display: 'The swamp was dark.', subject: 'ela' },
  { id: 'b-e4', type: 'sentence', pieces: ['We', 'saw', 'the', 'creature'], display: 'We saw the creature.', subject: 'ela' },
  { id: 'b-e5', type: 'sentence', pieces: ['Birds', 'fly', 'over', 'the', 'lake'], display: 'Birds fly over the lake.', subject: 'ela' },
  { id: 'b-e6', type: 'sentence', pieces: ['The', 'moon', 'is', 'very', 'bright'], display: 'The moon is very bright.', subject: 'ela' },
  { id: 'b-e7', type: 'sentence', pieces: ['Frogs', 'live', 'near', 'water'], display: 'Frogs live near water.', subject: 'ela' },
  { id: 'b-e8', type: 'sentence', pieces: ['He', 'heard', 'a', 'loud', 'noise'], display: 'He heard a loud noise.', subject: 'ela' },
  { id: 'b-e9', type: 'sentence', pieces: ['The', 'tracks', 'led', 'into', 'the', 'forest'], display: 'The tracks led into the forest.', subject: 'ela' },
  { id: 'b-e10', type: 'sentence', pieces: ['We', 'need', 'more', 'evidence'], display: 'We need more evidence.', subject: 'ela' },
  { id: 'b-e11', type: 'sentence', pieces: ['The', 'creature', 'hid', 'in', 'the', 'shadows'], display: 'The creature hid in the shadows.', subject: 'ela' },
  { id: 'b-e12', type: 'sentence', pieces: ['Investigators', 'search', 'for', 'clues'], display: 'Investigators search for clues.', subject: 'ela' },

  // Math equations
  { id: 'b-m1', type: 'equation', pieces: ['7', '+', '5', '=', '12'], display: '7 + 5 = 12', subject: 'math' },
  { id: 'b-m2', type: 'equation', pieces: ['15', '-', '8', '=', '7'], display: '15 - 8 = 7', subject: 'math' },
  { id: 'b-m3', type: 'equation', pieces: ['9', '+', '6', '=', '15'], display: '9 + 6 = 15', subject: 'math' },
  { id: 'b-m4', type: 'equation', pieces: ['13', '-', '4', '=', '9'], display: '13 - 4 = 9', subject: 'math' },
  { id: 'b-m5', type: 'equation', pieces: ['8', '+', '8', '=', '16'], display: '8 + 8 = 16', subject: 'math' },
  { id: 'b-m6', type: 'equation', pieces: ['17', '-', '9', '=', '8'], display: '17 - 9 = 8', subject: 'math' },
  { id: 'b-m7', type: 'equation', pieces: ['24', '+', '18', '=', '42'], display: '24 + 18 = 42', subject: 'math' },
  { id: 'b-m8', type: 'equation', pieces: ['11', '+', '7', '=', '18'], display: '11 + 7 = 18', subject: 'math' },
  { id: 'b-m9', type: 'equation', pieces: ['20', '-', '6', '=', '14'], display: '20 - 6 = 14', subject: 'math' },
  { id: 'b-m10', type: 'equation', pieces: ['14', '-', '6', '=', '8'], display: '14 - 6 = 8', subject: 'math' },
  { id: 'b-m11', type: 'equation', pieces: ['30', '+', '40', '=', '70'], display: '30 + 40 = 70', subject: 'math' },
  { id: 'b-m12', type: 'equation', pieces: ['50', '-', '20', '=', '30'], display: '50 - 20 = 30', subject: 'math' },
];
