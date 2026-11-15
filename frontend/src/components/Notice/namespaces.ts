import type { Notice } from "@pokenerdle/shared/notices";

export const DEFAULT_NOTICE_NAMESPACE = "notices";

/** Locale namespaces a notice's keys need, "notices" first (the default). */
export const getNoticeNamespaces = (notice: Notice): string[] => {
  const keys = [notice.titleKey, notice.bodyKey, notice.tagKey, notice.ctaKey];
  const namespaces = new Set([DEFAULT_NOTICE_NAMESPACE]);
  for (const key of keys) {
    const separator = key?.indexOf(":") ?? -1;
    if (key && separator > 0) namespaces.add(key.slice(0, separator));
  }
  return [...namespaces];
};
