import type { ThemeConfig, Cryptid, CryptidClue } from '../../../types';

const CLUE_TYPES: CryptidClue['type'][] = ['footprint', 'witness', 'sample', 'sketch', 'map_pin', 'photo'];
const CLUE_ICONS: Record<CryptidClue['type'], string> = {
  footprint: '/assets/ui/clue-footprint.svg',
  witness: '/assets/ui/clue-witness.svg',
  sample: '/assets/ui/clue-sample.svg',
  sketch: '/assets/ui/clue-sketch.svg',
  map_pin: '/assets/ui/clue-map-pin.svg',
  photo: '/assets/ui/clue-photo.svg',
};
const CLUE_DESCRIPTIONS: Record<CryptidClue['type'], string[]> = {
  footprint: ['Unusual tracks in soft ground', 'Deep impressions near water', 'Fresh prints along a trail'],
  witness: ['A local reported strange sounds', 'A camper saw movement at dusk', 'Eyewitness sketch matches prior reports'],
  sample: ['Unidentified hair sample collected', 'Strange residue on tree bark', 'Organic material sent for analysis'],
  sketch: ['Field sketch from a ranger', 'Composite drawing from witnesses', 'Rough rendering from trail cam still'],
  map_pin: ['New sighting logged on the map', 'Cluster of reports in this area', 'GPS coordinates of fresh evidence'],
  photo: ['Blurry image from a trail camera', 'Thermal signature captured at night', 'Distant shape in a telephoto shot'],
};

/** Generate N clues with cycling types and descriptions. */
function generateClues(prefix: string, count: number, baseClues: CryptidClue[]): CryptidClue[] {
  if (count <= baseClues.length) return baseClues.slice(0, count);
  const clues = [...baseClues];
  for (let i = baseClues.length + 1; i <= count; i++) {
    const type = CLUE_TYPES[(i - 1) % CLUE_TYPES.length];
    const descs = CLUE_DESCRIPTIONS[type];
    const desc = descs[(i - 1) % descs.length];
    clues.push({ id: `${prefix}-${i}`, type, description: desc, svgIcon: CLUE_ICONS[type], revealed: false });
  }
  return clues;
}

export const cryptidTheme: ThemeConfig = {
  id: 'cryptids',
  name: 'Cryptid Hunt',
  colors: {
    primary: '#2d5016',
    secondary: '#4a7c23',
    accent: '#d4a843',
    background: '#f5f0e1',
    surface: '#ffffff',
    text: '#3d2b1f',
    textLight: '#6b5a4e',
    success: '#4a7c23',
    error: '#c0392b',
    warning: '#d4a843',
  },
  narrativeTemplates: {
    welcome: "Welcome back, Investigator! Your field journal awaits.",
    session_start: "New evidence has been reported. Let's investigate!",
    correct_answer: "Excellent fieldwork! You're one step closer to the truth.",
    wrong_answer: "Hmm, that trail went cold. Let's try another approach.",
    streak_3: "You're on a hot trail! Keep going!",
    streak_5: "Incredible tracking skills! The creature can't hide from you!",
    streak_10: "LEGENDARY investigator status! Nothing escapes your eye!",
    evidence_found: "You found a piece of evidence! Add it to your field journal.",
    cryptid_unlocked: "A new cryptid location has been revealed on your map!",
    cryptid_discovered: "AMAZING DISCOVERY! You've identified a new cryptid!",
    frustration_pivot: "The trail went cold here... let's check another lead!",
    daily_login: "Your daily field supply has arrived! Ready to investigate?",
    subject_math: "Solve this to decode the cryptid's coordinates!",
    subject_ela: "Read this eyewitness report carefully for clues!",
    subject_science: "Use your scientist skills to analyze this evidence!",
    subject_social_studies: "Check your field maps and historical records!",
  },
  milestoneMessages: {
    first_evidence: "Your first piece of evidence! The hunt begins!",
    five_evidence: "Five clues collected — you're a natural investigator!",
    first_cryptid: "You've discovered your first cryptid! Check your Field Guide!",
    all_cryptids: "You've found ALL the cryptids! You're a Master Investigator!",
    legendary_nessie: "THE LEGEND IS REAL! After 80 evidence pieces, you've proven the existence of the Loch Ness Monster — the greatest cryptid discovery in history! You are a TRUE Master Investigator!",
    level_5: "Level 5! You've earned your Junior Investigator badge!",
    level_10: "Level 10! Senior Investigator status unlocked!",
    streak_10: "10 in a row! Your tracking instincts are legendary!",
  },
};

export const cryptidRoster: Cryptid[] = [
  {
    id: 'honey-island-swamp-monster',
    name: 'Honey Island Swamp Monster',
    description: 'A mysterious creature lurking in the swamps of Louisiana. Locals say it smells like rotten eggs!',
    region: 'Louisiana Bayou',
    difficulty: 1,
    evidenceRequired: 5,
    svgSilhouette: '/assets/cryptids/honey-island-swamp-monster.svg',
    revealImage: '/assets/cryptids/reveals/honey-island-swamp-monster.jpg',
    clues: [
      { id: 'hism-1', type: 'footprint', description: 'Three-toed footprint in the mud', svgIcon: '/assets/ui/clue-footprint.svg', revealed: false },
      { id: 'hism-2', type: 'witness', description: 'A fisherman saw something large moving through the reeds', svgIcon: '/assets/ui/clue-witness.svg', revealed: false },
      { id: 'hism-3', type: 'sample', description: 'Strange green slime on a cypress tree', svgIcon: '/assets/ui/clue-sample.svg', revealed: false },
      { id: 'hism-4', type: 'sketch', description: 'A blurry sketch from a trail camera', svgIcon: '/assets/ui/clue-sketch.svg', revealed: false },
      { id: 'hism-5', type: 'map_pin', description: 'Multiple sightings near Pearl River', svgIcon: '/assets/ui/clue-map-pin.svg', revealed: false },
    ],
    cardStats: { danger: 3, stealth: 5, mystery: 4 },
    lore: {
      originStory: `Deep in the murky waters of Honey Island Swamp — one of the wildest swamps in all of Louisiana — something strange has been lurking for over a hundred years. The Honey Island Swamp Monster was first spotted in 1963 by a retired air traffic controller named Harlan Ford, who was out hunting with a friend when they stumbled upon unusual tracks in the mud.

The creature is said to stand about seven feet tall, covered in dingy gray hair, with piercing amber eyes that glow in the dark. Its most famous feature? Webbed feet with three toes, perfect for moving silently through the swamp water. Some say it smells like rotting garbage — so you'd smell it before you ever see it!

Local legend says the creature may be the result of chimpanzees escaping from a circus train that crashed near the swamp over a century ago, mixing with the local wildlife over generations. Scientists aren't sure, but the footprint casts Ford collected remain some of the best physical evidence of any cryptid in America.`,
      famousSightings: [
        "1963: Harlan Ford's first encounter while hunting — found three-toed footprints in the swamp mud.",
        '1974: Ford captured shaky footage of a large figure moving through the trees, shown on local TV news.',
        '1980s: Multiple fishermen reported capsized boats near the Pearl River with no explanation.',
        '2000s: Trail cameras in the swamp captured several blurry images of a large, upright figure.',
      ],
      louisianaConnection: "This is Louisiana's very own cryptid! Honey Island Swamp is located in St. Tammany Parish, just northeast of New Orleans. The swamp covers over 70,000 acres and is one of the least-altered river swamps in the country, making it the perfect hiding place for a mysterious creature.",
      funFacts: [
        "The creature's webbed, three-toed footprints are unlike any known animal in Louisiana.",
        'Honey Island Swamp is home to real animals like black bears, wild boar, and alligators — all possible explanations for sightings!',
        "Harlan Ford's original footprint casts are kept in a museum in Slidell, Louisiana.",
        'The swamp got its name from honeybees that were once seen swarming on a small island in the river.',
      ],
      fieldNotes: 'FIELD REPORT #001 — Investigator, if you hear splashing in still water or catch a whiff of something truly terrible, stay alert! The Swamp Monster is most active at dusk. Bring waterproof boots and a strong stomach. Previous investigators recommend approaching from downwind. Remember: this creature has never harmed a human — it seems to be more scared of us than we are of it!',
    },
  },
  {
    id: 'rougarou',
    name: 'Rougarou',
    description: 'A werewolf-like beast from Cajun legend that prowls the sugar cane fields at night.',
    region: 'Cajun Country',
    difficulty: 2,
    evidenceRequired: 10, // 5 × 2
    svgSilhouette: '/assets/cryptids/rougarou.svg',
    revealImage: '/assets/cryptids/reveals/rougarou.jpg',
    clues: generateClues('rou', 10, [
      { id: 'rou-1', type: 'footprint', description: 'Wolf-like tracks that suddenly turn into human footprints', svgIcon: '/assets/ui/clue-footprint.svg', revealed: false },
      { id: 'rou-2', type: 'witness', description: 'A farmer heard howling during a full moon', svgIcon: '/assets/ui/clue-witness.svg', revealed: false },
      { id: 'rou-3', type: 'sketch', description: 'Torn fabric caught on a sugar cane stalk', svgIcon: '/assets/ui/clue-sketch.svg', revealed: false },
      { id: 'rou-4', type: 'photo', description: 'A shadowy figure in a nighttime trail photo', svgIcon: '/assets/ui/clue-photo.svg', revealed: false },
      { id: 'rou-5', type: 'map_pin', description: 'Sightings cluster around Atchafalaya Basin', svgIcon: '/assets/ui/clue-map-pin.svg', revealed: false },
    ]),
    cardStats: { danger: 5, stealth: 4, mystery: 3 },
    lore: {
      originStory: `The Rougarou (sometimes spelled "Loup-Garou") is one of the oldest and most terrifying legends in Louisiana. Brought to the bayous by French settlers hundreds of years ago, the story has been told around campfires and kitchen tables in Cajun country for generations. Parents would warn their children: "Be good, or the Rougarou will come for you!"

According to the legend, the Rougarou is a person who has been cursed to transform into a werewolf-like beast. Some stories say the curse lasts for exactly 101 days, after which the creature must pass the curse on to someone else by drawing blood. The Rougarou is said to stand over eight feet tall, with the body of a human and the head of a massive wolf, prowling through sugar cane fields and swamplands under the light of the full moon.

The most chilling detail? The Rougarou is said to be someone you know — a neighbor, a friend, even a family member — cursed to roam the night, unable to speak or ask for help until the curse is broken.`,
      famousSightings: [
        '1700s: French settlers in the Atchafalaya Basin first recorded warnings about the "loup-garou" in their journals.',
        '1908: A sugar cane farmer near Houma reported finding his entire crop trampled with enormous wolf-like tracks.',
        '1953: A family driving along Highway 1 near Grand Isle reported a seven-foot creature running alongside their car.',
        '2011: Multiple residents of Larose reported seeing a large, wolf-headed figure standing in a field during a full moon.',
      ],
      louisianaConnection: "The Rougarou is as Louisiana as gumbo and Mardi Gras! The legend is deeply woven into Cajun and Creole culture. The town of Houma, Louisiana even hosts an annual \"Rougarou Fest\" every October, celebrating this spooky legend with food, music, and costumes. The Atchafalaya Basin, where most sightings are reported, is the largest river swamp in the United States.",
      funFacts: [
        'The word "Rougarou" comes from the French "loup-garou," meaning werewolf.',
        'Some legends say you can protect yourself by placing 13 small objects on your doorstep — the Rougarou will be forced to count them all and lose track!',
        "The Rougarou Fest in Houma raises money to protect Louisiana's disappearing wetlands.",
        'In some versions of the tale, the only way to break the curse is to not tell anyone about it for a year and a day.',
      ],
      fieldNotes: "FIELD REPORT #002 — Investigator, this is a nighttime-only creature. Full moons are the prime investigation window. Look for tracks that shift from wolf-like to human — that's the telltale sign. Bring silver coins (legend says they ward off the Rougarou) and stay out of the sugar cane fields after dark. Most importantly: if the Rougarou draws your blood, you'll carry the curse next. Wear thick gloves!",
    },
  },
  {
    id: 'bigfoot',
    name: 'Bigfoot',
    description: 'The legendary ape-like creature spotted in forests across North America.',
    region: 'Pacific Northwest',
    difficulty: 3,
    evidenceRequired: 20, // 5 × 4
    svgSilhouette: '/assets/cryptids/bigfoot.svg',
    revealImage: '/assets/cryptids/reveals/bigfoot.jpg',
    clues: generateClues('bf', 20, [
      { id: 'bf-1', type: 'footprint', description: 'Enormous footprint — 16 inches long!', svgIcon: '/assets/ui/clue-footprint.svg', revealed: false },
      { id: 'bf-2', type: 'witness', description: 'A hiker reported seeing a tall, hairy figure', svgIcon: '/assets/ui/clue-witness.svg', revealed: false },
      { id: 'bf-3', type: 'sample', description: 'Tufts of coarse brown hair on a branch', svgIcon: '/assets/ui/clue-sample.svg', revealed: false },
      { id: 'bf-4', type: 'sketch', description: 'The famous Patterson-Gimlin film still', svgIcon: '/assets/ui/clue-sketch.svg', revealed: false },
      { id: 'bf-5', type: 'map_pin', description: 'Reports from Bluff Creek, California', svgIcon: '/assets/ui/clue-map-pin.svg', revealed: false },
      { id: 'bf-6', type: 'witness', description: 'Wood knocking sounds heard at night', svgIcon: '/assets/ui/clue-witness.svg', revealed: false },
    ]),
    cardStats: { danger: 3, stealth: 4, mystery: 5 },
    lore: {
      originStory: `Bigfoot — also called Sasquatch — is arguably the most famous cryptid in the entire world. Stories of a giant, ape-like creature living in the forests of North America go back thousands of years, with Native American tribes across the continent sharing tales of wild, hairy giants that roam the deepest woods.

The modern Bigfoot craze began in 1958, when a bulldozer operator named Jerry Crew found enormous footprints in the mud at a construction site in Bluff Creek, California. A local newspaper ran the story with the headline "Bigfoot," and the name stuck forever. Since then, thousands of people across North America have reported seeing, hearing, or smelling something they believe to be Bigfoot.

What would Bigfoot look like? Witnesses consistently describe a creature standing 7 to 10 feet tall, covered in dark brown or reddish-brown hair, with a flat face, broad shoulders, and a strong, unpleasant smell. Bigfoot is said to walk upright like a human but with a hunched, swaying gait.`,
      famousSightings: [
        '1958: Jerry Crew finds 16-inch footprints at Bluff Creek, California — the event that gave Bigfoot its name.',
        '1967: Roger Patterson and Bob Gimlin film a large, upright creature walking through the woods — the most famous cryptid footage ever.',
        '2000: The Skookum Cast — a full body impression found in mud in Washington state, analyzed by primate experts.',
        'Ongoing: The BFRO tracks thousands of reported sightings across all 50 states.',
      ],
      louisianaConnection: "Louisiana has its own Bigfoot sightings! The \"Fouke Monster\" from nearby Fouke, Arkansas has been spotted in northern Louisiana woods. Caddo Parish and the Kisatchie National Forest are hotspots. Some researchers believe Bigfoot uses Louisiana's dense forests and swamp corridors as migration routes.",
      funFacts: [
        'Bigfoot footprints have been found in 49 out of 50 US states — only Hawaii has zero reports!',
        "The Patterson-Gimlin film from 1967 has been studied for over 50 years, and experts still can't agree if it's real.",
        'Some scientists think Bigfoot could be a surviving Gigantopithecus — a real giant ape from 300,000 years ago.',
        'There are Bigfoot research organizations in almost every state.',
      ],
      fieldNotes: "FIELD REPORT #003 — This is a forest creature, Investigator. Look for broken branches at 7-8 feet high, unusual tree structures, and listen for wood knocks — two sharp knocks on a tree trunk. Bring a plaster cast kit for footprints. Bigfoot is most active at dawn and dusk. Warning: the smell has been described as \"a wet dog times a thousand\" — breathe through your mouth!",
    },
  },
  {
    id: 'mothman',
    name: 'Mothman',
    description: 'A winged creature with glowing red eyes, first spotted in West Virginia.',
    region: 'Point Pleasant, WV',
    difficulty: 4,
    evidenceRequired: 30,
    svgSilhouette: '/assets/cryptids/mothman.svg',
    revealImage: '/assets/cryptids/reveals/mothman.jpg',
    clues: generateClues('mm', 30, [
      { id: 'mm-1', type: 'witness', description: 'Two couples saw glowing red eyes near an old factory', svgIcon: '/assets/ui/clue-witness.svg', revealed: false },
      { id: 'mm-2', type: 'sketch', description: 'Drawing of a man-sized creature with 10-foot wingspan', svgIcon: '/assets/ui/clue-sketch.svg', revealed: false },
      { id: 'mm-3', type: 'map_pin', description: 'All sightings near the TNT area', svgIcon: '/assets/ui/clue-map-pin.svg', revealed: false },
      { id: 'mm-4', type: 'photo', description: 'Strange shadow on a security camera', svgIcon: '/assets/ui/clue-photo.svg', revealed: false },
      { id: 'mm-5', type: 'witness', description: 'Car chased by flying creature at 100 mph', svgIcon: '/assets/ui/clue-witness.svg', revealed: false },
    ]),
    cardStats: { danger: 4, stealth: 3, mystery: 5 },
    lore: {
      originStory: `On the night of November 15, 1966, two young couples were driving past an old abandoned munitions factory near Point Pleasant, West Virginia, when they saw something that would change their lives forever. Standing near the factory gate was a massive figure — shaped like a man but much larger — with huge folded wings and two enormous, glowing red eyes.

The creature spread its wings — witnesses estimated a wingspan of 10 to 15 feet — and took to the air, chasing their car as they fled at speeds over 100 miles per hour. The local newspaper dubbed the creature "Mothman."

Over the next 13 months, over 100 residents reported seeing the Mothman. Then, on December 15, 1967, the Silver Bridge collapsed during rush hour, killing 46 people. After the bridge disaster, the Mothman sightings stopped. Many believe the Mothman was trying to warn the town about the coming tragedy.`,
      famousSightings: [
        '1966, Nov 15: Two couples chased by a winged creature with glowing red eyes near the TNT area.',
        '1966-67: Over 100 sightings reported in Point Pleasant over 13 months.',
        '1967: A creature matching Mothman seen on the Silver Bridge days before its collapse.',
        '2016-Present: New sightings reported in Chicago — dozens of witnesses describe a large, winged humanoid over Lake Michigan.',
      ],
      louisianaConnection: "While Mothman is a West Virginia legend, similar winged humanoid creatures have been reported in Louisiana's rural parishes. In 2017, several witnesses in Lafourche Parish described a large, dark-winged figure flying low over the bayou at night.",
      funFacts: [
        'Point Pleasant has a 12-foot tall stainless steel Mothman statue in the middle of town!',
        "There's an annual Mothman Festival every September that attracts thousands of visitors.",
        'The 2002 movie "The Mothman Prophecies" starring Richard Gere was based on the true events.',
        'Some scientists think witnesses saw a large Sandhill Crane, which has reddish patches around its eyes.',
      ],
      fieldNotes: "FIELD REPORT #004 — Mothman is an aerial cryptid, Investigator. Watch the skies at night. The glowing red eyes are the giveaway — do NOT look directly at them for too long. Bring a camera with night-vision and stake out high places like bridges and water towers. Some researchers believe Mothman appears before disasters as a warning. If you see it... maybe listen to what it's trying to tell you.",
    },
  },
  {
    id: 'chupacabra',
    name: 'Chupacabra',
    description: 'The "goat sucker" — a spiny creature reported across the Americas.',
    region: 'Puerto Rico & Texas',
    difficulty: 5,
    evidenceRequired: 50,
    svgSilhouette: '/assets/cryptids/chupacabra.svg',
    revealImage: '/assets/cryptids/reveals/chupacabra.jpg',
    clues: generateClues('ch', 50, [
      { id: 'ch-1', type: 'footprint', description: 'Small clawed tracks near a farm', svgIcon: '/assets/ui/clue-footprint.svg', revealed: false },
      { id: 'ch-2', type: 'witness', description: 'A farmer found strange marks on livestock', svgIcon: '/assets/ui/clue-witness.svg', revealed: false },
      { id: 'ch-3', type: 'sample', description: 'Unusual quill-like spines found in a field', svgIcon: '/assets/ui/clue-sample.svg', revealed: false },
      { id: 'ch-4', type: 'sketch', description: 'A child drew what they saw in the moonlight', svgIcon: '/assets/ui/clue-sketch.svg', revealed: false },
      { id: 'ch-5', type: 'map_pin', description: 'Reports span from Puerto Rico to Texas', svgIcon: '/assets/ui/clue-map-pin.svg', revealed: false },
    ]),
    cardStats: { danger: 4, stealth: 5, mystery: 4 },
    lore: {
      originStory: `In 1995, on the island of Puerto Rico, farmers began finding their goats dead under mysterious circumstances — each animal drained of blood through small, circular puncture wounds. Residents named the unknown attacker "El Chupacabra" — Spanish for "the goat sucker."

The first eyewitness was a woman named Madelyne Tolentino from Canovanas. She reported a creature about 4 to 5 feet tall, with gray, leathery skin, large black eyes, and a row of sharp spines running down its back. It stood upright on two powerful hind legs and moved with incredible speed.

Within months, reports exploded across Latin America and the southern United States. Farmers in Mexico, Chile, Brazil, and especially Texas reported finding livestock with the same mysterious puncture wounds. The Chupacabra had gone international.`,
      famousSightings: [
        '1995: First attacks in Canovanas, Puerto Rico — 8 goats found drained of blood overnight.',
        '1996: Mayor of Canovanas organized an armed patrol after dozens of livestock deaths.',
        '2004: A rancher near San Antonio found a strange, hairless creature — DNA showed it was a coyote with severe mange.',
        '2010-Present: Continued sightings across Texas with trail cameras deployed.',
      ],
      louisianaConnection: "Chupacabra sightings have been reported in southern Louisiana, particularly near the Texas border. In 2014, a hunter in Calcasieu Parish photographed a hairless, dog-like animal that locals insisted was a Chupacabra. Louisiana's abundant livestock farms make it a plausible habitat.",
      funFacts: [
        '"Chupacabra" literally translates to "goat sucker" in Spanish.',
        'There are TWO versions: the Puerto Rican Chupacabra (reptilian, with spines) and the Texas Chupacabra (hairless, dog-like).',
        'DNA from captured "Chupacabras" always shows coyotes or dogs with mange.',
        'The legend spread from Puerto Rico to the entire Western Hemisphere in less than 5 years!',
      ],
      fieldNotes: "FIELD REPORT #005 — The Chupacabra is a nocturnal hunter, Investigator. Stake out farms between midnight and 4 AM. Look for puncture marks on livestock — two small holes, usually on the neck. Bring specimen containers for unusual quills or spines. Some investigators use audio recordings of goat calls as bait. Be careful — this one has claws!",
    },
  },
  {
    id: 'jersey-devil',
    name: 'Jersey Devil',
    description: 'A flying creature with hooves and a forked tail from the Pine Barrens of New Jersey.',
    region: 'Pine Barrens, NJ',
    difficulty: 6,
    evidenceRequired: 75,
    svgSilhouette: '/assets/cryptids/jersey-devil.svg',
    revealImage: '/assets/cryptids/reveals/jersey-devil.jpg',
    clues: generateClues('jd', 75, [
      { id: 'jd-1', type: 'footprint', description: 'Hoof prints on a rooftop — how did it get up there?', svgIcon: '/assets/ui/clue-footprint.svg', revealed: false },
      { id: 'jd-2', type: 'witness', description: 'A police officer reported a screaming, winged creature', svgIcon: '/assets/ui/clue-witness.svg', revealed: false },
      { id: 'jd-3', type: 'sketch', description: 'Historical sketch from 1909 newspaper', svgIcon: '/assets/ui/clue-sketch.svg', revealed: false },
      { id: 'jd-4', type: 'map_pin', description: 'Centered in Burlington County, NJ', svgIcon: '/assets/ui/clue-map-pin.svg', revealed: false },
      { id: 'jd-5', type: 'photo', description: 'Strange shadow against the full moon', svgIcon: '/assets/ui/clue-photo.svg', revealed: false },
    ]),
    cardStats: { danger: 3, stealth: 4, mystery: 5 },
    lore: {
      originStory: `The legend of the Jersey Devil dates back to 1735. According to the tale, a woman known as "Mother Leeds" lived in the Pine Barrens of southern New Jersey. When she discovered she was expecting her 13th child, she cried out, "Let this one be a devil!"

When the baby was born, it seemed normal at first. But then it began to transform — growing leathery bat-like wings, cloven hooves, claws, and a forked tail. The creature let out an unearthly scream, flew up the chimney, and disappeared into the Pine Barrens.

The most dramatic chapter came during January 1909, when hundreds of people across New Jersey reported seeing the creature. Schools closed, workers refused to leave their homes, and armed posses searched the Pine Barrens. The "Phenomenal Week" made national headlines.`,
      famousSightings: [
        '1735: The legendary "birth" of the Jersey Devil to Mother Leeds in the Pine Barrens.',
        '1909, January: The "Phenomenal Week" — over 1,000 sightings across NJ and PA in just 5 days.',
        '1909: Hoof prints found on rooftops, fences, and leading into and out of a river.',
        '1951: A group of boys in Gibbstown reported the creature landing in their backyard.',
      ],
      louisianaConnection: "While the Jersey Devil is a New Jersey legend, Louisiana has its own winged horrors! Some folklorists see parallels with Louisiana's tales of the \"Grunch\" — a goat-like creature said to lurk on Grunch Road near New Orleans. Both involve hooved creatures that fly and terrorize communities at night.",
      funFacts: [
        'The Jersey Devil is the official state demon of New Jersey!',
        'The NHL hockey team the New Jersey Devils is named after this cryptid.',
        'The Pine Barrens cover over 1.1 million acres — plenty of room to hide!',
        "Napoleon Bonaparte's brother Joseph reportedly saw the Jersey Devil while living in New Jersey.",
      ],
      fieldNotes: "FIELD REPORT #006 — The Jersey Devil is a flyer, Investigator, so look UP. It's been spotted perched on rooftops, treetops, and power lines. The scream sounds like a mix between a woman shrieking and a horse neighing. Investigate the Pine Barrens during winter when tracks show in snow. Look for cloven hoof prints that appear impossibly — on rooftops, across rivers, up tree trunks.",
    },
  },
  {
    id: 'thunderbird',
    name: 'Thunderbird',
    description: 'A massive bird from Native American legend with a wingspan wider than an airplane.',
    region: 'Great Plains',
    difficulty: 7,
    evidenceRequired: 100,
    svgSilhouette: '/assets/cryptids/thunderbird.svg',
    revealImage: '/assets/cryptids/reveals/thunderbird.jpg',
    clues: generateClues('tb', 100, [
      { id: 'tb-1', type: 'witness', description: 'A pilot saw a bird larger than his small plane', svgIcon: '/assets/ui/clue-witness.svg', revealed: false },
      { id: 'tb-2', type: 'sketch', description: 'Ancient cave painting of a giant bird', svgIcon: '/assets/ui/clue-sketch.svg', revealed: false },
      { id: 'tb-3', type: 'sample', description: 'A feather longer than your arm', svgIcon: '/assets/ui/clue-sample.svg', revealed: false },
      { id: 'tb-4', type: 'map_pin', description: 'Sightings along the Rocky Mountains', svgIcon: '/assets/ui/clue-map-pin.svg', revealed: false },
      { id: 'tb-5', type: 'photo', description: 'Enormous shadow captured by a weather satellite', svgIcon: '/assets/ui/clue-photo.svg', revealed: false },
    ]),
    cardStats: { danger: 5, stealth: 2, mystery: 5 },
    lore: {
      originStory: `Long before European settlers arrived, Native American tribes told stories of enormous birds so powerful they could create thunder with the beating of their wings and summon lightning from their eyes. These legendary creatures — known as Thunderbirds — are among the oldest figures in Native American mythology.

The Thunderbird is described as massive — with wingspans estimated at 15 to 20 feet or more. The largest living bird, the Wandering Albatross, has only about an 11-foot wingspan. Thunderbirds are said to have dark plumage, enormous talons, and the ability to carry off large prey.

While most scientists consider Thunderbirds mythological, sightings continue. In 1977, children in Lawndale, Illinois reported that a huge bird actually grabbed one of their friends and briefly lifted him off the ground. The boy was unharmed, but the incident renewed interest in giant birds.`,
      famousSightings: [
        '1890: Two cowboys in Arizona reportedly shot a giant winged creature — the famous "Thunderbird Photo" that many have seen but nobody can find.',
        '1977: Three boys in Lawndale, IL were chased by two enormous birds — one briefly lifted 10-year-old Marlon Lowe off the ground.',
        '2002: A small plane pilot over Alaska reported a bird with a wingspan matching his aircraft.',
        'Ancient: Thunderbird petroglyphs and cave paintings found across North America, some thousands of years old.',
      ],
      louisianaConnection: "Louisiana's own Chitimacha, Choctaw, and other Native American tribes have their own Thunderbird legends. Some accounts describe enormous birds over the Gulf Coast and Mississippi River delta. Louisiana's vast open marshlands could theoretically provide habitat for a very large bird species.",
      funFacts: [
        'The Thunderbird appears on totem poles across the Pacific Northwest — always at the very top.',
        'Some scientists believe the legends may be based on Teratorns — real prehistoric birds with 12-16 foot wingspans from 10,000 years ago.',
        "The \"Thunderbird Photo\" is one of cryptozoology's greatest mysteries — thousands claim to have seen it, but no original exists.",
        'Sightings are most common during storms — fitting given their legendary power over thunder!',
      ],
      fieldNotes: "FIELD REPORT #007 — Investigator, think BIG. Stake out mountain ridges and open plains with strong thermal updrafts. Bring binoculars rated for extreme distance and a camera with powerful zoom. Look for enormous feathers and oversized talon marks. Best times: during and after thunderstorms. Scale is everything — photograph it next to something of known size for proof!",
    },
  },
  {
    id: 'loch-ness-monster',
    name: 'Loch Ness Monster',
    description: 'Nessie — the legendary lake creature of Scotland. Could it be a surviving dinosaur?',
    region: 'Loch Ness, Scotland',
    difficulty: 8,
    evidenceRequired: 125,
    svgSilhouette: '/assets/cryptids/loch-ness-monster.svg',
    revealImage: '/assets/cryptids/reveals/loch-ness-monster.jpg',
    clues: generateClues('ln', 125, [
      { id: 'ln-1', type: 'photo', description: 'The famous "Surgeon\'s Photo" — real or fake?', svgIcon: '/assets/ui/clue-photo.svg', revealed: false },
      { id: 'ln-2', type: 'witness', description: 'A boat captain saw humps moving through the water', svgIcon: '/assets/ui/clue-witness.svg', revealed: false },
      { id: 'ln-3', type: 'sample', description: 'Unusual sonar readings from the lake bottom', svgIcon: '/assets/ui/clue-sample.svg', revealed: false },
      { id: 'ln-4', type: 'sketch', description: 'A drawing from a Scottish monk in the year 565', svgIcon: '/assets/ui/clue-sketch.svg', revealed: false },
      { id: 'ln-5', type: 'map_pin', description: 'Sightings cluster near Urquhart Castle', svgIcon: '/assets/ui/clue-map-pin.svg', revealed: false },
      { id: 'ln-6', type: 'witness', description: 'Ripples in perfectly calm water', svgIcon: '/assets/ui/clue-witness.svg', revealed: false },
    ]),
    cardStats: { danger: 2, stealth: 5, mystery: 5 },
    lore: {
      originStory: `The Loch Ness Monster — affectionately known as "Nessie" — is perhaps the most famous cryptid in the world. The legend goes back to 565 AD, when an Irish monk named Saint Columba reportedly encountered a "water beast" in the River Ness. He commanded the creature to retreat, and it obeyed — the first recorded monster sighting in history!

The modern legend began in 1933, when John and Aldie Mackay reported seeing an enormous creature rolling and plunging in the waters. A local newspaper ran the story, and "Monster Mania" gripped the world. Within months, dozens of witnesses came forward.

Loch Ness itself is the perfect hiding place. It's 23 miles long, over 700 feet deep, and filled with dark, peat-stained water that's nearly impossible to see through. Scientists estimate the loch contains more water than all the lakes and rivers in England and Wales combined.`,
      famousSightings: [
        '565 AD: Saint Columba commands a "water beast" to retreat — the first recorded sighting.',
        '1933: John and Aldie Mackay see a massive creature, sparking worldwide "Monster Mania."',
        '1934: The "Surgeon\'s Photograph" published showing a long neck rising from water. (Revealed as a hoax in 1994!)',
        '2019: Environmental DNA study found no large unknown animal, but a surprising amount of eel DNA — a new theory!',
      ],
      louisianaConnection: "While Nessie lives across the Atlantic, Louisiana has its own water mysteries! Legends of giant serpents in Lake Pontchartrain and enormous catfish in the Atchafalaya Basin echo the Nessie legend. Some fishermen report seeing large, unidentified creatures in Louisiana's deep bayous.",
      funFacts: [
        'Loch Ness is deeper than the North Sea at 755 feet!',
        'More than 1,000 people have reported seeing Nessie since 1933.',
        'The 2019 DNA study suggests Nessie might be a giant eel.',
        "There's a 24/7 live webcam pointed at Loch Ness that anyone can watch!",
      ],
      fieldNotes: "FIELD REPORT #008 — This is the big one, Investigator. The ultimate cryptid. You'll need sonar equipment and a boat. Best viewing spots: near Urquhart Castle and Dores beach. Early morning is prime time — the water is calmest. Bring underwater cameras, sonar, and a LOT of patience. Nessie has evaded capture for over 1,500 years. We're not trying to catch it — just prove it exists. Treat the loch and its legendary resident with respect!",
    },
  },
];
