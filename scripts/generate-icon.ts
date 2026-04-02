import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICON_DIR = join(__dirname, '..', 'public', 'assets', 'icons');
const SIZES = [16, 32, 48, 128];

// Chameleon silhouette on a rounded-square background.
// SVG designed at 128x128, scaled down by Sharp.
const SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <!-- Rounded square background -->
  <rect x="4" y="4" width="120" height="120" rx="24" ry="24" fill="#2A9D8F"/>

  <!-- Chameleon body - side profile facing right -->
  <g transform="translate(14, 18) scale(0.78)">
    <!-- Curled tail -->
    <path d="
      M 20 72
      Q 8 72, 8 60
      Q 8 48, 18 48
      Q 26 48, 26 55
      Q 26 62, 20 62
      Q 16 62, 18 58
    " fill="none" stroke="#FFF" stroke-width="5" stroke-linecap="round"/>

    <!-- Body -->
    <ellipse cx="62" cy="62" rx="32" ry="26" fill="#FFF"/>

    <!-- Head -->
    <ellipse cx="98" cy="52" rx="22" ry="20" fill="#FFF"/>

    <!-- Crest/ridge on top of head -->
    <path d="M 88 34 Q 95 24, 105 32" fill="none" stroke="#FFF" stroke-width="5" stroke-linecap="round"/>

    <!-- Eye - outer -->
    <circle cx="102" cy="48" r="8" fill="#2A9D8F"/>
    <!-- Eye - inner -->
    <circle cx="104" cy="48" r="3.5" fill="#1A1A1A"/>

    <!-- Mouth line -->
    <path d="M 108 58 Q 118 56, 120 52" fill="none" stroke="#2A9D8F" stroke-width="2.5" stroke-linecap="round"/>

    <!-- Front leg -->
    <path d="M 72 84 L 72 100 Q 72 104, 76 104 L 82 104" fill="none" stroke="#FFF" stroke-width="5" stroke-linecap="round"/>

    <!-- Back leg -->
    <path d="M 48 84 L 48 100 Q 48 104, 44 104 L 38 104" fill="none" stroke="#FFF" stroke-width="5" stroke-linecap="round"/>

    <!-- Branch/perch -->
    <line x1="24" y1="104" x2="96" y2="104" stroke="#E9C46A" stroke-width="5" stroke-linecap="round"/>
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
