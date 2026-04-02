import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconSvg = readFileSync(join(__dirname, '..', 'icon-exploration', 'f2-chubby-green-polished.svg'));
const outPath = join(__dirname, '..', 'social-preview.png');

// Render icon at 400px, then composite centered on a 1280x640 light green background
const icon = await sharp(iconSvg).resize(400, 400).png().toBuffer();

await sharp({
  create: {
    width: 1280,
    height: 640,
    channels: 4,
    background: { r: 241, g: 248, b: 233, alpha: 1 }, // #f1f8e9
  },
})
  .composite([{ input: icon, left: 440, top: 120 }])
  .png()
  .toFile(outPath);

console.log(`Social preview: ${outPath}`);
