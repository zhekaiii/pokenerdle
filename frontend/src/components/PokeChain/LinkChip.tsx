import { cn } from "@/lib/utils";
import clsx from "clsx";
import { GitBranch, ShieldCheck, X } from "lucide-react";
import React, { useRef } from "react";
import { formatAbilityName } from "../../utils/formatters";
import { Chip } from "../ui/Chip";

type Props = {
  className?: string;
  reactive?: boolean;
} & (
  | {
      variant: "evolution";
      count?: number;
    }
  | {
      variant: "ability";
      abilityName: string;
      count?: number;
    }
);

const LinkChip: React.FC<Props> = ({
  className,
  reactive,
  count = 0,
  ...props
}) => {
  const { current: frozenCount } = useRef(count ?? 0);
  return (
    <Chip
      className={cn(
        "tw:capitalize tw:self-center tw:my-1 tw:whitespace-nowrap",
        className
      )}
    >
      <div className="tw:inline-flex tw:items-center">
        {props.variant == "ability" ? <ShieldCheck /> : <GitBranch />}
        <span className="tw:mx-1">
          {props.variant == "ability"
            ? formatAbilityName(props.abilityName)
            : "Same evolution line"}
        </span>
        <div className="tw:flex">
          {Array.from({ length: reactive ? count : frozenCount }, (_, i) => (
            <X
              className={clsx(i > 0 && "tw:-ml-2", "tw:text-red-600")}
              key={i}
            />
          ))}
        </div>
      </div>
    </Chip>
  );
};

export default LinkChip;
