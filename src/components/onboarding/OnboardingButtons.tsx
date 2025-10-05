import { useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../components/ui/tooltip';

export const OnboardingButtons = ({
  previousUrl,
  nextUrl,
  onNextClick,
  disabledTooltipText,
}: {
  previousUrl: string;
  nextUrl?: string;
  onNextClick?: () => void;
  disabledTooltipText?: string;
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full">
            <Button
              className="w-full"
              disabled={Boolean(disabledTooltipText)}
              onClick={() => {
                if (onNextClick) {
                  onNextClick();
                } else if (nextUrl) {
                  navigate(nextUrl);
                }
              }}
            >
              Kontynuuj
            </Button>
          </div>
        </TooltipTrigger>

        {Boolean(disabledTooltipText) && (
          <TooltipContent side="top">
            <p>{disabledTooltipText}</p>
          </TooltipContent>
        )}
      </Tooltip>

      <Button
        variant="ghost"
        className="text-muted-foreground"
        onClick={() => navigate(previousUrl)}
      >
        Wróć
      </Button>
    </div>
  );
};
