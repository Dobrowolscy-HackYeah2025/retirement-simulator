import { OnboardingPageWrapper } from '@/components/OnboardingPageWrapper';
import { Input } from '@/components/ui/input';
import {
  inputAgeAtom,
  inputCityAtom,
  inputGenderAtom,
  inputGrossMonthlySalaryAtom,
  inputPlannedRetirementYearAtom,
  inputWorkStartYearAtom,
  inputZusAccountBalanceAtom,
  onboardingCompletedAtom,
  reportEventPayloadAtom,
  showReportGeneratorAtom,
} from '@/lib/atoms';

import {
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';

import { useAtomValue, useSetAtom } from 'jotai';
import { InfoIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { OnboardingButtons } from '../components/onboarding/OnboardingButtons';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../components/ui/tooltip';
import { trackEvent } from '../lib/analytics';

const LazyZUSReportGenerator = lazy(async () => {
  const module = await import('@/components/ZUSReportGenerator');
  return { default: module.ZUSReportGenerator };
});

// Format number with thousands separator
const formatNumber = (value: number | null): string => {
  if (value === null || value === 0) {
    return '';
  }
  return value.toLocaleString('en-US');
};

export function Onboarding2SalaryPage() {
  const age = useAtomValue(inputAgeAtom);
  const gender = useAtomValue(inputGenderAtom);
  const city = useAtomValue(inputCityAtom);
  const grossMonthlySalary = useAtomValue(inputGrossMonthlySalaryAtom);
  const workStartYear = useAtomValue(inputWorkStartYearAtom);
  const plannedRetirementYear = useAtomValue(inputPlannedRetirementYearAtom);
  const zusAccountBalance = useAtomValue(inputZusAccountBalanceAtom);
  const showReportGenerator = useAtomValue(showReportGeneratorAtom);

  const setGrossMonthlySalary = useSetAtom(inputGrossMonthlySalaryAtom);
  const setWorkStartYear = useSetAtom(inputWorkStartYearAtom);
  const setPlannedRetirementYear = useSetAtom(inputPlannedRetirementYearAtom);
  const setZusAccountBalance = useSetAtom(inputZusAccountBalanceAtom);
  const setOnboardingCompleted = useSetAtom(onboardingCompletedAtom);
  const setShowReportGenerator = useSetAtom(showReportGeneratorAtom);
  const reportPayload = useAtomValue(reportEventPayloadAtom);
  const navigate = useNavigate();

  // Parse formatted number back to raw number
  const parseFormattedNumber = useCallback((value: string): string => {
    return value.replace(/,/g, '');
  }, []);

  const [salaryInputValue, setSalaryInputValue] = useState(() =>
    formatNumber(grossMonthlySalary)
  );
  const [zusBalanceInputValue, setZusBalanceInputValue] = useState(() =>
    formatNumber(zusAccountBalance)
  );

  useEffect(() => {
    setSalaryInputValue(formatNumber(grossMonthlySalary));
  }, [grossMonthlySalary]);

  useEffect(() => {
    setZusBalanceInputValue(formatNumber(zusAccountBalance));
  }, [zusAccountBalance]);

  const [, startTransition] = useTransition();

  const parsedSalaryValue = Number(parseFormattedNumber(salaryInputValue));
  const currentSalaryGross = Number.isNaN(parsedSalaryValue)
    ? 0
    : parsedSalaryValue;
  const workStartYearValue = workStartYear ?? null;
  const retirementYearValue = plannedRetirementYear ?? null;

  const handleCurrentSalaryChange = useCallback(
    (value: string) => {
      // Remove all non-digit characters except for leading digits
      const cleanValue = value.replace(/[^\d]/g, '');

      if (cleanValue === '') {
        setSalaryInputValue('');
        startTransition(() => setGrossMonthlySalary(null));
        return;
      }

      const parsedValue = Number(cleanValue);
      if (Number.isNaN(parsedValue)) {
        return;
      }

      // Format and display with thousands separator
      setSalaryInputValue(parsedValue.toLocaleString('en-US'));
      startTransition(() => setGrossMonthlySalary(parsedValue));
    },
    [setGrossMonthlySalary, setSalaryInputValue, startTransition]
  );

  const handleZusBalanceChange = useCallback(
    (value: string) => {
      // Remove all non-digit characters except for leading digits
      const cleanValue = value.replace(/[^\d]/g, '');

      if (cleanValue === '') {
        setZusBalanceInputValue('');
        startTransition(() => setZusAccountBalance(null));
        return;
      }

      const parsedValue = Number(cleanValue);
      if (Number.isNaN(parsedValue)) {
        return;
      }

      // Format and display with thousands separator
      setZusBalanceInputValue(parsedValue.toLocaleString('en-US'));
      startTransition(() => setZusAccountBalance(parsedValue));
    },
    [setZusAccountBalance, setZusBalanceInputValue, startTransition]
  );

  const handleWorkStartYearChange = useCallback(
    (year: number) => {
      setWorkStartYear(year);
    },
    [setWorkStartYear]
  );

  const handleRetirementYearChange = useCallback(
    (year: number) => {
      setPlannedRetirementYear(year);
    },
    [setPlannedRetirementYear]
  );

  const workStartYears = useMemo(() => {
    return Array.from({ length: 76 }, (_, index) => 1950 + index);
  }, []);

  const retirementYears = useMemo(() => {
    const endYear = 2100;

    if (workStartYear == null) {
      const currentYear = Math.min(new Date().getFullYear(), endYear);
      return Array.from(
        { length: endYear - currentYear + 1 },
        (_, index) => currentYear + index
      );
    }

    const startYear = workStartYear + 1;
    if (startYear > endYear) {
      return [];
    }

    return Array.from(
      { length: endYear - startYear + 1 },
      (_, index) => startYear + index
    );
  }, [workStartYear]);

  const handleLoaderState = useCallback(
    (next: boolean) => {
      setShowReportGenerator(next);
    },
    [setShowReportGenerator]
  );

  const handleGenerateReport = useCallback(() => {
    handleLoaderState(true);
  }, [handleLoaderState]);

  const handleReportComplete = useCallback(() => {
    trackEvent('show-dashboard', reportPayload);

    handleLoaderState(false);
    setOnboardingCompleted(true);
  }, [handleLoaderState, setOnboardingCompleted, reportPayload]);

  const missingFields = useMemo(() => {
    const missing: string[] = [];

    if (currentSalaryGross <= 0) {
      missing.push('zarobki brutto');
    }
    if (
      workStartYearValue == null ||
      workStartYearValue < 1950 ||
      workStartYearValue > 2025
    ) {
      missing.push('rok rozpoczęcia pracy');
    }
    if (
      retirementYearValue == null ||
      workStartYearValue == null ||
      retirementYearValue <= workStartYearValue
    ) {
      missing.push('rok zakończenia aktywności zawodowej');
    }

    return missing;
  }, [currentSalaryGross, retirementYearValue, workStartYearValue]);
  const disabledTooltipText =
    missingFields.length > 0
      ? `Uzupełnij brakujące pola: ${missingFields.join(', ')}`
      : undefined;

  return (
    <OnboardingPageWrapper waveIndex={1}>
      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
        Zarobki i aktywność zawodowa
      </h1>

      <p className="text-sm mb-6 text-muted-foreground">
        Podaj informacje o swoich zarobkach i planach zawodowych.
      </p>

      <div className="flex flex-col gap-6">
        {/* Current Salary Gross */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Label>Obecne zarobki brutto (miesięcznie)</Label>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
              PLN
            </span>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={salaryInputValue}
              onChange={(e) => handleCurrentSalaryChange(e.target.value)}
              className="w-full pl-11"
            />
          </div>
        </div>

        {/* Work Start Year */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Label>Rok rozpoczęcia pracy</Label>
          </div>
          <Select
            value={workStartYearValue?.toString()}
            onValueChange={(value) => handleWorkStartYearChange(Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Wybierz rok" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {workStartYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Retirement Year */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Label>Planowany rok zakończenia aktywności zawodowej</Label>
          </div>
          <Select
            value={retirementYearValue?.toString()}
            onValueChange={(value) => handleRetirementYearChange(Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Wybierz rok" />
            </SelectTrigger>
            <SelectContent className="max-h-60" style={{ zIndex: 1000 }}>
              {retirementYears.map((year) => (
                <SelectItem
                  key={year}
                  value={year.toString()}
                  style={{ zIndex: 1000 }}
                >
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ZUS Account Balance (Optional) */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Label className="flex items-center gap-1 cursor-help">
              Stan konta ZUS (opcjonalnie)
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="size-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">
                  Aktualna wartość zgromadzonych środków na Twoim koncie i
                  subkoncie emerytalnym w ZUS. Możesz sprawdzić to na portalu
                  PUE ZUS. Pole jest opcjonalne - jeśli nie znasz tej wartości,
                  zostaw puste.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
              PLN
            </span>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={zusBalanceInputValue}
              onChange={(e) => handleZusBalanceChange(e.target.value)}
              className="w-full pl-11"
            />
          </div>
        </div>

        <OnboardingButtons
          previousUrl="/onboarding"
          onNextClick={handleGenerateReport}
          disabledTooltipText={disabledTooltipText}
        />
      </div>

      {showReportGenerator && (
        <LazyZUSReportGenerator
          loading={showReportGenerator}
          setLoading={handleLoaderState}
          onComplete={handleReportComplete}
        />
      )}
    </OnboardingPageWrapper>
  );
}
