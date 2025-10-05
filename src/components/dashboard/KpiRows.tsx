import { InfoIcon, TrendingDownIcon, TrendingUpIcon } from 'lucide-react';

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';

interface KpiRowsProps {
  selectedPension: number;
  selectedRealPension: number;
  averagePension: number;
  replacementRate: number;
  purchasingPowerPercentage: number;
}

export const KpiRows = ({
  selectedPension,
  selectedRealPension,
  averagePension,
  replacementRate,
  purchasingPowerPercentage,
}: KpiRowsProps) => {
  const pensionVsAverage = Math.round(
    ((selectedPension - averagePension) / averagePension) * 100
  );
  const isPensionAboveAverage = selectedPension > averagePension;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Nominal Pension */}
      <Card>
        <CardHeader>
          <CardDescription className="text-muted-foreground">
            Emerytura rzeczywista
          </CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums @[250px]/card:text-4xl">
            {selectedPension.toLocaleString()} zł
          </CardTitle>
          <CardAction>
            {isPensionAboveAverage ? (
              <TrendingUpIcon className="size-5 text-primary" />
            ) : (
              <TrendingDownIcon className="size-5 text-coral-red" />
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium text-foreground">
            {isPensionAboveAverage ? 'Powyżej' : 'Poniżej'} średniej{' '}
            {isPensionAboveAverage ? (
              <TrendingUpIcon className="size-4" />
            ) : (
              <TrendingDownIcon className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            vs średnia: {averagePension.toLocaleString()} zł (
            {isPensionAboveAverage ? '+' : ''}
            {pensionVsAverage}%)
          </div>
        </CardFooter>
      </Card>

      {/* Real Pension */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-muted-foreground">
            Emerytura urealniona
          </CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums @[250px]/card:text-4xl">
            {selectedRealPension.toLocaleString()} zł
          </CardTitle>
          <CardAction>
            <InfoIcon className="size-5 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium text-foreground">
            Siła nabywcza po inflacji
          </div>
          <div className="text-muted-foreground">
            {purchasingPowerPercentage}% wartości nominalnej
          </div>
        </CardFooter>
      </Card>

      {/* Replacement Rate */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-muted-foreground">
            Stopa zastąpienia
          </CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums @[250px]/card:text-4xl">
            {replacementRate}%
          </CardTitle>
          <CardAction>
            {replacementRate >= 50 ? (
              <TrendingUpIcon className="size-5 text-primary" />
            ) : (
              <TrendingDownIcon className="size-5 text-coral-red" />
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium text-foreground">
            {replacementRate >= 50 ? 'Dobry poziom' : 'Niski poziom'}
          </div>
          <div className="text-muted-foreground">
            Procent obecnego wynagrodzenia
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
