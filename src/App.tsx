import { AboutPage } from '@/routes/about';
import Dashboard from '@/routes/dashboard';
import { HomePage } from '@/routes/index';
import { OnboardingPage } from '@/routes/onboarding';
import { Onboarding2SalaryPage } from '@/routes/onboarding-2-salary';

import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';

import { OnboardingProgressBar } from './components/OnboardingProgressBar';
import { PageNavigationBar } from './components/PageNavigationBar';

const AppContent = () => {
  const location = useLocation();

  return (
    <div className="h-full w-full">
      {location.pathname.includes('onboarding') && <OnboardingProgressBar />}

      {!location.pathname.includes('onboarding') && <PageNavigationBar />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/onboarding/2-zarobki"
          element={<Onboarding2SalaryPage />}
        />
      </Routes>
    </div>
  );
};

export function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
