import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { regionalBenchmarkAtom } from '@/lib/atoms';

import { useEffect, useRef, useState } from 'react';

import Highcharts from 'highcharts';
import { useAtomValue } from 'jotai';

const CHART_COLORS = {
  primary: '#00993f',
  greenLight: '#bad4c4',
  greenDark: '#084f25',
  gray: '#bec3ce',
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
        <CardTitle as="h2">Porównanie z innymi regionami</CardTitle>
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
