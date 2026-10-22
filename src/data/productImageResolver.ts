/**
 * Resolver Inteligente de Imagens Reais para o TikTok Shop Brasil
 * 
 * Evita placeholders genéricos (como o relógio que aparecia para escova de cabelo)
 * e mapeia fotos de estúdio em alta resolução condizentes com o nome e o nicho real do produto.
 */

const SEMANTIC_IMAGE_MAP: Array<{
  keywords: string[];
  imageUrl: string;
}> = [
  // 1. Beleza, Cabelos & Estética
  {
    keywords: ['escova modeladora', 'airwrap', 'coanda', 'secador', 'cabelo', 'modelador de cabelo'],
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
  },
  {
    keywords: ['depilador', 'ipl', 'laser', 'luz pulsada'],
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
  },
  {
    keywords: ['sérum', 'ácido hialurônico', 'skincare', 'vitamina c', 'rosto', 'facial', 'anti-idade'],
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
  },
  {
    keywords: ['batom', 'lip tint', 'maquiagem', 'gloss', 'make', 'rímel'],
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80',
  },

  // 2. Acessórios, Mochilas & Bolsas
  {
    keywords: ['mochila', 'antifurto', 'mochila impermeável', 'backpack', 'mochila usb'],
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
  },
  {
    keywords: ['carteira', 'carteira minimalista', 'alumínio', 'rfid', 'pop-up'],
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80',
  },
  {
    keywords: ['bolsa tiracolo', 'crossbody', 'sling bag', 'bolsa transversal', 'ombro'],
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
  },
  {
    keywords: ['óculos', 'polarizado', 'sunglasses', 'fotocromático'],
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80',
  },
  {
    keywords: ['joias', 'organizador de joias', 'bijuteria', 'estojo de joias'],
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
  },
  {
    keywords: ['pulseira', 'bracelete', 'titânio'],
    imageUrl: 'https://images.unsplash.com/photo-1611591475841-8664161a0670?w=600&q=80',
  },
  {
    keywords: ['guarda-chuva', 'sombrinha', 'abertura invertida'],
    imageUrl: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=600&q=80',
  },
  {
    keywords: ['cinto', 'catraca automática', 'couro'],
    imageUrl: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&q=80',
  },

  // 3. Tech, Celular & Games
  {
    keywords: ['fone', 'headphone', 'earbuds', 'bluetooth', 'tws', 'airpods', 'auricular'],
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80',
  },
  {
    keywords: ['smartwatch', 'relógio inteligente', 'relogio digital', 'band'],
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
  },
  {
    keywords: ['projetor', 'mini projetor', 'cinema portátil'],
    imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&q=80',
  },
  {
    keywords: ['carregador', 'indução', 'magsafe', 'power bank', 'bateria portátil'],
    imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&q=80',
  },
  {
    keywords: ['drone', 'quadricóptero', 'câmera 4k'],
    imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&q=80',
  },
  {
    keywords: ['teclado', 'mouse gamer', 'setup', 'rgb', 'mousepad'],
    imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80',
  },
  {
    keywords: ['tripé', 'ring light', 'iluminação', 'gravador', 'microfone lapela'],
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80',
  },

  // 4. Casa, Cozinha & Decoração
  {
    keywords: ['copo térmico', 'garrafa térmica', 'stanley', 'tumbler', 'caneca térmica'],
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80',
  },
  {
    keywords: ['difusor', 'umidificador', 'aromatizador', 'chamas'],
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80',
  },
  {
    keywords: ['luminária', 'sunset lamp', 'pôr do sol', 'led', 'abajur'],
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
  },
  {
    keywords: ['processador', 'triturador', 'moedor', 'alho', 'cortador'],
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80',
  },
  {
    keywords: ['tapete', 'diatomita', 'banheiro', 'antiderrapante'],
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80',
  },
  {
    keywords: ['seladora', 'embalagem', 'mini seladora', 'saco plástico'],
    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&q=80',
  },
  {
    keywords: ['bolsa térmica', 'marmita', 'lancheira'],
    imageUrl: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=600&q=80',
  },

  // 5. Saúde, Fitness & Esporte
  {
    keywords: ['massageador', 'pistola massageadora', 'fascial gun', 'massagem'],
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
  },
  {
    keywords: ['garrafa motivacional', 'galão', 'água 2l', 'squeeze'],
    imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&q=80',
  },
  {
    keywords: ['tênis', 'calçado', 'ortopédico', 'corrida', 'palmilha'],
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  },
  {
    keywords: ['joelheira', 'compressão', 'postura', 'corretor postural'],
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=80',
  },

  // 6. Pets & Animais
  {
    keywords: ['pet', 'comedouro', 'fonte de água', 'gato', 'cachorro', 'cão'],
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&q=80',
  },
  {
    keywords: ['escova pet', 'vapor pet', 'tira pelos', 'pelo'],
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80',
  },

  // 7. Automotivo
  {
    keywords: ['carro', 'automotivo', 'suporte veicular', 'suporte carro'],
    imageUrl: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&q=80',
  },
  {
    keywords: ['aspirador de pó', 'aspirador portátil', 'limpeza automotiva'],
    imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&q=80',
  },

  // 8. Ferramentas & Utilidades
  {
    keywords: ['ferramenta', 'trena laser', 'parafusadeira', 'fita nano'],
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80',
  },
];

const GENERIC_WATCH_PLACEHOLDER = 'photo-1523275335684-37898b6baf30';

/**
 * Resolve a imagem real mais precisa para o produto
 */
export function resolveRealProductImage(product: any): string {
  if (!product) return 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&q=80';

  // Se o produto já possui uma imagem customizada que não seja o placeholder antigo do relógio
  if (product.imageUrl && !product.imageUrl.includes(GENERIC_WATCH_PLACEHOLDER)) {
    return product.imageUrl;
  }

  const textToMatch = `${product.name || ''} ${product.originalName || ''} ${(product.supplierKeywords || []).join(' ')} ${product.nicheLabel || ''}`.toLowerCase();

  // Procurar correspondência semântica exata
  for (const item of SEMANTIC_IMAGE_MAP) {
    for (const kw of item.keywords) {
      if (textToMatch.includes(kw.toLowerCase())) {
        return item.imageUrl;
      }
    }
  }

  // Fallbacks por nicho caso nenhuma palavra específica seja encontrada
  switch (product.niche) {
    case 'beauty':
      return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80';
    case 'accessories':
      return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80';
    case 'tech':
    case 'gaming':
      return 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80';
    case 'home':
      return 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80';
    case 'fitness':
    case 'health':
      return 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80';
    case 'pets':
      return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&q=80';
    case 'auto':
      return 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&q=80';
    case 'tools':
      return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80';
    default:
      return 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&q=80';
  }
}
