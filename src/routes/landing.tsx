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
    icon: <CheckCircleIcon className="size-8 text-primary" />,
  },
  {
    title: 'Różne scenariusze',
    description:
      'Zobacz jak zmieni się Twoja emerytura w zależności od wieku przejścia i stażu pracy',
    icon: <TrendingUpIcon className="size-8 text-primary" />,
  },
  {
    title: 'Bezpieczeństwo danych',
    description:
      'Wszystkie obliczenia wykonywane są lokalnie w Twojej przeglądarce',
    icon: <ShieldCheckIcon className="size-8 text-primary" />,
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="relative max-w-7xl mx-auto px-6 py-20 pt-24 md:pt-36">
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

        <div className="grid grid-cols-2 md:grid-cols-3 row max-w-9xl gap-2 md:gap-8 mt-12 md:mt-20">
          {cards.map((card) => (
            <div key={card.title}>
              <div className="text-left p-2 md:p-6">
                <div className="flex justify-start mb-4">
                  <div className="p-2 md:p-3 bg-primary/10 rounded-full">
                    <CheckCircleIcon className="size-6 md:size-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">
                  {card.title}
                </h3>
                <p className="text-xs md:text-base text-muted-foreground">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground/80 fixed left-0 bottom-2 w-full p-4 bg-white/20 rounded-lg backdrop-blur-2xl text-left md:text-center px-6">
          Kalkulator ma charakter informacyjny i nie stanowi oficjalnej prognozy
          ZUS.
        </p>
      </div>
    </div>
  );
}
