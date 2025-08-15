import { PostHog } from "posthog-node";
import { POSTHOG_HOST } from "../constants/posthog.js";

// Initialize PostHog client for server-side tracking
export const posthog = new PostHog(
  process.env.POSTHOG_API_KEY || "phc_placeholder", // You'll need to set this in your environment
  {
    host: POSTHOG_HOST,
    flushAt: 1, // Flush immediately for real-time tracking
    flushInterval: 0, // Disable automatic flushing
  }
);

// Helper function to capture events with proper error handling
export const captureEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  try {
    posthog.capture({
      event: eventName,
      properties,
      distinctId: "server", // Server-side events don't have a specific user
    });
  } catch (error) {
    console.error("Failed to capture PostHog event:", error);
  }
};
