import { useGoogleSignIn } from "@/components/ui/GoogleSignInButton";
import { trackNoticeClicked, trackNoticeShown } from "@/lib/events";
import type { Notice, NoticePlacement } from "@pokenerdle/shared/notices";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getNoticeNamespaces } from "./namespaces";
import { TEMPLATES } from "./templates";

interface NoticeBannerProps {
  notice: Notice;
  placement: NoticePlacement;
}

export const NoticeBanner: React.FC<NoticeBannerProps> = ({
  notice,
  placement,
}) => {
  const { t } = useTranslation(getNoticeNamespaces(notice));
  const navigate = useNavigate();
  const { handleSignIn } = useGoogleSignIn({
    redirectToPath: "/",
    source: `notice:${notice.id}`,
  });

  useEffect(() => {
    trackNoticeShown({ id: notice.id, placement });
  }, [notice.id, placement]);

  const Template = TEMPLATES[notice.template];
  if (!Template) return null;

  const translate = (key?: string) => (key ? t(key) : undefined);

  const onActivate = () => {
    trackNoticeClicked({ id: notice.id, placement });
    if (notice.action.type === "signIn") {
      void handleSignIn();
    } else {
      void navigate({ to: notice.action.href });
    }
  };

  return (
    <Template
      tag={translate(notice.tagKey)}
      title={t(notice.titleKey)}
      body={translate(notice.bodyKey)}
      cta={translate(notice.ctaKey)}
      onActivate={onActivate}
    />
  );
};
