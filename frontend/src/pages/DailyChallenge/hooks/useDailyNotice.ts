import api from "@/api";
import { getNoticeNamespaces } from "@/components/Notice/namespaces";
import { useAuth } from "@/hooks/useAuth";
import type { Notice } from "@pokenerdle/shared/notices";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const dailyNoticeQueryKey = (isAuthenticated: boolean) =>
  ["notice", "daily", isAuthenticated] as const;

interface UseDailyNoticeOptions {
  enabled: boolean;
  /** Loader result. `undefined` means the loader did not fetch (game not finished on landing). */
  initialNotice: Notice | null | undefined;
}

export const useDailyNotice = ({
  enabled,
  initialNotice,
}: UseDailyNoticeOptions) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { i18n } = useTranslation();
  // The loader's notice was fetched for the auth state seen at first render.
  // Seed only that state: after a sign-in or sign-out the key changes and must
  // fetch its own notice, not reuse the loader's (staleTime is Infinity).
  const [seedAuthState] = useState(isAuthenticated);

  const { data } = useQuery({
    queryKey: dailyNoticeQueryKey(isAuthenticated),
    queryFn: async (): Promise<Notice | null> => {
      try {
        const { notice } = await api.notices.get("daily");
        if (notice) await i18n.loadNamespaces(getNoticeNamespaces(notice));
        return notice;
      } catch (error) {
        console.error("Error loading daily notice:", error);
        return null;
      }
    },
    enabled: enabled && !authLoading,
    staleTime: Infinity,
    initialData:
      isAuthenticated === seedAuthState ? initialNotice : undefined,
  });

  return { notice: data ?? null, isPending: enabled && data === undefined };
};
