import api from "@/api";
import placeholderIcon from "@/assets/question_mark.png";
import LoadingDialog from "@/components/recyclables/LoadingDialog";
import { ImageWithPlaceholder } from "@/components/recyclables/PokemonReferenceDialog/ImageWithPlaceholder";
import { Button } from "@/components/ui/Button";
import { GoogleSignInButton } from "@/components/ui/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import { usePokemonIcons } from "@/hooks/usePokemonIcons";
import { usePokemonNames } from "@/hooks/usePokemonNames";
import { cn } from "@/lib/utils";
import { Route as ArchiveRoute } from "@/routes/daily/archive";
import { DailyChallengeCalendarEntry } from "@pokenerdle/shared/daily";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import clsx from "clsx";
import {
  addMonths,
  format,
  getDay,
  getDaysInMonth,
  isAfter,
  isBefore,
  parse,
  startOfMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DAILY_CHALLENGE_GUESS_LIMIT,
  DAY_1,
  FROZEN_DATE,
  getChallengeNumber,
} from "../constants";
import classes from "./index.module.scss";

type CellKind =
  | { kind: "empty" }
  | {
      kind: "day";
      date: string;
      day: number;
      status: CellStatus;
      isToday: boolean;
    };

type CellStatus = "solved" | "failed" | "unplayed" | "today" | "future";

const formatMonth = (d: Date) => format(d, "yyyy-MM");
const formatDate = (d: Date) => format(d, "yyyy-MM-dd");
const DAY_1_STR = format(DAY_1, "yyyy-MM-dd");

const buildCells = (
  monthStart: Date,
  entriesByDate: Map<string, DailyChallengeCalendarEntry>,
  today: string,
): CellKind[] => {
  const cells: CellKind[] = [];
  const firstWeekday = getDay(monthStart); // 0 = Sun
  for (let i = 0; i < firstWeekday; i++) cells.push({ kind: "empty" });

  const totalDays = getDaysInMonth(monthStart);
  for (let d = 1; d <= totalDays; d++) {
    const dayDate = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth(),
      d,
    );
    const dateStr = formatDate(dayDate);
    const isToday = dateStr === today;

    let status: CellStatus;
    if (dateStr > today || dateStr < DAY_1_STR) {
      status = "future";
    } else {
      const entry = entriesByDate.get(dateStr);
      if (entry) {
        status = entry.solved ? "solved" : "failed";
      } else if (isToday) {
        status = "today";
      } else {
        status = "unplayed";
      }
    }

    cells.push({ kind: "day", day: d, date: dateStr, status, isToday });
  }
  return cells;
};

const CalendarArchivePage: React.FC = () => {
  const { t } = useTranslation("daily");
  const { getPokemonIcon } = usePokemonIcons();
  const pokemonNames = usePokemonNames();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { month: initialMonth, data: initialData } =
    ArchiveRoute.useLoaderData();
  const search = ArchiveRoute.useSearch();
  const navigate = useNavigate({ from: ArchiveRoute.fullPath });

  const today = FROZEN_DATE;
  const todayDate = useMemo(() => new Date(today), [today]);
  const firstMonth = useMemo(
    () => startOfMonth(new Date(DAY_1.getFullYear(), DAY_1.getMonth(), 1)),
    [],
  );
  const currentMonthStart = useMemo(() => startOfMonth(todayDate), [todayDate]);

  const viewMonth = useMemo(() => {
    if (search.month) {
      const parsed = parse(search.month, "yyyy-MM", new Date());
      if (!Number.isNaN(parsed.getTime())) return startOfMonth(parsed);
    }
    return currentMonthStart;
  }, [search.month, currentMonthStart]);

  const [selectedDate, setSelectedDate] = useState<string | null>(
    viewMonth === currentMonthStart ? today : null,
  );

  const monthKey = formatMonth(viewMonth);

  const setViewMonth = (next: Date) => {
    const nextKey = formatMonth(next);
    const isCurrentMonth = nextKey === formatMonth(currentMonthStart);
    setSelectedDate(isCurrentMonth ? today : null);
    void navigate({
      search: (prev) => ({
        ...prev,
        month: isCurrentMonth ? undefined : nextKey,
      }),
      replace: false,
    });
  };

  const { data: calendarData, isFetching } = useQuery({
    queryKey: ["dailyCalendar", monthKey],
    queryFn: () => api.daily.getCalendar(monthKey),
    staleTime: 1000 * 60 * 5,
    initialData:
      monthKey === initialMonth && initialData ? initialData : undefined,
  });

  const entriesByDate = useMemo(() => {
    const map = new Map<string, DailyChallengeCalendarEntry>();
    for (const entry of calendarData?.entries ?? []) {
      map.set(entry.date, entry);
    }
    return map;
  }, [calendarData]);

  const cells = useMemo(
    () => buildCells(viewMonth, entriesByDate, today),
    [viewMonth, entriesByDate, today],
  );

  const canGoPrev = isAfter(viewMonth, firstMonth);
  const canGoNext = isBefore(viewMonth, startOfMonth(todayDate));

  const goPrev = () => {
    if (canGoPrev) setViewMonth(addMonths(viewMonth, -1));
  };
  const goNext = () => {
    if (canGoNext) setViewMonth(addMonths(viewMonth, 1));
  };

  const selectedEntry = selectedDate
    ? entriesByDate.get(selectedDate)
    : undefined;
  const selectedStatus: CellStatus | null = useMemo(() => {
    if (!selectedDate) return null;
    const cell = cells.find((c) => c.kind === "day" && c.date === selectedDate);
    return cell && cell.kind === "day" ? cell.status : null;
  }, [cells, selectedDate]);

  const handleCellClick = (cell: CellKind) => {
    if (cell.kind !== "day" || cell.status === "future") return;
    setSelectedDate((prev) => (prev === cell.date ? null : cell.date));
  };

  const weekdayLabels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(2024, 0, 7 + i); // Jan 7 2024 was Sunday
        return format(d, "EEEEE");
      }),
    [],
  );

  return (
    <div className={classes.Archive}>
      <h1 className={classes.Title}>{t("archive.title")}</h1>
      <div className={classes.Subtitle}>{t("archive.subtitle")}</div>

      <div className={classes.MonthNav}>
        <button
          type="button"
          className={classes.NavArrow}
          onClick={goPrev}
          disabled={!canGoPrev}
          aria-label={t("archive.prevMonth")}
        >
          <ChevronLeft />
        </button>
        <div className={classes.MonthLabel}>
          {format(viewMonth, "MMMM yyyy")}
        </div>
        <button
          type="button"
          className={classes.NavArrow}
          onClick={goNext}
          disabled={!canGoNext}
          aria-label={t("archive.nextMonth")}
        >
          <ChevronRight />
        </button>
      </div>

      <div className={classes.Weekdays}>
        {weekdayLabels.map((label, i) => (
          <div key={i}>{label}</div>
        ))}
      </div>

      <LoadingDialog open={isFetching} />

      <div className={classes.Grid} aria-busy={isFetching || undefined}>
        {cells.map((cell, i) => {
          if (cell.kind === "empty") {
            return (
              <div
                key={`e-${i}`}
                className={clsx(classes.Cell, classes["Cell--empty"])}
              />
            );
          }
          const isResult = cell.status === "solved" || cell.status === "failed";
          const isSelected = selectedDate === cell.date;
          const entry = entriesByDate.get(cell.date);
          const spriteUrl =
            isResult && entry ? getPokemonIcon(entry.pokemonId) : null;

          return (
            <button
              key={cell.date}
              type="button"
              className={cn(
                classes.Cell,
                classes[`Cell--${cell.status}`],
                cell.isToday && classes["Cell--today"],
                isSelected && classes["Cell--selected"],
              )}
              onClick={() => handleCellClick(cell)}
              disabled={cell.status === "future"}
              aria-label={cell.date}
            >
              {isResult && spriteUrl ? (
                <>
                  <span className={classes.DayNum}>{cell.day}</span>
                  <div className={classes.Pkmn}>
                    <ImageWithPlaceholder
                      src={spriteUrl}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = placeholderIcon;
                      }}
                    />
                  </div>
                  {cell.status === "failed" && (
                    <div className={classes.CornerX}>
                      <X />
                    </div>
                  )}
                </>
              ) : (
                <span>{cell.day}</span>
              )}
            </button>
          );
        })}
      </div>

      <SelectedPreview
        selectedDate={selectedDate}
        status={selectedStatus}
        entry={selectedEntry}
        pokemonName={
          selectedEntry
            ? (pokemonNames[selectedEntry.pokemonId]?.name ??
              pokemonNames[selectedEntry.pokemonId]?.speciesName ??
              undefined)
            : undefined
        }
        spriteUrl={
          selectedEntry ? getPokemonIcon(selectedEntry.pokemonId) : undefined
        }
      />

      <div className={classes.Legend}>
        <span>
          <span className={clsx(classes.Swatch, classes["Swatch--solved"])} />
          {t("archive.legend.solved")}
        </span>
        <span>
          <span className={clsx(classes.Swatch, classes["Swatch--failed"])} />
          {t("archive.legend.failed")}
        </span>
        <span>
          <span className={classes.Swatch} />
          {t("archive.legend.unplayed")}
        </span>
      </div>

      {!authLoading && !isAuthenticated && (
        <div className="tw:flex tw:flex-col tw:gap-2 tw:mt-4">
          <p className="tw:text-sm tw:text-muted-foreground tw:text-center">
            {t("auth.persistDisclaimer")}
          </p>
          <GoogleSignInButton
            variant="outline"
            source="daily_challenge_archive"
          />
        </div>
      )}
    </div>
  );
};

interface PreviewProps {
  selectedDate: string | null;
  status: CellStatus | null;
  entry: DailyChallengeCalendarEntry | undefined;
  pokemonName: string | undefined;
  spriteUrl: string | undefined;
}

const SelectedPreview: React.FC<PreviewProps> = ({
  selectedDate,
  status,
  entry,
  pokemonName,
  spriteUrl,
}) => {
  const { t } = useTranslation("daily");

  if (!selectedDate || status === null || status === "future") {
    return (
      <div className={clsx(classes.Preview, classes["Preview--empty"])}>
        {t("archive.preview.empty")}
      </div>
    );
  }

  const challengeNumber = getChallengeNumber(selectedDate);
  const dateLabel = format(new Date(selectedDate), "MMM d");
  const subLabel = `${dateLabel} · ${t("archive.preview.challengeNumber", {
    number: challengeNumber,
  })}`;

  if (status === "unplayed" || status === "today") {
    const isToday = status === "today";
    return (
      <div className={classes.Preview}>
        <div className={classes.PreviewMeta}>
          <div className={classes.PreviewName}>
            {isToday
              ? t("archive.preview.todayTitle")
              : t("archive.preview.unplayedTitle")}
          </div>
          <div className={classes.PreviewSub}>{subLabel}</div>
        </div>
        <div className={classes.PreviewAction}>
          <Button asChild size="sm">
            <Link to="/daily" search={isToday ? {} : { date: selectedDate }}>
              {t("archive.preview.play")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!entry) return null;

  const ctaLabel =
    status === "solved"
      ? t("archive.preview.review")
      : t("archive.preview.retry");

  const attemptsLabel = t("archive.preview.attempts", {
    count: entry.attempts,
    total: DAILY_CHALLENGE_GUESS_LIMIT,
  });

  return (
    <div className={classes.Preview}>
      {spriteUrl && (
        <img
          className={classes.PreviewSprite}
          src={spriteUrl}
          alt={pokemonName ?? ""}
        />
      )}
      <div className={classes.PreviewMeta}>
        <div className={classes.PreviewName}>
          {pokemonName ?? `#${entry.pokemonId}`}
        </div>
        <div className={classes.PreviewSub}>{subLabel}</div>
        <div className={classes.PreviewSub}>{attemptsLabel}</div>
      </div>
      <div className={classes.PreviewAction}>
        <Button
          asChild
          size="sm"
          variant={status === "solved" ? "outline" : "default"}
        >
          <Link to="/daily" search={{ date: selectedDate }}>
            {ctaLabel}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default CalendarArchivePage;
