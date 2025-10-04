import {
  inputAgeAtom,
  inputGenderAtom,
  inputGrossMonthlySalaryAtom,
  inputPlannedRetirementYearAtom,
  inputWorkStartYearAtom,
  inputZusAccountBalanceAtom,
  retirementAccumulatedCapitalAtom,
  retirementMonthlyPensionAtom,
  retirementMonthlyPensionWithSickLeaveAtom,
  retirementPensionReplacementRatioAtom,
  retirementPensionReplacementRatioWithSickLeaveAtom,
} from '@/lib/atoms';

import { useCallback } from 'react';

import { pdf } from '@react-pdf/renderer';
import { useAtomValue } from 'jotai';

import { RetirementReportDocument } from './RetirementReportDocument';

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

type RetirementReportHandle = {
  open: () => void;
};

export function useRetirementReport(): () => Promise<RetirementReportHandle> {
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

  return useCallback(async (): Promise<RetirementReportHandle> => {
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

    const dataset = normalizeStrings({
      highlights,
      derived: {
        title: 'Prognoza świadczenia',
        summary:
          'Poniżej znajdziesz kluczowe wskaźniki dotyczące przewidywanej emerytury na moment przejścia.',
        items: derivedItems,
      },
      notes,
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

    let hasOpened = false;

    const openReport = () => {
      if (hasOpened) {
        return;
      }
      hasOpened = true;

      if (typeof window === 'undefined') {
        URL.revokeObjectURL(url);
        return;
      }

      const scheduleRevocation = () => {
        window.setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 60_000);
      };

      let viewerWindow: Window | null = null;

      try {
        viewerWindow = window.open('', '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error('Failed to open preview window', error);
      }

      if (viewerWindow && !viewerWindow.closed) {
        try {
          viewerWindow.document.open();
          viewerWindow.document.write(`<!DOCTYPE html><html lang="pl"><head><title>Raport emerytalny ZUS</title><meta charset="utf-8" /></head><body style="margin:0;background:#0b2312;color:#ffffff;font-family:Inter,system-ui,-apple-system,sans-serif;">
            <embed src="${url}" type="application/pdf" style="border:none;width:100%;height:100vh;" title="Raport emerytalny ZUS" />
          </body></html>`);
          viewerWindow.document.close();
        } catch (error) {
          console.error('Failed to render PDF in new tab', error);
          viewerWindow.location.href = url;
        }

        viewerWindow.focus();
        scheduleRevocation();
        return;
      }

      const fallbackWindow = window.open(url, '_blank');
      if (fallbackWindow) {
        fallbackWindow.focus();
        scheduleRevocation();
        return;
      }

      window.location.href = url;
      scheduleRevocation();
    };

    return { open: openReport };
  }, [
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
  ]);
}
