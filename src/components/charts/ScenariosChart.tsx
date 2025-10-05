import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { scenariosDataAtom } from '@/lib/atoms';

import { useEffect, useRef, useState } from 'react';

import Highcharts from 'highcharts';
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
        <CardTitle as="h2">Scenariusze "co-jeśli"</CardTitle>
        <CardDescription>
          Prognoza emerytury w różnych scenariuszach ekonomicznych
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="h-[400px] w-full" />
      </CardContent>
    </Card>
  );
}

export default ScenariosChart;
