import { Button } from "@/components/ui/Button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { getChallengeNumber } from "../constants";

interface Props {
  date: string;
}

const ArchiveBanner: React.FC<Props> = ({ date }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("daily");
  const challengeNum = getChallengeNumber(date);
  const displayDate = new Date(date + "T00:00:00").toLocaleDateString(
    undefined,
    { year: "numeric", month: "short", day: "numeric" }
  );

  return (
    <div className="tw:bg-card tw:border tw:border-border tw:rounded-lg tw:px-4 tw:py-2.5 tw:mb-3 tw:flex tw:justify-between tw:items-center tw:w-full tw:max-w-[400px]">
      <div className="tw:text-sm">
        <span className="tw:font-medium">
          {t("challengeNumber", { number: challengeNum })}
        </span>
        <span className="tw:text-muted-foreground tw:mx-1.5">&mdash;</span>
        <span className="tw:text-muted-foreground">{displayDate}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate({ to: "/daily", search: {} })}
      >
        <ArrowLeft className="tw:size-3.5" />
        {t("buttons.backToToday")}
      </Button>
    </div>
  );
};

export default ArchiveBanner;
