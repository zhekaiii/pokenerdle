import api from "@/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { GoogleSignInButton } from "@/components/ui/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import { DAILY_CHALLENGE_GUESS_LIMIT } from "@/pages/DailyChallenge/constants";
import { DailyChallengeStatsResponse } from "@pokenerdle/shared/daily";
import { sum } from "es-toolkit";
import { TrendingUp } from "lucide-react";
import posthog from "posthog-js";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const StatsDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const { t } = useTranslation("daily");
  const [stats, setStats] = useState<DailyChallengeStatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const maxGuessCount = useMemo(() => {
    return Math.max(...Object.values(stats?.histogram || {}));
  }, [stats]);

  useEffect(() => {
    if (open) posthog.capture("daily_challenge_stats_dialog_opened");
  }, [open]);

  // Fetch user stats when the dialog opens. The backend also accepts a
  // PostHog distinct ID for anonymous users, so we can fetch regardless of
  // auth state.
  useEffect(() => {
    const fetchStats = async () => {
      if (open && !authLoading && !stats && !statsLoading) {
        setStatsLoading(true);
        try {
          const userStats = await api.daily.getStats();
          setStats(userStats);
        } catch (error) {
          console.error("Failed to fetch user stats:", error);
        } finally {
          setStatsLoading(false);
        }
      }
    };

    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only want to run on open change
  }, [open, authLoading]);

  const StatBox = ({
    label,
    value,
    subtitle,
  }: {
    label: React.ReactNode;
    value: React.ReactNode;
    subtitle?: string;
  }) => {
    return (
      <Card responsive className="tw:justify-center">
        <CardContent className="tw:text-center">
          <div className="tw:text-2xl tw:font-bold tw:text-primary">
            {value}
          </div>
          <div className="tw:text-sm tw:text-muted-foreground">{label}</div>
          {subtitle && (
            <div className="tw:text-xs tw:text-muted-foreground tw:mt-1">
              {subtitle}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="tw:flex tw:flex-col tw:overflow-hidden">
        <DialogHeader>
          <DialogTitle className="tw:flex tw:items-center tw:gap-2">
            <TrendingUp className="tw:w-5 tw:h-5 tw:text-primary" />
            Your Daily Challenge Stats
          </DialogTitle>
        </DialogHeader>

        <div className="tw:space-y-4 tw:flex-1 tw:min-h-0 tw:overflow-y-auto tw:-mx-6 tw:px-6">
          {!authLoading && (
            <>
              {statsLoading ? (
                <div className="tw:text-center tw:flex tw:items-center tw:justify-center tw:text-sm tw:h-[352px] tw:max-h-full">
                  Loading your stats...
                </div>
              ) : stats && stats.num_played > 0 ? (
                <div className="tw:relative tw:max-h-full">
                  <Carousel className="tw:w-full" opts={{ loop: true }}>
                    <CarouselContent>
                      <CarouselItem>
                        <div className="tw:grid tw:grid-cols-2 tw:auto-rows-fr tw:gap-4 tw:text-center tw:h-full">
                          <StatBox
                            label="Games Played"
                            value={stats.num_played}
                          />

                          <StatBox
                            label="Win Rate"
                            value={`${stats.win_rate}%`}
                          />

                          <StatBox
                            label="Current Streak"
                            value={stats.streak}
                            subtitle={
                              stats.streak > 0
                                ? "🔥 Keep it going!"
                                : "💪 Start your streak today!"
                            }
                          />

                          <StatBox
                            label="Best Streak"
                            value={stats.max_streak}
                            subtitle={
                              stats.max_streak > 0 &&
                              stats.max_streak === stats.streak
                                ? "🏆 Personal record!"
                                : undefined
                            }
                          />
                        </div>
                      </CarouselItem>
                      <CarouselItem>
                        <div className="tw:space-y-4">
                          <div className="tw:text-center tw:text-sm tw:font-medium tw:mb-4">
                            Guess Distribution
                          </div>
                          <div className="tw:space-y-3">
                            {Array.from(
                              { length: DAILY_CHALLENGE_GUESS_LIMIT },
                              (_, i) => {
                                const guessNum = i + 1;
                                const count = stats.histogram[guessNum] || 0;
                                const percentage =
                                  maxGuessCount > 0
                                    ? (count / maxGuessCount) * 100
                                    : 0;

                                return (
                                  <div
                                    key={guessNum}
                                    className="tw:flex tw:items-center tw:gap-3"
                                  >
                                    <div className="tw:w-8 tw:text-sm tw:font-medium tw:text-muted-foreground">
                                      {guessNum}
                                    </div>
                                    <div className="tw:flex-1 tw:relative">
                                      <div
                                        className="tw:h-6 tw:bg-primary tw:rounded tw:transition-all tw:duration-300"
                                        style={{
                                          width: `${percentage}%`,
                                        }}
                                      />
                                      {count > 0 && (
                                        <div className="tw:absolute tw:left-2 tw:top-1/2 tw:-translate-y-1/2 tw:text-xs tw:font-medium tw:text-primary-foreground">
                                          {count}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              },
                            )}
                          </div>
                          <span>
                            Average Guesses:{" "}
                            {(
                              Object.entries(stats.histogram).reduce(
                                (acc, [guessCount, freq]) =>
                                  acc + Number(guessCount) * freq,
                                0,
                              ) / sum(Object.values(stats.histogram))
                            ).toFixed(1)}
                          </span>
                        </div>
                      </CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious className="tw:-left-4" />
                    <CarouselNext className="tw:-right-4" />
                  </Carousel>
                </div>
              ) : (
                <div className="tw:text-center tw:text-sm tw:text-muted-foreground tw:py-8">
                  No games played yet. Start your PokéNerdle journey today!
                </div>
              )}
            </>
          )}
        </div>

        {!authLoading && !isAuthenticated && (
          <div className="tw:flex tw:flex-col tw:gap-2 tw:pt-2 tw:border-t">
            <p className="tw:text-sm tw:text-muted-foreground tw:text-center">
              {t("auth.persistDisclaimer")}
            </p>
            <GoogleSignInButton
              variant="outline"
              source="daily_challenge_stats_dialog"
            />
          </div>
        )}

        <Button onClick={() => onOpenChange?.(false)} className="tw:w-full">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default StatsDialog;
