import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { contributionHistoryAtom } from '@/lib/atoms';

import { useEffect, useRef, useState } from 'react';

import Highcharts from 'highcharts';
import { Info } from 'lucide-react';
import { useAtomValue } from 'jotai';

const CHART_COLORS = {
  primary: '#00993f',
  greenLight: '#bad4c4',
  darkBlue: '#00416e',
} as const;

function ContributionHistoryChart() {
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
        categories: contributionHistory.map((item) => item.year.toString()),
      },
      yAxis: [
        {
          title: {
            text: 'Składki (zł)',
            style: { color: 'black' },
          },
        },
        {
          title: {
            text: 'Kapitał (zł)',
            style: { color: 'black' },
          },
          opposite: true,
        },
      ],
      series: [
        {
          name: 'Składki roczne',
          type: 'column',
          data: contributionHistory.map((item) => item.contributions),
          color: CHART_COLORS.greenLight,
          yAxis: 0,
          borderWidth: 0,
          borderRadius: 4,
        },
        {
          name: 'Kapitał narastający',
          type: 'line',
          data: contributionHistory.map((item) => item.capital),
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
        itemStyle: { color: 'black' },
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
        <div className="flex items-center gap-2">
          <CardTitle as="h2">Historia składek emerytalnych</CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info
                className="h-4 w-4 text-gray-600 hover:text-gray-800 transition-colors cursor-help"
                aria-label="Informacje o historii składek"
              />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm bg-white text-gray-800 border border-gray-200 shadow-lg">
              <div className="text-sm">
                <div className="font-semibold mb-2">Historia składek emerytalnych</div>
                <div className="space-y-2">
                  <div>
                    <strong>Składki roczne:</strong> 19.52% pensji brutto każdego roku
                  </div>
                  <div>
                    <strong>Narastający kapitał:</strong> Suma wszystkich składek + stan konta ZUS
                  </div>
                  <div>
                    <strong>Wzrost płac:</strong> Rzeczywiste dane ZUS (3-5% rocznie)
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    * Większe składki = wyższy kapitał = wyższa emerytura
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <CardDescription>
          Składki roczne i narastający kapitał emerytalny
        </CardDescription>
      </CardHeader>
      <CardContent className="px-1 lg:px-6">
        <div ref={chartRef} className="h-[400px] w-full" />
      </CardContent>
    </Card>
  );
}

export default ContributionHistoryChart;
