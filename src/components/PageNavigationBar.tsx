import ZusLogo from '@/assets/zus_logo.svg';
import { useRetirementReport } from '@/lib/report';

import { useCallback } from 'react';

import { FileTextIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from './ui/button';

export const PageNavigationBar = () => {
  const generateRetirementReport = useRetirementReport();

  const handleGenerateReport = useCallback(() => {
    void generateRetirementReport();
  }, [generateRetirementReport]);

  return (
    <nav
      className="border-b-2 border-primary/20 bg-white/20 shadow-lg z-200 fixed top-4 left-8 w-[calc(100%-4rem)] rounded-xl backdrop-blur-xl"
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
          <Button
            onClick={handleGenerateReport}
            className="bg-transparent bg-gradient-to-r from-zus-green via-zus-green/97 to-zus-green [background-size:200%_auto] text-white hover:bg-transparent hover:bg-[99%_center] focus-visible:ring-primary/20 relative overflow-hidden group cursor-pointer"
          >
            <span className="group-hover:translate-x-40 transition duration-500 flex items-center gap-2">
              Generuj raport <FileTextIcon className="size-4" />
            </span>
            <div className="-translate-x-40 group-hover:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 z-20">
              <FileTextIcon className="size-4" />
            </div>
          </Button>
        </div>
      </div>
    </nav>
  );
};
