import { useAuth } from "@/hooks/useAuth";
import clsx from "clsx";
import { UserCircle } from "lucide-react";
import { useState } from "react";

type Props = {
  sizeClassName?: string;
};

export const ProfileIcon: React.FC<Props> = ({
  sizeClassName = "tw:size-5",
}) => {
  const { user } = useAuth();
  const [isError, setIsError] = useState(false);

  return user && user.user_metadata.avatar_url && !isError ? (
    <img
      className={clsx(
        "tw:rounded-full tw:object-cover tw:object-center",
        sizeClassName
      )}
      src={user.user_metadata.avatar_url}
      referrerPolicy="no-referrer"
      onError={() => setIsError(true)}
    />
  ) : (
    <UserCircle className={sizeClassName} />
  );
};
