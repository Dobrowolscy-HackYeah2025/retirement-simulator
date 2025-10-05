import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_HEADERS =
  'Content-Type, X-Vercel-Protection-Bypass, Authorization';
const ALLOWED_HOST = 'symulator-emerytury-zus.vercel.app';

const normalizeHost = (value: string | undefined): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().toLowerCase();

  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/^https?:\/\//, '').replace(/\/$/, '');
};

const matchesAllowedHost = (value: string | undefined | string[]): boolean => {
  if (Array.isArray(value)) {
    return value.some((item) => normalizeHost(item) === ALLOWED_HOST);
  }

  return normalizeHost(value) === ALLOWED_HOST;
};

export const enforceAllowedHost = (
  req: VercelRequest,
  res: VercelResponse
): boolean => {
  const hostHeader = req.headers.host;
  const forwardedHostHeader = req.headers['x-forwarded-host'];

  if (
    matchesAllowedHost(hostHeader) ||
    matchesAllowedHost(forwardedHostHeader)
  ) {
    return true;
  }

  res.status(403).json({ message: 'Brak dostępu.' });
  return false;
};

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
