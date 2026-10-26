const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '..', 'public');

async function build() {
  console.log('Generating authentic TikBlox 3D Blox assets...');
  
  // 1. Read the original icon.svg (3D Isometric Blox)
  const iconSvgPath = path.join(publicDir, 'icon.svg');
  const iconSvgBuf = fs.readFileSync(iconSvgPath);

  // 512x512
  await sharp(iconSvgBuf)
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // icons/icon-512x512.png
  await sharp(iconSvgBuf)
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'icons', 'icon-512x512.png'));

  // 192x192
  await sharp(iconSvgBuf)
    .resize(192, 192)
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 180x180 Apple Touch Icon
  await sharp(iconSvgBuf)
    .resize(180, 180)
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 512x512 Maskable (scale inner 3D blox to 390px centered in 512px canvas for Android safe zone circle)
  const innerSymbol = await sharp(iconSvgBuf)
    .resize(390, 390)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 9, g: 10, b: 16, alpha: 1 } // #090A10 deep obsidian
    }
  })
    .composite([{ input: innerSymbol, top: 61, left: 61 }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // 64x64 Favicon
  await sharp(iconSvgBuf)
    .resize(64, 64)
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('✓ All 3D Isometric Blox PWA icons successfully generated!');

  // 2. Generate tikblox-logo.png from original tikblox-full-logo.svg
  const fullLogoPath = path.join(publicDir, 'tikblox-full-logo.svg');
  const fullLogoBuf = fs.readFileSync(fullLogoPath);

  await sharp(fullLogoBuf)
    .resize(1200, 360)
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'tikblox-logo.png'));

  console.log('✓ Authentic 1200x360 tikblox-logo.png generated from original full logo!');
}

build().catch(console.error);
