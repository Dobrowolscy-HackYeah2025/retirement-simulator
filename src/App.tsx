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

  function RequireOnboarding({ children }: { children: JSX.Element }) {
    const inputs = useAtomValue(retirementInputsAtom);

    if (inputs.age == null) {
      return <Navigate to="/onboarding" replace />;
    }

    return children;
  }

  return (
    <div className="h-full w-full mt-32">
      {location.pathname.includes('onboarding') && <OnboardingProgressBar />}

      {!location.pathname.includes('onboarding') && <PageNavigationBar />}

      <Routes>
        <Route path="/" element={<OnboardingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route
          path="/onboarding/2-zarobki"
          element={
            <RequireOnboarding>
              <Onboarding2SalaryPage />
            </RequireOnboarding>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireOnboarding>
              <Dashboard />
            </RequireOnboarding>
          }
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
