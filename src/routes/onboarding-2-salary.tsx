import { OnboardingPageWrapper } from '@/components/OnboardingPageWrapper';
import { Input } from '@/components/ui/input';
import { ZUSReportGenerator } from '@/components/ZUSReportGenerator';
import {
  currentSalaryGrossAtom,
  retirementYearAtom,
  workStartYearAtom,
} from '@/lib/atoms';

import { useState } from 'react';

import { useAtom } from 'jotai';
import {
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  DollarSignIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

export function Onboarding2SalaryPage() {
  const [currentSalaryGross, setCurrentSalaryGross] = useAtom(
    currentSalaryGrossAtom
  );
  const [workStartYear, setWorkStartYear] = useAtom(workStartYearAtom);
  const [retirementYear, setRetirementYear] = useAtom(retirementYearAtom);
  const [showReportGenerator, setShowReportGenerator] = useState(false);
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
    // Navigate to results page or show success message
    alert('Raport ZUS został wygenerowany pomyślnie!');
  };

  const handleGoBack = () => {
    navigate('/onboarding');
  };

  return (
    <OnboardingPageWrapper>
      <h1 className="text-2xl font-bold mb-2 text-foreground">
        Zarobki i aktywność zawodowa
      </h1>
      <p className="text-sm mb-8 text-muted-foreground">
        Podaj informacje o swoich zarobkach i planach zawodowych.
      </p>

      <div className="flex flex-col gap-4">
        {/* Current Salary Gross */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <DollarSignIcon className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Obecne zarobki brutto
            </span>
            {currentSalaryGross > 0 && (
              <div className="bg-primary text-primary-foreground flex size-4 items-center justify-center rounded-full ml-auto">
                <CheckIcon className="size-3" />
              </div>
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
            <CalendarIcon className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Rok rozpoczęcia pracy
            </span>
            {workStartYear >= 1950 && workStartYear <= 2025 && (
              <div className="bg-primary text-primary-foreground flex size-4 items-center justify-center rounded-full ml-auto">
                <CheckIcon className="size-3" />
              </div>
            )}
          </div>
          <Select
            value={workStartYear.toString()}
            onValueChange={(value) => setWorkStartYear(Number(value))}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-4 text-muted-foreground" />
                <SelectValue placeholder="Wybierz rok" />
              </div>
            </SelectTrigger>
            <SelectContent className="border-none max-h-60">
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
            <ClockIcon className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Planowany rok zakończenia aktywności zawodowej
            </span>
            {retirementYear > workStartYear && (
              <div className="bg-primary text-primary-foreground flex size-4 items-center justify-center rounded-full ml-auto">
                <CheckIcon className="size-3" />
              </div>
            )}
          </div>
          <Select
            value={retirementYear.toString()}
            onValueChange={(value) => setRetirementYear(Number(value))}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <ClockIcon className="size-4 text-muted-foreground" />
                <SelectValue placeholder="Wybierz rok" />
              </div>
            </SelectTrigger>
            <SelectContent className="border-none max-h-60">
              {retirementYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            className="w-full"
            disabled={!isFormValid}
            onClick={handleGenerateReport}
          >
            Generuj raport ZUS
          </Button>
          <Button
            variant="ghost"
            className="text-gray-500 font-medium"
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
