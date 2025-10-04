import Dashboard from '@/routes/dashboard';
import { OnboardingPage } from '@/routes/onboarding';
import { Onboarding2SalaryPage } from '@/routes/onboarding-2-salary';

import { useAtomValue } from 'jotai';
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import { OnboardingProgressBar } from './components/OnboardingProgressBar';
import { PageNavigationBar } from './components/PageNavigationBar';
import { inputAgeAtom } from './lib/atoms';
import { cn } from './lib/utils';
import { NotFoundPage } from './routes/404';

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const age = useAtomValue(inputAgeAtom);

  if (age == null) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

const AppContent = () => {
  const location = useLocation();
  const isOnboarding = location.pathname.includes('onboarding');
  const isDashboard = location.pathname.includes('dashboard');
  const isAnyRouteMatch = isOnboarding || isDashboard;

  return (
    <div
      className={cn(
        'h-full w-full',
        !isOnboarding && isAnyRouteMatch && 'mt-32'
      )}
    >
      {isOnboarding && <OnboardingProgressBar />}
      {!isOnboarding && isAnyRouteMatch && <PageNavigationBar />}

      <Routes>
        <Route path="/" element={<Navigate to="/onboarding" replace />} />
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

        <Route path="*" element={<NotFoundPage />} />
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
