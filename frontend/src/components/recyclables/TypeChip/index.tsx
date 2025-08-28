import { cn } from "@/lib/utils";
import React from "react";

import bugIcon from "src/assets/icons/types/bug.svg";
import darkIcon from "src/assets/icons/types/dark.svg";
import dragonIcon from "src/assets/icons/types/dragon.svg";
import electricIcon from "src/assets/icons/types/electric.svg";
import fairyIcon from "src/assets/icons/types/fairy.svg";
import fightingIcon from "src/assets/icons/types/fighting.svg";
import fireIcon from "src/assets/icons/types/fire.svg";
import flyingIcon from "src/assets/icons/types/flying.svg";
import ghostIcon from "src/assets/icons/types/ghost.svg";
import grassIcon from "src/assets/icons/types/grass.svg";
import groundIcon from "src/assets/icons/types/ground.svg";
import iceIcon from "src/assets/icons/types/ice.svg";
import normalIcon from "src/assets/icons/types/normal.svg";
import poisonIcon from "src/assets/icons/types/poison.svg";
import psychicIcon from "src/assets/icons/types/psychic.svg";
import rockIcon from "src/assets/icons/types/rock.svg";
import steelIcon from "src/assets/icons/types/steel.svg";
import waterIcon from "src/assets/icons/types/water.svg";

const TYPE_ICON_CONFIG: Record<
  string,
  {
    icon: string;
    bgClass: string;
  }
> = {
  bug: {
    icon: bugIcon,
    bgClass: "tw:bg-(--bug-type)",
  },
  dark: {
    icon: darkIcon,
    bgClass: "tw:bg-(--dark-type)",
  },
  dragon: {
    icon: dragonIcon,
    bgClass: "tw:bg-(--dragon-type)",
  },
  electric: {
    icon: electricIcon,
    bgClass: "tw:bg-(--electric-type)",
  },
  fairy: {
    icon: fairyIcon,
    bgClass: "tw:bg-(--fairy-type)",
  },
  fighting: {
    icon: fightingIcon,
    bgClass: "tw:bg-(--fighting-type)",
  },
  fire: {
    icon: fireIcon,
    bgClass: "tw:bg-(--fire-type)",
  },
  flying: {
    icon: flyingIcon,
    bgClass: "tw:bg-(--flying-type)",
  },
  ghost: {
    icon: ghostIcon,
    bgClass: "tw:bg-(--ghost-type)",
  },
  grass: {
    icon: grassIcon,
    bgClass: "tw:bg-(--grass-type)",
  },
  ground: {
    icon: groundIcon,
    bgClass: "tw:bg-(--ground-type)",
  },
  ice: {
    icon: iceIcon,
    bgClass: "tw:bg-(--ice-type)",
  },
  normal: {
    icon: normalIcon,
    bgClass: "tw:bg-(--normal-type)",
  },
  poison: {
    icon: poisonIcon,
    bgClass: "tw:bg-(--poison-type)",
  },
  psychic: {
    icon: psychicIcon,
    bgClass: "tw:bg-(--psychic-type)",
  },
  rock: {
    icon: rockIcon,
    bgClass: "tw:bg-(--rock-type)",
  },
  steel: {
    icon: steelIcon,
    bgClass: "tw:bg-(--steel-type)",
  },
  water: {
    icon: waterIcon,
    bgClass: "tw:bg-(--water-type)",
  },
};

type Props = {
  size?: number;
  type: string;
} & React.HTMLAttributes<HTMLDivElement>;

const TypeChip: React.FC<Props> = ({
  size = 24,
  type,
  className,
  ...props
}) => {
  const { icon, bgClass } = TYPE_ICON_CONFIG[type.toLowerCase()] ?? {};
  if (!icon) return;

  return (
    <div
      className={cn(
        "tw:rounded-full tw:pe-2 tw:inline-flex tw:items-center tw:text-background tw:dark:text-foreground tw:align-middle tw:min-w-max",
        bgClass,
        className
      )}
      {...props}
    >
      <img style={{ height: `${size}px`, width: `${size}px` }} src={icon} />
      <span className="tw:flex-1 tw:text-center tw:whitespace-nowrap">
        {type}
      </span>
    </div>
  );
};

export default TypeChip;
