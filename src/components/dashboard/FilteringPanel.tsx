import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  includeSickLeaveAtom,
  inputGrossMonthlySalaryAtom,
  retirementAgeAtom,
  selectedScenarioAtom,
} from '@/lib/atoms';

import { useEffect, useState } from 'react';

import { useAtom } from 'jotai';
import { Info } from 'lucide-react';

import { Card } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';

type ScenarioType = 'pessimistic' | 'realistic' | 'optimistic';

// Format number with thousands separator
const formatNumber = (value: number | null): string => {
  if (value === null || value === 0) {
    return '';
  }
  return value.toLocaleString('en-US');
};

export function FilteringPanel() {
  const [retirementAge, setRetirementAge] = useAtom(retirementAgeAtom);
  const [salary, setSalary] = useAtom(inputGrossMonthlySalaryAtom);
  const [includeSickLeave, setIncludeSickLeave] = useAtom(includeSickLeaveAtom);
  const [selectedScenario, setSelectedScenario] = useAtom(selectedScenarioAtom);

  const [salaryInputValue, setSalaryInputValue] = useState(() =>
    formatNumber(salary)
  );

  useEffect(() => {
    setSalaryInputValue(formatNumber(salary));
  }, [salary]);

  const handleSalaryChange = (value: string) => {
    // Remove all non-digit characters
    const cleanValue = value.replace(/[^\d]/g, '');

    if (cleanValue === '') {
      setSalaryInputValue('');
      setSalary(null);
      return;
    }

    const parsedValue = Number(cleanValue);
    if (Number.isNaN(parsedValue)) {
      return;
    }

    // Format and display with thousands separator
    setSalaryInputValue(parsedValue.toLocaleString('en-US'));
    setSalary(parsedValue);
  };

  const handleRetirementAgeChange = (values: number[]) => {
    const value = values[0];
    if (!isNaN(value) && value >= 60 && value <= 70) {
      setRetirementAge(value);
    }
  };

  const handleScenarioChange = (scenario: ScenarioType) => {
    setSelectedScenario(scenario);
  };

  const handleSickLeaveChange = (checked: boolean) => {
    setIncludeSickLeave(checked);
  };

  return (
    <Card className="bg-card rounded-lg border shadow-sm p-6 h-full gap-0">
      <h3 className="text-2xl font-semibold text-foreground mb-6">
        Ustawienia symulacji
      </h3>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-muted-foreground hover:text-primary cursor-help transition-colors" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm bg-white text-gray-800 border border-gray-200 shadow-lg">
              <div className="text-sm">
                <div className="font-semibold mb-3">
                  Scenariusze ekonomiczne ZUS
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="font-medium text-green-400 mb-1">
                      Realistyczny:
                    </div>
                    <div className="text-xs space-y-1">
                      <div>• Wzrost płac: standardowy (dane ZUS)</div>
                      <div>• Stopy składek: normalne</div>
                      <div>• Długość życia: standardowa</div>
                      <div>• Stabilne warunki demograficzne</div>
                      <div className="text-green-300 font-medium">
                        → Bazowa emerytura
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-blue-400 mb-1">
                      Optymistyczny:
                    </div>
                    <div className="text-xs space-y-1">
                      <div>• Wzrost płac: 150% normalnego (szybszy)</div>
                      <div>• Stopy składek: -10% (niższe)</div>
                      <div>• Długość życia: +1 rok (dłuższa)</div>
                      <div>• Mniej emerytów w systemie</div>
                      <div className="text-blue-300 font-medium">
                        → Wyższa emerytura
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-red-400 mb-1">
                      Pesymistyczny:
                    </div>
                    <div className="text-xs space-y-1">
                      <div>• Wzrost płac: 50% normalnego (wolniejszy)</div>
                      <div>• Stopy składek: +10% (wyższe)</div>
                      <div>• Długość życia: -1 rok (krótsza)</div>
                      <div>• Więcej emerytów w systemie</div>
                      <div className="text-red-300 font-medium">
                        → Niższa emerytura
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
          <Label className="text-foreground">
            Wybierz scenariusz ekonomiczny
          </Label>
        </div>
        <div className="flex flex-col gap-2 mb-2">
          <button
            onClick={() => handleScenarioChange('realistic')}
            className={`cursor-pointer flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors border-2 ${
              selectedScenario === 'realistic'
                ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
                : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
            }`}
          >
            Realistyczny
          </button>
          <button
            onClick={() => handleScenarioChange('optimistic')}
            className={`cursor-pointer flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors border-2 ${
              selectedScenario === 'optimistic'
                ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800'
                : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
            }`}
          >
            Optymistyczny
          </button>
          <button
            onClick={() => handleScenarioChange('pessimistic')}
            className={`cursor-pointer flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors border-2 ${
              selectedScenario === 'pessimistic'
                ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
                : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
            }`}
          >
            Pesymistyczny
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Scenariusz wpływa na prognozy wzrostu płac i warunki systemowe
        </p>
      </div>

      <Separator className="mb-8" />

      <div className="mb-6">
        <label
          htmlFor="retirement-age"
          className="block text-sm font-medium text-foreground mb-2"
        >
          <div className="flex items-center gap-2 mb-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Info
                  className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-help"
                  aria-label="Informacje o obliczeniach emerytury"
                />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm bg-white text-gray-800 border border-gray-200 shadow-lg">
                <div className="text-sm">
                  <div className="font-semibold mb-2">
                    Jak obliczana jest emerytura?
                  </div>
                  <div className="mb-2">
                    <strong>Wzór:</strong> Kapitał emerytalny ÷ (Długość życia ×
                    12)
                  </div>
                  <div className="mb-2">
                    <strong>Kapitał:</strong> Stan konta ZUS + Składki przez
                    całe życie
                  </div>
                  <div className="mb-2">
                    <strong>Długość życia:</strong> Maleje z wiekiem przejścia
                    na emeryturę
                  </div>
                  <div className="mb-2">
                    <strong>Wpływ opóźnienia:</strong>
                  </div>
                  <ul className="text-xs ml-4 space-y-1">
                    <li>• Więcej składek = wyższy kapitał</li>
                    <li>• Krótsza emerytura = wyższa miesięczna emerytura</li>
                    <li>• Razem: ~3-6% wzrostu rocznie</li>
                  </ul>
                  <div className="text-xs text-muted-foreground mt-2">
                    * Wzrost jest realistyczny dzięki danym ZUS
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
            <Label className="text-foreground">
              Wiek przejścia na emeryturę: {retirementAge}
            </Label>
          </div>
        </label>
        <Slider
          id="retirement-age"
          min={60}
          max={70}
          step={1}
          value={[retirementAge]}
          onValueChange={handleRetirementAgeChange}
          className="mt-3 [&_[data-slot=slider-track]]:bg-gray-300 [&_[data-slot=slider-range]]:bg-primary/80"
        />
      </div>

      <div className="bg-muted/50 p-4 rounded-lg border border-border mb-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Checkbox
              checked={includeSickLeave}
              onCheckedChange={handleSickLeaveChange}
            />
          </div>
          <div className="flex-1 min-w-0">
            <label
              htmlFor="sick-leave"
              className="flex items-center gap-3 text-sm font-medium text-foreground cursor-pointer"
            >
              <span>Uwzględnij absencję chorobową</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm bg-white text-gray-800 border border-gray-200 shadow-lg">
                  <div className="text-sm">
                    <div className="font-bold mb-3 text-center">
                      Wpływ L4 na emeryturę
                    </div>
                    <div className="space-y-2">
                      <div className="font-semibold">Jak to działa:</div>
                      <div className="pl-2">
                        • Podczas L4 dostajesz 80% wynagrodzenia
                      </div>
                      <div className="pl-2">
                        • Składki emerytalne naliczane są tylko od 80%
                      </div>
                      <div className="pl-2">
                        • To oznacza niższy kapitał emerytalny
                      </div>
                      <div className="border-t pt-3 mt-3">
                        <div className="font-semibold">Średnio w roku:</div>
                        <div className="pl-2">• Kobiety: 24.2 dni L4</div>
                        <div className="pl-2">• Mężczyźni: 14.5 dni L4</div>
                      </div>
                      <div className="bg-primary text-primary-foreground font-bold p-2 rounded-lg mt-3 text-center">
                        Rezultat: ~1-2% niższa emerytura
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </label>
            <p className="mt-2 text-xs text-muted-foreground">
              Symulacja uwzględni średnią liczbę dni L4 w ciągu kariery
              zawodowej.
            </p>
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      <div className="space-y-4">
        {/* Retirement Age */}

        {/* Salary */}
        <div>
          <label
            htmlFor="salary"
            className="block text-sm font-medium text-foreground mb-2.5"
          >
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info
                    className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-help"
                    aria-label="Informacje o wpływie pensji na emeryturę"
                  />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm bg-white text-gray-800 border border-gray-200 shadow-lg">
                  <div className="text-sm">
                    <div className="font-semibold mb-2">
                      Wpływ pensji na emeryturę
                    </div>
                    <div className="mb-2">
                      <strong>Składki:</strong> 19.52% pensji brutto rocznie
                    </div>
                    <div className="mb-2">
                      <strong>Wzrost płac:</strong> Rzeczywiste dane ZUS (3-5%
                      rocznie)
                    </div>
                    <div className="mb-2">
                      <strong>Kapitał:</strong> Składki × lata pracy + stan
                      konta ZUS
                    </div>
                    <div className="text-xs text-muted-foreground">
                      * Wyższa pensja = więcej składek = wyższa emerytura
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
              <Label className="text-foreground">
                Wysokość wynagrodzenia brutto
              </Label>
            </div>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
              PLN
            </span>
            <Input
              id="salary"
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={salaryInputValue}
              onChange={(e) => handleSalaryChange(e.target.value)}
              className="mt-1 block w-full pl-11"
            />
          </div>
        </div>

        {/* Sick Leave */}
      </div>
    </Card>
  );
}
