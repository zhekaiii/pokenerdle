import { Button } from "@/components/ui/Button";
import React from "react";
import { useTranslation } from "react-i18next";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- prefer type aliases
type ResultPanelProps = {
  onAdvance: () => void;
};

const ResultPanel: React.FC<ResultPanelProps> = ({ onAdvance }) => {
  const { t } = useTranslation("statGuess");

  return (
    <div className="tw:flex tw:justify-center tw:pt-2">
      <Button onClick={onAdvance}>{t("actions.next")}</Button>
    </div>
  );
};

export default ResultPanel;
