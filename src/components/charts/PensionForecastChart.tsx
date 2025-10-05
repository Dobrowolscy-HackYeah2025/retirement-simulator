import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { pensionForecastDataAtom, retirementAgeAtom, inputGrossMonthlySalaryAtom } from '@/lib/atoms';

import { useEffect, useRef, useState } from 'react';

import Highcharts from 'highcharts';
import { Info } from 'lucide-react';
import { useAtomValue } from 'jotai';

const CHART_COLORS = {
  primary: 'var(--zus-green)', // #00993f
  green: 'var(--zus-green)', // #00993f
  greenLight: 'var(--secondary)', // #bad4c4
  darkBlue: 'var(--navy-blue)', // #00416e
} as const;

function PensionForecastChart() {
  const pensionForecastData = useAtomValue(pensionForecastDataAtom);
  const retirementAge = useAtomValue(retirementAgeAtom);
  const grossMonthlySalary = useAtomValue(inputGrossMonthlySalaryAtom);
  const chartRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<Highcharts.Chart | null>(null);

  // Debug - sprawdź czy dane się zmieniają
  useEffect(() => {
    console.log('PensionForecastChart - grossMonthlySalary changed:', grossMonthlySalary);
    console.log('PensionForecastChart - pensionForecastData changed:', pensionForecastData);
  }, [grossMonthlySalary, pensionForecastData]);

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
        plotLines: [
          {
            id: 'retirement-age-line',
            value: retirementAge,
            color: CHART_COLORS.darkBlue,
            width: 2,
            dashStyle: 'Solid',
            zIndex: 5, // Wyższy z-index żeby plotline był nad seriami
            label: {
              text: `Wybrany wiek: ${retirementAge} lat`,
              style: { color: CHART_COLORS.darkBlue, fontWeight: 'bold' },
            },
          },
        ],
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
            enabled: false, // Wyłączone markery
          },
          lineWidth: 3,
          dataLabels: {
            enabled: true,
            allowOverlap: true,
            formatter: function() {
              // Pokaż labelkę tylko dla ostatniego punktu
              return this.index === this.series.data.length - 1 ? this.series.name : null;
            },
            style: {
              color: 'black',
              fontSize: '14px',
              fontWeight: 'bold',
              textOutline: '1px white',
            },
            align: 'left',
            verticalAlign: 'middle',
            x: 10,
            y: 0,
          },
        },
        {
          name: 'Emerytura realna',
          type: 'line',
          data: pensionForecastData.map((item) => [item.age, item.realAmount]),
          color: CHART_COLORS.green,
          marker: {
            enabled: false, // Wyłączone markery
          },
          lineWidth: 3,
          dataLabels: {
            enabled: true,
            allowOverlap: true,
            formatter: function() {
              // Pokaż labelkę tylko dla ostatniego punktu
              return this.index === this.series.data.length - 1 ? this.series.name : null;
            },
            style: {
              color: 'black',
              fontSize: '14px',
              fontWeight: 'bold',
              textOutline: '1px white',
            },
            align: 'left',
            verticalAlign: 'middle',
            x: 10,
            y: 20,
          },
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

  // Update plotline when retirement age changes
  useEffect(() => {
    if (chart) {
      const xAxis = chart.xAxis[0];
      const plotLine = (xAxis as any).plotLinesAndBands.find(
        (pl: any) => pl.id === 'retirement-age-line'
      );

      if (plotLine) {
        // Remove existing plotline and add new one
        chart.xAxis[0].removePlotLine('retirement-age-line');
        chart.xAxis[0].addPlotLine({
          id: 'retirement-age-line',
          value: retirementAge,
          color: CHART_COLORS.darkBlue,
          width: 2,
          dashStyle: 'Solid',
          zIndex: 5, // Wyższy z-index żeby plotline był nad seriami
          label: {
            text: `Wybrany wiek: ${retirementAge} lat`,
            style: { color: CHART_COLORS.darkBlue, fontWeight: 'bold' },
          },
        });
      } else {
        // Add new plotline if it doesn't exist
        chart.xAxis[0].addPlotLine({
          id: 'retirement-age-line',
          value: retirementAge,
          color: CHART_COLORS.darkBlue,
          width: 2,
          dashStyle: 'Solid',
          zIndex: 5, // Wyższy z-index żeby plotline był nad seriami
          label: {
            text: `Wybrany wiek: ${retirementAge} lat`,
            style: { color: CHART_COLORS.darkBlue, fontWeight: 'bold' },
          },
        });
      }
    }
  }, [retirementAge, chart]);

  return (
    <Card className="@container/card max-h-[500px]">
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
          <div className="h-[400px] w-full relative">
            <div ref={chartRef} className="absolute inset-0 h-full w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PensionForecastChart;
