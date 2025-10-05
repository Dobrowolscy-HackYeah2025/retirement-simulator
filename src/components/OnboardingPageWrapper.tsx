import ZusLogo from '@/assets/zus_logo.svg';

import { AnimatePresence, motion } from 'motion/react';

import { Wave } from './Wave';

const OnboardingNavigation = () => {
  return (
    <div className="flex justify-between mx-4 mt-2">
      <div className="flex gap-2 justify-start items-center">
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
    <div className="w-full flex flex-col justify-center items-center">
      <div className="m-0 mt-16 md:mt-20 rounded-lg md:shadow-md md:border-b md:border-l md:border-r border-foreground/15 h-full bg-white w-2xl max-w-[100%] z-50">
        <OnboardingNavigation />
        <div className="flex justify-center pt-8">
          <div className="w-xl max-w-[100%] px-4 md:px-0 pb-16">
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
