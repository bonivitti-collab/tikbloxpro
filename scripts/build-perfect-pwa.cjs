const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '..', 'public');

// Perfect PWA Icon SVG: 512x512
// Centered squircle with glowing cyan-to-pink gradient border and orange lightning bolt
const pwaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Border Gradient: Cyan to Pink (TikTok Signature) -->
    <linearGradient id="pwaBorderGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#25F4EE" />
      <stop offset="50%" stop-color="#00D2C4" />
      <stop offset="100%" stop-color="#FE2C55" />
    </linearGradient>

    <!-- Bolt Gradient: Bright Amber to Energetic Orange -->
    <linearGradient id="pwaBoltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFD54F" />
      <stop offset="40%" stop-color="#FF9800" />
      <stop offset="100%" stop-color="#FF5722" />
    </linearGradient>

    <!-- Glow Effect -->
    <filter id="pwaGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Solid App Background #090D16 to prevent white borders on Android/iOS -->
  <rect width="512" height="512" fill="#090D16" />

  <!-- Squircle Container -->
  <rect
    x="66"
    y="66"
    width="380"
    height="380"
    rx="98"
    fill="#0B0F19"
    stroke="url(#pwaBorderGrad)"
    stroke-width="16"
    filter="url(#pwaGlow)"
  />

  <!-- Center Lightning Bolt -->
  <path
    d="M280 120 L185 260 H260 L232 392 L340 226 H268 L280 120 Z"
    fill="url(#pwaBoltGrad)"
    stroke="#FFB300"
    stroke-width="2"
    stroke-linejoin="round"
  />
</svg>`;

async function build() {
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), pwaSvg, 'utf8');

  const svgBuf = Buffer.from(pwaSvg);

  // 1. pwa-512x512.png
  await sharp(svgBuf)
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 2. icons/icon-512x512.png
  await sharp(svgBuf)
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'icons', 'icon-512x512.png'));

  // 3. pwa-192x192.png
  await sharp(svgBuf)
    .resize(192, 192)
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 4. apple-touch-icon.png (180x180)
  await sharp(svgBuf)
    .resize(180, 180)
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 5. pwa-maskable-512x512.png (scale logo to 380 inside 512 canvas for Android safe zone circle)
  const innerLogo = await sharp(svgBuf)
    .resize(380, 380)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 9, g: 13, b: 22, alpha: 1 }
    }
  })
    .composite([{ input: innerLogo, top: 66, left: 66 }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // 6. favicon.ico (64x64)
  await sharp(svgBuf)
    .resize(64, 64)
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('✓ All PWA Icons generated with 100% precision');
}

build().catch(console.error);
