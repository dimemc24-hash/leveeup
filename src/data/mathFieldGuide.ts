/**
 * Cryptid Field Guide — Math Mode: problem structure, packs, and strategy tips.
 */

import type { MathEvalType } from '../lib/mathEval';

export interface ProblemStep {
  id: string;
  type: 'model' | 'equation' | 'statement' | 'check_equation' | 'strategy_explanation' | 'true_false_work';
  prompt: string;
  evaluationType: MathEvalType;
  required: boolean;
  canvasHeight?: number;
}

export interface MathProblem {
  id: string;
  type: 'computation' | 'word_problem' | 'true_false' | 'strategy';
  problem: string;
  expectedAnswer: number | string;
  expectedEquation?: string;
  leftValue?: number;
  rightValue?: number;
  steps: ProblemStep[];
  strategyTip: string;
}

export interface MathProblemPack {
  id: string;
  name: string;
  problems: MathProblem[];
}

export const STRATEGY_TIPS: Record<string, string> = {
  place_value: 'Try a place value chart — break numbers into hundreds, tens, and ones. Regroup when you need to!',
  compensation: 'Is one number close to a round number? Subtract the round number, then adjust back! (298 is close to 300)',
  counting_up: 'When numbers are close together, try counting UP from the smaller number!',
  check_addition: 'Always check subtraction with addition — add your answer to the smaller number. You should get the bigger number back!',
  show_equation: 'A field researcher always documents the expedition. Write the full equation, not just the answer!',
  write_statement: 'Finish your report! Write a complete sentence that answers the question.',
  explain_strategy: "Tell me HOW you solved it — 'First I... then I...' What did you do with the numbers?",
  both_sides: 'Solve the left side first, then the right side, then compare! Write both answers.',
  read_carefully: 'Read the problem one more time — what operation do the words tell you to use?',
  word_problem_model: 'Drawing a tape diagram or number line can help you SEE the problem before solving it.',
};

export const mathProblemPacks: MathProblemPack[] = [
  {
    id: 'subtraction-expedition',
    name: 'Subtraction Expedition',
    problems: [
      {
        id: 'sub-1',
        type: 'computation',
        problem: '544 - 239 = ?',
        expectedAnswer: 305,
        expectedEquation: '305 + 239 = 544',
        steps: [
          { id: 'solve', type: 'equation', prompt: 'Solve it — write your equation', evaluationType: 'equation', required: true },
          { id: 'check', type: 'check_equation', prompt: 'Verify your sighting — write an addition equation to check your answer', evaluationType: 'check_equation', required: true },
        ],
        strategyTip: STRATEGY_TIPS.place_value,
      },
      {
        id: 'sub-2',
        type: 'computation',
        problem: '929 - 475 = ?',
        expectedAnswer: 454,
        expectedEquation: '454 + 475 = 929',
        steps: [
          { id: 'solve', type: 'equation', prompt: 'Solve it — write your equation', evaluationType: 'equation', required: true },
          { id: 'check', type: 'check_equation', prompt: 'Verify — write an addition equation to check', evaluationType: 'check_equation', required: true },
        ],
        strategyTip: STRATEGY_TIPS.place_value,
      },
      {
        id: 'sub-3',
        type: 'computation',
        problem: '822 - 478 = ?',
        expectedAnswer: 344,
        expectedEquation: '344 + 478 = 822',
        steps: [
          { id: 'solve', type: 'equation', prompt: 'Solve it — write your equation', evaluationType: 'equation', required: true },
          { id: 'check', type: 'check_equation', prompt: 'Verify — write an addition equation to check', evaluationType: 'check_equation', required: true },
        ],
        strategyTip: STRATEGY_TIPS.check_addition,
      },
      {
        id: 'sub-4',
        type: 'computation',
        problem: '743 - 357 = ?',
        expectedAnswer: 386,
        expectedEquation: '386 + 357 = 743',
        steps: [
          { id: 'solve', type: 'equation', prompt: 'Solve it — write your equation', evaluationType: 'equation', required: true },
          { id: 'check', type: 'check_equation', prompt: 'Verify — write an addition equation to check', evaluationType: 'check_equation', required: true },
        ],
        strategyTip: STRATEGY_TIPS.place_value,
      },
      {
        id: 'sub-5',
        type: 'computation',
        problem: '478 - 294 = ?',
        expectedAnswer: 184,
        expectedEquation: '184 + 294 = 478',
        steps: [
          { id: 'solve', type: 'equation', prompt: 'Solve it — write your equation', evaluationType: 'equation', required: true },
          { id: 'check', type: 'check_equation', prompt: 'Verify — write an addition equation to check', evaluationType: 'check_equation', required: true },
        ],
        strategyTip: STRATEGY_TIPS.place_value,
      },
      {
        id: 'sub-6',
        type: 'computation',
        problem: '741 - 446 = ?',
        expectedAnswer: 295,
        expectedEquation: '295 + 446 = 741',
        steps: [
          { id: 'solve', type: 'equation', prompt: 'Solve it — write your equation', evaluationType: 'equation', required: true },
          { id: 'check', type: 'check_equation', prompt: 'Verify — write an addition equation to check', evaluationType: 'check_equation', required: true },
        ],
        strategyTip: STRATEGY_TIPS.check_addition,
      },
      {
        id: 'sub-7',
        type: 'computation',
        problem: '600 - 308 = ?',
        expectedAnswer: 292,
        expectedEquation: '292 + 308 = 600',
        steps: [
          { id: 'solve', type: 'equation', prompt: 'Solve it — write your equation', evaluationType: 'equation', required: true },
          { id: 'check', type: 'check_equation', prompt: 'Verify — write an addition equation to check', evaluationType: 'check_equation', required: true },
        ],
        strategyTip: STRATEGY_TIPS.place_value,
      },
      {
        id: 'sub-8',
        type: 'computation',
        problem: '503 - 267 = ?',
        expectedAnswer: 236,
        expectedEquation: '236 + 267 = 503',
        steps: [
          { id: 'solve', type: 'equation', prompt: 'Solve it — write your equation', evaluationType: 'equation', required: true },
          { id: 'check', type: 'check_equation', prompt: 'Verify — write an addition equation to check', evaluationType: 'check_equation', required: true },
        ],
        strategyTip: STRATEGY_TIPS.place_value,
      },
      {
        id: 'sub-9',
        type: 'computation',
        problem: '800 - 456 = ?',
        expectedAnswer: 344,
        expectedEquation: '344 + 456 = 800',
        steps: [
          { id: 'solve', type: 'equation', prompt: 'Solve it — write your equation', evaluationType: 'equation', required: true },
          { id: 'check', type: 'check_equation', prompt: 'Verify — write an addition equation to check', evaluationType: 'check_equation', required: true },
        ],
        strategyTip: STRATEGY_TIPS.place_value,
      },
      {
        id: 'sub-10',
        type: 'computation',
        problem: '712 - 389 = ?',
        expectedAnswer: 323,
        expectedEquation: '323 + 389 = 712',
        steps: [
          { id: 'solve', type: 'equation', prompt: 'Solve it — write your equation', evaluationType: 'equation', required: true },
          { id: 'check', type: 'check_equation', prompt: 'Verify — write an addition equation to check', evaluationType: 'check_equation', required: true },
        ],
        strategyTip: STRATEGY_TIPS.place_value,
      },
    ],
  },
  {
    id: 'zoo-expedition',
    name: 'Zoo Expedition',
    problems: [
      {
        id: 'word-1',
        type: 'word_problem',
        problem: '63 students went on a trip to the zoo. 48 fewer teachers than students went to the zoo. How many teachers went to the zoo?',
        expectedAnswer: 15,
        expectedEquation: '63 - 48 = 15',
        steps: [
          { id: 'model', type: 'model', prompt: '🗺️ Track It — draw a model to help you solve this', evaluationType: 'model_present', required: false, canvasHeight: 320 },
          { id: 'equation', type: 'equation', prompt: '⚡ Trap It — write your equation with the answer', evaluationType: 'equation', required: true },
          { id: 'statement', type: 'statement', prompt: '📝 Log It — write a sentence answering the question', evaluationType: 'statement', required: false },
        ],
        strategyTip: STRATEGY_TIPS.read_carefully,
      },
      {
        id: 'word-2',
        type: 'word_problem',
        problem: 'There are 234 red birds and 178 blue birds at the sanctuary. How many more red birds?',
        expectedAnswer: 56,
        expectedEquation: '234 - 178 = 56',
        steps: [
          { id: 'model', type: 'model', prompt: '🗺️ Track It — draw a model', evaluationType: 'model_present', required: false, canvasHeight: 320 },
          { id: 'equation', type: 'equation', prompt: '⚡ Trap It — write your equation with the answer', evaluationType: 'equation', required: true },
          { id: 'statement', type: 'statement', prompt: '📝 Log It — write a sentence answering the question', evaluationType: 'statement', required: false },
        ],
        strategyTip: STRATEGY_TIPS.word_problem_model,
      },
      {
        id: 'word-3',
        type: 'word_problem',
        problem: 'The museum had 415 visitors Saturday and 287 Sunday. How many more on Saturday?',
        expectedAnswer: 128,
        expectedEquation: '415 - 287 = 128',
        steps: [
          { id: 'model', type: 'model', prompt: '🗺️ Track It — draw a model', evaluationType: 'model_present', required: false, canvasHeight: 320 },
          { id: 'equation', type: 'equation', prompt: '⚡ Trap It — write your equation with the answer', evaluationType: 'equation', required: true },
          { id: 'statement', type: 'statement', prompt: '📝 Log It — write a sentence answering the question', evaluationType: 'statement', required: false },
        ],
        strategyTip: STRATEGY_TIPS.place_value,
      },
      {
        id: 'word-4',
        type: 'word_problem',
        problem: 'A park has 362 oak trees and 198 pine trees. How many more oak trees?',
        expectedAnswer: 164,
        expectedEquation: '362 - 198 = 164',
        steps: [
          { id: 'model', type: 'model', prompt: '🗺️ Track It — draw a model', evaluationType: 'model_present', required: false, canvasHeight: 320 },
          { id: 'equation', type: 'equation', prompt: '⚡ Trap It — write your equation with the answer', evaluationType: 'equation', required: true },
          { id: 'statement', type: 'statement', prompt: '📝 Log It — write a sentence answering the question', evaluationType: 'statement', required: false },
        ],
        strategyTip: STRATEGY_TIPS.compensation,
      },
      {
        id: 'word-5',
        type: 'word_problem',
        problem: 'Freddy collected 253 rocks. His sister collected 175. How many more did Freddy collect?',
        expectedAnswer: 78,
        expectedEquation: '253 - 175 = 78',
        steps: [
          { id: 'model', type: 'model', prompt: '🗺️ Track It — draw a model', evaluationType: 'model_present', required: false, canvasHeight: 320 },
          { id: 'equation', type: 'equation', prompt: '⚡ Trap It — write your equation with the answer', evaluationType: 'equation', required: true },
          { id: 'statement', type: 'statement', prompt: '📝 Log It — write a sentence answering the question', evaluationType: 'statement', required: false },
        ],
        strategyTip: STRATEGY_TIPS.place_value,
      },
      {
        id: 'word-6',
        type: 'word_problem',
        problem: 'The school library has 521 fiction books and 347 nonfiction. How many more fiction books?',
        expectedAnswer: 174,
        expectedEquation: '521 - 347 = 174',
        steps: [
          { id: 'model', type: 'model', prompt: '🗺️ Track It — draw a model', evaluationType: 'model_present', required: false, canvasHeight: 320 },
          { id: 'equation', type: 'equation', prompt: '⚡ Trap It — write your equation with the answer', evaluationType: 'equation', required: true },
          { id: 'statement', type: 'statement', prompt: '📝 Log It — write a sentence answering the question', evaluationType: 'statement', required: false },
        ],
        strategyTip: STRATEGY_TIPS.place_value,
      },
      {
        id: 'word-7',
        type: 'word_problem',
        problem: '346 kids signed up for soccer. 189 signed up for basketball. How many more chose soccer?',
        expectedAnswer: 157,
        expectedEquation: '346 - 189 = 157',
        steps: [
          { id: 'model', type: 'model', prompt: '🗺️ Track It — draw a model', evaluationType: 'model_present', required: false, canvasHeight: 320 },
          { id: 'equation', type: 'equation', prompt: '⚡ Trap It — write your equation with the answer', evaluationType: 'equation', required: true },
          { id: 'statement', type: 'statement', prompt: '📝 Log It — write a sentence answering the question', evaluationType: 'statement', required: false },
        ],
        strategyTip: STRATEGY_TIPS.counting_up,
      },
    ],
  },
  {
    id: 'true-false-tracker',
    name: 'True or False Tracker',
    problems: [
      { id: 'tf-1', type: 'true_false', problem: '14 - 5 = 16 - 7', expectedAnswer: 'true', leftValue: 9, rightValue: 9, steps: [{ id: 'work', type: 'true_false_work', prompt: 'Show your work — solve BOTH sides, then write True or False', evaluationType: 'true_false_work', required: true, canvasHeight: 320 }], strategyTip: STRATEGY_TIPS.both_sides },
      { id: 'tf-2', type: 'true_false', problem: '9 - 3 = 12 - 6', expectedAnswer: 'true', leftValue: 6, rightValue: 6, steps: [{ id: 'work', type: 'true_false_work', prompt: 'Show your work — solve BOTH sides, then write True or False', evaluationType: 'true_false_work', required: true, canvasHeight: 320 }], strategyTip: STRATEGY_TIPS.both_sides },
      { id: 'tf-3', type: 'true_false', problem: '7 + 4 = 13 - 1', expectedAnswer: 'false', leftValue: 11, rightValue: 12, steps: [{ id: 'work', type: 'true_false_work', prompt: 'Show your work — solve BOTH sides, then write True or False', evaluationType: 'true_false_work', required: true, canvasHeight: 320 }], strategyTip: STRATEGY_TIPS.both_sides },
      { id: 'tf-4', type: 'true_false', problem: '10 - 1 = 12 - 3', expectedAnswer: 'true', leftValue: 9, rightValue: 9, steps: [{ id: 'work', type: 'true_false_work', prompt: 'Show your work — solve BOTH sides, then write True or False', evaluationType: 'true_false_work', required: true, canvasHeight: 320 }], strategyTip: STRATEGY_TIPS.both_sides },
      { id: 'tf-5', type: 'true_false', problem: '15 - 3 = 12 + 3', expectedAnswer: 'false', leftValue: 12, rightValue: 15, steps: [{ id: 'work', type: 'true_false_work', prompt: 'Show your work — solve BOTH sides, then write True or False', evaluationType: 'true_false_work', required: true, canvasHeight: 320 }], strategyTip: STRATEGY_TIPS.both_sides },
      { id: 'tf-6', type: 'true_false', problem: '19 + 1 = 7 + 13', expectedAnswer: 'true', leftValue: 20, rightValue: 20, steps: [{ id: 'work', type: 'true_false_work', prompt: 'Show your work — solve BOTH sides, then write True or False', evaluationType: 'true_false_work', required: true, canvasHeight: 320 }], strategyTip: STRATEGY_TIPS.both_sides },
      { id: 'tf-7', type: 'true_false', problem: '7 - 3 = 2 + 2', expectedAnswer: 'true', leftValue: 4, rightValue: 4, steps: [{ id: 'work', type: 'true_false_work', prompt: 'Show your work — solve BOTH sides, then write True or False', evaluationType: 'true_false_work', required: true, canvasHeight: 320 }], strategyTip: STRATEGY_TIPS.both_sides },
      { id: 'tf-8', type: 'true_false', problem: '13 - 5 = 12 + 4', expectedAnswer: 'false', leftValue: 8, rightValue: 16, steps: [{ id: 'work', type: 'true_false_work', prompt: 'Show your work — solve BOTH sides, then write True or False', evaluationType: 'true_false_work', required: true, canvasHeight: 320 }], strategyTip: STRATEGY_TIPS.both_sides },
      { id: 'tf-9', type: 'true_false', problem: '8 + 6 = 20 - 6', expectedAnswer: 'true', leftValue: 14, rightValue: 14, steps: [{ id: 'work', type: 'true_false_work', prompt: 'Show your work — solve BOTH sides, then write True or False', evaluationType: 'true_false_work', required: true, canvasHeight: 320 }], strategyTip: STRATEGY_TIPS.both_sides },
      { id: 'tf-10', type: 'true_false', problem: '15 - 7 = 3 + 5', expectedAnswer: 'true', leftValue: 8, rightValue: 8, steps: [{ id: 'work', type: 'true_false_work', prompt: 'Show your work — solve BOTH sides, then write True or False', evaluationType: 'true_false_work', required: true, canvasHeight: 320 }], strategyTip: STRATEGY_TIPS.both_sides },
    ],
  },
  {
    id: 'strategy-journal',
    name: 'Strategy Journal',
    problems: [
      { id: 'strat-1', type: 'strategy', problem: '695 - 290 = ?', expectedAnswer: 405, steps: [{ id: 'solve', type: 'equation', prompt: 'Solve it — write your equation', evaluationType: 'equation', required: true }, { id: 'explain', type: 'strategy_explanation', prompt: '📖 Tell the story — HOW did you solve it? What did you do with the numbers?', evaluationType: 'strategy_explanation', required: true, canvasHeight: 260 }], strategyTip: STRATEGY_TIPS.explain_strategy },
      { id: 'strat-2', type: 'strategy', problem: '450 - 199 = ?', expectedAnswer: 251, steps: [{ id: 'solve', type: 'equation', prompt: 'Solve it — write your equation', evaluationType: 'equation', required: true }, { id: 'explain', type: 'strategy_explanation', prompt: '📖 Tell the story — HOW did you solve it?', evaluationType: 'strategy_explanation', required: true, canvasHeight: 260 }], strategyTip: STRATEGY_TIPS.compensation },
      { id: 'strat-3', type: 'strategy', problem: '800 - 347 = ?', expectedAnswer: 453, steps: [{ id: 'solve', type: 'equation', prompt: 'Solve it — write your equation', evaluationType: 'equation', required: true }, { id: 'explain', type: 'strategy_explanation', prompt: '📖 Tell the story — HOW did you solve it?', evaluationType: 'strategy_explanation', required: true, canvasHeight: 260 }], strategyTip: STRATEGY_TIPS.place_value },
      { id: 'strat-4', type: 'strategy', problem: '563 - 298 = ?', expectedAnswer: 265, steps: [{ id: 'solve', type: 'equation', prompt: 'Solve it — write your equation', evaluationType: 'equation', required: true }, { id: 'explain', type: 'strategy_explanation', prompt: '📖 Tell the story — HOW did you solve it?', evaluationType: 'strategy_explanation', required: true, canvasHeight: 260 }], strategyTip: STRATEGY_TIPS.counting_up },
      { id: 'strat-5', type: 'strategy', problem: '1000 - 642 = ?', expectedAnswer: 358, steps: [{ id: 'solve', type: 'equation', prompt: 'Solve it — write your equation', evaluationType: 'equation', required: true }, { id: 'explain', type: 'strategy_explanation', prompt: '📖 Tell the story — HOW did you solve it?', evaluationType: 'strategy_explanation', required: true, canvasHeight: 260 }], strategyTip: STRATEGY_TIPS.place_value },
      { id: 'strat-6', type: 'strategy', problem: '725 - 399 = ?', expectedAnswer: 326, steps: [{ id: 'solve', type: 'equation', prompt: 'Solve it — write your equation', evaluationType: 'equation', required: true }, { id: 'explain', type: 'strategy_explanation', prompt: '📖 Tell the story — HOW did you solve it?', evaluationType: 'strategy_explanation', required: true, canvasHeight: 260 }], strategyTip: STRATEGY_TIPS.compensation },
      { id: 'strat-7', type: 'strategy', problem: '600 - 245 = ?', expectedAnswer: 355, steps: [{ id: 'solve', type: 'equation', prompt: 'Solve it — write your equation', evaluationType: 'equation', required: true }, { id: 'explain', type: 'strategy_explanation', prompt: '📖 Tell the story — HOW did you solve it?', evaluationType: 'strategy_explanation', required: true, canvasHeight: 260 }], strategyTip: STRATEGY_TIPS.place_value },
      { id: 'strat-8', type: 'strategy', problem: '504 - 297 = ?', expectedAnswer: 207, steps: [{ id: 'solve', type: 'equation', prompt: 'Solve it — write your equation', evaluationType: 'equation', required: true }, { id: 'explain', type: 'strategy_explanation', prompt: '📖 Tell the story — HOW did you solve it?', evaluationType: 'strategy_explanation', required: true, canvasHeight: 260 }], strategyTip: STRATEGY_TIPS.counting_up },
    ],
  },
];

/** Cryptids for Field Guide reveals (same roster as Spell Caster, can share or duplicate). */
export const fieldGuideCryptids = [
  { id: 'fg-1', name: 'Mothman', emoji: '🦇', oneLiner: 'Winged watcher of the night!' },
  { id: 'fg-2', name: 'Chupacabra', emoji: '🐺', oneLiner: 'Mysterious creature of the ranch!' },
  { id: 'fg-3', name: 'Sasquatch', emoji: '🦶', oneLiner: 'Bigfoot of the forest!' },
  { id: 'fg-4', name: 'Jackalope', emoji: '🐰', oneLiner: 'The horned rabbit of the plains!' },
  { id: 'fg-5', name: 'Thunderbird', emoji: '🦅', oneLiner: 'Giant bird of storm and legend!' },
  { id: 'fg-6', name: 'Jersey Devil', emoji: '😈', oneLiner: 'Flying creature of the Pine Barrens!' },
  { id: 'fg-7', name: 'Mokele-mbembe', emoji: '🦕', oneLiner: 'Living dinosaur of the Congo!' },
  { id: 'fg-8', name: 'Ahool', emoji: '🦇', oneLiner: 'Giant bat of Java!' },
  { id: 'fg-9', name: 'Wendigo', emoji: '❄️', oneLiner: 'Spirit of the winter woods!' },
  { id: 'fg-10', name: 'Nessie', emoji: '🐉', oneLiner: 'The Loch Ness Monster!' },
  { id: 'fg-11', name: 'Kraken', emoji: '🐙', oneLiner: 'Giant squid of the deep!' },
  { id: 'fg-12', name: 'Yeti', emoji: '🏔️', oneLiner: 'Abominable Snowman of the mountains!' },
  { id: 'fg-13', name: 'Hodag', emoji: '🦎', oneLiner: 'Fearsome beast of Wisconsin!' },
  { id: 'fg-14', name: 'Skinwalker', emoji: '🐺', oneLiner: 'Shape-shifter of legend!' },
  { id: 'fg-15', name: 'Mapinguari', emoji: '🦥', oneLiner: 'Giant sloth of the Amazon!' },
];
