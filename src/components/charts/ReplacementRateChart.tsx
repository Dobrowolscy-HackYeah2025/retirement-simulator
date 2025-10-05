import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { replacementRateAtom } from '@/lib/atoms';

import { useEffect, useRef, useState } from 'react';

import Highcharts from 'highcharts';
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
              color: 'hsl(var(--foreground))',
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
    <Card className="@container/card">
      <CardHeader>
        <CardTitle as="h2">Stopa zastąpienia</CardTitle>
        <CardDescription>
          Stosunek emerytury do ostatniego wynagrodzenia
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

export default ReplacementRateChart;
