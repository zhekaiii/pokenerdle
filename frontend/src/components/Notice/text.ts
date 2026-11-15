import type { Notice } from "@pokenerdle/shared/notices";

export interface NoticeText {
  tag?: string;
  title: string;
  body?: string;
  cta?: string;
}

/**
 * A missing key would render as raw key text, so a missing title hides the
 * notice and a missing optional key is left out.
 */
export const resolveNoticeText = (
  notice: Notice,
  t: (key: string) => string,
  exists: (key: string) => boolean,
): NoticeText | null => {
  if (!exists(notice.titleKey)) return null;
  const optional = (key?: string) => (key && exists(key) ? t(key) : undefined);
  return {
    tag: optional(notice.tagKey),
    title: t(notice.titleKey),
    body: optional(notice.bodyKey),
    cta: optional(notice.ctaKey),
  };
};
