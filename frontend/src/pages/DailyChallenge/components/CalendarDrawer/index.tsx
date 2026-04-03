import api from "@/api";
import { Button } from "@/components/ui/Button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/Drawer";
import { cn } from "@/lib/utils";
import { DailyChallengeCalendarEntry } from "@pokenerdle/shared/daily";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DAY_1, FROZEN_DATE } from "../../constants";
import { TZDate } from "@date-fns/tz";
import { SINGAPORE_TIMEZONE } from "@pokenerdle/shared/date";
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isBefore,
  isAfter,
  isSameDay,
} from "date-fns";

const SPRITE_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-viii/icons";

interface Props {
  currentDate?: string;
}

const CalendarDrawer: React.FC<Props> = ({ currentDate }) => {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = currentDate ? new Date(currentDate + "T00:00:00") : new Date();
    return startOfMonth(d);
  });
  const [entries, setEntries] = useState<DailyChallengeCalendarEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation("daily");

  const fetchCalendar = useCallback(async (month: Date) => {
    try {
      setLoading(true);
      const monthStr = format(month, "yyyy-MM");
      const result = await api.daily.getCalendar(monthStr);
      setEntries(result.entries);
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchCalendar(viewMonth);
    }
  }, [open, viewMonth, fetchCalendar]);

  const today = new TZDate(FROZEN_DATE, SINGAPORE_TIMEZONE);
  const day1Date = DAY_1;

  const canGoBack = isAfter(startOfMonth(viewMonth), startOfMonth(day1Date));
  const canGoForward = isBefore(startOfMonth(viewMonth), startOfMonth(today));

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart); // 0=Sun

  const entryMap = new Map(entries.map((e) => [e.date, e]));

  const onSelectDate = (date: string) => {
    setOpen(false);
    const activeDate = currentDate ?? FROZEN_DATE;
    if (date === activeDate) return;
    if (date === FROZEN_DATE) {
      navigate({ to: "/daily", search: {} });
    } else {
      navigate({ to: "/daily", search: { date } });
    }
  };

  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="secondary" size="sm">
          <Calendar className="tw:size-4" />
          {t("buttons.pastChallenges")}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("calendar.title")}</DrawerTitle>
          <DrawerDescription>{t("calendar.description")}</DrawerDescription>
        </DrawerHeader>
        <div className="tw:px-5 tw:pb-6">
          {/* Month navigation */}
          <div className="tw:flex tw:justify-between tw:items-center tw:mb-3">
            <Button
              variant="ghost"
              size="icon"
              disabled={!canGoBack}
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
            >
              <ChevronLeft className="tw:size-4" />
            </Button>
            <span className="tw:font-semibold tw:text-sm">
              {format(viewMonth, "MMMM yyyy")}
            </span>
            <Button
              variant="ghost"
              size="icon"
              disabled={!canGoForward}
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
            >
              <ChevronRight className="tw:size-4" />
            </Button>
          </div>

          {/* Day headers */}
          <div className="tw:grid tw:grid-cols-7 tw:gap-1 tw:text-center tw:mb-2">
            {dayHeaders.map((d) => (
              <div
                key={d}
                className="tw:text-xs tw:text-muted-foreground tw:font-medium tw:py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="tw:grid tw:grid-cols-7 tw:gap-1">
            {/* Empty cells before month starts */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Day cells */}
            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const entry = entryMap.get(dateStr);
              const isBeforeDay1 = isBefore(day, day1Date);
              const isFutureOrToday =
                isAfter(day, today) || isSameDay(day, today);
              const isDisabled = isBeforeDay1 || isFutureOrToday;
              const isSelected = dateStr === (currentDate ?? FROZEN_DATE);

              return (
                <button
                  key={dateStr}
                  disabled={isDisabled}
                  onClick={() => onSelectDate(dateStr)}
                  className={cn(
                    "tw:relative tw:flex tw:flex-col tw:items-center tw:justify-center tw:min-h-[48px] tw:rounded-md tw:transition-colors",
                    isDisabled
                      ? "tw:opacity-30 tw:cursor-not-allowed"
                      : "tw:bg-secondary tw:hover:bg-accent tw:cursor-pointer",
                    isSelected && "tw:ring-2 tw:ring-ring"
                  )}
                >
                  {entry ? (
                    <>
                      <span className="tw:absolute tw:top-0.5 tw:right-1.5 tw:text-[10px] tw:text-muted-foreground">
                        {day.getDate()}
                      </span>
                      <div className="tw:relative tw:mt-1">
                        <img
                          src={`${SPRITE_BASE_URL}/${entry.pokemonId}.png`}
                          alt=""
                          className={cn(
                            "tw:w-[30px] tw:h-[30px]",
                            !entry.solved && "tw:opacity-40"
                          )}
                          style={{ imageRendering: "pixelated" }}
                        />
                        {!entry.solved && (
                          <svg
                            className="tw:absolute tw:inset-0 tw:w-full tw:h-full tw:text-destructive"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          >
                            <line x1="6" y1="6" x2="18" y2="18" />
                            <line x1="18" y1="6" x2="6" y2="18" />
                          </svg>
                        )}
                      </div>
                    </>
                  ) : (
                    <span className="tw:text-sm">{day.getDate()}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CalendarDrawer;
