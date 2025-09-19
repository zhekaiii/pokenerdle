import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { supabase } from "../lib/supabase";

export const posthogAtom = atomWithStorage<null | {
  distinct_id: string | null;
}>(`ph_${import.meta.env.VITE_PUBLIC_POSTHOG_KEY}_posthog`, null);

export const posthogDistinctIdAtom = atom<string | null>((get) => {
  const posthog = get(posthogAtom);
  return posthog?.distinct_id ?? null;
});

const getInitialAuthState = () => {
  return { user: null, session: null };
};

const initialAuthState = getInitialAuthState();

// Base atoms
export const userAtom = atom<User | null>(initialAuthState.user as User | null);
export const sessionAtom = atom<Session | null>(
  initialAuthState.session as Session | null
);
export const authLoadingAtom = atom<boolean>(false);

// Derived atom for auth state
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);

// Action atoms
export const signInWithGoogle = async (redirectTo?: string) => {
  console.log({ redirectTo });
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
};

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
