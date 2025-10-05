import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { regionalBenchmarkAtom } from '@/lib/atoms';

import { useEffect, useRef, useState } from 'react';

import Highcharts from 'highcharts';
import { Info } from 'lucide-react';
import { useAtomValue } from 'jotai';

const CHART_COLORS = {
  primary: 'var(--zus-green)', // #00993f
  greenLight: 'var(--secondary)', // #bad4c4
  greenDark: 'var(--secondary-foreground)', // #084f25
  gray: 'var(--gray-blue)', // #bec3ce
} as const;

function RegionalBenchmarkChart() {
  const regionalBenchmark = useAtomValue(regionalBenchmarkAtom);
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
        categories: regionalBenchmark.map((item) => item.region),
      },
      yAxis: {
        title: {
          text: 'Kwota emerytury (zł)',
          style: { color: 'hsl(var(--foreground))' },
        },
      },
      series: [
        {
          name: 'Średnia w regionie',
          type: 'column',
          color: CHART_COLORS.primary, // Kolor dla legendy
          data: regionalBenchmark.map((item) => ({
            y: item.average,
            color: item.isSelected
              ? CHART_COLORS.primary
              : CHART_COLORS.greenLight,
          })),
          borderWidth: 0,
          borderRadius: 4,
        },
        {
          name: 'Twoja prognoza',
          type: 'column',
          color: CHART_COLORS.greenDark, // Kolor dla legendy
          data: regionalBenchmark.map((item) => ({
            y: item.user,
            color: item.isSelected ? CHART_COLORS.greenDark : CHART_COLORS.gray,
          })),
          borderWidth: 0,
          borderRadius: 4,
        },
      ],
      legend: {
        enabled: true,
        itemStyle: { color: 'hsl(var(--foreground))' },
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
      !chart.xAxis ||
      !chart.xAxis[0] ||
      !chart.series ||
      !chart.series[0] ||
      !chart.series[1] ||
      regionalBenchmark.length === 0
    ) {
      return;
    }

    chart.xAxis[0].setCategories(regionalBenchmark.map((item) => item.region));
    chart.series[0].setData(
      regionalBenchmark.map((item) => ({
        y: item.average,
        color: item.isSelected ? CHART_COLORS.primary : CHART_COLORS.greenLight,
      })),
      false
    );
    chart.series[1].setData(
      regionalBenchmark.map((item) => ({
        y: item.user,
        color: item.isSelected ? CHART_COLORS.greenDark : CHART_COLORS.gray,
      })),
      false
    );
    chart.redraw();
  }, [chart, regionalBenchmark]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle as="h2">Porównanie z innymi regionami</CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info
                className="h-4 w-4 text-gray-600 hover:text-gray-800 transition-colors cursor-help"
                aria-label="Informacje o porównaniu regionalnym"
              />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm bg-white text-gray-800 border border-gray-200 shadow-lg">
              <div className="text-sm">
                <div className="font-semibold mb-2">Benchmark regionalny</div>
                <div className="space-y-2">
                  <div>
                    <strong>Średnia w regionie:</strong> Średnia emerytura w danym województwie
                  </div>
                  <div>
                    <strong>Twoja prognoza:</strong> Twoja przewidywana emerytura
                  </div>
                  <div>
                    <strong>Wyróżniony region:</strong> Region odpowiadający Twojemu miastu
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    * Dane oparte na statystykach ZUS i GUS
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <CardDescription>
          Twoja prognoza vs średnia emerytury w regionach
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="h-[400px] w-full" />
      </CardContent>
    </Card>
  );
}

export default RegionalBenchmarkChart;
