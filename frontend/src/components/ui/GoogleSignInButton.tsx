import GoogleIcon from "@/assets/google.svg?react";
import { signInWithGoogle } from "@/atoms/auth";
import { GoogleSignInSource, trackGoogleSignInClicked } from "@/lib/events";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, ButtonProps } from "./Button";

interface UseGoogleSignInProps {
  redirectToPath?: string;
  source: GoogleSignInSource;
}

export const useGoogleSignIn = ({
  redirectToPath = !import.meta.env.SSR ? location.pathname : "",
  source,
}: UseGoogleSignInProps) => {
  const redirectToSearchParams = new URLSearchParams({ next: redirectToPath });
  const [loading, setLoading] = useState(false);
  const handleSignIn = async () => {
    try {
      setLoading(true);
      trackGoogleSignInClicked({ source });
      await signInWithGoogle(
        new URL(
          location.origin +
            "/auth/callback?" +
            redirectToSearchParams.toString(),
        ).toString(),
      );
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
  className,
  variant,
  size,
  /**
   * Path to redirect to after sign in
   */
  redirectToPath,
  source,
}) => {
  const { t } = useTranslation("nav");
  const { loading, handleSignIn } = useGoogleSignIn({
    redirectToPath,
    source,
  });

  return (
    <Button
      onClick={handleSignIn}
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
    >
      <GoogleIcon className="tw:size-4" />
      {loading ? t("loggingIn") : t("loginWithGoogle")}
    </Button>
  );
};
