import ZusLogo from '@/assets/zus_logo.svg';
import { useRetirementReport } from '@/lib/report';

import { useCallback } from 'react';

import { ZapIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from './ui/button';

export const PageNavigationBar = () => {
  const generateRetirementReport = useRetirementReport();

  const handleGenerateReport = useCallback(() => {
    void generateRetirementReport();
  }, [generateRetirementReport]);

  return (
    <nav
      className="border border-primary/20 bg-gradient-to-br from-white via-zus-green/5 to-zus-green/10 shadow-lg z-200 fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[1900px] rounded-xl backdrop-blur-xl"
      style={{
        boxShadow:
          '0 1px 3px 0 rgb(0 153 63 / 0.1), 0 1px 2px -1px rgb(0 153 63 / 0.1), inset 0 1px 0 0 rgb(255 255 255 / 0.5), inset 0 -1px 0 0 rgb(0 153 63 / 0.1)',
      }}
    >
      <div className="flex items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={ZusLogo} className="h-12 w-12" alt="ZUS Logo" />
        </Link>

        <div className="flex items-center gap-2">
          <Button className="bg-transparent bg-gradient-to-r from-zus-green via-zus-green/80 to-zus-green [background-size:200%_auto] text-white hover:bg-transparent hover:bg-[99%_center] focus-visible:ring-primary/20">
            Generuj raport <ZapIcon />
          </Button>
        </div>
      </div>
    </nav>
  );
};
