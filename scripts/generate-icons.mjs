/**
 * Generates PWA icons for LeveeUp using DALL-E 3, then saves as PNG.
 * Run: node scripts/generate-icons.mjs
 */
import fs from 'fs';
import path from 'path';
import https from 'https';

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) { console.error('Missing OPENAI_API_KEY'); process.exit(1); }

const OUT_DIR = path.join('public', 'assets', 'ui');
fs.mkdirSync(OUT_DIR, { recursive: true });

const PROMPT = 'App icon for a children cryptid investigation game called LeveeUp. A cute cartoon magnifying glass with a glowing green swamp creature silhouette visible through the lens, dark teal background, vibrant colors, simple bold design, square format, no text';

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

async function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (e) => { fs.unlink(filepath, () => {}); reject(e); });
  });
}

// Simple PNG resizer using sharp if available, otherwise just copy
async function resizeOrCopy(src, dest, size) {
  try {
    const { default: sharp } = await import('sharp');
    await sharp(src).resize(size, size).png().toFile(dest);
    console.log(`  Resized to ${size}x${size}: ${path.basename(dest)}`);
  } catch {
    // sharp not available, just copy the 1024 version
    fs.copyFileSync(src, dest);
    console.log(`  Copied (sharp unavailable): ${path.basename(dest)}`);
  }
}

async function main() {
  const src1024 = path.join(OUT_DIR, 'icon-1024.png');

  if (!fs.existsSync(src1024)) {
    console.log('Generating app icon with DALL-E...');
    const url = await generateImage(PROMPT);
    await downloadFile(url, src1024);
    console.log('✓ Downloaded icon-1024.png');
  }

  await resizeOrCopy(src1024, path.join(OUT_DIR, 'icon-192.png'), 192);
  await resizeOrCopy(src1024, path.join(OUT_DIR, 'icon-512.png'), 512);
  console.log('Done!');
}

main().catch(console.error);
