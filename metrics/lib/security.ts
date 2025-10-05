import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_HEADERS =
  'Content-Type, X-Vercel-Protection-Bypass, Authorization';

export const applyCors = (
  req: VercelRequest,
  res: VercelResponse,
  allowedMethods: string
): boolean => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', allowedMethods);
  res.setHeader('Access-Control-Allow-Headers', ALLOWED_HEADERS);
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }

  return false;
};

const getAdminKey = (): string => {
  const value = process.env.ADMIN_KEY;
  if (!value) {
    throw new Error('ADMIN_KEY environment variable is not set');
  }

  return value;
};

export const enforceAdminToken = (
  req: VercelRequest,
  res: VercelResponse
): boolean => {
  const authHeader = req.headers.authorization;
  const expected = `Token ${getAdminKey()}`;

  if (authHeader === expected) {
    return true;
  }

  res.status(401).json({ message: 'Brak autoryzacji.' });
  return false;
};
