import { useGoogleSignIn } from "@/components/ui/GoogleSignInButton";
import { trackNoticeClicked, trackNoticeShown } from "@/lib/events";
import type { Notice, NoticePlacement } from "@pokenerdle/shared/notices";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getNoticeNamespaces } from "./namespaces";
import { TEMPLATES } from "./templates";
import { resolveNoticeText } from "./text";

interface NoticeBannerProps {
  notice: Notice;
  placement: NoticePlacement;
}

export const NoticeBanner: React.FC<NoticeBannerProps> = ({
  notice,
  placement,
}) => {
  const { t, i18n } = useTranslation(getNoticeNamespaces(notice));
  const navigate = useNavigate();
  const { handleSignIn } = useGoogleSignIn({
    redirectToPath: "/",
    source: `notice:${notice.id}`,
  });

  const Template = TEMPLATES[notice.template] as
    | (typeof TEMPLATES)[keyof typeof TEMPLATES]
    | undefined;
  const text = resolveNoticeText(notice, t, (key) => i18n.exists(key));
  const visible = Boolean(Template && text);

  useEffect(() => {
    if (visible) trackNoticeShown({ id: notice.id, placement });
  }, [visible, notice.id, placement]);

  if (!Template || !text) return null;

  const onActivate = () => {
    if (!notice.action) return;
    trackNoticeClicked({ id: notice.id, placement });
    if (notice.action.type === "signIn") {
      void handleSignIn();
    } else {
      void navigate({ to: notice.action.href });
    }
  };

  return (
    <Template {...text} onActivate={onActivate} />
  );
};
