import { createClient } from "@supabase/supabase-js";
import { NextFunction, Request, Response } from "express";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface AuthenticatedRequest extends Request {
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

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: "Authorization header is required",
      });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify the JWT token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error("Token verification failed:", error);
      res.status(401).json({
        error: "Invalid or expired token",
      });
      return;
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email || "",
      aud: user.aud,
      role: user.role,
      email_confirmed_at: user.email_confirmed_at,
      user_metadata: user.user_metadata,
      app_metadata: user.app_metadata,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      error: "Internal server error during authentication",
    });
  }
};

export const optionalAuthenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    // If no auth header is provided, continue without authentication
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      next();
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      // Verify the JWT token with Supabase
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        console.error("Token verification failed:", error);
        // Don't reject the request, just log the error and continue without auth
        console.warn(
          "Invalid token provided, continuing without authentication"
        );
        next();
        return;
      }

      // Add user to request object
      req.user = {
        id: user.id,
        email: user.email || "",
        aud: user.aud,
        role: user.role,
        email_confirmed_at: user.email_confirmed_at,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata,
      };
    } catch (error) {
      console.error("Authentication error:", error);
      // Don't reject the request, just continue without auth
      console.warn("Authentication failed, continuing without authentication");
    }

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    // Don't reject the request, just continue without auth
    console.warn(
      "Authentication middleware failed, continuing without authentication"
    );
    next();
  }
};
