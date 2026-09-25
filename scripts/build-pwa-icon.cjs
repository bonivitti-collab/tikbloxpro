const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '../public');

// Create the 3D Interlocking Glossy Blox SVG matching user's image exactly
function create3DIconSVG() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Squircle Gradients -->
    <radialGradient id="squircleBg" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#12131C" />
      <stop offset="45%" stop-color="#08090E" />
      <stop offset="100%" stop-color="#000000" />
    </radialGradient>

    <!-- Glass Rim Highlight on Squircle -->
    <linearGradient id="squircleRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.45)" />
      <stop offset="30%" stop-color="rgba(255,255,255,0.18)" />
      <stop offset="70%" stop-color="rgba(255,255,255,0.03)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.8)" />
    </linearGradient>

    <!-- Glass Dome Highlight on Squircle top -->
    <linearGradient id="squircleGloss" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.22)" />
      <stop offset="40%" stop-color="rgba(255,255,255,0.06)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0.0)" />
    </linearGradient>

    <!-- 1. CYAN BLOCK GRADIENTS (Top) -->
    <linearGradient id="cyanTopFace" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#48F7FF" />
      <stop offset="40%" stop-color="#00E5FF" />
      <stop offset="100%" stop-color="#00B4D8" />
    </linearGradient>
    <linearGradient id="cyanLeftFace" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00C4E6" />
      <stop offset="100%" stop-color="#008EA6" />
    </linearGradient>
    <linearGradient id="cyanRightFace" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#008EA6" />
      <stop offset="100%" stop-color="#006375" />
    </linearGradient>

    <!-- 2. PINK / MAGENTA BLOCK GRADIENTS (Bottom-Left) -->
    <linearGradient id="pinkTopFace" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#FF5288" />
      <stop offset="40%" stop-color="#FF007F" />
      <stop offset="100%" stop-color="#D6006B" />
    </linearGradient>
    <linearGradient id="pinkLeftFace" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F7007B" />
      <stop offset="100%" stop-color="#C20060" />
    </linearGradient>
    <linearGradient id="pinkRightFace" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#BD005E" />
      <stop offset="100%" stop-color="#7A003B" />
    </linearGradient>

    <!-- 3. SKY BLUE / CERULEAN BLOCK GRADIENTS (Right) -->
    <linearGradient id="blueTopFace" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#82C2FF" />
      <stop offset="40%" stop-color="#4F9DFF" />
      <stop offset="100%" stop-color="#2D7AE0" />
    </linearGradient>
    <linearGradient id="blueLeftFace" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3D8EF5" />
      <stop offset="100%" stop-color="#1A66CC" />
    </linearGradient>
    <linearGradient id="blueRightFace" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2877E0" />
      <stop offset="100%" stop-color="#144C99" />
    </linearGradient>

    <!-- Glossy Specular Highlights for Cube Bevels -->
    <linearGradient id="specularGlint" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.95)" />
      <stop offset="50%" stop-color="rgba(255,255,255,0.4)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0.0)" />
    </linearGradient>

    <!-- Soft Drop Shadow Filter for 3D Blocks -->
    <filter id="blockShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#000000" flood-opacity="0.9" />
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.7" />
    </filter>

    <!-- Ambient Glow under the blocks -->
    <filter id="ambientGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="32" />
    </filter>
  </defs>

  <!-- Pure Pitch Black Canvas Base -->
  <rect width="512" height="512" fill="#000000" />

  <!-- Outer Squircle Container (iOS App Icon Silhouette) -->
  <g id="squircle-frame">
    <!-- Squircle Drop Shadow -->
    <rect x="44" y="44" width="424" height="424" rx="98" fill="#000000" opacity="0.6" />
    
    <!-- Glossy Piano-Black Squircle Body -->
    <rect x="44" y="44" width="424" height="424" rx="98" fill="url(#squircleBg)" />
    
    <!-- Outer Rim Highlight -->
    <rect x="44" y="44" width="424" height="424" rx="98" fill="none" stroke="url(#squircleRim)" stroke-width="2.5" />
    
    <!-- Glass Curved Dome Highlight on Top Half -->
    <path d="M 46 142 C 46 88, 88 46, 142 46 L 370 46 C 424 46, 466 88, 466 142 C 340 180, 172 180, 46 142 Z" fill="url(#squircleGloss)" opacity="0.65" />
  </g>

  <!-- Subtle Ambient Glows from the 3 Blocks -->
  <ellipse cx="230" cy="190" rx="90" ry="70" fill="#00E5FF" opacity="0.14" filter="url(#ambientGlow)" />
  <ellipse cx="200" cy="330" rx="90" ry="70" fill="#FF007F" opacity="0.16" filter="url(#ambientGlow)" />
  <ellipse cx="320" cy="270" rx="90" ry="70" fill="#4F9DFF" opacity="0.15" filter="url(#ambientGlow)" />

  <!-- 
    ========================================================================
    CENTRAL 3D ISOMETRIC INTERLOCKING BLOCKS (MATCHING USER'S IMAGE)
    Center: (256, 260)
    ========================================================================
  -->
  <g id="interlocking-3d-blox" filter="url(#blockShadow)">
    
    <!-- ============================================================== -->
    <!-- 1. TOP BLOCK: CYAN T-CUBE (L-interlock extending right)        -->
    <!-- ============================================================== -->
    <g id="cyan-block">
      <!-- Main Upper Cube -->
      <!-- Left Face -->
      <path d="M 148 162 L 218 202 L 218 274 L 148 234 Z" fill="url(#cyanLeftFace)" />
      <!-- Right Face -->
      <path d="M 218 202 L 288 162 L 288 234 L 218 274 Z" fill="url(#cyanRightFace)" />
      <!-- Top Face -->
      <path d="M 218 122 L 288 162 L 218 202 L 148 162 Z" fill="url(#cyanTopFace)" />

      <!-- Step Extension Right (Interlocks over Sky Blue) -->
      <!-- Extension Top Face -->
      <path d="M 288 162 L 358 202 L 288 242 L 218 202 Z" fill="url(#cyanTopFace)" />
      <!-- Extension Right Face -->
      <path d="M 358 202 L 358 274 L 288 314 L 288 242 Z" fill="url(#cyanRightFace)" />
      <!-- Extension Underside / Inner Face -->
      <path d="M 218 274 L 288 234 L 288 242 L 218 274 Z" fill="#004D5C" opacity="0.6" />

      <!-- Specular Gloss Sheen on Top Faces -->
      <path d="M 218 123 L 286 162 L 254 180 L 186 142 Z" fill="url(#specularGlint)" opacity="0.75" />
      <path d="M 288 163 L 356 202 L 324 220 L 256 182 Z" fill="url(#specularGlint)" opacity="0.65" />

      <!-- Fine Edge Bevel Highlights -->
      <line x1="218" y1="122" x2="148" y2="162" stroke="#A6FBFF" stroke-width="2" stroke-linecap="round" opacity="0.9" />
      <line x1="218" y1="122" x2="288" y2="162" stroke="#CFFFFE" stroke-width="2.5" stroke-linecap="round" opacity="0.95" />
      <line x1="288" y1="162" x2="358" y2="202" stroke="#CFFFFE" stroke-width="2.5" stroke-linecap="round" opacity="0.95" />
      <line x1="148" y1="162" x2="218" y2="202" stroke="#5CF9FF" stroke-width="1.5" opacity="0.6" />
      <line x1="218" y1="202" x2="288" y2="242" stroke="#5CF9FF" stroke-width="1.5" opacity="0.5" />
    </g>

    <!-- ============================================================== -->
    <!-- 2. RIGHT BLOCK: SKY BLUE (Stepping down and interlocking)       -->
    <!-- ============================================================== -->
    <g id="blue-block">
      <!-- Upper Body behind Cyan Extension -->
      <!-- Left Face -->
      <path d="M 252 222 L 298 248 L 298 322 L 252 296 Z" fill="url(#blueLeftFace)" />
      <!-- Right Face -->
      <path d="M 298 248 L 388 196 L 388 270 L 298 322 Z" fill="url(#blueRightFace)" />
      <!-- Top Face -->
      <path d="M 342 170 L 388 196 L 298 248 L 252 222 Z" fill="url(#blueTopFace)" />

      <!-- Lower Body (Descending towards bottom) -->
      <!-- Top Face of Lower Step -->
      <path d="M 298 322 L 388 270 L 388 344 L 298 396 Z" fill="url(#blueRightFace)" />
      <!-- Left Face of Lower Step -->
      <path d="M 298 322 L 298 396 L 252 370 L 252 296 Z" fill="url(#blueLeftFace)" />

      <!-- Specular Gloss on Blue Top -->
      <path d="M 342 171 L 386 196 L 342 221 L 298 196 Z" fill="url(#specularGlint)" opacity="0.65" />
      
      <!-- Fine Edge Bevel Highlights -->
      <line x1="342" y1="170" x2="388" y2="196" stroke="#D1E8FF" stroke-width="2.5" stroke-linecap="round" opacity="0.9" />
      <line x1="388" y1="196" x2="388" y2="270" stroke="#99CAFF" stroke-width="1.8" opacity="0.7" />
      <line x1="388" y1="270" x2="388" y2="344" stroke="#70B0FF" stroke-width="1.5" opacity="0.6" />
    </g>

    <!-- ============================================================== -->
    <!-- 3. BOTTOM-LEFT BLOCK: VIVID PINK / MAGENTA CUBE                -->
    <!-- ============================================================== -->
    <g id="pink-block">
      <!-- Pink Cube Main Body -->
      <!-- Top Face -->
      <path d="M 218 274 L 288 234 L 288 306 L 218 346 Z" fill="#99004C" opacity="0.4" />
      <path d="M 148 262 L 218 222 L 288 262 L 218 302 Z" fill="url(#pinkTopFace)" />
      
      <!-- Left Face -->
      <path d="M 148 262 L 218 302 L 218 396 L 148 356 Z" fill="url(#pinkLeftFace)" />
      
      <!-- Right Face -->
      <path d="M 218 302 L 288 262 L 288 356 L 218 396 Z" fill="url(#pinkRightFace)" />

      <!-- L-Interlock Connecting with Sky Blue -->
      <path d="M 218 396 L 288 356 L 318 374 L 248 414 Z" fill="url(#pinkRightFace)" />
      <path d="M 248 414 L 318 374 L 298 362 L 228 402 Z" fill="url(#pinkTopFace)" />

      <!-- Specular Gloss on Pink Top Face -->
      <path d="M 218 223 L 286 262 L 254 280 L 186 242 Z" fill="url(#specularGlint)" opacity="0.75" />

      <!-- Fine Edge Bevel Highlights -->
      <line x1="218" y1="222" x2="148" y2="262" stroke="#FF99C2" stroke-width="2" stroke-linecap="round" opacity="0.85" />
      <line x1="218" y1="222" x2="288" y2="262" stroke="#FFD1E3" stroke-width="2.5" stroke-linecap="round" opacity="0.95" />
      <line x1="148" y1="262" x2="218" y2="302" stroke="#FF5C9D" stroke-width="1.5" opacity="0.6" />
      <line x1="218" y1="302" x2="218" y2="396" stroke="#FF85B3" stroke-width="1.8" opacity="0.7" />
    </g>

    <!-- Deep Ambient Occlusion Junctions -->
    <g opacity="0.55" fill="#000000">
      <!-- Junction between Cyan and Pink -->
      <path d="M 218 274 L 224 270 L 224 286 L 218 290 Z" />
      <!-- Junction between Cyan and Blue -->
      <path d="M 288 242 L 294 238 L 294 256 L 288 260 Z" />
      <!-- Center Core Crevice Shadow -->
      <polygon points="218,274 238,262 238,282 218,294" />
    </g>

  </g>

  <!-- Final Glint Pinpoints for High Gloss Look -->
  <circle cx="218" cy="123" r="3" fill="#FFFFFF" opacity="0.95" />
  <circle cx="288" cy="163" r="2.5" fill="#FFFFFF" opacity="0.9" />
  <circle cx="218" cy="223" r="3" fill="#FFFFFF" opacity="0.95" />
  <circle cx="342" cy="171" r="2.5" fill="#FFFFFF" opacity="0.9" />

</svg>`;
}

async function run() {
  console.log('Generating exact 3D PWA icon matching uploaded design...');
  const svg = create3DIconSVG();

  // Save icon.svg
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg);
  console.log('Saved public/icon.svg');

  const svgBuffer = Buffer.from(svg);

  // 1. apple-touch-icon.png (180x180) - Used by iOS Safari Add to Home Screen!
  await sharp(svgBuffer)
    .resize(180, 180)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated public/apple-touch-icon.png (180x180)');

  // 2. pwa-192x192.png (192x192) - Android & Web App Manifest
  await sharp(svgBuffer)
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Generated public/pwa-192x192.png (192x192)');

  // 3. pwa-512x512.png (512x512) - High-res splash & PWA standard
  await sharp(svgBuffer)
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Generated public/pwa-512x512.png (512x512)');

  // 4. pwa-maskable-512x512.png (512x512) with safe-zone padding
  await sharp(svgBuffer)
    .resize(410, 410)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    })
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Generated public/pwa-maskable-512x512.png (512x512)');

  // 5. favicon.ico
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Generated public/favicon.ico (64x64)');

  // Also copy to dist if dist exists
  const distDir = path.resolve(__dirname, '../dist');
  if (fs.existsSync(distDir)) {
    fs.copyFileSync(path.join(publicDir, 'apple-touch-icon.png'), path.join(distDir, 'apple-touch-icon.png'));
    fs.copyFileSync(path.join(publicDir, 'pwa-192x192.png'), path.join(distDir, 'pwa-192x192.png'));
    fs.copyFileSync(path.join(publicDir, 'pwa-512x512.png'), path.join(distDir, 'pwa-512x512.png'));
    fs.copyFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), path.join(distDir, 'pwa-maskable-512x512.png'));
    fs.copyFileSync(path.join(publicDir, 'icon.svg'), path.join(distDir, 'icon.svg'));
    fs.copyFileSync(path.join(publicDir, 'favicon.ico'), path.join(distDir, 'favicon.ico'));
    console.log('Updated dist/ icon assets');
  }

  console.log('All PWA and iOS icons successfully updated!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
