import { useAtom, useAtomValue } from "jotai";
import {
  authLoadingAtom,
  isAuthenticatedAtom,
  sessionAtom,
  signOutAtom,
  userAtom,
} from "../atoms/auth";

export function useAuth() {
  const user = useAtomValue(userAtom);
  const session = useAtomValue(sessionAtom);
  const loading = useAtomValue(authLoadingAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);

  const [, signOut] = useAtom(signOutAtom);

  return {
    user,
    session,
    loading,
    isAuthenticated,
    signOut,
  };
}
