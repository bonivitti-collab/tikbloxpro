const fs = require('fs');
let c = fs.readFileSync('vite.config.ts', 'utf8');
c = c.replace(
  "name: 'TIKBLOX - Radar de Tendências Virais & Produtos do Exterior',",
  "name: 'TIKBLOX PRO - TikTok Shop Brasil Radar',"
).replace(
  "short_name: 'TIKBLOX',",
  "short_name: 'TIKBLOX PRO',"
).replace(
  "description: 'Radar de tendências de produtos internacionais explodindo nos EUA/China chegando ao Brasil para surfar a onda.',",
  "description: 'Radar de tendências virais do TikTok Shop e minerador de produtos com estoque pronta entrega em São Paulo.',"
).replace(
  "theme_color: '#090d16',",
  "theme_color: '#090D16',"
).replace(
  "background_color: '#090d16',",
  "background_color: '#090D16',"
);
fs.writeFileSync('vite.config.ts', c, 'utf8');
console.log('✓ vite.config.ts manifest updated successfully');
