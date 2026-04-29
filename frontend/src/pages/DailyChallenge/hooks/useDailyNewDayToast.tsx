import { TZDate } from "@date-fns/tz";
import { SINGAPORE_TIMEZONE } from "@pokenerdle/shared/date";
import { useRouter } from "@tanstack/react-router";
import { format } from "date-fns";
import { RefreshCw } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const NEW_DAY_CHECK_INTERVAL_MS = 1000 * 60;
const NEW_DAY_TOAST_ID = "daily-new-day-toast";

const getToday = () => format(TZDate.tz(SINGAPORE_TIMEZONE), "yyyy-MM-dd");

interface UseDailyNewDayToastProps {
  enabled: boolean;
  today: string;
}

export const useDailyNewDayToast = ({
  enabled,
  today,
}: UseDailyNewDayToastProps) => {
  const router = useRouter();
  const { t } = useTranslation("daily");
  const hasShownToastRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      toast.dismiss(NEW_DAY_TOAST_ID);
      hasShownToastRef.current = false;
      return;
    }

    const checkForNewDay = () => {
      const currentDate = getToday();
      if (currentDate === today) {
        toast.dismiss(NEW_DAY_TOAST_ID);
        hasShownToastRef.current = false;
        return;
      }

      if (hasShownToastRef.current) {
        return;
      }

      hasShownToastRef.current = true;
      toast(t("toast.newDayAvailable"), {
        id: NEW_DAY_TOAST_ID,
        duration: Infinity,
        action: {
          label: (
            <div className="tw:flex tw:items-center tw:gap-1">
              {t("toast.refresh")}
              <RefreshCw size="1.25em" />
            </div>
          ),
          onClick: () => {
            toast.dismiss(NEW_DAY_TOAST_ID);
            hasShownToastRef.current = false;
            void router.invalidate();
          },
        },
      });
    };

    checkForNewDay();
    const intervalId = window.setInterval(
      checkForNewDay,
      NEW_DAY_CHECK_INTERVAL_MS,
    );

    return () => {
      window.clearInterval(intervalId);
      toast.dismiss(NEW_DAY_TOAST_ID);
    };
  }, [enabled, router, t, today]);
};
