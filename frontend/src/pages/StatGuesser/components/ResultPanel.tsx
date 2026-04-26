import { Button } from "@/components/ui/Button";
import React from "react";
import { useTranslation } from "react-i18next";

interface ResultPanelProps {
  onAdvance: () => void;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ onAdvance }) => {
  const { t } = useTranslation("statGuesser");

  return (
    <div className="tw:flex tw:justify-center tw:pt-2">
      <Button onClick={onAdvance}>{t("actions.next")}</Button>
    </div>
  );
};

export default ResultPanel;
