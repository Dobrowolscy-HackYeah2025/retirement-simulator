import { OnboardingPageWrapper } from '@/components/OnboardingPageWrapper';

import { Input } from '../components/ui/input';

export function OnboardingPage() {
  return (
    <OnboardingPageWrapper>
      <h1 className="text-2xl font-bold mb-4">Uzupelnij swoje dane</h1>
      <p className="text-sm text-gray-500 mb-4">
        Abysmy mogli pomoc w planowaniu emerytury, potrzebujemy kilku informacji
        o Tobie.
      </p>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <Input />
        </div>
      </div>
    </OnboardingPageWrapper>
  );
}
