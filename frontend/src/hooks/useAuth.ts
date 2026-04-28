import { useAtom, useAtomValue } from "jotai";
import {
  authLoadingAtom,
  isAuthenticatedAtom,
  signOutAtom,
  userAtom,
} from "../atoms/auth";

export function useAuth() {
  const user = useAtomValue(userAtom);
  const loading = useAtomValue(authLoadingAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);

  const [, signOut] = useAtom(signOutAtom);

  return {
    user,
    loading,
    isAuthenticated,
    signOut,
  };
}
