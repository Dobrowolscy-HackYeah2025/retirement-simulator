import { AiBanner } from './ai/AiBanner';
import { GenerateReportCtaButton } from './GenerateReportCtaButton';

export function SiteHeader() {
  return (
    <header className="flex shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear ">
      <div className="flex flex-col w-full">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:py-6 lg:px-6">
          {/* <SidebarTrigger className="-ml-1" /> */}
          {/* <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        /> */}
          <div className="lg:text-2xl text-base font-medium">
            Twoja prognoza emerytalna
          </div>
          <div className="ml-auto flex items-center gap-2">
            <GenerateReportCtaButton />
          </div>
        </div>
        <AiBanner />
      </div>
    </header>
  );
}
