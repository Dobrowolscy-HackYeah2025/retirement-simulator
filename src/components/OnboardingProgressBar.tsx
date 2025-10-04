import { useLocation } from 'react-router-dom';

export const OnboardingProgressBar = () => {
  const location = useLocation();

  // Calculate progress based on current route
  const getProgress = () => {
    if (location.pathname === '/onboarding') {
      return 33;
    }
    if (location.pathname === '/onboarding/2-zarobki') {
      return 66;
    }
    if (location.pathname === '/onboarding/3-final') {
      return 100;
    }
    return 0;
  };

  const progress = getProgress();

  return (
    <div className="w-full h-2 absolute top-4 z-50">
      <div
        className="ml-4 h-full bg-zus-green shadow-sm rounded-tl outline-t outline-green-500 transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
