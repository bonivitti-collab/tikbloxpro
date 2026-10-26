const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const userImg = 'C:/Users/boniv/.gemini/antigravity/brain/f21275c1-07e1-4892-820e-2aedeefdf6c9/.user_uploaded/media_1793030004789_5a3c0d04.png';
const publicDir = path.resolve(__dirname, '..', 'public');

async function run() {
  console.log('1. Processing authentic TikBlox Pro logo from user uploaded file...');
  // Bounding box of content: minX: 9, maxX: 154, minY: 11, maxY: 51
  // Adding balanced 4px padding
  const left = 5;
  const top = 7;
  const width = 153;
  const height = 48;

  // Extract the cropped logo
  const cropped = await sharp(userImg)
    .extract({ left, top, width, height })
    .toBuffer();

  // Generate 2x crisp version (306x96)
  await sharp(cropped)
    .resize(306, 96, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'tikblox-logo.png'));

  console.log('✓ public/tikblox-logo.png generated with authentic user artwork (306x96 HiDPI)');

  // 2. Generate icon.svg with solid #090D16 background and glowing squircle
  const iconSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Border Gradient: Cyan to Pink (TikTok Signature) -->
    <linearGradient id="tbBorderGrad512" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#25F4EE" />
      <stop offset="50%" stop-color="#00D2C4" />
      <stop offset="100%" stop-color="#FE2C55" />
    </linearGradient>

    <!-- Bolt Gradient: Bright Amber to Energetic Orange -->
    <linearGradient id="tbBoltGrad512" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFC107" />
      <stop offset="45%" stop-color="#FF9800" />
      <stop offset="100%" stop-color="#FF5722" />
    </linearGradient>

    <!-- Neon Glow on border & bolt -->
    <filter id="tbGlow512" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Solid App Canvas Background #090D16 -->
  <rect width="512" height="512" rx="112" fill="#090D16" />

  <!-- Squircle Container with TikTok Gradient Border -->
  <rect x="36" y="36" width="440" height="440" rx="110" fill="#0B0F19" stroke="url(#tbBorderGrad512)" stroke-width="16" filter="url(#tbGlow512)" />

  <!-- Center Lightning Bolt (Proportionate to Official Design) -->
  <path
    d="M278 116 L188 252 H258 L236 388 L344 220 H266 L278 116 Z"
    fill="url(#tbBoltGrad512)"
    stroke="#FFA000"
    stroke-width="2"
    stroke-linejoin="round"
    filter="url(#tbGlow512)"
  />
</svg>`;

  fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconSvgContent, 'utf8');
  console.log('✓ public/icon.svg updated with solid canvas & high-res squircle');

  const svgBuf = Buffer.from(iconSvgContent);

  // 3. Generate all PWA Icon sizes
  // 512x512
  await sharp(svgBuf)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // icons/icon-512x512.png
  await sharp(svgBuf)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icons', 'icon-512x512.png'));

  // 192x192
  await sharp(svgBuf)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 180x180 Apple Touch Icon
  await sharp(svgBuf)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Maskable 512x512 (with safe-zone 80% padding for Android adaptive icons)
  await sharp(svgBuf)
    .resize(410, 410)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 9, g: 13, b: 22, alpha: 1 }
    })
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // Favicon 64x64
  await sharp(svgBuf)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('✓ All PWA icons (192, 512, maskable, apple-touch, favicon) successfully generated!');
}

run().catch(console.error);
