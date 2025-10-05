import { useCallback, useState } from 'react';

import { useAtomValue } from 'jotai';
import { FileTextIcon } from 'lucide-react';

import { trackEvent } from '../lib/analytics';
import {
  inputAgeAtom,
  inputCityAtom,
  inputGenderAtom,
  inputGrossMonthlySalaryAtom,
  inputPlannedRetirementYearAtom,
  inputWorkStartYearAtom,
  inputZusAccountBalanceAtom,
} from '../lib/atoms';
import { useRetirementReport } from '../lib/report';
import { Button } from './ui/button';

export const GenerateReportCtaButton = () => {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const generateRetirementReport = useRetirementReport();
  const age = useAtomValue(inputAgeAtom);
  const gender = useAtomValue(inputGenderAtom);
  const city = useAtomValue(inputCityAtom);
  const grossMonthlySalary = useAtomValue(inputGrossMonthlySalaryAtom);
  const workStartYear = useAtomValue(inputWorkStartYearAtom);
  const plannedRetirementYear = useAtomValue(inputPlannedRetirementYearAtom);
  const zusAccountBalance = useAtomValue(inputZusAccountBalanceAtom);

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

  return (
    <Button
      onClick={() => {
        void handleGenerateReport();
      }}
      className="bg-transparent bg-gradient-to-r from-zus-green via-zus-green/97 to-zus-green [background-size:200%_auto] text-white hover:bg-transparent hover:bg-[99%_center] focus-visible:ring-primary/20 relative overflow-hidden group cursor-pointer"
      size="sm"
    >
      <span className="group-hover:translate-x-40 transition duration-500 flex items-center gap-2">
        Generuj raport <FileTextIcon className="size-4" />
      </span>

      <div className="-translate-x-40 group-hover:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 z-20">
        <FileTextIcon className="size-4" />
      </div>
    </Button>
  );
};
