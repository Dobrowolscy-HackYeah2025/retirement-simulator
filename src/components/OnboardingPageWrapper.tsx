import ZusLogo from '@/assets/zus_logo.svg';

import { useNavigate } from 'react-router-dom';

const OnboardingNavigation = () => {
  const navigate = useNavigate();

  const handleGoToMainPage = () => {
    navigate('/');
  };

  return (
    <div className="flex justify-between mx-4 mt-2">
      <div className="flex gap-2 justify-start items-center">
        {/* <Button variant="ghost" size="icon-lg" onClick={handleGoToMainPage}>
          <ChevronLeft />
        </Button> */}
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
    <div className="h-full w-full flex flex-col grow bg-foreground/5 justify-center items-center">
      <div className="m-0 md:m-8 rounded shadow-md outline outline-gray-200 h-full bg-white w-2xl max-w-[100%]">
        <OnboardingNavigation />
        <div className="flex justify-center pt-24">
          <div className="w-lg max-w-[100%] px-8 md:px-0">{children}</div>
        </div>
      </div>
    </div>
  );
};
