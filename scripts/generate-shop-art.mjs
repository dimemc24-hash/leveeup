/**
 * Generates shop item art for LeveeUp using DALL-E 3.
 * Run: node scripts/generate-shop-art.mjs
 */
import fs from 'fs';
import path from 'path';
import https from 'https';

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) { console.error('Missing OPENAI_API_KEY'); process.exit(1); }

const OUT_DIR = path.join('public', 'assets', 'shop');
fs.mkdirSync(OUT_DIR, { recursive: true });

const STYLE = 'cartoon game item icon for a children\'s app, vibrant thick outlines, bright colors, isolated on a plain white background, no text, no shadows, square composition, Duolingo-style illustration';

const ITEMS = [
  { file: 'hat-explorer.png',       prompt: `Explorer safari hat, tan/khaki color, wide brim, adventure style. ${STYLE}` },
  { file: 'hat-detective.png',      prompt: `Classic detective deerstalker cap, dark brown, magnifying glass pin on the side. ${STYLE}` },
  { file: 'hat-cryptid-crown.png',  prompt: `Glowing purple and gold crown made of mysterious crystals and cryptid bones, legendary fantasy style. ${STYLE}` },
  { file: 'hat-swamp-cap.png',      prompt: `Green camouflage baseball cap with swamp water droplets and a small alligator pin. ${STYLE}` },
  { file: 'binoculars-basic.png',   prompt: `Classic black field binoculars with leather strap, shiny lenses. ${STYLE}` },
  { file: 'binoculars-night.png',   prompt: `Military-style green night vision goggles with glowing green lenses, futuristic. ${STYLE}` },
  { file: 'binoculars-thermal.png', prompt: `High-tech orange and black thermal scope with heat-signature display, glowing. ${STYLE}` },
  { file: 'vest-field.png',         prompt: `Tan explorer field vest with many pockets, patches, and a magnifying glass pin. ${STYLE}` },
  { file: 'vest-camo.png',          prompt: `Green forest camouflage tactical vest with pouches. ${STYLE}` },
  { file: 'vest-legendary.png',     prompt: `Epic deep purple master investigator trench coat with gold trim and glowing runes. ${STYLE}` },
  { file: 'flashlight-basic.png',   prompt: `Classic yellow flashlight with bright beam cone. ${STYLE}` },
  { file: 'flashlight-uv.png',      prompt: `Purple UV blacklight flashlight with glowing purple beam revealing hidden footprints. ${STYLE}` },
  { file: 'flashlight-lantern.png', prompt: `Ancient mystical lantern glowing green, swamp gas style, ornate metal frame. ${STYLE}` },
  { file: 'journal-leather.png',    prompt: `Brown leather-bound field journal with a compass rose stamped on the cover. ${STYLE}` },
  { file: 'journal-waterproof.png', prompt: `Bright yellow waterproof field notebook with water droplets beading off it. ${STYLE}` },
  { file: 'journal-ancient.png',    prompt: `Ancient mystical tome with glowing cryptic symbols on the cover, purple glow. ${STYLE}` },
  { file: 'sticker-paw.png',        prompt: `Giant muddy Bigfoot paw print sticker, brown on white, fun and bold. ${STYLE}` },
  { file: 'sticker-eye.png',        prompt: `Single glowing red Mothman eye sticker, eerie and cool, red glow effects. ${STYLE}` },
  { file: 'sticker-scale.png',      prompt: `Shimmering blue-green dragon/Nessie scale sticker, iridescent effect. ${STYLE}` },
  { file: 'sticker-feather.png',    prompt: `Giant thunderbird feather sticker, gold and black, sparks of lightning around it. ${STYLE}` },
  { file: 'badge-junior.png',       prompt: `Junior Investigator badge, silver star shape, blue ribbon, 'JR' engraved. ${STYLE}` },
  { file: 'badge-senior.png',       prompt: `Senior Investigator badge, gold star with magnifying glass, purple ribbon. ${STYLE}` },
  { file: 'badge-master.png',       prompt: `Master Investigator legendary badge, glowing gold with cryptid silhouette in center, epic. ${STYLE}` },
];

async function generateImage(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'url',
    });
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.data?.[0]?.url) resolve(json.data[0].url);
          else reject(new Error(data));
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (e) => { fs.unlink(filepath, () => {}); reject(e); });
  });
}

async function main() {
  console.log(`Generating ${ITEMS.length} shop item images...`);
  for (const item of ITEMS) {
    const outPath = path.join(OUT_DIR, item.file);
    if (fs.existsSync(outPath)) {
      console.log(`  SKIP (exists): ${item.file}`);
      continue;
    }
    try {
      console.log(`  Generating: ${item.file}...`);
      const url = await generateImage(item.prompt);
      await downloadImage(url, outPath);
      console.log(`  ✓ Saved: ${item.file}`);
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 1500));
    } catch(e) {
      console.error(`  ✗ Failed ${item.file}:`, e.message);
    }
  }
  console.log('Done!');
}

main();
