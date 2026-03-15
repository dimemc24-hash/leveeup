/**
 * Generates dungeon/swamp game assets for the Flashlight Hunt minigame.
 */
import fs from 'fs';
import path from 'path';
import https from 'https';

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) { console.error('Missing OPENAI_API_KEY'); process.exit(1); }

const OUT_DIR = path.join('public', 'assets', 'dungeon');
fs.mkdirSync(OUT_DIR, { recursive: true });

const TILE_STYLE = 'top-down 2D game tile, 64x64, seamless texture, dark swamp/bayou theme, cartoon style, for children\'s game, no text';
const SPRITE_STYLE = 'top-down 2D game sprite, transparent-style white background, cartoon, children\'s game, isolated object, no text, bold outlines';

const ITEMS = [
  // Tiles
  { file: 'tile-floor.png',       prompt: `Murky swamp floor tile, dark muddy water with lily pads, ${TILE_STYLE}` },
  { file: 'tile-wall.png',        prompt: `Cypress tree trunk wall tile, dark bayou, mossy bark texture, ${TILE_STYLE}` },
  { file: 'tile-grass.png',       prompt: `Dark swamp grass floor tile, tall reeds, murky green, ${TILE_STYLE}` },
  { file: 'tile-path.png',        prompt: `Wooden boardwalk plank floor tile, old weathered wood, bayou swamp, ${TILE_STYLE}` },

  // Collectible clue items
  { file: 'clue-footprint.png',   prompt: `Glowing green giant footprint in mud, cryptid evidence clue item, floating glow effect, ${SPRITE_STYLE}` },
  { file: 'clue-feather.png',     prompt: `Glowing gold giant feather, cryptid evidence clue item, magical sparkle, ${SPRITE_STYLE}` },
  { file: 'clue-slime.png',       prompt: `Glowing green mysterious slime blob, cryptid evidence clue item, ${SPRITE_STYLE}` },
  { file: 'clue-eye.png',         prompt: `Single glowing red eye in the dark, cryptid evidence clue item, eerie, ${SPRITE_STYLE}` },
  { file: 'clue-journal.png',     prompt: `Small open field journal with cryptid sketch, glowing pages, clue item, ${SPRITE_STYLE}` },

  // Player sprite
  { file: 'player.png',           prompt: `Top-down view of a small cartoon child investigator holding a flashlight, facing down, overhead/bird-eye view, khaki explorer outfit, ${SPRITE_STYLE}` },

  // UI / effects
  { file: 'flashlight-cone.png',  prompt: `Flashlight beam cone effect, warm yellow-white glow, transparent center, dark edges, radial light effect, game UI overlay` },
  { file: 'chest.png',            prompt: `Wooden treasure chest with golden latch, glowing slightly, top-down view, ${SPRITE_STYLE}` },
  { file: 'exit-portal.png',      prompt: `Glowing green swamp portal / exit gate, mystical vines, top-down view, ${SPRITE_STYLE}` },
];

async function generateImage(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size: '1024x1024', quality: 'standard', response_format: 'url' });
    const req = https.request({
      hostname: 'api.openai.com', path: '/v1/images/generations', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}`, 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { const json = JSON.parse(data); if (json.data?.[0]?.url) resolve(json.data[0].url); else reject(new Error(data)); }
        catch(e) { reject(e); }
      });
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (res) => { res.pipe(file); file.on('finish', () => { file.close(); resolve(); }); }).on('error', (e) => { fs.unlink(filepath, () => {}); reject(e); });
  });
}

async function main() {
  console.log(`Generating ${ITEMS.length} dungeon assets...`);
  for (const item of ITEMS) {
    const outPath = path.join(OUT_DIR, item.file);
    if (fs.existsSync(outPath)) { console.log(`  SKIP: ${item.file}`); continue; }
    try {
      console.log(`  Generating: ${item.file}...`);
      const url = await generateImage(item.prompt);
      await downloadImage(url, outPath);
      console.log(`  ✓ ${item.file}`);
      await new Promise(r => setTimeout(r, 1500));
    } catch(e) { console.error(`  ✗ ${item.file}:`, e.message?.slice(0, 100)); }
  }
  console.log('Done!');
}
main();
