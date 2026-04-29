import { Button } from "@/components/ui/Button";
import { GoogleSignInButton } from "@/components/ui/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { getRouteApi, Link } from "@tanstack/react-router";
import {
  Calendar,
  Check,
  ChevronRight,
  Link as LinkIcon,
  MapPin,
  SlidersHorizontal,
} from "lucide-react";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { TZDate } from "@date-fns/tz";
import { SINGAPORE_TIMEZONE } from "@pokenerdle/shared/date";
import { format } from "date-fns";
import { getChallengeNumber } from "../DailyChallenge/constants";
import classes from "./HomePage.module.scss";

export interface HomeSummary {
  guesses: DailyChallengeGuessResponse[] | null;
  streak: number;
  winRate: number;
}

const homeRoute = getRouteApi("/");

type ModeStatus = "solved" | "inProgress" | "notPlayed";

const TYPE_COLORS = {
  daily: "var(--water-type)",
  pokeChain: "var(--fighting-type)",
  pathFinder: "var(--grass-type)",
  statGuesser: "var(--psychic-type)",
} as const;

const getDailyStatus = (
  guesses: DailyChallengeGuessResponse[] | null,
): ModeStatus => {
  if (!guesses || guesses.length === 0) return "notPlayed";
  if (guesses.some((g) => g.correct)) return "solved";
  return "inProgress";
};

interface ModeIconProps {
  color: string;
  children: React.ReactNode;
}

const ModeIcon: React.FC<ModeIconProps> = ({ color, children }) => (
  <div className={classes.ModeIcon} style={{ background: color }}>
    {children}
  </div>
);

interface StatusPillProps {
  status: ModeStatus;
}

const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  const { t } = useTranslation("home");
  const variant =
    status === "solved"
      ? classes["StatusPill--solved"]
      : status === "inProgress"
        ? classes["StatusPill--amber"]
        : classes["StatusPill--muted"];
  return (
    <span className={`${classes.StatusPill} ${variant}`}>
      {status === "solved" && <Check className="tw:size-3" />}
      {t(`status.${status}`)}
    </span>
  );
};

interface ModeCardProps {
  color: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  status?: ModeStatus;
  to: string;
  cta: string;
  ctaVariant?: "default" | "outline";
  body?: React.ReactNode;
  footExtra?: React.ReactNode;
}

const ModeCard: React.FC<ModeCardProps> = ({
  color,
  icon,
  title,
  subtitle,
  status,
  to,
  cta,
  ctaVariant = "default",
  body,
  footExtra,
}) => (
  <Link to={to} className={classes.CardLink}>
    <div className={classes.Card}>
      <div className={classes.Stripe} style={{ background: color }} />
      <div className={classes.CardHead}>
        <ModeIcon color={color}>{icon}</ModeIcon>
        <div className={classes.CardHeadMeta}>
          <div className={classes.CardTitle}>{title}</div>
          {subtitle && <div className={classes.CardSubtitle}>{subtitle}</div>}
        </div>
        {status && <StatusPill status={status} />}
      </div>
      {body && <div className={classes.CardBody}>{body}</div>}
      <div className={classes.CardFoot}>
        <div className={classes.FootExtra}>{footExtra}</div>
        <Button size="sm" variant={ctaVariant} asChild>
          <span>
            {cta}
            <ChevronRight className="tw:size-4" />
          </span>
        </Button>
      </div>
    </div>
  </Link>
);

interface StatProps {
  value: React.ReactNode;
  label: string;
}

const Stat: React.FC<StatProps> = ({ value, label }) => (
  <div className={classes.Stat}>
    <div className={classes.StatValue}>{value}</div>
    <div className={classes.StatLabel}>{label}</div>
  </div>
);

interface GuessDotsProps {
  guesses: DailyChallengeGuessResponse[] | null;
  solved: boolean;
}

const GuessDots: React.FC<GuessDotsProps> = ({ guesses, solved }) => {
  const made = guesses?.length ?? 0;
  return (
    <div className={classes.GuessDots}>
      {Array.from({ length: 8 }).map((_, i) => {
        const isLast = i + 1 === made && solved;
        const isFilled = i < made;
        const className = `${classes.GuessDot} ${
          isLast
            ? classes["GuessDot--solved"]
            : isFilled
              ? classes["GuessDot--failed"]
              : ""
        }`;
        return <div key={i} className={className} />;
      })}
    </div>
  );
};

const HomePage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useTranslation("home");
  const summary = homeRoute.useLoaderData();

  const displayName = isAuthenticated
    ? ((
        user?.user_metadata as { full_name?: string; name?: string } | undefined
      )?.full_name ??
      (user?.user_metadata as { full_name?: string; name?: string } | undefined)
        ?.name ??
      user?.email?.split("@")[0] ??
      "")
    : t("guestName");

  const dailyStatus = getDailyStatus(summary?.guesses ?? null);
  const dailyTriesLabel =
    summary?.guesses && summary.guesses.length > 0
      ? `${summary.guesses.length}/8`
      : "—";
  const challengeNumber = useMemo(() => {
    return getChallengeNumber(
      format(TZDate.tz(SINGAPORE_TIMEZONE), "yyyy-MM-dd"),
    );
  }, []);

  return (
    <div className={classes.HomePage}>
      <div className={classes.Column}>
        <div className={classes.Greeting}>
          <div className={classes.GreetingLine}>
            {isAuthenticated ? t("greeting.signedIn") : t("greeting.signedOut")}
          </div>
          <div className={classes.GreetingName}>{displayName} 👋</div>
        </div>

        <ModeCard
          color={TYPE_COLORS.daily}
          icon={<Calendar className="tw:size-5 tw:text-white" />}
          title={t("modes.daily.title")}
          subtitle={t("modes.daily.challengeLabel", {
            number: challengeNumber,
          })}
          status={dailyStatus}
          to="/daily"
          cta={
            dailyStatus === "solved"
              ? t("modes.daily.ctaResults")
              : dailyStatus === "inProgress"
                ? t("modes.daily.ctaResume")
                : t("modes.daily.ctaPlay")
          }
          ctaVariant={dailyStatus === "solved" ? "outline" : "default"}
          body={
            <div className={classes.StatRow}>
              <Stat
                value={
                  <span className={classes.Streak}>
                    {`${summary?.streak ?? 0} 🔥`}
                  </span>
                }
                label={t("stats.dayStreak")}
              />
              <Stat value={dailyTriesLabel} label={t("stats.todaysTries")} />
              <Stat
                value={`${summary?.winRate ?? 0}%`}
                label={t("stats.winRate")}
              />
              <div className={classes.StatRowSpacer} />
              <GuessDots
                guesses={summary?.guesses ?? null}
                solved={dailyStatus === "solved"}
              />
            </div>
          }
        />

        <ModeCard
          color={TYPE_COLORS.pokeChain}
          icon={<LinkIcon className="tw:size-5 tw:text-white" />}
          title={t("modes.pokeChain.title")}
          subtitle={t("modes.pokeChain.subtitle")}
          to="/pokechain"
          cta={t("modes.pokeChain.ctaFindMatch")}
          body={
            <div className={classes.CardDescription}>
              {t("modes.pokeChain.shortDesc")}
            </div>
          }
        />

        <ModeCard
          color={TYPE_COLORS.pathFinder}
          icon={<MapPin className="tw:size-5 tw:text-white" />}
          title={t("modes.pathFinder.title")}
          subtitle={t("modes.pathFinder.subtitle")}
          to="/path-finder"
          cta={t("modes.pathFinder.ctaStart")}
          body={
            <div className={classes.CardDescription}>
              {t("modes.pathFinder.shortDesc")}
            </div>
          }
        />

        <ModeCard
          color={TYPE_COLORS.statGuesser}
          icon={<SlidersHorizontal className="tw:size-5 tw:text-white" />}
          title={t("modes.statGuesser.title")}
          subtitle={t("modes.statGuesser.subtitle")}
          to="/stat-guesser"
          cta={t("modes.statGuesser.ctaStart")}
          body={
            <div className={classes.CardDescription}>
              {t("modes.statGuesser.shortDesc")}
            </div>
          }
        />

        {!isAuthenticated && !authLoading && (
          <GoogleSignInButton
            variant="outline"
            className="tw:w-full"
            redirectToPath="/"
            source="homepage"
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
