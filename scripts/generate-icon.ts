import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICON_DIR = join(__dirname, '..', 'public', 'assets', 'icons');
const SIZES = [16, 32, 48, 128];

// Green chameleon, top-down view on transparent background.
// Looking down at a chameleon from above -- body, splayed legs, curled tail, two eyes.
const SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <!-- Curled tail -->
  <path d="
    M 64 118
    Q 64 126, 56 126
    Q 46 126, 46 118
    Q 46 110, 54 110
    Q 60 110, 58 116
  " fill="none" stroke="#238577" stroke-width="6" stroke-linecap="round"/>

  <!-- Back left leg -->
  <path d="M 42 88 Q 14 94, 10 108" fill="none" stroke="#2A9D8F" stroke-width="7" stroke-linecap="round"/>
  <path d="M 10 108 L 6 104 M 10 108 L 6 112 M 10 108 L 14 114" fill="none" stroke="#2A9D8F" stroke-width="4" stroke-linecap="round"/>

  <!-- Back right leg -->
  <path d="M 86 88 Q 114 94, 118 108" fill="none" stroke="#2A9D8F" stroke-width="7" stroke-linecap="round"/>
  <path d="M 118 108 L 122 104 M 118 108 L 122 112 M 118 108 L 114 114" fill="none" stroke="#2A9D8F" stroke-width="4" stroke-linecap="round"/>

  <!-- Front left leg -->
  <path d="M 42 42 Q 14 36, 8 22" fill="none" stroke="#2A9D8F" stroke-width="7" stroke-linecap="round"/>
  <path d="M 8 22 L 4 26 M 8 22 L 4 18 M 8 22 L 12 16" fill="none" stroke="#2A9D8F" stroke-width="4" stroke-linecap="round"/>

  <!-- Front right leg -->
  <path d="M 86 42 Q 114 36, 120 22" fill="none" stroke="#2A9D8F" stroke-width="7" stroke-linecap="round"/>
  <path d="M 120 22 L 124 26 M 120 22 L 124 18 M 120 22 L 116 16" fill="none" stroke="#2A9D8F" stroke-width="4" stroke-linecap="round"/>

  <!-- Body -->
  <ellipse cx="64" cy="68" rx="24" ry="40" fill="#2A9D8F"/>

  <!-- Spine ridge -->
  <line x1="64" y1="30" x2="64" y2="108" stroke="#238577" stroke-width="3" stroke-linecap="round"/>

  <!-- Head -->
  <ellipse cx="64" cy="24" rx="20" ry="18" fill="#2A9D8F"/>

  <!-- Snout -->
  <ellipse cx="64" cy="8" rx="8" ry="6" fill="#238577"/>

  <!-- Left eye - bulging out -->
  <circle cx="46" cy="22" r="9" fill="#2A9D8F" stroke="#238577" stroke-width="2"/>
  <circle cx="46" cy="22" r="6" fill="#E9C46A"/>
  <circle cx="45" cy="21" r="3" fill="#1A1A1A"/>

  <!-- Right eye - bulging out -->
  <circle cx="82" cy="22" r="9" fill="#2A9D8F" stroke="#238577" stroke-width="2"/>
  <circle cx="82" cy="22" r="6" fill="#E9C46A"/>
  <circle cx="83" cy="21" r="3" fill="#1A1A1A"/>
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
