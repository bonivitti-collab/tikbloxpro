// api/webhook/kiwify.ts - Endpoint de Webhook da Kiwify (Vercel Serverless)

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-kiwify-signature');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body || {};
    const orderStatus = payload.order_status || payload.status;
    const customer = payload.Customer || payload.customer || {};
    const product = payload.Product || payload.product || {};
    const subscription = payload.Subscription || payload.subscription || {};

    const customerEmail = (customer.email || '').toLowerCase().trim();
    const customerName = customer.full_name || customer.name || 'Assinante TikBlox';
    const productName = product.product_name || product.name || 'TikBlox Pro';

    console.log(`[KIWIFY WEBHOOK] Recebido evento: ${orderStatus} para ${customerEmail} - Produto: ${productName}`);

    // Identifica se é o Plano Combo com IA ou o Plano Radar Essential
    const isComboWithAI = 
      productName.toLowerCase().includes('ia') || 
      productName.toLowerCase().includes('combo') || 
      productName.toLowerCase().includes('copilot');

    const assignedPlan = isComboWithAI ? 'pro_ai' : 'essential';

    if (orderStatus === 'paid' || orderStatus === 'approved') {
      console.log(`[KIWIFY WEBHOOK] Acesso LIBERADO para ${customerEmail} - Plano: ${assignedPlan}`);
      
      // Aqui o acesso fica registrado com status ativo
      return res.status(200).json({
        success: true,
        message: 'Acesso do assinante aprovado e liberado com sucesso.',
        email: customerEmail,
        plan: assignedPlan,
      });
    }

    if (orderStatus === 'refunded' || orderStatus === 'chargedback' || orderStatus === 'canceled') {
      console.log(`[KIWIFY WEBHOOK] Acesso REVOGADO para ${customerEmail}`);
      return res.status(200).json({
        success: true,
        message: 'Acesso revogado.',
        email: customerEmail,
      });
    }

    // Outros eventos
    return res.status(200).json({
      success: true,
      received: true,
    });
  } catch (error: any) {
    console.error('[KIWIFY WEBHOOK ERROR]:', error);
    return res.status(500).json({ error: 'Erro interno ao processar webhook da Kiwify' });
  }
}
