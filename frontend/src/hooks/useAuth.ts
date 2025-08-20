import { useAtom, useAtomValue } from "jotai";
import { useCallback } from "react";
import {
  authLoadingAtom,
  isAuthenticatedAtom,
  sessionAtom,
  signInWithGoogleAtom,
  signOutAtom,
  userAtom,
} from "../atoms/auth";

export function useAuth() {
  const user = useAtomValue(userAtom);
  const session = useAtomValue(sessionAtom);
  const loading = useAtomValue(authLoadingAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);

  const [, signInWithGoogleAction] = useAtom(signInWithGoogleAtom);
  const [, signOutAction] = useAtom(signOutAtom);

  const signInWithGoogle = useCallback(async () => {
    await signInWithGoogleAction();
  }, [signInWithGoogleAction]);

  const signOut = useCallback(async () => {
    await signOutAction();
  }, [signOutAction]);

  return {
    user,
    session,
    loading,
    isAuthenticated,
    signInWithGoogle,
    signOut,
  };
}
