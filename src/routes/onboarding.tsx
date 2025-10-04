import { OnboardingPageWrapper } from '@/components/OnboardingPageWrapper';

import { useAtom } from 'jotai';
import { CalendarIcon, CheckIcon, UserIcon } from 'lucide-react';

import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { userAgeAtom, userGenderAtom } from '../lib/atoms';

export function OnboardingPage() {
  const [userGender, setUserGender] = useAtom(userGenderAtom);
  const [userAge, setUserAge] = useAtom(userAgeAtom);

  return (
    <OnboardingPageWrapper step={1} numberOfSteps={3}>
      <h1 className="text-2xl font-bold mb-2 text-foreground">
        Uzupełnij swoje dane
      </h1>
      <p className="text-sm mb-8 text-muted-foreground">
        Wygenerujemy wszystko pod Ciebie.
      </p>

      <div className="flex flex-col gap-4">
        <div className="relative">
          <Select
            value={userGender || ''}
            onValueChange={(value) => setUserGender(value as 'man' | 'woman')}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <UserIcon className="size-4 text-muted-foreground" />
                <SelectValue placeholder="Wybierz płeć" />
              </div>
              {userGender && (
                <div className="bg-primary text-primary-foreground stroke-primary-foreground flex size-4 items-center justify-center rounded-full ml-auto">
                  <CheckIcon className="size-3 color-primary-foreground stroke-primary-foreground" />
                </div>
              )}
            </SelectTrigger>
            <SelectContent className="border-none">
              <SelectItem value="man">mężczyzna</SelectItem>
              <SelectItem value="woman">kobieta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <CalendarIcon className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Wiek: {userAge} lat
            </span>
            {userAge >= 18 && userAge <= 120 && (
              <div className="bg-primary text-primary-foreground flex size-4 items-center justify-center rounded-full ml-auto">
                <CheckIcon className="size-3" />
              </div>
            )}
          </div>
          <Slider
            value={[userAge]}
            onValueChange={(value) => setUserAge(value[0])}
            min={18}
            max={120}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>18</span>
            <span>120</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            className="w-full"
            disabled={!userGender || userAge < 18 || userAge > 120}
          >
            Kontynuuj
          </Button>
          <Button variant="ghost" className="text-gray-500 font-medium">
            Wróć
          </Button>
        </div>
      </div>
    </OnboardingPageWrapper>
  );
}
