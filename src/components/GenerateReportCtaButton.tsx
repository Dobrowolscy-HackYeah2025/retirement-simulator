import { useCallback, useEffect, useState } from 'react';

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
  reportEventPayloadAtom,
} from '../lib/atoms';
import { useRetirementReport } from '../lib/report';
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
          Prosimy o chwilę cierpliwości. Dokument otworzy się w nowej karcie
          zaraz po zakończeniu generowania.
        </p>
      </div>
    </div>
  );
};

export const GenerateReportCtaButton = () => {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const generateRetirementReport = useRetirementReport();
  const reportPayload = useAtomValue(reportEventPayloadAtom);

  const handleGenerateReport = useCallback(async () => {
    setIsGeneratingReport(true);
    const MIN_LOADER_DURATION_MS = 1_500;
    const loaderStartedAt = performance.now();

    let reportHandle: { open: () => void } | null = null;
    try {
      trackEvent('generate-report', reportPayload);
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
  }, [generateRetirementReport, reportPayload]);

  return (
    <>
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

      {isGeneratingReport ? <GeneratingReportOverlay /> : null}
    </>
  );
};
