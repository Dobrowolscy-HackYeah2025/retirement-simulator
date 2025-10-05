import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

import { applyCors } from '../lib/security';
import {
  type IngestPayload,
  parseRequestBody,
  validatePayload,
} from './ingest';

const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

let requestTimestamps: number[] = [];

const client = new OpenAI();

const isLimitExceeded = (timestamp: number): boolean => {
  const windowStart = timestamp - RATE_LIMIT_WINDOW_MS;
  requestTimestamps = requestTimestamps.filter((value) => value > windowStart);
  return requestTimestamps.length >= RATE_LIMIT_MAX_REQUESTS;
};

const registerRequest = (timestamp: number): void => {
  requestTimestamps.push(timestamp);
};

const getRetryAfterSeconds = (timestamp: number): number => {
  if (requestTimestamps.length === 0) {
    return Math.ceil(RATE_LIMIT_WINDOW_MS / 1_000);
  }

  const oldestTimestamp = requestTimestamps[0];
  const remainingMs = RATE_LIMIT_WINDOW_MS - (timestamp - oldestTimestamp);
  const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1_000));

  return remainingSeconds;
};

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

const buildInputSection = (payload: IngestPayload): string => {
  const sicknessLabel = payload.includesSicknessPeriods ? 'Tak' : 'Nie';

  const parts = [
    `Wiek: ${payload.age}`,
    `Płeć: ${payload.gender}`,
    `Wysokość wynagrodzenia: ${formatNumber(payload.salary)}`,
    `Czy uwzględniał okresy choroby: ${sicknessLabel}`,
    `Wysokość zgromadzonych środków na koncie ZUS: ${formatNumber(payload.zusBalance)}`,
    `Emerytura oczekiwana: ${formatNumber(payload.expectedPension)}`,
    `Emerytura rzeczywista: ${formatNumber(payload.actualPension)}`,
    `Emerytura urealniona: ${formatNumber(payload.adjustedPension)}`,
    `Kod pocztowy: ${payload.postalCode}`,
  ];

  return parts.join(' ');
};

type OpenAiContentItem = { type: string; text?: string };
type OpenAiOutputItem = { content?: OpenAiContentItem[] };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res, 'POST, OPTIONS')) {
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ message: 'Dostępna jest wyłącznie metoda POST.' });
    return;
  }

  const now = Date.now();
  if (isLimitExceeded(now)) {
    res.setHeader('Retry-After', getRetryAfterSeconds(now).toString());
    res.status(429).json({
      message: 'Przekroczono limit zapytań. Spróbuj ponownie za chwilę.',
    });
    return;
  }

  const rawBody = parseRequestBody(req);
  const payload = validatePayload(rawBody);

  if (!payload) {
    res.status(400).json({ message: 'Nieprawidłowe dane wejściowe.' });
    return;
  }

  try {
    registerRequest(now);
    const prompt = `<context>Jesteś agentem który analizuje dane emerytury użytkownika i daje feedback co do wyników oraz sugeruje różne działania wpływające na jego korzyść, podsumowanie nie powinno być dłuższe niż 400 znaków</context> <input>${buildInputSection(payload)}</input>`;

    try {
      const response = await client.responses.create({
        model: 'gpt-5-mini',
        input: prompt,
      });

      res.status(200).json({ summary: response.output_text });
    } catch (error) {
      console.error(error);
      res.status(502).json({
        message: 'Nie udało się odczytać odpowiedzi od usługi OpenAI.',
      });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Wystąpił błąd po stronie serwera.' });
  }
}
