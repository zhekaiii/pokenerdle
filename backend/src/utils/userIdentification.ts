import { AuthenticatedRequest } from "../middlewares/auth.js";

/**
 * Get user identification for tracking purposes.
 * Returns the authenticated user ID if available, otherwise returns PostHog distinct_id.
 * This allows us to track users even when they're not logged in.
 */
export const getUserId = (req: AuthenticatedRequest): string | undefined => {
  // If user is authenticated, use their user ID
  if (req.user?.id) {
    return req.user.id;
  }

  // If user is not authenticated but has PostHog distinct_id, use that
  if (req.posthogDistinctId) {
    return req.posthogDistinctId;
  }

  // No identification available
  return undefined;
};
