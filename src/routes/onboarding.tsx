import { OnboardingPageWrapper } from '@/components/OnboardingPageWrapper';

import { useCallback, useEffect, useState } from 'react';

import { useAtom, useAtomValue } from 'jotai';
import {
  AlertCircleIcon,
  CalendarIcon,
  CheckIcon,
  MailIcon,
  MapPinIcon,
  UserIcon,
} from 'lucide-react';

import { OnboardingButtons } from '../components/onboarding/OnboardingButtons';
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
import {
  inputAgeAtom,
  inputCityAtom,
  inputGenderAtom,
  inputPostalCodeAtom,
  inputRegionAtom,
  regionalBenchmarkAtom,
} from '../lib/atoms';
import { filterCities } from '../lib/polish-cities';

const MIN_USER_AGE = 18;
const MAX_USER_AGE = 70;

// Polish postal code validation regex (xx-xxx format)
const POSTAL_CODE_REGEX = /^\d{2}-\d{3}$/;

export function OnboardingPage() {
  const [gender, setGender] = useAtom(inputGenderAtom);
  const [age, setAge] = useAtom(inputAgeAtom);
  const [city, setCity] = useAtom(inputCityAtom);
  const [postalCode, setPostalCode] = useAtom(inputPostalCodeAtom);
  const [region, setRegion] = useAtom(inputRegionAtom);
  const regionalBenchmark = useAtomValue(regionalBenchmarkAtom);
  const [cityInput, setCityInput] = useState(city);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null);
  const [postalCodeInput, setPostalCodeInput] = useState(postalCode || '');

  const userGender =
    gender === 'male' ? 'man' : gender === 'female' ? 'woman' : null;
  const userAge = age;
  const userCity = city;

  const setUserGender = (value: 'man' | 'woman') => {
    setGender(value === 'man' ? 'male' : 'female');
  };

  const setUserAge = (val: number | null) => {
    setAge(val);
  };

  const setUserCity = (val: string) => {
    setCity(val);
  };

  // Debounced postal code validation
  const validatePostalCode = useCallback((code: string) => {
    if (!code.trim()) {
      setPostalCodeError(null);
      return true;
    }

    if (!POSTAL_CODE_REGEX.test(code)) {
      setPostalCodeError(
        'Kod pocztowy musi być w formacie XX-XXX (np. 00-123)'
      );
      return false;
    }

    setPostalCodeError(null);
    return true;
  }, []);

  // Debounce effect for postal code validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validatePostalCode(postalCodeInput);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [postalCodeInput, validatePostalCode]);

  const getMissingFields = () => {
    const missing: string[] = [];

    if (!userGender) {
      missing.push('płeć');
    }

    if (!userAge || userAge < MIN_USER_AGE || userAge > MAX_USER_AGE) {
      missing.push('wiek');
    }

    // Check postal code validation
    if (postalCodeInput.trim() && postalCodeError) {
      missing.push('poprawny kod pocztowy');
    }

    return missing;
  };

  const isAgeValid =
    userAge && userAge >= MIN_USER_AGE && userAge <= MAX_USER_AGE;

  const missingFields = getMissingFields();
  const disabledTooltipText = !isAgeValid
    ? 'Wiek musi być między 18 a 70.'
    : missingFields.length > 0
      ? `Uzupełnij brakujące pola: ${missingFields.join(', ')}`
      : undefined;

  return (
    <OnboardingPageWrapper waveIndex={0}>
      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
        Uzupełnij swoje dane
      </h1>

      <p className="text-sm mb-8 text-muted-foreground">
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
                  <CheckIcon className="size-4 text-primary ml-auto" />
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="man">Mężczyzna</SelectItem>
                <SelectItem value="woman">Kobieta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label>
            Miasto zamieszkania <span className="md:hidden">*</span>{' '}
            <span className="hidden md:inline text-muted-foreground font-normal text-xs">
              (opcjonalne)
            </span>
          </Label>

          <div className="relative">
            <div className="relative">
              <Input
                type="text"
                placeholder="Miasto zamieszkania"
                defaultValue={userCity || ''}
                value={cityInput || ''}
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
                <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 size-4 text-primary" />
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
        <div className="flex flex-col gap-2">
          <Label>
            Kod pocztowy <span className="md:hidden">*</span>{' '}
            <span className="hidden md:inline text-muted-foreground font-normal text-xs">
              (opcjonalne)
            </span>
          </Label>

          <div className="relative">
            <div className="relative">
              <Input
                type="text"
                placeholder="00-123"
                value={postalCodeInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setPostalCodeInput(value);
                  setPostalCode(value);
                }}
                className={`w-full pl-9 ${postalCodeError ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              {postalCodeInput && !postalCodeError && (
                <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 size-4 text-primary" />
              )}
              {postalCodeError && (
                <AlertCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 size-4 text-red-500" />
              )}
            </div>
            {postalCodeError && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                {postalCodeError}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-6 w-full mt-6">
        <Label>
          Województwo <span className="md:hidden">*</span>{' '}
          <span className="hidden md:inline text-muted-foreground font-normal text-xs">
            (opcjonalne)
          </span>
        </Label>

        <Select
          value={region || ''}
          onValueChange={(value) => setRegion(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Wybierz województwo" />
          </SelectTrigger>
          <SelectContent className="z-[70]">
            {regionalBenchmark.map((regionItem) => (
              <SelectItem key={regionItem.region} value={regionItem.region}>
                {regionItem.region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <div className="flex flex-col gap-2 items-stretch mt-2">
          <div className="flex flex-row justify-between flex-1 items-center">
            <div className="flex items-start gap-2">
              <CalendarIcon className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                Wiek{userAge ? `: ${userAge}` : ''}
              </span>
            </div>

            <div className="flex-1"></div>

            <div className="flex">
              <Input
                type="number"
                min={MIN_USER_AGE}
                max={MAX_USER_AGE}
                step={1}
                className="min-w-0 text-center"
                size={3}
                value={typeof userAge === 'number' ? userAge : undefined}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setUserAge(null);
                  } else {
                    const numValue = parseInt(value, 10);
                    if (!isNaN(numValue)) {
                      setUserAge(numValue);
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 items-stretch w-full">
            <Slider
              value={[userAge || 30]}
              onValueChange={(value) => setUserAge(value[0])}
              min={MIN_USER_AGE}
              max={MAX_USER_AGE}
              step={1}
              className="w-full"
            />
            <div className="flex w-full justify-between text-xs text-muted-foreground mt-1">
              <span className="flex-1">{MIN_USER_AGE}</span>
              <span className="flex-1 text-center">
                {(MIN_USER_AGE + MAX_USER_AGE) / 2}
              </span>
              <span className="flex-1 text-right">{MAX_USER_AGE}</span>
            </div>
          </div>

          {!isAgeValid && userAge ? (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              Wiek musi być między {MIN_USER_AGE} a {MAX_USER_AGE}.
            </p>
          ) : null}
        </div>
      </div>

      <OnboardingButtons
        previousUrl="/"
        nextUrl="/onboarding/2-zarobki"
        disabledTooltipText={disabledTooltipText}
      />
    </OnboardingPageWrapper>
  );
}
