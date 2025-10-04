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

export interface RetirementReportData {
  highlights: RetirementReportHighlight[];
  derived: RetirementReportGroup;
  notes: string[];
}
