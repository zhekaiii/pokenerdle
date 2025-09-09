import { useEffect, useState } from "react";

const useDetectKeyboardOpen = (
  minKeyboardHeight = 300,
  defaultValue = false
) => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(defaultValue);

  useEffect(() => {
    const listener = () => {
      const newState =
        window.screen.height - minKeyboardHeight >
        (window.visualViewport?.height ?? 0);
      setIsKeyboardOpen(newState);
    };
    if (typeof visualViewport != "undefined") {
      window.visualViewport?.addEventListener("resize", listener);
    }
    return () => {
      if (typeof visualViewport != "undefined") {
        window.visualViewport?.removeEventListener("resize", listener);
      }
    };
  }, [minKeyboardHeight]);

  return isKeyboardOpen;
};

export default useDetectKeyboardOpen;
