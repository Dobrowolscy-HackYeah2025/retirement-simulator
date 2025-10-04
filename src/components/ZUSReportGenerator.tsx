'use client';

import { IconSquareRoundedX } from '@tabler/icons-react';

import { MultiStepLoader as Loader } from './ui/multi-step-loader';

const zusLoadingStates = [
  {
    text: 'Weryfikacja danych osobowych',
  },
  {
    text: 'Sprawdzanie historii składek ZUS',
  },
  {
    text: 'Obliczanie stażu pracy',
  },
  {
    text: 'Analiza zarobków brutto',
  },
  {
    text: 'Kalkulacja przyszłych składek',
  },
  {
    text: 'Prognoza emerytury',
  },
  {
    text: 'Generowanie raportu ZUS',
  },
  {
    text: 'Raport gotowy!',
  },
];

export function ZUSReportGenerator({
  loading,
  setLoading,
  onComplete,
}: {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onComplete: () => void;
}) {
  return (
    <div className="w-full h-[60vh] flex items-center justify-center">
      <Loader
        loadingStates={zusLoadingStates}
        loading={loading}
        duration={2000}
      />

      <button
        className="fixed top-4 right-4 text-black dark:text-white z-[120]"
        onClick={() => {
          setLoading(false);
          onComplete();
        }}
      >
        <IconSquareRoundedX className="h-10 w-10" />
      </button>
    </div>
  );
}
