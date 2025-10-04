import Dashboard from '@/routes/dashboard';
import { OnboardingPage } from '@/routes/onboarding';
import { Onboarding2SalaryPage } from '@/routes/onboarding-2-salary';

import { useAtomValue } from 'jotai';
import {
  HashRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import { OnboardingProgressBar } from './components/OnboardingProgressBar';
import { PageNavigationBar } from './components/PageNavigationBar';
import { inputAgeAtom, onboardingCompletedAtom } from './lib/atoms';
import { cn } from './lib/utils';
import { NotFoundPage } from './routes/404';

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const age = useAtomValue(inputAgeAtom);

  if (age == null) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

function NoOnboardingReEntry({ children }: { children: React.ReactNode }) {
  const onboardingCompleted = useAtomValue(onboardingCompletedAtom);
  if (onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
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
        <Route
          path="/"
          element={
            <Link to="/onboarding">
              <button className="m-4 p-4 bg-primary absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]">
                Idź do onboardingu
              </button>
            </Link>
          }
        />
        <Route
          path="/onboarding"
          element={
            <NoOnboardingReEntry>
              <OnboardingPage />
            </NoOnboardingReEntry>
          }
        />
        <Route
          path="/onboarding/2-zarobki"
          element={
            <NoOnboardingReEntry>
              <Onboarding2SalaryPage />
            </NoOnboardingReEntry>
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
