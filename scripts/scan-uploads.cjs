const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = 'C:/Users/boniv/.gemini/antigravity/brain/f21275c1-07e1-4892-820e-2aedeefdf6c9/.user_uploaded';

async function scan() {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f.startsWith('media_179278') || f.startsWith('media_179279') || f.startsWith('media_179303')) {
      const full = path.join(dir, f);
      const meta = await sharp(full).metadata();
      console.log(f, `${meta.width}x${meta.height}`, `${fs.statSync(full).size} bytes`);
    }
  }
}
scan().catch(console.error);
