import { OnboardingPageWrapper } from '@/components/OnboardingPageWrapper';
import { Input } from '@/components/ui/input';
import { ZUSReportGenerator } from '@/components/ZUSReportGenerator';
import {
  currentSalaryGrossAtom,
  retirementYearAtom,
  showReportGeneratorAtom,
  workStartYearAtom,
} from '@/lib/atoms';

import { useAtom } from 'jotai';
import { CheckIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/button';
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
  const [currentSalaryGross, setCurrentSalaryGross] = useAtom(
    currentSalaryGrossAtom
  );
  const [workStartYear, setWorkStartYear] = useAtom(workStartYearAtom);
  const [retirementYear, setRetirementYear] = useAtom(retirementYearAtom);
  const [showReportGenerator, setShowReportGenerator] = useAtom(
    showReportGeneratorAtom
  );
  const navigate = useNavigate();

  // Generate years from 1950 to 2025
  const workStartYears = Array.from({ length: 76 }, (_, i) => 1950 + i);

  // Generate retirement years from workStartYear + 1 to 2100
  const retirementYears = Array.from(
    { length: 2100 - workStartYear },
    (_, i) => workStartYear + 1 + i
  );

  const isFormValid =
    currentSalaryGross > 0 &&
    workStartYear >= 1950 &&
    workStartYear <= 2025 &&
    retirementYear > workStartYear;

  const handleGenerateReport = () => {
    setShowReportGenerator(true);
  };

  const handleReportComplete = () => {
    setShowReportGenerator(false);
    // Navigate to main page after report generation
    navigate('/');
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
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-foreground">
              Obecne zarobki brutto
            </span>
            {currentSalaryGross > 0 && (
              <CheckIcon className="size-4 text-primary ml-auto" />
            )}
          </div>
          <div className="relative">
            <Input
              type="number"
              placeholder="0"
              value={currentSalaryGross || ''}
              onChange={(e) =>
                setCurrentSalaryGross(Number(e.target.value) || 0)
              }
              className="w-full pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
              PLN
            </span>
          </div>
        </div>

        {/* Work Start Year */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-foreground">
              Rok rozpoczęcia pracy
            </span>
            {workStartYear >= 1950 && workStartYear <= 2025 && (
              <CheckIcon className="size-4 text-primary ml-auto" />
            )}
          </div>
          <Select
            value={workStartYear.toString()}
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
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-foreground">
              Planowany rok zakończenia aktywności zawodowej
            </span>
            {retirementYear > workStartYear && (
              <CheckIcon className="size-4 text-primary ml-auto" />
            )}
          </div>
          <Select
            value={retirementYear.toString()}
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
