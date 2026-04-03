import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICON_DIR = join(__dirname, '..', 'public', 'assets', 'icons');
const SIZES = [16, 32, 48, 128];

// Chubby green chameleon (F2), top-down view on transparent background.
const SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <g transform="translate(0, 2.5)">
  <!-- Curled tail -->
  <path d="M 17 26 Q 23 27 23 24 Q 23 21.5 20 22" stroke="#2E7D32" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- Body -->
  <ellipse cx="16" cy="15.5" rx="6.5" ry="9" fill="#43A047"/>
  <!-- Belly -->
  <ellipse cx="16" cy="15.5" rx="4" ry="7" fill="#66BB6A" opacity="0.5"/>
  <!-- Front legs -->
  <path d="M 10.5 9.5 L 5 6.5" stroke="#43A047" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M 21.5 9.5 L 27 6.5" stroke="#43A047" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="5" cy="6.5" r="1.8" fill="#2E7D32"/>
  <circle cx="27" cy="6.5" r="1.8" fill="#2E7D32"/>
  <!-- Back legs -->
  <path d="M 11 21 L 6 24" stroke="#43A047" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M 21 21 L 26 24" stroke="#43A047" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="6" cy="24" r="1.8" fill="#2E7D32"/>
  <circle cx="26" cy="24" r="1.8" fill="#2E7D32"/>
  <!-- Head -->
  <ellipse cx="16" cy="5.5" rx="7" ry="5" fill="#4CAF50"/>
  <!-- Eyes -->
  <circle cx="10" cy="4.5" r="3.5" fill="#A5D6A7"/>
  <circle cx="22" cy="4.5" r="3.5" fill="#A5D6A7"/>
  <circle cx="10" cy="4.5" r="2" fill="#1B5E20"/>
  <circle cx="22" cy="4.5" r="2" fill="#1B5E20"/>
  <circle cx="10.7" cy="3.5" r="0.7" fill="white" opacity="0.9"/>
  <circle cx="22.7" cy="3.5" r="0.7" fill="white" opacity="0.9"/>
  <!-- Smile -->
  <path d="M 13 8 Q 16 9.5 19 8" stroke="#2E7D32" stroke-width="0.8" fill="none" stroke-linecap="round"/>
  </g>
</svg>
`;

mkdirSync(ICON_DIR, { recursive: true });

await Promise.all(
  SIZES.map(async (size) => {
    const outPath = join(ICON_DIR, `icon${size}.png`);
    await sharp(Buffer.from(SVG))
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log(`  ${outPath} (${size}x${size})`);
  }),
);

console.log('Done.');
