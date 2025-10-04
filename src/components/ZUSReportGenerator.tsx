'use client';

import { XIcon } from 'lucide-react';

import { environment } from '../lib/environment';
import { MultiStepLoader as Loader } from './ui/multi-step-loader';

const zusLoadingStates = [
  {
    text: 'Gromadzenie danych',
  },
  {
    text: 'Prognozowanie emerytury',
  },
  {
    text: 'Generowanie wykresów',
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
        duration={
          import.meta.env.PROD || environment.TEST_MULTI_LOADER ? 2000 : 50
        }
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
