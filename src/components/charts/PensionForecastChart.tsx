import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { pensionForecastDataAtom } from '@/lib/atoms';

import { useEffect, useRef, useState } from 'react';

import Highcharts from 'highcharts';
import { useAtomValue } from 'jotai';

const CHART_COLORS = {
  primary: '#00993f',
  green: '#00993f',
  greenLight: '#bad4c4',
  darkBlue: '#00416e',
} as const;

export function PensionForecastChart() {
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
        <CardTitle>Prognoza emerytury vs wiek przejścia</CardTitle>
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
