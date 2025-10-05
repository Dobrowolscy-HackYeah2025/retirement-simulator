import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { includeSickLeaveAtom, sickLeaveImpactAtom } from '@/lib/atoms';

import { useEffect, useRef, useState } from 'react';

import Highcharts from 'highcharts';
import { useAtomValue } from 'jotai';

const CHART_COLORS = {
  primary: '#00993f',
  greenDark: '#084f25',
  darkBlue: '#00416e',
} as const;

function SickLeaveImpactChart() {
  const sickLeaveImpact = useAtomValue(sickLeaveImpactAtom);
  const includeSickLeave = useAtomValue(includeSickLeaveAtom);
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
        categories: ['Z L4', 'Bez L4'],
      },
      yAxis: {
        title: {
          text: 'Kwota emerytury (zł)',
          style: { color: CHART_COLORS.darkBlue },
        },
      },
      series: [
        {
          name: 'Wysokość emerytury',
          type: 'column',
          data: sickLeaveImpact
            ? [
                {
                  y: includeSickLeave
                    ? sickLeaveImpact.withSickLeave
                    : sickLeaveImpact.withoutSickLeave,
                  color: CHART_COLORS.greenDark,
                },
                {
                  y: sickLeaveImpact.withoutSickLeave,
                  color: CHART_COLORS.primary,
                },
              ]
            : [],
          dataLabels: {
            enabled: true,
            format: '{y} zł',
            style: { color: CHART_COLORS.darkBlue, fontWeight: 'bold' },
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
    if (!chart || !chart.series || !chart.series[0] || !sickLeaveImpact) {
      return;
    }

    const withSickLeave = includeSickLeave
      ? sickLeaveImpact.withSickLeave
      : sickLeaveImpact.withoutSickLeave;
    const withoutSickLeave = sickLeaveImpact.withoutSickLeave;

    chart.series[0].setData([
      { y: withSickLeave, color: CHART_COLORS.greenDark },
      { y: withoutSickLeave, color: CHART_COLORS.primary },
    ]);
  }, [chart, includeSickLeave, sickLeaveImpact]);

  return (
    <Card className="@container/card h-full">
      <CardHeader>
        <CardTitle as="h2">Wpływ absencji chorobowych</CardTitle>
        <CardDescription>
          Porównanie emerytury z uwzględnieniem L4 i bez
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="h-[350px] w-full" />
      </CardContent>
    </Card>
  );
}

export default SickLeaveImpactChart;
