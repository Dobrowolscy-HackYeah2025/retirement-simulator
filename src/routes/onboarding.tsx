import { OnboardingPageWrapper } from '@/components/OnboardingPageWrapper';

import { useState } from 'react';

import { useAtom } from 'jotai';
import { CalendarIcon, CheckIcon, MapPinIcon, UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { userAgeAtom, userCityAtom, userGenderAtom } from '../lib/atoms';
import { filterCities } from '../lib/polish-cities';
import { cn } from '../lib/utils';

export function OnboardingPage() {
  const [userGender, setUserGender] = useAtom(userGenderAtom);
  const [userAge, setUserAge] = useAtom(userAgeAtom);
  const [userCity, setUserCity] = useAtom(userCityAtom);
  const navigate = useNavigate();
  const [cityInput, setCityInput] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const handleContinue = () => {
    navigate('/onboarding/2-zarobki');
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <OnboardingPageWrapper>
      <h1 className="text-2xl font-bold mb-2 text-foreground">
        Uzupełnij swoje dane
      </h1>
      <p className="text-sm mb-6 text-muted-foreground">
        Wygenerujemy wszystko pod Ciebie.
      </p>

      <div className="flex flex-col gap-2 mb-6">
        <Label>Płeć</Label>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <Select
              value={userGender || ''}
              onValueChange={(value) => setUserGender(value as 'man' | 'woman')}
            >
              <SelectTrigger className="w-full" hideIcon={true}>
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
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <Label>Miasto zamieszkania</Label>
        {/* City Field */}
        <div className="relative">
          <div className="relative">
            <Input
              type="text"
              placeholder="Miasto zamieszkania"
              defaultValue={userCity}
              value={cityInput}
              onChange={(e) => {
                setCityInput(e.target.value);
                setShowCitySuggestions(true);

                if (e.target.value === '') {
                  setUserCity('');
                }
              }}
              onFocus={() => setShowCitySuggestions(true)}
              onBlur={() =>
                setTimeout(() => setShowCitySuggestions(false), 200)
              }
              className="w-full pl-9"
            />
            <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            {userCity && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground flex size-4 items-center justify-center rounded-full">
                <CheckIcon className="size-3" />
              </div>
            )}
            {showCitySuggestions && cityInput && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filterCities(cityInput).map((city) => (
                  <div
                    key={city}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => {
                      setUserCity(city);
                      setCityInput(city);
                      setShowCitySuggestions(false);
                    }}
                  >
                    {city}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          'relative mb-6',
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent p-3 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
        )}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-foreground">
            {userAge ? `Wiek: ${userAge} lat` : 'Wybierz wiek'}
          </span>
          {userAge && userAge >= 18 && userAge <= 120 && (
            <div className="bg-primary text-primary-foreground flex size-4 items-center justify-center rounded-full ml-auto">
              <CheckIcon className="size-3" />
            </div>
          )}
        </div>

        <div className="flex gap-4 items-start mt-3">
          <CalendarIcon className="size-4 text-muted-foreground -mt-1" />
          <div className="flex flex-col gap-1 items-stretch w-full">
            <Slider
              value={[userAge || 30]}
              onValueChange={(value) => setUserAge(value[0])}
              min={18}
              max={120}
              step={1}
              className="w-full"
            />
            <div className="flex w-full justify-between text-xs text-muted-foreground mt-1">
              <span className="flex-1">18</span>
              <span className="flex-1 text-right">120</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          className="w-full"
          disabled={
            !userGender ||
            userAge === null ||
            userAge < 18 ||
            userAge > 120 ||
            !userCity
          }
          onClick={handleContinue}
        >
          Kontynuuj
        </Button>
        <Button
          variant="ghost"
          className="text-gray-500 font-medium"
          onClick={handleGoBack}
        >
          Wróć
        </Button>
      </div>
    </OnboardingPageWrapper>
  );
}
