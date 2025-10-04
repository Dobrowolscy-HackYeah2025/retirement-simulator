import { Button } from '@/components/ui/button';

import { AlertCircleIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-white via-zus-green/5 to-zus-green/10">
      <div className="max-w-md w-full mx-auto p-8 text-center">
        <div className="mb-8">
          <AlertCircleIcon className="size-24 mx-auto text-primary mb-4" />
          <h1 className="text-6xl font-bold text-foreground mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Strona nie została znaleziona
          </h2>
          <p className="text-muted-foreground">
            Przepraszamy, ale strona której szukasz nie istnieje lub została
            przeniesiona.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link to="/dashboard" className="w-full">
            <Button className="w-full bg-primary hover:bg-primary/90 text-white">
              Wróć do strony głównej
            </Button>
          </Link>
          <Link to="/onboarding" className="w-full">
            <Button
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary hover:text-white"
            >
              Rozpocznij od nowa
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
