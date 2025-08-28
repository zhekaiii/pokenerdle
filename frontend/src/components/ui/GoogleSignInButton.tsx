import GoogleIcon from "@/assets/google.svg?react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Button, ButtonProps } from "./Button";

interface UseGoogleSignInProps {
  onSignIn?: () => void;
  redirectTo?: string;
}

export const useGoogleSignIn = ({
  onSignIn,
  redirectTo,
}: UseGoogleSignInProps = {}) => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const handleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle(redirectTo);
      onSignIn?.();
    } catch (error) {
      console.error("Sign in failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleSignIn,
  };
};

type GoogleSignInButtonProps = {
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
} & UseGoogleSignInProps;

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSignIn,
  className,
  variant,
  size,
  redirectTo = location.origin + location.pathname,
}) => {
  const { loading, handleSignIn } = useGoogleSignIn({ onSignIn, redirectTo });

  return (
    <Button
      onClick={handleSignIn}
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
    >
      <GoogleIcon className="tw:size-4" />
      {loading ? "Logging in..." : "Login with Google"}
    </Button>
  );
};
