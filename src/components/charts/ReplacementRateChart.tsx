import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { replacementRateAtom } from '@/lib/atoms';

import { useEffect, useRef, useState } from 'react';

import Highcharts from 'highcharts';
import { Info } from 'lucide-react';
import { useAtomValue } from 'jotai';

const CHART_COLORS = {
  primary: '#00993f',
  greenLight: '#bad4c4',
} as const;

function ReplacementRateChart() {
  const replacementRate = useAtomValue(replacementRateAtom);
  const chartRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<Highcharts.Chart | null>(null);

  // Initialize chart
  useEffect(() => {
    if (!chartRef.current || chart) {
      return;
    }

    const newChart = Highcharts.chart(chartRef.current, {
      chart: {
        type: 'pie',
        backgroundColor: 'transparent',
        plotBackgroundColor: undefined,
        plotBorderWidth: undefined,
        plotShadow: false,
      },
      title: {
        text: '',
      },
      tooltip: {
        enabled: false,
      },
      plotOptions: {
        pie: {
          allowPointSelect: false,
          cursor: 'default',
          dataLabels: {
            enabled: true,
            format: '{point.name}<br/><b>{point.y}%</b>',
            style: {
              color: 'black',
              fontWeight: 'bold',
              fontSize: '14px',
              textOutline: 'none',
            },
            distance: 20,
          },
          showInLegend: false,
          borderWidth: 0,
          innerSize: '40%',
          size: '80%',
        },
      },
      series: [
        {
          name: 'Stopa zastąpienia',
          type: 'pie',
          data: [
            {
              name: 'Emerytura',
              y: replacementRate,
              color: CHART_COLORS.primary,
            },
            {
              name: 'Różnica',
              y: 100 - replacementRate,
              color: CHART_COLORS.greenLight,
            },
          ],
        },
      ],
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
    if (!chart || !chart.series || !chart.series[0]) {
      return;
    }

    chart.series[0].setData([
      {
        name: 'Emerytura',
        y: replacementRate,
        color: CHART_COLORS.primary,
      },
      {
        name: 'Różnica',
        y: 100 - replacementRate,
        color: CHART_COLORS.greenLight,
      },
    ]);
  }, [chart, replacementRate]);

  return (
    <Card className="@container/card h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle as="h2">Stopa zastąpienia</CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info
                className="h-4 w-4 text-gray-600 hover:text-gray-800 transition-colors cursor-help"
                aria-label="Informacje o stopie zastąpienia"
              />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm bg-white text-gray-800 border border-gray-200 shadow-lg">
              <div className="text-sm">
                <div className="font-semibold mb-2">Stopa zastąpienia</div>
                <div className="space-y-2">
                  <div>
                    <strong>Wzór:</strong> (Emerytura ÷ Ostatnie wynagrodzenie) × 100%
                  </div>
                  <div>
                    <strong>Oznacza:</strong> Jaki procent ostatniej pensji stanowi emerytura
                  </div>
                  <div>
                    <strong>Cel ZUS:</strong> ~60% dla przeciętnego pracownika
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    * Wyższa stopa = lepsze zabezpieczenie emerytalne
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <CardDescription>
          Stosunek emerytury do ostatniego wynagrodzenia
        </CardDescription>
      </CardHeader>
      <CardContent className="px-1 lg:px-6">
        <div ref={chartRef} className="h-[350px] w-full" />
      </CardContent>
    </Card>
  );
}

export default ReplacementRateChart;
