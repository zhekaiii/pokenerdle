import { useEffect, useState } from "react";

export const NoSsr: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [rendered, setRendered] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRendered(true);
  }, []);
  if (!rendered) {
    return null;
  }
  return children;
};
