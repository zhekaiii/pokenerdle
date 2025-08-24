import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { atom } from "jotai";
import { supabase } from "../lib/supabase";

// Base atoms
export const userAtom = atom<User | null>(null);
export const sessionAtom = atom<Session | null>(null);
export const authLoadingAtom = atom<boolean>(true);

// Derived atom for auth state
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);

// Action atoms
export const signInWithGoogleAtom = atom(
  null,
  async (get, set, redirectTo?: string) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  }
);

export const signOutAtom = atom(null, async (get, set) => {
  supabase.auth.signOut().catch((error) => {
    console.error("Error signing out:", error);
  });
  set(userAtom, null);
  set(sessionAtom, null);
});

// Auth state management atom
export const initAuthAtom = atom(null, async (get, set) => {
  try {
    // Get initial session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    set(sessionAtom, session);
    set(userAtom, session?.user ?? null);
    set(authLoadingAtom, false);

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        set(sessionAtom, session);
        set(userAtom, session?.user ?? null);
        set(authLoadingAtom, false);
      }
    );

    return () => subscription.unsubscribe();
  } catch (error) {
    console.error("Error initializing auth:", error);
    set(authLoadingAtom, false);
  }
});
