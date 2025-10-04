export interface RetirementReportItem {
  id: string;
  label: string;
  formattedValue: string;
  description?: string;
}

export interface RetirementReportGroup {
  title: string;
  items: RetirementReportItem[];
  summary?: string;
}

export interface RetirementReportHighlight {
  id: string;
  label: string;
  value: string;
}

export interface RetirementReportChartPoint {
  x: number | string;
  y: number;
  color?: string;
}

export interface RetirementReportChartSeries {
  id: string;
  label: string;
  points: RetirementReportChartPoint[];
  color?: string;
  type?: 'line' | 'column';
}

export interface RetirementReportChart {
  id: string;
  title: string;
  description?: string;
  type: 'line' | 'column';
  xLabel?: string;
  yLabel?: string;
  series: RetirementReportChartSeries[];
}

export interface RetirementReportData {
  highlights: RetirementReportHighlight[];
  derived: RetirementReportGroup;
  notes: string[];
  charts: RetirementReportChart[];
}

export interface RetirementReportHandle {
  open: () => void;
}
