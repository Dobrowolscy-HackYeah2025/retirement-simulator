import { OnboardingPageWrapper } from '@/components/OnboardingPageWrapper';
import { Input } from '@/components/ui/input';
import { ZUSReportGenerator } from '@/components/ZUSReportGenerator';
import { retirementInputsAtom, showReportGeneratorAtom } from '@/lib/atoms';

import { useEffect, useState } from 'react';

import { useAtom } from 'jotai';
import { InfoIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/button';
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

export function Onboarding2SalaryPage() {
  const [retirementInputs, setRetirementInputs] = useAtom(retirementInputsAtom);
  const [showReportGenerator, setShowReportGenerator] = useAtom(
    showReportGeneratorAtom
  );
  const navigate = useNavigate();

  // Use local state for inputs to avoid triggering expensive atom computations on every keystroke
  const [localSalary, setLocalSalary] = useState(
    retirementInputs.grossMonthlySalary?.toString() || ''
  );
  const [localZusBalance, setLocalZusBalance] = useState(
    retirementInputs.zusAccountBalance?.toString() || ''
  );

  const currentSalaryGross = retirementInputs.grossMonthlySalary || 0;
  const workStartYear = retirementInputs.workStartYear || 2020;
  const retirementYear = retirementInputs.plannedRetirementYear || 2065;
  const zusAccountBalance = retirementInputs.zusAccountBalance || 0;

  // Debounce salary input
  useEffect(() => {
    const timeout = setTimeout(() => {
      const value = Number(localSalary) || null;
      if (value !== retirementInputs.grossMonthlySalary) {
        setRetirementInputs((prev) => ({
          ...prev,
          grossMonthlySalary: value,
        }));
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [localSalary]);

  // Debounce ZUS balance input
  useEffect(() => {
    const timeout = setTimeout(() => {
      const value = Number(localZusBalance) || null;
      if (value !== retirementInputs.zusAccountBalance) {
        setRetirementInputs((prev) => ({
          ...prev,
          zusAccountBalance: value,
        }));
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [localZusBalance]);

  const setCurrentSalaryGross = (value: string) => {
    setLocalSalary(value);
  };

  const setWorkStartYear = (year: number) => {
    setRetirementInputs((prev) => ({
      ...prev,
      workStartYear: year,
    }));
  };

  const setRetirementYear = (year: number) => {
    setRetirementInputs((prev) => ({
      ...prev,
      plannedRetirementYear: year,
    }));
  };

  // Generate years from 1950 to 2025
  const workStartYears = Array.from({ length: 76 }, (_, i) => 1950 + i);

  // Generate retirement years from workStartYear + 1 to 2100
  const retirementYears = Array.from(
    { length: 2100 - workStartYear },
    (_, i) => workStartYear + 1 + i
  );

  const handleGenerateReport = () => {
    setShowReportGenerator(true);
  };

  const handleReportComplete = () => {
    setShowReportGenerator(false);
    // Navigate to main page after report generation
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate('/onboarding');
  };

  // Get missing fields for tooltip
  const getMissingFields = () => {
    const missing: string[] = [];
    if (currentSalaryGross <= 0) {
      missing.push('zarobki brutto');
    }
    if (workStartYear < 1950 || workStartYear > 2025) {
      missing.push('rok rozpoczęcia pracy');
    }
    if (retirementYear <= workStartYear) {
      missing.push('rok zakończenia aktywności zawodowej');
    }
    return missing;
  };

  const missingFields = getMissingFields();
  const isDisabled = missingFields.length > 0;

  return (
    <OnboardingPageWrapper>
      <h1 className="text-3xl font-bold mb-2 text-foreground">
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
            <Input
              type="number"
              placeholder="0"
              value={localSalary}
              onChange={(e) => setCurrentSalaryGross(e.target.value)}
              className="w-full pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
              PLN
            </span>
          </div>
        </div>

        {/* Work Start Year */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Label>Rok rozpoczęcia pracy</Label>
          </div>
          <Select
            value={workStartYear?.toString() || 'choose'}
            onValueChange={(value) => setWorkStartYear(Number(value))}
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
            value={retirementYear?.toString() || 'choose'}
            onValueChange={(value) => setRetirementYear(Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Wybierz rok" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {retirementYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ZUS Account Balance (Optional) */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Label className="flex items-center gap-1 cursor-help">
                  Stan konta ZUS (opcjonalnie)
                  <InfoIcon className="size-3 text-muted-foreground" />
                </Label>
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
            <Input
              type="number"
              placeholder="0"
              value={localZusBalance}
              onChange={(e) => setLocalZusBalance(e.target.value)}
              className="w-full pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
              PLN
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">
                <Button
                  className="w-full"
                  disabled={isDisabled}
                  onClick={handleGenerateReport}
                >
                  Generuj raport ZUS
                </Button>
              </div>
            </TooltipTrigger>
            {isDisabled && (
              <TooltipContent side="top">
                <p>
                  Uzupełnij brakujące pola:{' '}
                  {missingFields.map((field, index) => (
                    <span key={field}>
                      <strong>{field}</strong>
                      {index < missingFields.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </p>
              </TooltipContent>
            )}
          </Tooltip>
          <Button
            variant="ghost"
            className="text-muted-foreground font-medium"
            onClick={handleGoBack}
          >
            Wróć
          </Button>
        </div>
      </div>

      {showReportGenerator && (
        <ZUSReportGenerator
          loading={showReportGenerator}
          setLoading={setShowReportGenerator}
          onComplete={handleReportComplete}
        />
      )}
    </OnboardingPageWrapper>
  );
}
