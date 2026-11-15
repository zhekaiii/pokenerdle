import GoogleIcon from "@/assets/google.svg?react";
import { useGoogleSignIn } from "@/components/ui/GoogleSignInButton";
import { trackNoticeClicked, trackNoticeShown } from "@/lib/events";
import type { Notice, NoticeAction, NoticePlacement } from "@pokenerdle/shared/notices";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getNoticeNamespaces } from "./namespaces";
import { TEMPLATES } from "./templates";
import { resolveNoticeText } from "./text";

// Icon per action type, so a CTA says where it leads without more words.
const CTA_ICONS: Partial<Record<NoticeAction["type"], React.ReactNode>> = {
  signIn: <GoogleIcon className="tw:size-3" />,
};

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
    redirectToPath: import.meta.env.SSR ? "/" : location.pathname + location.search,
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

  const action = notice.action;
  const onActivate = action
    ? () => {
        trackNoticeClicked({ id: notice.id, placement });
        if (action.type === "signIn") {
          void handleSignIn();
        } else {
          void navigate({ to: action.href });
        }
      }
    : undefined;

  return (
    <Template
      {...text}
      ctaIcon={action && CTA_ICONS[action.type]}
      onActivate={onActivate}
    />
  );
};
