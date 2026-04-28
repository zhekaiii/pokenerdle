import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../data/const.js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing Supabase URL");
}

if (!supabaseServiceKey) {
  throw new Error("Missing Supabase service role key");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface StrictAuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    aud: string;
    role?: string;
    email_confirmed_at?: string;
    user_metadata?: any;
    app_metadata?: any;
  };
}
export interface AuthenticatedRequest extends StrictAuthenticatedRequest {
  posthogDistinctId?: string;
}

const parseUserFromHeader = async (authHeader: string) => {
  const token = authHeader.substring(7); // Remove "Bearer " prefix

  // Verify the JWT token with Supabase
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email || "",
    aud: user.aud,
    role: user.role,
    email_confirmed_at: user.email_confirmed_at,
    user_metadata: user.user_metadata,
    app_metadata: user.app_metadata,
  };
};

const parsePosthogDistinctIdFromHeader = (req: AuthenticatedRequest) => {
  const posthogDistinctId = req.headers["x-posthog-distinct-id"] as
    | string
    | undefined;
  if (posthogDistinctId) {
    req.posthogDistinctId = `posthog_${posthogDistinctId}`;
  }
};

/**
 * Requires posthog session or supabase authentication, otherwise
 * returns a StatusCode.UNAUTHORIZED error.
 */
export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    parsePosthogDistinctIdFromHeader(req);

    if (
      (!authHeader || !authHeader.startsWith("Bearer ")) &&
      !req.posthogDistinctId
    ) {
      res.status(StatusCode.UNAUTHORIZED).json({
        error: "Authorization header or distinct ID is required",
      });
      return;
    }

    if (!authHeader) {
      next();
      return;
    }

    const user = await parseUserFromHeader(authHeader);
    if (!user) {
      res.status(StatusCode.UNAUTHORIZED).json({
        error: "Invalid or expired token",
      });
      return;
    }

    // Add user to request object
    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      error: "Internal server error during authentication",
    });
  }
};

/**
 * Middleware that sets posthog session to req.posthogDistinctId if it exists,
 * and verifies JWT token with Supabase if exists.
 * If neither is provided, the request doesn't throw.
 */
export const optionalAuthenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;
  parsePosthogDistinctIdFromHeader(req);

  // If no auth header is provided, check for PostHog distinct_id
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  try {
    // Verify the JWT token with Supabase
    const user = await parseUserFromHeader(authHeader);

    if (!user) {
      // Don't reject the request, just log the error and continue without auth
      console.warn("Invalid token provided, continuing without authentication");
      next();
      return;
    }

    // Add user to request object
    req.user = user;
  } catch (error) {
    console.error("Authentication error:", error);
    // Don't reject the request, just continue without auth
    console.warn("Authentication failed, continuing without authentication");
  }

  next();
};

/**
 * Requires supabase authentication, otherwise returns a StatusCode.UNAUTHORIZED error.
 */
export const strictAuthenticateUser = async (
  req: StrictAuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;
  parsePosthogDistinctIdFromHeader(req);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(StatusCode.UNAUTHORIZED).json({
      error: "Authorization header is required",
    });
    return;
  }
  try {
    const user = await parseUserFromHeader(authHeader);
    if (!user) {
      res.status(StatusCode.UNAUTHORIZED).json({
        error: "Invalid or expired token",
      });
      return;
    }

    req.user = user;
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      error: "Internal server error during authentication",
    });
  }

  next();
};
