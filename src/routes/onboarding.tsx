import { OnboardingPageWrapper } from '@/components/OnboardingPageWrapper';

import { useState } from 'react';

import { useAtom } from 'jotai';
import { CalendarIcon, CheckIcon, MapPinIcon, UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
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

        {/* City Field */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <MapPinIcon className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Miasto zamieszkania
            </span>
            {userCity && (
              <div className="bg-primary text-primary-foreground flex size-4 items-center justify-center rounded-full ml-auto">
                <CheckIcon className="size-3" />
              </div>
            )}
          </div>
          <div className="relative">
            <Input
              type="text"
              placeholder="Wpisz nazwę miasta"
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
              className="w-full"
            />
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

        <div className="flex flex-col gap-2">
          <Button
            className="w-full"
            disabled={!userGender || userAge < 18 || userAge > 120 || !userCity}
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
      </div>
    </OnboardingPageWrapper>
  );
}
