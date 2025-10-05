import { AppSidebar } from '@/components/app-sidebar';
import { ContributionHistoryChart } from '@/components/charts/ContributionHistoryChart';
import { PensionForecastChart } from '@/components/charts/PensionForecastChart';
import { RegionalBenchmarkChart } from '@/components/charts/RegionalBenchmarkChart';
import { ReplacementRateChart } from '@/components/charts/ReplacementRateChart';
import { ScenariosChart } from '@/components/charts/ScenariosChart';
import { SickLeaveImpactChart } from '@/components/charts/SickLeaveImpactChart';
import { DataTable } from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import data from '@/lib/data.json';

export function DashboardNew() {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* KPI Cards */}
              <SectionCards />

              {/* Main Charts Grid */}
              <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
                {/* Pension Forecast - Full Width */}
                <div className="lg:col-span-2">
                  <PensionForecastChart />
                </div>

                {/* Scenarios Chart */}
                <ScenariosChart />

                {/* Contribution History */}
                <ContributionHistoryChart />

                {/* Regional Benchmark - Full Width */}
                <div className="lg:col-span-2">
                  <RegionalBenchmarkChart />
                </div>

                {/* Replacement Rate */}
                <ReplacementRateChart />

                {/* Sick Leave Impact */}
                <SickLeaveImpactChart />
              </div>

              {/* Data Table */}
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
