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
import { inputAgeAtom, onboardingCompletedAtom } from './lib/atoms';
import { cn } from './lib/utils';
import { NotFoundPage } from './routes/404';
import { DashboardNew } from './routes/dashboard-new';
import { LandingPage } from './routes/landing';

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const onboardingCompleted = useAtomValue(onboardingCompletedAtom);
  if (!onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

function RequireAge({ children }: { children: React.ReactNode }) {
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
  const isLanding = location.pathname === '/';
  const isAnyRouteMatch = isOnboarding || isDashboard || isLanding;

  return (
    <div
      className={cn(
        'h-full w-full',
        !isOnboarding &&
          !isLanding &&
          !isDashboard &&
          isAnyRouteMatch &&
          'mt-32'
      )}
    >
      {isOnboarding && <OnboardingProgressBar />}
      {!isOnboarding && !isLanding && !isDashboard && isAnyRouteMatch && (
        <PageNavigationBar />
      )}

      {/* {isDashboard && <AiBanner />} */}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route
          path="/onboarding/2-zarobki"
          element={
            <NoOnboardingReEntry>
              {/* Moze wydawac sie dziwne ale require onboarding wymaga age */}
              <RequireAge>
                <Onboarding2SalaryPage />
              </RequireAge>
            </NoOnboardingReEntry>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireOnboarding>
              <DashboardNew />
            </RequireOnboarding>
          }
        />

        <Route
          path="/dashboard-new"
          element={
            <RequireOnboarding>
              <DashboardNew />
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
