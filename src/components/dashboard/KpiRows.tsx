import { InfoIcon, TrendingDownIcon, TrendingUpIcon } from 'lucide-react';

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';

export const KpiRows = ({
  scenariosData,
  replacementRate,
}: {
  scenariosData: any;
  replacementRate: number;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Nominal Pension Forecast */}
      <Card>
        <CardHeader>
          <CardDescription className="text-muted-foreground">
            Prognoza emerytury
          </CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums @[250px]/card:text-4xl">
            {scenariosData.realistic.toLocaleString()} zł
          </CardTitle>
          <CardAction>
            <TrendingUpIcon className="size-5 text-primary" />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium text-foreground">
            Emerytura nominalna
          </div>
          <div className="text-muted-foreground">
            Prognozowana kwota miesięczna
          </div>
        </CardFooter>
      </Card>

      {/* Real Pension Forecast */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-muted-foreground">
            Emerytura realna
          </CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums @[250px]/card:text-4xl">
            {Math.round(scenariosData.realistic * 0.7).toLocaleString()} zł
          </CardTitle>
          <CardAction>
            <InfoIcon className="size-5 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium text-foreground">
            Z uwzględnieniem inflacji
          </div>
          <div className="text-muted-foreground">
            Wartość siły nabywczej (~70%)
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
