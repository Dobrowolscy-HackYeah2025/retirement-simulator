import type { VercelRequest, VercelResponse } from '@vercel/node';

import { getDb } from '../lib/db';
import { applyCors } from '../lib/security';

export interface IngestPayload {
  expectedPension: number; // Emerytura oczekiwana
  age: number; // Wiek
  gender: string; // Płeć
  salary: number; // Wysokość wynagrodzenia
  includesSicknessPeriods: boolean; // Czy uwzględniał okresy choroby
  zusBalance: number | null; // Wysokość zgromadzonych środków na koncie i Subkoncie
  actualPension: number; // Emerytura rzeczywista
  adjustedPension: number; // Emerytura urealniona
  postalCode?: string | null; // Kod pocztowy
}

export const parseRequestBody = (req: VercelRequest): unknown => {
  if (req.body === undefined || req.body === null) {
    return null;
  }

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }

  return req.body;
};

const toPolandDateParts = (
  date: Date
): { usageDate: string; usageTime: string } => {
  const formatter = new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((item) => item.type === type)?.value ?? '';

  return {
    usageDate: `${part('year')}-${part('month')}-${part('day')}`,
    usageTime: `${part('hour')}:${part('minute')}:${part('second')}`,
  };
};

const sanitizePostalCode = (value: string): string =>
  value.trim().toUpperCase();

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export const validatePayload = (raw: unknown): IngestPayload | null => {
  if (typeof raw !== 'object' || raw === null) {
    return null;
  }

  const {
    expectedPension,
    age,
    gender,
    salary,
    includesSicknessPeriods,
    zusBalance,
    actualPension,
    adjustedPension,
    postalCode,
  } = raw as Partial<IngestPayload>;

  if (
    !isFiniteNumber(expectedPension) ||
    !isFiniteNumber(age) ||
    typeof gender !== 'string' ||
    !isFiniteNumber(salary) ||
    typeof includesSicknessPeriods !== 'boolean' ||
    (zusBalance && !isFiniteNumber(zusBalance)) ||
    !isFiniteNumber(actualPension) ||
    !isFiniteNumber(adjustedPension) ||
    (postalCode && typeof postalCode !== 'string')
  ) {
    return null;
  }

  return {
    expectedPension,
    age,
    gender: gender.trim(),
    salary,
    includesSicknessPeriods,
    zusBalance: zusBalance ? zusBalance : null,
    actualPension,
    adjustedPension,
    postalCode: postalCode ? sanitizePostalCode(postalCode) : null,
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res, 'POST, OPTIONS')) {
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ message: 'Dostępna jest wyłącznie metoda POST.' });
    return;
  }

  const rawBody = parseRequestBody(req);

  const payload = validatePayload(rawBody);
  if (!payload) {
    res.status(400).json({ message: 'Nieprawidłowe dane wejściowe.' });
    return;
  }

  try {
    const db = await getDb();
    const { usageDate, usageTime } = toPolandDateParts(new Date());

    await db.execute({
      sql: `
        INSERT INTO report_events (
          usage_date,
          usage_time,
          expected_pension,
          age,
          gender,
          salary,
          includes_sickness_periods,
          zus_balance,
          actual_pension,
          adjusted_pension,
          postal_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      args: [
        usageDate,
        usageTime,
        payload.expectedPension,
        payload.age,
        payload.gender,
        payload.salary,
        payload.includesSicknessPeriods ? 1 : 0,
        payload.zusBalance,
        payload.actualPension,
        payload.adjustedPension,
        payload.postalCode,
      ],
    });

    res.status(201).json({ message: 'Zdarzenie zostało zapisane.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Wystąpił błąd po stronie serwera.' });
  }
}
