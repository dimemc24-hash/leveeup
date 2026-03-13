/**
 * Cryptid Spell Caster — word packs, sentences, and spelling tips.
 * Aligned to Freddy's test patterns (Louisiana 2nd grade).
 */

export interface WordPack {
  id: string;
  name: string;
  words: string[];
}

export const wordPacks: WordPack[] = [
  {
    id: 'freddy-test',
    name: "Freddy's Test Words",
    words: ['relief', 'movie', 'field', 'ladies', 'kitties', 'piece', 'smiled', 'yelled', 'cookies', 'thief', 'lies', 'grief', 'babies', 'achieve', 'water'],
  },
  {
    id: 'ie-ei',
    name: 'ie & ei Words',
    words: ['believe', 'chief', 'field', 'grief', 'piece', 'relief', 'shield', 'thief', 'yield', 'achieve', 'receive', 'friend'],
  },
  {
    id: 'plural-power',
    name: 'Plural Power',
    words: ['ladies', 'kitties', 'babies', 'stories', 'puppies', 'ponies', 'families', 'pennies', 'cities', 'parties', 'cookies'],
  },
  {
    id: 'past-tense',
    name: 'Past Tense',
    words: ['smiled', 'yelled', 'tried', 'cried', 'believed', 'achieved', 'received', 'yielded', 'shielded'],
  },
];

/** Sentence for "Use in a sentence" — sentence then word alone. */
export const sentences: Record<string, string> = {
  relief: 'I felt such relief when the test was over. Relief.',
  movie: 'We watched a great movie last night. Movie.',
  field: 'The kids played in the field. Field.',
  ladies: 'The ladies went shopping together. Ladies.',
  kitties: 'The little kitties were so cute. Kitties.',
  piece: 'Can I have a piece of cake? Piece.',
  smiled: 'She smiled when she saw her friend. Smiled.',
  yelled: 'He yelled across the playground. Yelled.',
  cookies: 'Mom baked chocolate chip cookies. Cookies.',
  thief: 'The thief ran away quickly. Thief.',
  lies: 'A good friend never lies. Lies.',
  grief: 'She felt grief when her pet was lost. Grief.',
  babies: 'The babies were sleeping quietly. Babies.',
  achieve: 'You can achieve anything you work hard for. Achieve.',
  water: 'Please drink some water. Water.',
  believe: 'I believe you can do it. Believe.',
  chief: 'The chief made an important decision. Chief.',
  shield: 'The knight held a strong shield. Shield.',
  yield: 'The sign said yield to traffic. Yield.',
  receive: 'Did you receive my letter? Receive.',
  friend: 'My best friend came over to play. Friend.',
  stories: 'We read three stories before bed. Stories.',
  puppies: 'The puppies were running in the yard. Puppies.',
  ponies: 'We saw the ponies at the farm. Ponies.',
  families: 'Many families came to the picnic. Families.',
  pennies: 'I saved ten pennies in my jar. Pennies.',
  cities: 'We visited two cities on our trip. Cities.',
  parties: 'Birthday parties are so much fun. Parties.',
  tried: 'She tried her best on the test. Tried.',
  cried: 'The baby cried when he was hungry. Cried.',
  believed: 'We believed the story was true. Believed.',
  achieved: 'He achieved his goal. Achieved.',
  received: 'She received a gift in the mail. Received.',
  yielded: 'The driver yielded at the corner. Yielded.',
  shielded: 'The umbrella shielded us from the rain. Shielded.',
};

/** Default sentence pattern when word has no custom sentence. */
export function getSentenceForWord(word: string): string {
  const lower = word.toLowerCase();
  if (sentences[lower]) return sentences[lower];
  const cap = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  return `The word is ${word}. ${cap}.`;
}

/** Spelling tip key: word or rule. */
export function getSpellingTip(word: string): string {
  const w = word.toLowerCase();
  if (w === 'receive') return '"i before e EXCEPT after c" — r-e-c-e-i-v-e';
  if (w === 'friend') return 'This one breaks the rule! f-r-i-e-n-d';
  if (/-ies$/.test(w)) return 'Change the y to i, add -es: baby → babies';
  if (/-ed$/.test(w)) {
    const base = w.slice(0, -2);
    if (base.endsWith('e')) return 'Drop silent e, add -d: smile → smiled';
    return 'Just add -ed: yell → yelled';
  }
  if (/ie|ei/.test(w)) return '"i before e" — spell it out letter by letter';
  return 'Say the word slowly and write each sound.';
}

/** Cryptid reveal roster for Spell Caster (order matters). */
export interface SpellCasterCryptid {
  id: string;
  name: string;
  emoji: string;
  oneLiner: string;
}

export const spellCasterCryptids: SpellCasterCryptid[] = [
  { id: 'mothman', name: 'Mothman', emoji: '🦇', oneLiner: 'Winged watcher of the night!' },
  { id: 'chupacabra', name: 'Chupacabra', emoji: '🐺', oneLiner: 'Mysterious creature of the ranch!' },
  { id: 'sasquatch', name: 'Sasquatch', emoji: '🦶', oneLiner: 'Bigfoot of the forest!' },
  { id: 'jackalope', name: 'Jackalope', emoji: '🐰', oneLiner: 'The horned rabbit of the plains!' },
  { id: 'thunderbird', name: 'Thunderbird', emoji: '🦅', oneLiner: 'Giant bird of storm and legend!' },
  { id: 'jersey-devil', name: 'Jersey Devil', emoji: '😈', oneLiner: 'Flying creature of the Pine Barrens!' },
  { id: 'mokele-mbembe', name: 'Mokele-mbembe', emoji: '🦕', oneLiner: 'Living dinosaur of the Congo!' },
  { id: 'ahool', name: 'Ahool', emoji: '🦇', oneLiner: 'Giant bat of Java!' },
  { id: 'wendigo', name: 'Wendigo', emoji: '❄️', oneLiner: 'Spirit of the winter woods!' },
  { id: 'nessie', name: 'Nessie', emoji: '🐉', oneLiner: 'The Loch Ness Monster!' },
  { id: 'kraken', name: 'Kraken', emoji: '🐙', oneLiner: 'Giant squid of the deep!' },
  { id: 'yeti', name: 'Yeti', emoji: '🏔️', oneLiner: 'Abominable Snowman of the mountains!' },
  { id: 'hodag', name: 'Hodag', emoji: '🦎', oneLiner: 'Fearsome beast of Wisconsin!' },
  { id: 'skinwalker', name: 'Skinwalker', emoji: '🐺', oneLiner: 'Shape-shifter of legend!' },
  { id: 'mapinguari', name: 'Mapinguari', emoji: '🦥', oneLiner: 'Giant sloth of the Amazon!' },
];
