import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { scenariosDataAtom } from '@/lib/atoms';

import { useEffect, useRef, useState } from 'react';

import Highcharts from 'highcharts';
import { Info } from 'lucide-react';
import { useAtomValue } from 'jotai';

const CHART_COLORS = {
  primary: '#00993f',
  green: '#00993f',
  greenDark: '#084f25',
} as const;

function ScenariosChart() {
  const scenariosData = useAtomValue(scenariosDataAtom);
  const chartRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<Highcharts.Chart | null>(null);

  // Initialize chart
  useEffect(() => {
    if (!chartRef.current || chart) {
      return;
    }

    const newChart = Highcharts.chart(chartRef.current, {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
      },
      title: {
        text: '',
      },
      xAxis: {
        categories: ['Pesymistyczny', 'Realistyczny', 'Optymistyczny'],
      },
      yAxis: {
        title: {
          text: 'Kwota emerytury (zł)',
          style: { color: 'hsl(var(--foreground))' },
        },
      },
      series: [
        {
          name: 'Prognozowana emerytura',
          type: 'column',
          data: scenariosData
            ? [
                { y: scenariosData.pessimistic, color: CHART_COLORS.greenDark },
                { y: scenariosData.realistic, color: CHART_COLORS.primary },
                { y: scenariosData.optimistic, color: CHART_COLORS.green },
              ]
            : [],
          dataLabels: {
            enabled: true,
            format: '{y} zł',
            style: { fontWeight: 'bold' },
          },
          borderWidth: 0,
          borderRadius: 4,
        },
      ],
      legend: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
    });

    setChart(newChart);

    return () => {
      newChart.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update chart data
  useEffect(() => {
    if (!chart || !chart.series || !chart.series[0] || !scenariosData) {
      return;
    }

    chart.series[0].setData([
      { y: scenariosData.pessimistic, color: CHART_COLORS.greenDark },
      { y: scenariosData.realistic, color: CHART_COLORS.primary },
      { y: scenariosData.optimistic, color: CHART_COLORS.green },
    ]);
  }, [chart, scenariosData]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle as="h2">Scenariusze "co-jeśli"</CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info
                className="h-4 w-4 text-gray-600 hover:text-gray-800 transition-colors cursor-help"
                aria-label="Informacje o scenariuszach ekonomicznych"
              />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm bg-white text-gray-800 border border-gray-200 shadow-lg">
              <div className="text-sm">
                <div className="font-semibold mb-2">Scenariusze ekonomiczne ZUS</div>
                <div className="space-y-3">
                  <div>
                    <div className="font-medium text-red-400 mb-1">Pesymistyczny:</div>
                    <div className="text-xs space-y-1">
                      <div>• Wzrost płac: 50% normalnego (wolniejszy)</div>
                      <div>• Stopy składek: 90% (niższe)</div>
                      <div>• Długość życia: -2 lata (krótsza)</div>
                      <div>• Więcej emerytów w systemie</div>
                      <div className="text-red-300 font-medium">→ Niższa emerytura</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-green-400 mb-1">Realistyczny:</div>
                    <div className="text-xs space-y-1">
                      <div>• Wzrost płac: standardowy (dane ZUS)</div>
                      <div>• Stopy składek: normalne</div>
                      <div>• Długość życia: standardowa</div>
                      <div>• Stabilne warunki demograficzne</div>
                      <div className="text-green-300 font-medium">→ Bazowa emerytura</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-blue-400 mb-1">Optymistyczny:</div>
                    <div className="text-xs space-y-1">
                      <div>• Wzrost płac: 150% normalnego (szybszy)</div>
                      <div>• Stopy składek: 110% (wyższe)</div>
                      <div>• Długość życia: +2 lata (dłuższa)</div>
                      <div>• Mniej emerytów w systemie</div>
                      <div className="text-blue-300 font-medium">→ Wyższa emerytura</div>
                    </div>
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <CardDescription>
          Prognoza emerytury w różnych scenariuszach ekonomicznych
        </CardDescription>
      </CardHeader>
      <CardContent className="px-1 lg:px-6">
        <div ref={chartRef} className="h-[400px] w-full" />
      </CardContent>
    </Card>
  );
}

export default ScenariosChart;
