import HeroImage from '@/assets/hero.png';
import ZusLogo from '@/assets/zus_logo.svg';
import { Button } from '@/components/ui/button';

import {
  ArrowRightIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const cards = [
  {
    title: 'Dokładne prognozy',
    description:
      'Obliczenia oparte na oficjalnych danych ZUS i parametrach demograficznych GUS',
    icon: <CheckCircleIcon className="size-6 text-primary" />,
  },
  {
    title: 'Różne scenariusze',
    description:
      'Zobacz jak zmieni się Twoja emerytura w zależności od wieku przejścia i stażu pracy',
    icon: <TrendingUpIcon className="size-6 text-primary" />,
  },
  {
    title: 'Bezpieczeństwo danych',
    description:
      'Wszystkie obliczenia wykonywane są lokalnie w Twojej przeglądarce',
    icon: <ShieldCheckIcon className="size-6 text-primary" />,
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="relative max-w-7xl mx-auto px-6 py-20 pt-24 md:pt-36 lg:pt-40">
        <div className="text-left">
          <div className="flex justify-start mb-4">
            <img
              src={ZusLogo}
              className="h-16 w-16 md:h-20 md:w-20"
              alt="ZUS Logo"
            />
          </div>

          <h1 className="text-4xl md:text-7xl font-bold text-foreground mb-6">
            Kalkulator
            <br />
            Emerytalny ZUS
          </h1>

          <p className="text-base md:text-xl text-muted-foreground mb-8 max-w-xl text-left">
            Sprawdź ile będzie wynosić Twoja przyszła emerytura. Prosty
            kalkulator oparty na danych ZUS i GUS.
          </p>

          <Link to="/onboarding">
            <Button size="lg" variant="default">
              Rozpocznij obliczenia
              <ArrowRightIcon className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <img
            src={HeroImage}
            alt="App Screenshot"
            className="hidden md:block absolute top-28 -right-[10%] -z-10 w-[60%]"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 row max-w-9xl gap-2 md:gap-8 mt-12 md:mt-32">
          {cards.map((card) => (
            <div key={card.title}>
              <div className="text-left">
                <div className="flex justify-start mb-4">
                  <div className="p-2 md:p-3 bg-primary/10 rounded-full">
                    {card.icon}
                  </div>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">
                  {card.title}
                </h3>
                <p className="text-xs md:text-base text-muted-foreground mix-blend-difference">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="fixed bottom-0 left-0 right-0 -z-10"
        >
          <path
            fill="#35a454"
            fill-opacity="1"
            d="M0,128L40,138.7C80,149,160,171,240,181.3C320,192,400,192,480,176C560,160,640,128,720,112C800,96,880,96,960,117.3C1040,139,1120,181,1200,208C1280,235,1360,245,1400,250.7L1440,256L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"
          ></path>
        </svg>

        <div className="flex w-full justify-center fixed bottom-0 left-0">
          <p className="max-w-7xl mx-auto text-sm text-white/80 left-0 w-full py-4 text-left px-4">
            Kalkulator ma charakter informacyjny i nie stanowi oficjalnej
            prognozy ZUS.
          </p>
        </div>
      </div>
    </div>
  );
}
