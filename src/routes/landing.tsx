import HeroImage from '@/assets/app_screenshots_2.webp';
import ZusLogo from '@/assets/zus_logo.svg';
import { Button } from '@/components/ui/button';

import { ArrowRightIcon, ShieldCheckIcon, TrendingUpIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { AdminReportButton } from '../components/landing/AdminReportButton';

const cards = [
  {
    title: 'Różne scenariusze',
    description:
      'Zobacz jak zmieni się Twoja emerytura w zależności od wieku przejścia i stażu pracy.',
    icon: <TrendingUpIcon className="size-6 text-primary" />,
  },
  {
    title: 'Bezpieczeństwo danych',
    description:
      'Wszystkie obliczenia wykonywane są lokalnie w Twojej przeglądarce.',
    icon: <ShieldCheckIcon className="size-6 text-primary" />,
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="max-w-7xl flex justify-end mx-auto mt-6 px-4 md:px-0">
        <AdminReportButton />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pb-20 pt-8 md:pt-12 lg:pt-16">
        <div className="text-left">
          <div className="flex justify-start mb-4">
            <img
              src={ZusLogo}
              className="h-16 w-16 md:h-20 md:w-20"
              alt="ZUS Logo"
            />
          </div>

          <h1 className="text-4xl md:text-7xl font-bold text-foreground mb-6">
            Symulator
            <br />
            Emerytalny ZUS
          </h1>

          <p className="text-base md:text-xl text-muted-foreground mb-8 max-w-xl text-left">
            Sprawdź ile będzie wynosić Twoja przyszła emerytura. Prosty
            kalkulator oparty na danych ZUS i GUS.
          </p>

          <Link to="/onboarding">
            <Button
              size="lg"
              variant="default"
              className="group text-base lg:text-lg"
            >
              <ArrowRightIcon className="group-hover:translate-x-1 transition-transform" />
              Rozpocznij obliczenia
            </Button>
          </Link>

          <img
            src={HeroImage}
            alt="App Screenshot"
            className="hidden lg:block absolute top-12 -right-[10%] -z-10 w-[60%]"
            fetchPriority="high"
            decoding="async"
            width="1600"
            height="1100"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 row max-w-9xl gap-2 md:gap-8 mt-12 md:mt-16">
          {cards.map((card) => (
            <div key={card.title}>
              <div className="text-left">
                <div className="flex justify-start mb-4">
                  <div className="p-2 md:p-3 bg-primary/10 rounded-full">
                    {card.icon}
                  </div>
                </div>
                <h2 className="text-base md:text-lg font-semibold text-foreground mb-2">
                  {card.title}
                </h2>
                <p className="text-xs md:text-base text-muted-foreground">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="fixed -bottom-0 lg:-bottom-16 left-0 right-0 -z-10 overflow-hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            className="h-[10rem] md:h-auto"
            preserveAspectRatio="none"
          >
            <path
              fill="#35a454"
              opacity="87%"
              fillOpacity="1"
              d="M0,64L80,96C160,128,320,192,480,208C640,224,800,192,960,192C1120,192,1280,224,1360,240L1440,256L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            ></path>
          </svg>
        </div>

        <div className="flex w-full justify-center fixed bottom-0 left-0">
          <p className="max-w-7xl mx-auto text-xs text-white/80 left-0 w-full py-2 text-left px-4">
            Kalkulator ma charakter informacyjny i nie stanowi oficjalnej
            prognozy ZUS.
          </p>
        </div>
      </div>
    </div>
  );
}
