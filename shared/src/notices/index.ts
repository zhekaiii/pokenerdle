import { z } from "zod";

export const NOTICE_PLACEMENTS = ["home", "daily"] as const;
export const NoticePlacementSchema = z.enum(NOTICE_PLACEMENTS);
export type NoticePlacement = z.infer<typeof NoticePlacementSchema>;

export const NoticeTemplateSchema = z.enum(["pokedex"]);
export type NoticeTemplate = z.infer<typeof NoticeTemplateSchema>;

export const NoticeActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("link"),
    // Internal routes only: "/path", never "//host" or "https://...".
    href: z.string().refine((href) => href.startsWith("/") && !href.startsWith("//"), {
      message: "href must be an internal path",
    }),
  }),
  z.object({ type: z.literal("signIn") }),
]);
export type NoticeAction = z.infer<typeof NoticeActionSchema>;

// Unix seconds. The cap (year 2286) rejects millisecond timestamps, which
// would otherwise never expire.
const UnixSeconds = z.number().int().nonnegative().max(9_999_999_999);

// Strict so a typo like "befor" drops the entry instead of widening it.
export const NoticeConditionsSchema = z.strictObject({
  from: UnixSeconds.optional(),
  before: UnixSeconds.optional(),
  signedIn: z.boolean().optional(),
});
export type NoticeConditions = z.infer<typeof NoticeConditionsSchema>;

// Strict: a typo drops the entry rather than losing its conditions.
export const NoticeSchema = z.strictObject({
  id: z.string().min(1),
  template: NoticeTemplateSchema,
  titleKey: z.string().min(1),
  bodyKey: z.string().optional(),
  tagKey: z.string().optional(),
  ctaKey: z.string().optional(),
  action: NoticeActionSchema.optional(),
  when: NoticeConditionsSchema.optional(),
});
export type Notice = z.infer<typeof NoticeSchema>;

export interface NoticeResponse {
  notice: Notice | null;
}

export type NoticesByPlacement = Partial<Record<NoticePlacement, Notice[]>>;

// Shape checks only: entries are validated one by one below, so one bad entry
// (or one bad placement) never drops the rest.
const NoticesPayloadSchema = z.record(z.string(), z.unknown());
const PlacementEntriesSchema = z.array(z.unknown());

export const parseNoticesPayload = (
  payload: unknown,
): { notices: NoticesByPlacement; errors: string[] } => {
  const record = NoticesPayloadSchema.safeParse(payload);
  if (!record.success) {
    return { notices: {}, errors: ["payload must be an object keyed by placement"] };
  }
  const notices: NoticesByPlacement = {};
  const errors: string[] = [];

  for (const placement of NOTICE_PLACEMENTS) {
    if (record.data[placement] === undefined) continue;
    const entries = PlacementEntriesSchema.safeParse(record.data[placement]);
    if (!entries.success) {
      errors.push(`${placement}: must be an array`);
      continue;
    }
    notices[placement] = entries.data.flatMap((entry, i) => {
      const parsed = NoticeSchema.safeParse(entry);
      if (parsed.success) return [parsed.data];
      errors.push(`${placement}[${i}]: ${parsed.error.issues.map((x) => x.message).join("; ")}`);
      return [];
    });
  }
  return { notices, errors };
};

const passes = (
  when: NoticeConditions | undefined,
  { nowSec, signedIn }: { nowSec: number; signedIn: boolean },
): boolean => {
  if (!when) return true;
  if (when.from !== undefined && nowSec < when.from) return false;
  if (when.before !== undefined && nowSec >= when.before) return false;
  if (when.signedIn !== undefined && when.signedIn !== signedIn) return false;
  return true;
};

export const pickNotice = (
  notices: Notice[],
  ctx: { nowSec: number; signedIn: boolean },
): Notice | null => notices.find((notice) => passes(notice.when, ctx)) ?? null;
