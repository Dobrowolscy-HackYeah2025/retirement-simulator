import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { ArrowUpRight } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="py-32">
      <div className="container text-foreground">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <Badge variant="outline">
              Poczytaj o aplikacji
              <ArrowUpRight className="ml-2 size-4" />
            </Badge>
            <h1 className="my-6 text-pretty text-4xl font-bold lg:text-6xl">
              Symulator emerytury ZUS
            </h1>
            <p className="text-muted-foreground mb-8 max-w-xl lg:text-xl">
              Sprawdź jaką emeryturę otrzymasz w przyszłości na podstawie swoich
              danych.
            </p>
            <div className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start">
              <Button asChild className="w-full sm:w-auto">
                <a href="/onboarding">Symuluj emeryture</a>
              </Button>
            </div>
          </div>
          {/* <img src={image.src}
            alt={image.alt}
            className="max-h-96 w-full rounded-md object-cover"
          /> */}
        </div>
      </div>
    </section>
  );
};
