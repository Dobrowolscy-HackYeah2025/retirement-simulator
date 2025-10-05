import { AppSidebar } from '@/components/app-sidebar';
import { ContributionHistoryChart } from '@/components/charts/ContributionHistoryChart';
import { PensionForecastChart } from '@/components/charts/PensionForecastChart';
import { RegionalBenchmarkChart } from '@/components/charts/RegionalBenchmarkChart';
import { ReplacementRateChart } from '@/components/charts/ReplacementRateChart';
import { ScenariosChart } from '@/components/charts/ScenariosChart';
import { SickLeaveImpactChart } from '@/components/charts/SickLeaveImpactChart';
import { SectionCards } from '@/components/section-cards';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

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
              <SectionCards />

              <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
                <div className="lg:col-span-2">
                  <PensionForecastChart />
                </div>

                <ScenariosChart />

                <ContributionHistoryChart />

                <div className="lg:col-span-2">
                  <RegionalBenchmarkChart />
                </div>
                <ReplacementRateChart />
                <SickLeaveImpactChart />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
