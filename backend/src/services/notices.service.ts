import {
  Notice,
  NoticePlacement,
  NoticesByPlacement,
  parseNoticesPayload,
  pickNotice,
} from "@pokenerdle/shared/notices";
import { posthog } from "../lib/posthog.js";

const NOTICES_FLAG_KEY = "notices";
const DEFAULT_TTL_MS = 60_000;

/**
 * Caches the notices config. A fetch that returns `undefined` or throws is a
 * blip: the last good config keeps being served. Any parsed object, including
 * `{}`, replaces it — that's how notices get switched off.
 */
export const createNoticesSource = ({
  fetchPayload,
  ttlMs = DEFAULT_TTL_MS,
  now = Date.now,
}: {
  fetchPayload: () => Promise<unknown>;
  ttlMs?: number;
  now?: () => number;
}) => {
  let cached: NoticesByPlacement = {};
  let fetchedAt: number | null = null;
  let inFlight: Promise<void> | null = null;

  const refresh = async () => {
    try {
      const payload = await fetchPayload();
      if (payload === undefined) {
        console.warn("Notices config fetch returned nothing; keeping last good config");
        return;
      }
      const { notices, errors } = parseNoticesPayload(payload);
      if (errors.length > 0) console.warn("Invalid notices config entries:", errors);
      cached = notices;
    } catch (error) {
      console.warn("Failed to fetch notices config; keeping last good config:", error);
    } finally {
      fetchedAt = now();
    }
  };

  return {
    getPlacement: async (placement: NoticePlacement): Promise<Notice[]> => {
      if (fetchedAt === null || now() - fetchedAt > ttlMs) {
        inFlight ??= refresh().finally(() => {
          inFlight = null;
        });
        await inFlight;
      }
      return cached[placement] ?? [];
    },
  };
};

const defaultSource = createNoticesSource({
  fetchPayload: async () => {
    if (process.env.NOTICES_JSON) return JSON.parse(process.env.NOTICES_JSON);
    return posthog.getFeatureFlagPayload(NOTICES_FLAG_KEY, "server");
  },
});

export const getNoticeService = async (
  placement: NoticePlacement,
  signedIn: boolean,
): Promise<Notice | null> =>
  pickNotice(await defaultSource.getPlacement(placement), {
    nowSec: Math.floor(Date.now() / 1000),
    signedIn,
  });
