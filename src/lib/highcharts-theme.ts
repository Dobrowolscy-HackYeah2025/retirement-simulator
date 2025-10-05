import * as Highcharts from 'highcharts';

/**
 * Global Highcharts theme configuration
 * Uses the same font stack as shadcn/Tailwind CSS
 */
export function applyHighchartsTheme() {
  Highcharts.setOptions({
    chart: {
      style: {
        fontFamily: 'Geist',
      },
    },
  });
}
