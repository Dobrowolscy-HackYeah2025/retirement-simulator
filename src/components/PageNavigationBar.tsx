import ZusLogo from '@/assets/zus_logo.svg';
import { Button } from '@/components/ui/button';
import { useRetirementReport } from '@/lib/report';

import { useCallback } from 'react';

import { Link } from 'react-router-dom';

export const PageNavigationBar = () => {
  const generateRetirementReport = useRetirementReport();

  const handleGenerateReport = useCallback(() => {
    void generateRetirementReport();
  }, [generateRetirementReport]);

  return (
    <nav className="border-b border-primary/5 bg-white shadow-sm shadow-green-200">
      <div className="flex items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={ZusLogo} className="h-12 w-12" alt="ZUS Logo" />
        </Link>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleGenerateReport}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Generuj raport PDF
          </Button>
        </div>
      </div>
    </nav>
  );
};
