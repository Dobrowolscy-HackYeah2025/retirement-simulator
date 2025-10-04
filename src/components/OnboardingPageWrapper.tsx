import ZusLogo from '@/assets/zus_logo.svg';

import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import { Wave } from './Wave';

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
  waveIndex = 0,
}: {
  children: React.ReactNode;
  waveIndex?: number;
}) => {
  return (
    <div className="h-full w-full flex flex-col grow bg-foreground/5 justify-center items-center">
      <div className="m-0 md:m-8 rounded shadow-md outline outline-gray-200 h-full bg-white w-2xl max-w-[100%] z-50">
        <OnboardingNavigation />
        <div className="flex justify-center pt-24">
          <div className="w-lg max-w-[100%] px-8 md:px-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={waveIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{
                  duration: 0.4,
                  ease: 'easeInOut',
                }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {waveIndex !== undefined && <Wave waveIndex={waveIndex as 0 | 1} />}
    </div>
  );
};
