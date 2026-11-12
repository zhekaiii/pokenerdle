import { BugIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import classes from "./SiteFooter.module.scss";

const SiteFooter: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <div className={classes.SiteFooterWrapper}>
      <footer className={classes.SiteFooter}>
        <a
          className={classes.ReportBug}
          href="https://github.com/zhekaiii/pokenerdle/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          <BugIcon aria-hidden="true" />
          {t("footer.reportBug")}
        </a>
        <nav className={classes.Links}>
          <a href="/privacy.html" target="_blank" rel="noopener noreferrer">
            {t("footer.privacyPolicy")}
          </a>
          <span className={classes.Separator} aria-hidden="true">
            ·
          </span>
          <a href="/terms.html" target="_blank" rel="noopener noreferrer">
            {t("footer.termsOfService")}
          </a>
        </nav>
      </footer>
    </div>
  );
};

export default SiteFooter;
