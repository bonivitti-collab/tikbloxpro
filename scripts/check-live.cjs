async function check() {
  const res = await fetch('https://tikbloxpro.vercel.app');
  const html = await res.text();
  console.log('Live Status:', res.status);
  console.log('Live Title:', html.match(/<title>(.*?)<\/title>/)?.[1]);
  const jsMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
  console.log('Live Main JS:', jsMatch?.[1]);
  const logoRes = await fetch('https://tikbloxpro.vercel.app/tikblox-logo.png');
  console.log('Live tikblox-logo.png size:', logoRes.headers.get('content-length'), 'status:', logoRes.status);
  const pwaRes = await fetch('https://tikbloxpro.vercel.app/pwa-192x192.png');
  console.log('Live pwa-192x192.png size:', pwaRes.headers.get('content-length'), 'status:', pwaRes.status);
}
check().catch(console.error);
