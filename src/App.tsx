import { Button } from '@/components/ui/button';
import { useRetirementReport } from '@/lib/report';
import { AboutPage } from '@/routes/about';
import { HomePage } from '@/routes/index';
import { OnboardingPage } from '@/routes/onboarding';
import { Onboarding2SalaryPage } from '@/routes/onboarding-2-salary';

import { useCallback } from 'react';

import { HashRouter, Link, Route, Routes } from 'react-router-dom';

export function App() {
  const generateRetirementReport = useRetirementReport();

  const handleGenerateReport = useCallback(() => {
    void generateRetirementReport();
  }, [generateRetirementReport]);

  return (
    <HashRouter>
      <div className="h-full w-full">
        {!window.location.hash.includes('onboarding') && (
          <nav className="p-2 flex gap-2 text-lg border-b">
            <Link to="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link to="/about">
              <Button variant="ghost">About</Button>
            </Link>
            <Link to="/onboarding">
              <Button variant="ghost">Onboarding</Button>
            </Link>
            <Button onClick={handleGenerateReport}>Generate raport</Button>
          </nav>
        )}

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route
            path="/onboarding/2-zarobki"
            element={<Onboarding2SalaryPage />}
          />
        </Routes>
      </div>
    </HashRouter>
  );
}
