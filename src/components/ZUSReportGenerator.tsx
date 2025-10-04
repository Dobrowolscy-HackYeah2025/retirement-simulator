'use client';

import { XIcon } from 'lucide-react';

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
        duration={import.meta.env.PROD ? 1000 : 50}
        loop={false}
        onComplete={onComplete}
      />

      <button
        className="fixed top-4 right-4 text-white z-[120]"
        onClick={() => {
          setLoading(false);
          onComplete();
        }}
      >
        <XIcon className="h-6 w-6" />
      </button>
    </div>
  );
}
