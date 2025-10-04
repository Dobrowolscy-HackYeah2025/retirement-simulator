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
  withWave = true,
}: {
  children: React.ReactNode;
  withWave?: boolean;
}) => {
  return (
    <div className="h-full w-full flex flex-col grow bg-foreground/5 justify-center items-center">
      <div className="m-0 md:m-8 rounded shadow-md outline outline-gray-200 h-full bg-white w-2xl max-w-[100%] z-50">
        <OnboardingNavigation />
        <div className="flex justify-center pt-24">
          <div className="w-lg max-w-[100%] px-8 md:px-0">{children}</div>
        </div>
      </div>

      {withWave && (
        <div className="fixed bottom-0 left-0 z-30 w-full" id="wave-onboarding">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path
              fill="#35a454"
              fill-opacity="1"
              d="M0,128L80,160C160,192,320,256,480,240C640,224,800,128,960,117.3C1120,107,1280,181,1360,218.7L1440,256L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            ></path>
          </svg>
        </div>
      )}
    </div>
  );
};
