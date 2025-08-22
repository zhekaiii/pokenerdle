import dailyApi from "@/api/daily";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useAuth } from "@/hooks/useAuth";
import { DailyChallengeStatsResponse } from "@pokenerdle/shared/daily";
import { TrendingUp } from "lucide-react";
import React, { useEffect, useState } from "react";

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const StatsDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DailyChallengeStatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch user stats when dialog opens and user is authenticated
  useEffect(() => {
    const fetchStats = async () => {
      if (open && isAuthenticated && !authLoading && !stats && !statsLoading) {
        setStatsLoading(true);
        try {
          const userStats = await dailyApi.getStats();
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
  }, [open, isAuthenticated, authLoading]);

  if (!authLoading && !isAuthenticated) {
    return null;
  }

  const getStatBox = ({
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="tw:flex tw:items-center tw:gap-2">
            <TrendingUp className="tw:w-5 tw:h-5 tw:text-primary" />
            Your Daily Challenge Stats
          </DialogTitle>
        </DialogHeader>

        <div className="tw:space-y-4">
          {!isAuthenticated && !authLoading && (
            <div className="tw:text-center tw:text-muted-foreground">
              Sign in to view your stats!
            </div>
          )}

          {isAuthenticated && !authLoading && (
            <div>
              {statsLoading ? (
                <div className="tw:text-center tw:text-sm tw:text-muted-foreground tw:py-8">
                  Loading your stats...
                </div>
              ) : stats ? (
                <div className="tw:space-y-4">
                  <div className="tw:grid tw:grid-cols-2 tw:auto-rows-fr tw:gap-4 tw:text-center">
                    {getStatBox({
                      label: "Games Played",
                      value: stats.num_played,
                    })}

                    {getStatBox({
                      label: "Win Rate",
                      value: `${stats.win_rate}%`,
                    })}

                    {getStatBox({
                      label: "Current Streak",
                      value: stats.streak,
                      subtitle:
                        stats.streak > 0
                          ? "🔥 Keep it going!"
                          : "💪 Start your streak today!",
                    })}

                    {getStatBox({
                      label: "Best Streak",
                      value: stats.max_streak,
                      subtitle:
                        stats.max_streak > 0 &&
                        stats.max_streak === stats.streak
                          ? "🏆 Personal record!"
                          : undefined,
                    })}
                  </div>

                  {stats.num_played === 0 && (
                    <div className="tw:text-center tw:text-sm tw:text-muted-foreground">
                      No games played yet. Start your Pokémon journey today!
                    </div>
                  )}
                </div>
              ) : (
                <div className="tw:text-center tw:text-sm tw:text-muted-foreground tw:py-8">
                  Unable to load stats. Please try again later.
                </div>
              )}
            </div>
          )}

          <Button onClick={() => onOpenChange?.(false)} className="tw:w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatsDialog;
