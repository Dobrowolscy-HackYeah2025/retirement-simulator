import { Button } from '@/components/ui/button';
import { AboutPage } from '@/routes/about';
import { HomePage } from '@/routes/index';
import { OnboardingPage } from '@/routes/onboarding';

import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';

export function App() {
  return (
    <BrowserRouter>
      <div>
        {!window.location.pathname.includes('onboarding') && (
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
            <Button onClick={() => alert('Generate raport')}>
              Generate raport
            </Button>
          </nav>
        )}

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
