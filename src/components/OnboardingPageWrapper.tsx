import ZusLogo from '@/assets/zus_logo.svg';

import { ChevronLeft } from 'lucide-react';

import { Button } from './ui/button';

const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <div className="w-full h-2">
      <div
        className="h-full bg-zus-green shadow-sm rounded-tl outline-t outline-green-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

const OnboardingNavigation = () => {
  return (
    <div className="flex justify-between mx-4">
      <div className="flex gap-2 justify-start items-center">
        <Button variant="ghost" size="icon-lg">
          <ChevronLeft />
        </Button>
        <img src={ZusLogo} className="w-16 h-16 mt-1" />
      </div>
    </div>
  );
};

export const OnboardingPageWrapper = ({
  step,
  numberOfSteps,
  children,
}: {
  step: number;
  numberOfSteps: number;
  children: React.ReactNode;
}) => {
  return (
    <div className="h-full w-full flex flex-col grow">
      <div className="m-4 rounded shadow-md outline outline-gray-200 h-full">
        <ProgressBar progress={(step / numberOfSteps) * 100} />
        <OnboardingNavigation />
        <div className=" flex justify-center pt-24 p-2">
          <div className="w-md">{children}</div>
        </div>
      </div>
    </div>
  );
};
