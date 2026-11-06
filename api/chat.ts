export default function handler(_req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(410).json({ error: 'O copiloto de IA foi removido do TikBlox.' });
}
