import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { pensionForecastDataAtom } from '@/lib/atoms';

import { useEffect, useRef, useState } from 'react';

import Highcharts from 'highcharts';
import { Info } from 'lucide-react';
import { useAtomValue } from 'jotai';

const CHART_COLORS = {
  primary: '#00993f',
  green: '#00993f',
  greenLight: '#bad4c4',
  darkBlue: '#00416e',
} as const;

function PensionForecastChart() {
  const pensionForecastData = useAtomValue(pensionForecastDataAtom);
  const chartRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<Highcharts.Chart | null>(null);

  // Initialize chart
  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    // Don't re-initialize if chart already exists
    if (chart) {
      return;
    }

    const newChart = Highcharts.chart(chartRef.current, {
      chart: {
        type: 'line',
        backgroundColor: 'transparent',
        style: {
          fontFamily: 'inherit',
        },
      },
      title: {
        text: '',
      },
      xAxis: {
        type: 'linear',
        title: {
          text: 'Wiek przejścia na emeryturę',
          style: { color: CHART_COLORS.darkBlue },
        },
        min: 60,
        max: 70,
      },
      yAxis: {
        title: {
          text: 'Kwota emerytury (zł)',
          style: { color: CHART_COLORS.darkBlue },
        },
      },
      series: [
        {
          name: 'Kwota emerytury',
          type: 'line',
          data: pensionForecastData.map((item) => [item.age, item.amount]),
          color: CHART_COLORS.primary,
          marker: {
            radius: 6,
            fillColor: CHART_COLORS.primary,
            lineColor: CHART_COLORS.primary,
          },
          lineWidth: 3,
        },
        {
          name: 'Emerytura realna',
          type: 'line',
          data: pensionForecastData.map((item) => [item.age, item.realAmount]),
          color: CHART_COLORS.green,
          marker: {
            radius: 6,
            fillColor: CHART_COLORS.green,
            lineColor: CHART_COLORS.green,
          },
          lineWidth: 3,
        },
      ],
      legend: {
        enabled: true,
        itemStyle: { color: CHART_COLORS.darkBlue },
      },
      tooltip: {
        pointFormat: '<b>{series.name}</b>: {point.y} zł',
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
    if (
      !chart ||
      !chart.series ||
      !chart.series[0] ||
      !chart.series[1] ||
      pensionForecastData.length === 0
    ) {
      return;
    }

    chart.series[0].setData(
      pensionForecastData.map((item) => [item.age, item.amount]),
      false
    );
    chart.series[1].setData(
      pensionForecastData.map((item) => [item.age, item.realAmount]),
      false
    );
    chart.redraw();
  }, [chart, pensionForecastData]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle as="h2">Prognoza emerytury vs wiek przejścia</CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info
                className="h-4 w-4 text-gray-600 hover:text-gray-800 transition-colors cursor-help"
                aria-label="Informacje o prognozie emerytury"
              />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm bg-white text-gray-800 border border-gray-200 shadow-lg">
              <div className="text-sm">
                <div className="font-semibold mb-2">Wpływ wieku przejścia na emeryturę</div>
                <div className="space-y-2">
                  <div>
                    <strong>Późniejsza emerytura:</strong> Więcej składek + krótsza emerytura = wyższa miesięczna emerytura
                  </div>
                  <div>
                    <strong>Emerytura nominalna:</strong> Wartość w cenach z roku przejścia
                  </div>
                  <div>
                    <strong>Emerytura realna:</strong> Wartość w cenach z 2025 roku (po inflacji)
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    * Wzrost ~3-6% rocznie dzięki danym ZUS
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <CardDescription>
          Wpływ wieku przejścia na emeryturę na wysokość świadczenia
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pensionForecastData.length === 0 ? (
          <div className="flex h-[400px] w-full items-center justify-center text-muted-foreground">
            Brak danych do wyświetlenia
          </div>
        ) : (
          <div ref={chartRef} className="h-[400px] w-full" />
        )}
      </CardContent>
    </Card>
  );
}

export default PensionForecastChart;
