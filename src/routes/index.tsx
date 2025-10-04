import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  retirementInputsAtom,
  retirementMonthlyPensionAtom,
  retirementMonthlyPensionWithSickLeaveAtom,
  retirementPensionReplacementRatioAtom,
  retirementPensionReplacementRatioWithSickLeaveAtom,
} from '@/lib/atoms';

import { useAtomValue } from 'jotai';

export function HomePage() {
  const inputs = useAtomValue(retirementInputsAtom);
  const monthlyPension = useAtomValue(retirementMonthlyPensionAtom);
  const monthlyPensionWithSickLeave = useAtomValue(
    retirementMonthlyPensionWithSickLeaveAtom
  );
  const replacementRatio = useAtomValue(retirementPensionReplacementRatioAtom);
  const replacementRatioWithSickLeave = useAtomValue(
    retirementPensionReplacementRatioWithSickLeaveAtom
  );

  const formatCurrency = (value: number | null) =>
    value == null
      ? '—'
      : value.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });

  const formatPercent = (value: number | null) =>
    value == null ? '—' : `${(value * 100).toFixed(1)}%`;

  const formatGender = (value: string) => {
    if (value === 'female') {
      return 'kobieta';
    }
    if (value === 'male') {
      return 'mężczyzna';
    }
    return value ?? '—';
  };

  return (
    <div className="p-2">
      <Card className="max-w-2xl mx-auto">
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2 pt-4">
              <h3 className="text-lg font-semibold">
                Podgląd stanu (atomy Jotai)
              </h3>

              <dl className="space-y-1 text-sm text-muted-foreground">
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium text-foreground">Wiek</dt>
                  <dd>{inputs.age == null ? '—' : `${inputs.age} lat`}</dd>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium text-foreground">Płeć</dt>
                  <dd>{formatGender(inputs.gender)}</dd>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium text-foreground">Pensja brutto</dt>
                  <dd>{formatCurrency(inputs.grossMonthlySalary)}</dd>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium text-foreground">
                    Rok rozpoczęcia pracy
                  </dt>
                  <dd>{inputs.workStartYear ?? '—'}</dd>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium text-foreground">
                    Planowany rok emerytury
                  </dt>
                  <dd>{inputs.plannedRetirementYear ?? '—'}</dd>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium text-foreground">
                    Saldo konta ZUS
                  </dt>
                  <dd>{formatCurrency(inputs.zusAccountBalance)}</dd>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium text-foreground">
                    Szacowana emerytura
                  </dt>
                  <dd>{formatCurrency(monthlyPension)}</dd>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium text-foreground">
                    Emerytura (z L4)
                  </dt>
                  <dd>{formatCurrency(monthlyPensionWithSickLeave)}</dd>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium text-foreground">
                    Wskaźnik zastąpienia
                  </dt>
                  <dd>{formatPercent(replacementRatio)}</dd>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <dt className="font-medium text-foreground">
                    Wskaźnik zastąpienia (z L4)
                  </dt>
                  <dd>{formatPercent(replacementRatioWithSickLeave)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
