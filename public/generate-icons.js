// Script untuk generate placeholder icons
// Jalankan: node public/generate-icons.js
// Kemudian ganti dengan icon asli ITK

const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

// SVG icon sederhana (buku + ITK)
const svgTemplate = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#1E40AF"/>
  <text x="${size/2}" y="${size * 0.42}" font-family="serif" font-size="${size * 0.35}" fill="white" text-anchor="middle" font-weight="bold">📚</text>
  <text x="${size/2}" y="${size * 0.72}" font-family="sans-serif" font-size="${size * 0.13}" fill="#F59E0B" text-anchor="middle" font-weight="bold">ITK</text>
</svg>`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
sizes.forEach(size => {
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), svgTemplate(size));
  console.log(`Generated icon-${size}x${size}.svg`);
});

console.log('\nCatatan: Konversi SVG ke PNG menggunakan tool seperti:');
console.log('- sharp (npm): sharp icon.svg -o icon.png');
console.log('- Atau gunakan tool online: https://svgtopng.com');
