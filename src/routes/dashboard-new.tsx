import { AppSidebar } from '@/components/app-sidebar';
import { SectionCards } from '@/components/section-cards';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { lazy, Suspense } from 'react';

// Lazy load charts to reduce initial bundle size
const PensionForecastChart = lazy(
  () => import('@/components/charts/PensionForecastChart')
);
const ScenariosChart = lazy(() => import('@/components/charts/ScenariosChart'));
const ContributionHistoryChart = lazy(
  () => import('@/components/charts/ContributionHistoryChart')
);
const RegionalBenchmarkChart = lazy(
  () => import('@/components/charts/RegionalBenchmarkChart')
);
const ReplacementRateChart = lazy(
  () => import('@/components/charts/ReplacementRateChart')
);
const SickLeaveImpactChart = lazy(
  () => import('@/components/charts/SickLeaveImpactChart')
);

// Chart loading skeleton
const ChartSkeleton = ({ fullWidth = false }: { fullWidth?: boolean }) => (
  <div
    className={`animate-pulse rounded-lg border bg-card ${fullWidth ? 'lg:col-span-2' : ''}`}
  >
    <div className="p-6">
      <div className="mb-4 h-6 w-48 rounded bg-muted" />
      <div className="h-4 w-64 rounded bg-muted" />
    </div>
    <div className="px-6 pb-6">
      <div className="h-[400px] rounded bg-muted/50" />
    </div>
  </div>
);

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
              {/* Main heading for the page - visually hidden but important for accessibility */}
              <h1 className="sr-only">Twoja prognoza emerytalna - Dashboard</h1>

              <SectionCards />

              <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
                <Suspense fallback={<ChartSkeleton fullWidth />}>
                  <div className="lg:col-span-2">
                    <PensionForecastChart />
                  </div>
                </Suspense>

                <Suspense fallback={<ChartSkeleton />}>
                  <ScenariosChart />
                </Suspense>

                <Suspense fallback={<ChartSkeleton />}>
                  <ContributionHistoryChart />
                </Suspense>

                <Suspense fallback={<ChartSkeleton fullWidth />}>
                  <div className="lg:col-span-2">
                    <RegionalBenchmarkChart />
                  </div>
                </Suspense>

                <Suspense fallback={<ChartSkeleton />}>
                  <ReplacementRateChart />
                </Suspense>

                <Suspense fallback={<ChartSkeleton />}>
                  <SickLeaveImpactChart />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
