import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as ExcelJS from 'exceljs';

import { getDb } from '../lib/db';
import { applyCors, enforceAdminToken } from '../lib/security';

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

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Raporty', {
      properties: { defaultColWidth: 20 },
    });

    // Define columns with headers
    worksheet.columns = [
      { header: 'Data użycia', key: 'usageDate', width: 15 },
      { header: 'Godzina użycia', key: 'usageTime', width: 15 },
      { header: 'Emerytura oczekiwana', key: 'expectedPension', width: 20 },
      { header: 'Wiek', key: 'age', width: 10 },
      { header: 'Płeć', key: 'gender', width: 15 },
      { header: 'Wysokość wynagrodzenia', key: 'salary', width: 20 },
      {
        header: 'Czy uwzględniał okresy choroby',
        key: 'includesSicknessPeriods',
        width: 30,
      },
      {
        header: 'Wysokość zgromadzonych środków',
        key: 'zusBalance',
        width: 25,
      },
      { header: 'Emerytura rzeczywista', key: 'actualPension', width: 20 },
      { header: 'Emerytura urealniona', key: 'adjustedPension', width: 20 },
      { header: 'Kod pocztowy', key: 'postalCode', width: 15 },
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    worksheet.getRow(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    // Add data rows
    rows.forEach((row) => {
      const includesSicknessRaw = row['includesSicknessPeriods'];
      const includesSickness =
        Number(includesSicknessRaw) === 1 || includesSicknessRaw === true
          ? 'Tak'
          : 'Nie';

      worksheet.addRow({
        usageDate: row['usageDate'],
        usageTime: row['usageTime'],
        expectedPension: row['expectedPension'],
        age: row['age'],
        gender: row['gender'],
        salary: row['salary'],
        includesSicknessPeriods: includesSickness,
        zusBalance: row['zusBalance'],
        actualPension: row['actualPension'],
        adjustedPension: row['adjustedPension'],
        postalCode: row['postalCode'],
      });
    });

    // Add borders to all cells
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set headers for XLSX download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="metrics-report.xlsx"'
    );
    res.setHeader('Content-Length', buffer.byteLength.toString());

    res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    res.status(500).json({ message: 'Wystąpił błąd po stronie serwera.' });
  }
}
