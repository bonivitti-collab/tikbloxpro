import React from 'react';

type LegalKind = 'termos' | 'privacidade';

export const LegalPage: React.FC<{ kind: LegalKind }> = ({ kind }) => {
  const privacy = kind === 'privacidade';
  return (
    <main className="min-h-screen bg-[#0B1020] text-slate-200 px-4 py-10">
      <article className="max-w-2xl mx-auto space-y-4 text-sm leading-relaxed">
        <a href="/" className="text-[#25F4EE] text-xs font-bold">Voltar</a>
        <h1 className="text-2xl font-black text-white">{privacy ? 'Privacidade' : 'Termos de uso'}</h1>
        <p>
          O TikBlox Pro é um radar de produtos do TikTok Shop Brasil, operado como tecnologia Sentinel Systems.
          Não somos o TikTok nem a ByteDance. O link do produto abre o anúncio; o comprador escolhe o vendedor lá.
        </p>
        {privacy ? (
          <>
            <p>
              Guardamos o e-mail, o nome e o estado da assinatura que a Kiwify envia no webhook, para liberar ou
              tirar o acesso. A senha, quando existe, fica só como hash scrypt no servidor. O navegador recebe um
              cookie HttpOnly de sessão, não a chave do banco.
            </p>
            <p>
              Números de preço, comissão, estoque e vídeos vêm da coleta (Kalodata e, se configurada, Apify) ou do
              que você digita. Não vendemos essa base. Para pedir acesso, correção ou exclusão dos seus dados,
              use o e-mail da compra na Kiwify.
            </p>
          </>
        ) : (
          <>
            <p>
              O acesso pago entra pelo checkout da Kiwify. Reembolso, atraso e cancelamento seguem o webhook
              assinado da Kiwify: sem assinatura válida o radar não abre. A garantia anunciada na página de
              pagamento é a da oferta da Kiwify, não uma promessa extra deste site.
            </p>
            <p>
              O radar mostra faixa de preço, comissão quando a taxa existe, e um score só quando a contagem de
              vídeos foi medida: 95 menos o número de vídeos, entre 5 e 95. Catálogo de exemplo, ilustrações da
              landing e texto de gancho não são medição nem resultado de cliente.
            </p>
          </>
        )}
      </article>
    </main>
  );
};
