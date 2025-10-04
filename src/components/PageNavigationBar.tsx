import ZusLogo from '@/assets/zus_logo.svg';
import { useRetirementReport } from '@/lib/report';

import type { MouseEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { useAtomValue, useSetAtom } from 'jotai';
import { FileTextIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { trackEvent } from '../lib/analytics';
import {
  inputAgeAtom,
  inputCityAtom,
  inputGenderAtom,
  inputGrossMonthlySalaryAtom,
  inputPlannedRetirementYearAtom,
  inputWorkStartYearAtom,
  inputZusAccountBalanceAtom,
  onboardingCompletedAtom,
} from '../lib/atoms';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Button } from './ui/button';

const GeneratingReportOverlay = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-live="assertive"
      aria-busy="true"
      aria-label="Generowanie raportu PDF"
      className={`fixed inset-0 z-[999] flex flex-col items-center justify-center gap-6 bg-[color:var(--black)]/55 backdrop-blur-sm px-6 text-center transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div
        className="h-16 w-16 rounded-full border-4 border-[color:var(--gray-blue)] border-t-[color:var(--amber)] animate-spin"
        aria-hidden="true"
      />
      <div className="flex flex-col gap-3 max-w-md">
        <p className="text-2xl font-semibold text-white">
          Przygotowujemy raport PDF
        </p>
        <p className="text-sm text-white/90">
          Prosimy o chwilę cierpliwości. Dokument otworzy się w nowej karcie zaraz po zakończeniu generowania.
        </p>
      </div>
    </div>
  );
};

export const PageNavigationBar = () => {
  const age = useAtomValue(inputAgeAtom);
  const gender = useAtomValue(inputGenderAtom);
  const city = useAtomValue(inputCityAtom);
  const grossMonthlySalary = useAtomValue(inputGrossMonthlySalaryAtom);
  const workStartYear = useAtomValue(inputWorkStartYearAtom);
  const plannedRetirementYear = useAtomValue(inputPlannedRetirementYearAtom);
  const zusAccountBalance = useAtomValue(inputZusAccountBalanceAtom);
  const onboardingCompleted = useAtomValue(onboardingCompletedAtom);
  const setAge = useSetAtom(inputAgeAtom);
  const setGender = useSetAtom(inputGenderAtom);
  const setCity = useSetAtom(inputCityAtom);
  const setGrossMonthlySalary = useSetAtom(inputGrossMonthlySalaryAtom);
  const setWorkStartYear = useSetAtom(inputWorkStartYearAtom);
  const setPlannedRetirementYear = useSetAtom(inputPlannedRetirementYearAtom);
  const setZusAccountBalance = useSetAtom(inputZusAccountBalanceAtom);
  const setOnboardingCompleted = useSetAtom(onboardingCompletedAtom);
  const generateRetirementReport = useRetirementReport();
  const navigate = useNavigate();
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleGenerateReport = useCallback(async () => {
    setIsGeneratingReport(true);
    const MIN_LOADER_DURATION_MS = 1_500;
    const loaderStartedAt = performance.now();
    const ensureNextFrame = () =>
      new Promise<void>((resolve) => {
        if (typeof window === 'undefined') {
          resolve();
          return;
        }
        const raf = window.requestAnimationFrame?.bind(window);
        if (raf) {
          raf(() => resolve());
        } else {
          window.setTimeout(resolve, 0);
        }
      });

    await ensureNextFrame();
    let reportHandle: { open: () => void } | null = null;
    try {
      trackEvent('generate-report', {
        age,
        gender,
        city,
        grossMonthlySalary,
        workStartYear,
        plannedRetirementYear,
        zusAccountBalance,
      });
      reportHandle = await generateRetirementReport();
    } catch (error) {
      console.error('Failed to generate retirement report PDF', error);
    } finally {
      const elapsed = performance.now() - loaderStartedAt;
      if (elapsed < MIN_LOADER_DURATION_MS) {
        await new Promise((resolve) =>
          window.setTimeout(resolve, MIN_LOADER_DURATION_MS - elapsed)
        );
      }
      reportHandle?.open();
      setIsGeneratingReport(false);
    }
  }, [
    generateRetirementReport,
    age,
    gender,
    city,
    grossMonthlySalary,
    workStartYear,
    plannedRetirementYear,
    zusAccountBalance,
  ]);

  const handleResetInputsAndNavigateHome = useCallback(() => {
    setAge(null);
    setGender(null);
    setCity('');
    setGrossMonthlySalary(null);
    setWorkStartYear(null);
    setPlannedRetirementYear(null);
    setZusAccountBalance(null);
    setOnboardingCompleted(false);
    setIsExitDialogOpen(false);
    navigate('/');
  }, [
    navigate,
    setAge,
    setGender,
    setCity,
    setGrossMonthlySalary,
    setWorkStartYear,
    setPlannedRetirementYear,
    setZusAccountBalance,
    setOnboardingCompleted,
  ]);

  const handleHomeClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (onboardingCompleted) {
        event.preventDefault();
        setIsExitDialogOpen(true);
      }
    },
    [onboardingCompleted]
  );

  return (
    <>
      <nav
        className="border border-foreground/20 bg-white/20 shadow-md z-200 fixed lg:top-4 -translate-x-1/2 left-1/2 w-[100%] max-w-7xl lg:rounded-xl backdrop-blur-xl md:rounded-none md:top-0"
        style={{}}
      >
        <div className="flex items-center justify-between px-6 py-3">
          <Link
            to="/"
            onClick={handleHomeClick}
            className="flex items-center gap-2"
          >
            <img src={ZusLogo} className="h-12 w-12" alt="ZUS Logo" />
          </Link>

          <div className="flex items-center gap-2">
            <Link to="https://www.zus.pl/" target="_blank">
              <Button variant="outline" className="text-foreground">
                Strona ZUS
              </Button>
            </Link>

            <Button
              onClick={() => {
                void handleGenerateReport();
              }}
              className="bg-transparent bg-gradient-to-r from-zus-green via-zus-green/97 to-zus-green [background-size:200%_auto] text-white hover:bg-transparent hover:bg-[99%_center] focus-visible:ring-primary/20 relative overflow-hidden group cursor-pointer"
            >
              <span className="group-hover:translate-x-40 transition duration-500 flex items-center gap-2">
                Generuj raport <FileTextIcon className="size-4" />
              </span>

              <div className="-translate-x-40 group-hover:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 z-20">
                <FileTextIcon className="size-4" />
              </div>
            </Button>
          </div>
        </div>
      </nav>

      <AlertDialog open={isExitDialogOpen} onOpenChange={setIsExitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Czy na pewno chcesz opuścić panel?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Opuszczając tę stronę stracisz aktualny raport i będziesz musiał
              ponownie uzupełnić swoje dane.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Pozostań tutaj</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetInputsAndNavigateHome}>
              Tak, wróć do startu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isGeneratingReport ? <GeneratingReportOverlay /> : null}
    </>
  );
};
