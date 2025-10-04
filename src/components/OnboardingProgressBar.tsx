import { useAtom } from 'jotai';
import { useLocation } from 'react-router-dom';

import { showReportGeneratorAtom } from '../lib/atoms';

export const OnboardingProgressBar = () => {
  const location = useLocation();
  const [showReportGenerator] = useAtom(showReportGeneratorAtom);

  // Calculate progress based on current route
  const getProgress = () => {
    if (location.pathname === '/onboarding') {
      return 33;
    }
    if (location.pathname === '/onboarding/2-zarobki') {
      return 66;
    }
    if (location.pathname === '/onboarding/3-final' || showReportGenerator) {
      return 90;
    }
    return 0;
  };

  const progress = getProgress();

  return (
    <div className="w-2xl h-2 absolute top-8 z-50 -translate-x-1/2 left-1/2">
      <div
        className="h-full bg-zus-green shadow-sm rounded-tl outline-t outline-green-500 transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
