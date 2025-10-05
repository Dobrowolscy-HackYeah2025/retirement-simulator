import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { contributionHistoryAtom } from '@/lib/atoms';

import { useEffect, useRef, useState } from 'react';

import Highcharts from 'highcharts';
import { useAtomValue } from 'jotai';

const CHART_COLORS = {
  primary: '#00993f',
  greenLight: '#bad4c4',
  darkBlue: '#00416e',
} as const;

export function ContributionHistoryChart() {
  const contributionHistory = useAtomValue(contributionHistoryAtom);
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
        categories: [],
      },
      yAxis: [
        {
          title: {
            text: 'Składki (zł)',
            style: { color: CHART_COLORS.darkBlue },
          },
        },
        {
          title: {
            text: 'Kapitał (zł)',
            style: { color: CHART_COLORS.darkBlue },
          },
          opposite: true,
        },
      ],
      series: [
        {
          name: 'Składki roczne',
          type: 'column',
          data: [],
          color: CHART_COLORS.greenLight,
          yAxis: 0,
          borderWidth: 0,
          borderRadius: 4,
        },
        {
          name: 'Kapitał narastający',
          type: 'line',
          data: [],
          color: CHART_COLORS.primary,
          yAxis: 1,
          marker: {
            radius: 4,
            fillColor: CHART_COLORS.primary,
            lineColor: CHART_COLORS.primary,
          },
          lineWidth: 3,
        },
      ],
      legend: {
        enabled: true,
        itemStyle: { color: CHART_COLORS.darkBlue },
      },
      credits: {
        enabled: false,
      },
    });

    setChart(newChart);

    return () => {
      newChart.destroy();
    };
  }, [chart]);

  // Update chart data
  useEffect(() => {
    if (
      !chart ||
      !chart.xAxis ||
      !chart.xAxis[0] ||
      !chart.series ||
      !chart.series[0] ||
      !chart.series[1] ||
      contributionHistory.length === 0
    ) {
      return;
    }

    chart.xAxis[0].setCategories(
      contributionHistory.map((item) => item.year.toString())
    );
    chart.series[0].setData(
      contributionHistory.map((item) => item.contributions),
      false
    );
    chart.series[1].setData(
      contributionHistory.map((item) => item.capital),
      false
    );
    chart.redraw();
  }, [chart, contributionHistory]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Historia składek emerytalnych</CardTitle>
        <CardDescription>
          Składki roczne i narastający kapitał emerytalny
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="h-[400px] w-full" />
      </CardContent>
    </Card>
  );
}
