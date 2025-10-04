import ZusLogo from '@/assets/zus_logo.svg';

import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from './ui/button';

const OnboardingNavigation = () => {
  const navigate = useNavigate();

  const handleGoToMainPage = () => {
    navigate('/');
  };

  return (
    <div className="flex justify-between mx-2 mt-2">
      <div className="flex gap-2 justify-start items-center">
        <Button variant="ghost" size="icon-lg" onClick={handleGoToMainPage}>
          <ChevronLeft />
        </Button>
        <img src={ZusLogo} className="w-16 h-16 mt-1" />
      </div>
    </div>
  );
};

export const OnboardingPageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="h-full w-full flex flex-col grow">
      <div className="m-4 rounded shadow-md outline outline-gray-200 h-full">
        <OnboardingNavigation />
        <div className=" flex justify-center pt-24 p-2">
          <div className="w-md">{children}</div>
        </div>
      </div>
    </div>
  );
};
