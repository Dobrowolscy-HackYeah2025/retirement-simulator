import type { VercelRequest, VercelResponse } from '@vercel/node';

import { getDb } from '../lib/db';
import { applyCors, enforceAdminToken } from '../lib/security';

const escapeHtml = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res, 'GET, OPTIONS')) {
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ message: 'Dostępna jest wyłącznie metoda GET.' });
    return;
  }

  if (!enforceAdminToken(req, res)) {
    return;
  }

  try {
    const db = await getDb();
    const result = await db.execute(`
      SELECT
        usage_date AS usageDate,
        usage_time AS usageTime,
        expected_pension AS expectedPension,
        age,
        gender,
        salary,
        includes_sickness_periods AS includesSicknessPeriods,
        zus_balance AS zusBalance,
        actual_pension AS actualPension,
        adjusted_pension AS adjustedPension,
        postal_code AS postalCode
      FROM report_events
      ORDER BY usage_date DESC, usage_time DESC;
    `);

    const rows = (result.rows ?? []) as Array<Record<string, unknown>>;

    const headerCells = [
      'Data użycia',
      'Godzina użycia',
      'Emerytura oczekiwana',
      'Wiek',
      'Płeć',
      'Wysokość wynagrodzenia',
      'Czy uwzględniał okresy choroby',
      'Wysokość zgromadzonych środków na koncie i Subkoncie',
      'Emerytura rzeczywista',
      'Emerytura urealniona',
      'Kod pocztowy',
    ]
      .map((label) => `<th>${escapeHtml(label)}</th>`) // header labels w języku polskim
      .join('');

    const bodyRows = rows
      .map((row) => {
        const includesSicknessRaw = row['includesSicknessPeriods'];
        const includesSickness =
          Number(includesSicknessRaw) === 1 || includesSicknessRaw === true
            ? 'Tak'
            : 'Nie';
        return `
          <tr>
            <td>${escapeHtml(row['usageDate'])}</td>
            <td>${escapeHtml(row['usageTime'])}</td>
            <td>${escapeHtml(row['expectedPension'])}</td>
            <td>${escapeHtml(row['age'])}</td>
            <td>${escapeHtml(row['gender'])}</td>
            <td>${escapeHtml(row['salary'])}</td>
            <td>${escapeHtml(includesSickness)}</td>
            <td>${escapeHtml(row['zusBalance'])}</td>
            <td>${escapeHtml(row['actualPension'])}</td>
            <td>${escapeHtml(row['adjustedPension'])}</td>
            <td>${escapeHtml(row['postalCode'])}</td>
          </tr>
        `;
      })
      .join('');

    const html = `<!DOCTYPE html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <title>Eksport raportów</title>
  </head>
  <body>
    <table border="1">
      <thead>
        <tr>${headerCells}</tr>
      </thead>
      <tbody>
        ${bodyRows}
      </tbody>
    </table>
  </body>
</html>`;

    res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="report-events.xls"'
    );
    res.status(200).send(html);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Wystąpił błąd po stronie serwera.' });
  }
}
