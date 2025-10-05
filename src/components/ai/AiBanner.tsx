import { useEffect } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { useAtom, useAtomValue } from 'jotai';
import { BrainIcon, CheckCircleIcon, Loader2 } from 'lucide-react';

import {
  dashboardSummaryQueryAtom,
  showAiBannerAtom,
  showAiSummaryAtom,
} from '../../lib/atoms';

const SAMPLE_AI_SUMMARY = `
 Masz 31 lat. Jestes super zdrowy i aktywny. Masz 100000 zl na koncie emerytalnym.
 Masz 10000 zl na koncie oszczędnościowym.
 Masz 10000 zl na koncie inwestycyjnym.
 Masz 10000 zl na koncie oszczędnościowym. Powinienes muc przejsc na emeryturem.
 Masz 10000 zl na koncie oszczędnościowym. Powinienes muc przejsc na emeryturem.
 Masz 10000 zl na koncie oszczędnościowym. Powinienes muc przejsc na emeryturem.
 Masz 10000 zl na koncie oszczędnościowym. Powinienes muc przejsc na emeryturem.
`;

export const AiBanner = () => {
  const [showAiBanner, setShowAiBanner] = useAtom(showAiBannerAtom);
  const [showAiSummary, setShowAiSummary] = useAtom(showAiSummaryAtom);
  const summaryQuery = useAtomValue(dashboardSummaryQueryAtom);

  const handleIgnoreNotification = () => {
    setShowAiBanner(false);
  };

  const handleShowSummary = () => {
    setShowAiSummary(true);
  };

  // Automatically show summary when data is received
  useEffect(() => {
    if (summaryQuery.isSuccess && summaryQuery.data) {
      setShowAiSummary(true);
    }
  }, [summaryQuery.isSuccess, summaryQuery.data, setShowAiSummary]);

  if (!showAiBanner) {
    return null;
  }

  const isLoading = summaryQuery.isPending;
  const summaryData = summaryQuery.data;
  const hasError = summaryQuery.isError;

  // Change color to light green when summary is ready
  const backgroundColor = showAiSummary
    ? '#00993f40' // Light green accent
    : '#FFB34F'; // Orange
  const textColor = showAiSummary ? '#10331e' : '#10331e';
  const borderColor = showAiSummary ? '#10331e20' : 'transparent';

  if (hasError) {
    return null;
  }

  return (
    <motion.div
      className="w-full overflow-hidden"
      style={{
        backgroundColor,
        color: textColor,
        borderStyle: 'solid',
        borderTopWidth: '1px',
        borderBottomWidth: '1px',
      }}
      initial={{ height: 'auto' }}
      animate={{
        height: 'auto',
        backgroundColor,
        borderColor,
      }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="p-2 text-sm px-7"
          >
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin [animation-duration:2s]" />
              <span>Generujemy dla Ciebie podsumowanie...</span>
            </div>
          </motion.div>
        ) : showAiSummary ? (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="p-2 text-sm px-7"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex items-start gap-2"
            >
              <BrainIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />

              <div className="text-sm">
                <span className="underline font-medium">
                  Podsumowanie AI (może popełniać błędy):
                </span>{' '}
                {hasError
                  ? 'Nie udało się wygenerować podsumowania. Spróbuj ponownie później.'
                  : summaryData?.summary || SAMPLE_AI_SUMMARY}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="p-2 text-sm px-7 flex gap-2"
          >
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4" />
              <span>Podsumowanie gotowe - </span>
            </div>

            <div className="text-sm">
              <span
                className="underline cursor-pointer"
                onClick={handleShowSummary}
              >
                zobacz podsumowanie
              </span>{' '}
              <span>lub</span>{' '}
              <span
                className="underline cursor-pointer"
                onClick={handleIgnoreNotification}
              >
                ignoruj powiadomienie.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
