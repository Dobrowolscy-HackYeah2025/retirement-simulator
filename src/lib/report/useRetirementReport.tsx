import {
  contributionHistoryAtom,
  inputAgeAtom,
  inputGenderAtom,
  inputGrossMonthlySalaryAtom,
  inputPlannedRetirementYearAtom,
  inputWorkStartYearAtom,
  inputZusAccountBalanceAtom,
  pensionForecastDataAtom,
  regionalBenchmarkAtom,
  replacementRateAtom,
  retirementAccumulatedCapitalAtom,
  retirementMonthlyPensionAtom,
  retirementMonthlyPensionWithSickLeaveAtom,
  retirementPensionReplacementRatioAtom,
  retirementPensionReplacementRatioWithSickLeaveAtom,
  scenariosDataAtom,
  sickLeaveImpactAtom,
} from '@/lib/atoms';

import { useCallback } from 'react';

import { pdf } from '@react-pdf/renderer';
import { useAtomValue } from 'jotai';

import { RetirementReportDocument } from './RetirementReportDocument';
import type { RetirementReportChart, RetirementReportHandle } from './types';

const REPORT_COLORS = {
  primary: '#00993F',
  primaryDark: '#084F25',
  primaryLight: '#BAD4C4',
  amber: '#FFB34F',
  blue: '#3F84D2',
  coral: '#F05E5E',
  gray: '#BEC3CE',
};

function normalizeStrings<T>(value: T): T {
  if (typeof value === 'string') {
    return value.normalize('NFC') as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeStrings(item)) as T;
  }

  if (value && typeof value === 'object') {
    const normalizedEntries = Object.entries(
      value as Record<string, unknown>
    ).map(([key, entryValue]) => [key, normalizeStrings(entryValue)] as const);

    return Object.fromEntries(normalizedEntries) as T;
  }

  return value;
}

interface GenerateRetirementReportOptions {
  previewWindow?: Window | null;
}

export function useRetirementReport(): (
  options?: GenerateRetirementReportOptions
) => Promise<RetirementReportHandle> {
  const age = useAtomValue(inputAgeAtom);
  const gender = useAtomValue(inputGenderAtom);
  const grossMonthlySalary = useAtomValue(inputGrossMonthlySalaryAtom);
  const workStartYear = useAtomValue(inputWorkStartYearAtom);
  const plannedRetirementYear = useAtomValue(inputPlannedRetirementYearAtom);
  const zusAccountBalance = useAtomValue(inputZusAccountBalanceAtom);
  const accumulatedCapital = useAtomValue(retirementAccumulatedCapitalAtom);
  const monthlyPension = useAtomValue(retirementMonthlyPensionAtom);
  const monthlyPensionWithSickLeave = useAtomValue(
    retirementMonthlyPensionWithSickLeaveAtom
  );
  const replacementRatio = useAtomValue(retirementPensionReplacementRatioAtom);
  const replacementRatioWithSickLeave = useAtomValue(
    retirementPensionReplacementRatioWithSickLeaveAtom
  );
  const pensionForecastData = useAtomValue(pensionForecastDataAtom);
  const replacementRateValue = useAtomValue(replacementRateAtom);
  const sickLeaveImpact = useAtomValue(sickLeaveImpactAtom);
  const contributionHistory = useAtomValue(contributionHistoryAtom);
  const scenariosData = useAtomValue(scenariosDataAtom);
  const regionalBenchmark = useAtomValue(regionalBenchmarkAtom);

  return useCallback(
    async ({
      previewWindow,
    }: GenerateRetirementReportOptions = {}): Promise<RetirementReportHandle> => {
      const generatedAt = new Date().toLocaleString('pl-PL');

      const currencyFormatter = new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
        maximumFractionDigits: 0,
      });

      const percentFormatter = new Intl.NumberFormat('pl-PL', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });

      const formatCurrency = (value: number | null | undefined) =>
        value == null ? '—' : currencyFormatter.format(value);

      const formatCurrencyDelta = (value: number | null | undefined) =>
        value == null ? '—' : currencyFormatter.format(Math.abs(value));

      const formatNumber = (value: number | null | undefined, suffix = '') =>
        value == null ? '—' : `${value}${suffix}`;

      const formatPercent = (value: number | null | undefined) =>
        value == null ? '—' : percentFormatter.format(value);

      const formatPercentPoints = (
        value: number | null | undefined,
        fractionDigits = 1
      ) => {
        if (value == null) {
          return '—';
        }
        return `${Math.abs(value).toLocaleString('pl-PL', {
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
        })} pp`;
      };

      const formatGender = (value: string | null | undefined) => {
        if (value === 'female') {
          return 'kobieta';
        }
        if (value === 'male') {
          return 'mężczyzna';
        }
        return value ?? '—';
      };

      const sickLeaveDeltaCurrency =
        monthlyPension != null && monthlyPensionWithSickLeave != null
          ? monthlyPension - monthlyPensionWithSickLeave
          : null;

      const replacementDeltaPoints =
        replacementRatio != null && replacementRatioWithSickLeave != null
          ? (replacementRatio - replacementRatioWithSickLeave) * 100
          : null;

      const derivedItems = [
        {
          id: 'derived-capital',
          label: 'Kapitał zgromadzony przed emeryturą',
          formattedValue: formatCurrency(accumulatedCapital),
          description:
            'Przybliżona wartość środków po naliczeniu składek do momentu przejścia na emeryturę.',
        },
        {
          id: 'derived-monthly-pension',
          label: 'Prognozowana emerytura miesięczna (brutto)',
          formattedValue: formatCurrency(monthlyPension),
          description:
            'Kwota oczekiwana przy założeniu ciągłej aktywności zawodowej bez przerw chorobowych.',
        },
        {
          id: 'derived-monthly-pension-sick',
          label: 'Prognozowana emerytura po uwzględnieniu L4',
          formattedValue: formatCurrency(monthlyPensionWithSickLeave),
          description:
            'Uśredniony wpływ zwolnień lekarskich na wysokość świadczenia.',
        },
        {
          id: 'derived-sick-leave-impact',
          label: 'Spadek świadczenia spowodowany L4',
          formattedValue: `${formatCurrencyDelta(sickLeaveDeltaCurrency)} / ${formatPercentPoints(
            replacementDeltaPoints
          )}`,
          description:
            'Różnica pomiędzy wariantem bez absencji i wariantem z typową absencją chorobową (wartość i punkty procentowe).',
        },
        {
          id: 'derived-replacement',
          label: 'Wskaźnik zastąpienia (bez L4)',
          formattedValue: formatPercent(replacementRatio),
          description:
            'Odsetek ostatniej pensji brutto, który pokryje prognozowane świadczenie.',
        },
        {
          id: 'derived-replacement-sick',
          label: 'Wskaźnik zastąpienia (z L4)',
          formattedValue: formatPercent(replacementRatioWithSickLeave),
          description: 'Ten sam wskaźnik przy założeniu absencji chorobowej.',
        },
      ];

      const notes = [
        'Raport ma charakter poglądowy i prezentuje wartości w PLN, zaokrąglone do pełnych złotych.',
        'Symulacja korzysta z założeń prognozy FUS20 Zakładu Ubezpieczeń Społecznych oraz statystyk dotyczących zwolnień lekarskich.',
      ];

      if (derivedItems.some((item) => item.formattedValue.includes('—'))) {
        notes.push(
          'Jeżeli widzisz brakujące wartości, uzupełnij proszę dane wejściowe i wygeneruj raport ponownie.'
        );
      }

      const highlights = [
        {
          id: 'highlight-age',
          label: 'Wiek',
          value: formatNumber(age, ' lat'),
        },
        {
          id: 'highlight-gender',
          label: 'Płeć',
          value: formatGender(gender as any),
        },
        {
          id: 'highlight-salary',
          label: 'Pensja brutto',
          value: formatCurrency(grossMonthlySalary),
        },
        {
          id: 'highlight-start',
          label: 'Rok rozpoczęcia pracy',
          value: formatNumber(workStartYear),
        },
        {
          id: 'highlight-end',
          label: 'Planowany rok emerytury',
          value: formatNumber(plannedRetirementYear),
        },
        {
          id: 'highlight-zus',
          label: 'Środki w ZUS',
          value: formatCurrency(zusAccountBalance),
        },
      ];

      const charts: RetirementReportChart[] = [];

      if (pensionForecastData.length > 0) {
        charts.push({
          id: 'chart-pension-forecast',
          title: 'Prognoza emerytury w zależności od wieku',
          description:
            'Porównanie nominalnej i realnej wartości świadczenia przy różnych wariantach wieku przejścia na emeryturę.',
          type: 'line',
          xLabel: 'Wiek przejścia na emeryturę',
          yLabel: 'Kwota świadczenia (zł)',
          series: [
            {
              id: 'series-nominal',
              label: 'Kwota emerytury',
              color: REPORT_COLORS.primary,
              points: pensionForecastData.map((item) => ({
                x: item.age,
                y: item.amount,
              })),
            },
            {
              id: 'series-real',
              label: 'Emerytura realna',
              color: REPORT_COLORS.primaryDark,
              points: pensionForecastData.map((item) => ({
                x: item.age,
                y: item.realAmount,
              })),
            },
          ],
        });
      }

      if (replacementRateValue > 0) {
        charts.push({
          id: 'chart-replacement',
          title: 'Stopa zastąpienia pensji',
          description:
            'Jaki procent ostatniej pensji brutto pokryje prognozowane świadczenie emerytalne.',
          type: 'column',
          yLabel: 'Udział w pensji (%)',
          series: [
            {
              id: 'series-replacement',
              label: 'Stopa zastąpienia',
              color: REPORT_COLORS.primary,
              points: [{ x: 'Zastąpienie', y: replacementRateValue }],
            },
            {
              id: 'series-remaining',
              label: 'Pozostała część pensji',
              color: REPORT_COLORS.primaryLight,
              points: [
                { x: 'Pozostałe', y: Math.max(0, 100 - replacementRateValue) },
              ],
            },
          ],
        });
      }

      if (sickLeaveImpact.withSickLeave || sickLeaveImpact.withoutSickLeave) {
        charts.push({
          id: 'chart-sick-leave',
          title: 'Wpływ absencji chorobowej',
          description:
            'Zestawienie prognozowanej wysokości emerytury w wariancie z i bez uwzględnienia typowych zwolnień lekarskich.',
          type: 'column',
          yLabel: 'Kwota świadczenia (zł)',
          series: [
            {
              id: 'series-sick-leave',
              label: 'Uwzględnienie L4',
              color: REPORT_COLORS.coral,
              points: [{ x: 'Z L4', y: sickLeaveImpact.withSickLeave }],
            },
            {
              id: 'series-no-sick',
              label: 'Bez L4',
              color: REPORT_COLORS.primary,
              points: [{ x: 'Bez L4', y: sickLeaveImpact.withoutSickLeave }],
            },
          ],
        });
      }

      if (contributionHistory.length > 0) {
        charts.push({
          id: 'chart-contribution-history',
          title: 'Historia składek i kapitału',
          description:
            'Ostatnie pięć lat opłaconych składek oraz narastający kapitał emerytalny.',
          type: 'column',
          xLabel: 'Rok rozliczeniowy',
          yLabel: 'Kwota (zł)',
          series: [
            {
              id: 'series-contributions',
              label: 'Składki roczne',
              color: REPORT_COLORS.primaryLight,
              points: contributionHistory.map((item) => ({
                x: item.year,
                y: item.contributions,
              })),
            },
            {
              id: 'series-capital',
              label: 'Kapitał narastający',
              color: REPORT_COLORS.primary,
              type: 'line',
              points: contributionHistory.map((item) => ({
                x: item.year,
                y: item.capital,
              })),
            },
          ],
        });
      }

      if (
        scenariosData &&
        (scenariosData.pessimistic ||
          scenariosData.realistic ||
          scenariosData.optimistic)
      ) {
        charts.push({
          id: 'chart-scenarios',
          title: 'Scenariusze "co-jeśli"',
          description:
            'Prognozowane świadczenie przy wariantach pesymistycznym, realistycznym i optymistycznym.',
          type: 'column',
          yLabel: 'Kwota świadczenia (zł)',
          series: [
            {
              id: 'series-scenarios',
              label: 'Prognozowana emerytura',
              color: REPORT_COLORS.primary,
              points: [
                { x: 'Pesymistyczny', y: scenariosData.pessimistic || 0 },
                { x: 'Realistyczny', y: scenariosData.realistic || 0 },
                { x: 'Optymistyczny', y: scenariosData.optimistic || 0 },
              ],
            },
          ],
        });
      }

      if (regionalBenchmark.length > 0) {
        charts.push({
          id: 'chart-regional-benchmark',
          title: 'Porównanie regionalne',
          description:
            'Zestawienie średniej emerytury w wybranych województwach z prognozą użytkownika.',
          type: 'column',
          yLabel: 'Kwota świadczenia (zł)',
          series: [
            {
              id: 'series-region-average',
              label: 'Średnia w regionie',
              color: REPORT_COLORS.primaryLight,
              points: regionalBenchmark.map((item) => ({
                x: item.region,
                y: item.average,
              })),
            },
            {
              id: 'series-user-region',
              label: 'Prognoza użytkownika',
              color: REPORT_COLORS.primary,
              points: regionalBenchmark.map((item) => ({
                x: item.region,
                y: item.user,
              })),
            },
          ],
        });
      }

      const dataset = normalizeStrings({
        highlights,
        derived: {
          title: 'Prognoza świadczenia',
          summary:
            'Poniżej znajdziesz kluczowe wskaźniki dotyczące przewidywanej emerytury na moment przejścia.',
          items: derivedItems,
        },
        notes,
        charts,
      });

      const report = (
        <RetirementReportDocument dataset={dataset} generatedAt={generatedAt} />
      );

      const blob = await pdf(report).toBlob();
      const pdfBlob =
        blob.type === 'application/pdf'
          ? blob
          : new Blob([blob], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);

      const openReport = () => {
        window.open(url, '_blank');
      };

      return { open: openReport };
    },
    [
      age,
      gender,
      grossMonthlySalary,
      workStartYear,
      plannedRetirementYear,
      zusAccountBalance,
      accumulatedCapital,
      monthlyPension,
      monthlyPensionWithSickLeave,
      replacementRatio,
      replacementRatioWithSickLeave,
      pensionForecastData,
      replacementRateValue,
      sickLeaveImpact,
      contributionHistory,
      scenariosData,
      regionalBenchmark,
    ]
  );
}
