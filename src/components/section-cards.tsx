import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { useAtomValue } from 'jotai';

import {
  averagePensionAtom,
  purchasingPowerPercentageAtom,
  replacementRateAtom,
  selectedScenarioPensionAtom,
  selectedScenarioRealPensionAtom,
} from '../lib/atoms';

export function SectionCards() {
  // Get data from global state
  const selectedPension = useAtomValue(selectedScenarioPensionAtom);
  const selectedRealPension = useAtomValue(selectedScenarioRealPensionAtom);
  const averagePension = useAtomValue(averagePensionAtom);
  const replacementRate = useAtomValue(replacementRateAtom);
  const purchasingPowerPercentage = useAtomValue(purchasingPowerPercentageAtom);

  const pensionVsAverage = Math.round(
    ((selectedPension - averagePension) / averagePension) * 100
  );
  const isPensionAboveAverage = selectedPension > averagePension;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      {/* Emerytura rzeczywista */}
      <Card className="@container/card py-4 gap-4">
        <CardHeader className="py-0">
          <CardDescription>Emerytura rzeczywista</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {selectedPension.toLocaleString()} zł
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {isPensionAboveAverage ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {isPensionAboveAverage ? '+' : ''}
              {pensionVsAverage}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm py-0">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {isPensionAboveAverage ? 'Powyżej' : 'Poniżej'} średniej{' '}
            {isPensionAboveAverage ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            vs średnia: {averagePension.toLocaleString()} zł
          </div>
        </CardFooter>
      </Card>

      {/* Emerytura urealniona */}
      <Card className="@container/card py-4 gap-4">
        <CardHeader className="py-0">
          <CardDescription>Emerytura urealniona</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {selectedRealPension.toLocaleString()} zł
          </CardTitle>
          <CardAction>
            <Badge variant="outline">{purchasingPowerPercentage}%</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm py-0">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Siła nabywcza po inflacji
          </div>
          <div className="text-muted-foreground">
            {purchasingPowerPercentage}% wartości nominalnej
          </div>
        </CardFooter>
      </Card>

      {/* Stopa zastąpienia */}
      <Card className="@container/card py-4 gap-4">
        <CardHeader className="py-0">
          <CardDescription>Stopa zastąpienia</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {replacementRate}%
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm py-0">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Stosunek emerytury do pensji
          </div>
          <div className="text-muted-foreground">
            Procent obecnego wynagrodzenia
          </div>
        </CardFooter>
      </Card>

    </div>
  );
}
