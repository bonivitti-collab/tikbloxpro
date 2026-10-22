export default function handler(req: any, res: any) {
  res.status(200).json({
    status: 'ok',
    service: 'TikBlox Pro API',
    version: '2.0.0',
    timestamp: Date.now(),
  });
}
