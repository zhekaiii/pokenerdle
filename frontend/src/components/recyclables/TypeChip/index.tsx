import { cn } from "@/lib/utils";
import React from "react";

import bugIcon from "src/assets/bug.svg";
import darkIcon from "src/assets/dark.svg";
import dragonIcon from "src/assets/dragon.svg";
import electricIcon from "src/assets/electric.svg";
import fairyIcon from "src/assets/fairy.svg";
import fightingIcon from "src/assets/fighting.svg";
import fireIcon from "src/assets/fire.svg";
import flyingIcon from "src/assets/flying.svg";
import ghostIcon from "src/assets/ghost.svg";
import grassIcon from "src/assets/grass.svg";
import groundIcon from "src/assets/ground.svg";
import iceIcon from "src/assets/ice.svg";
import normalIcon from "src/assets/normal.svg";
import poisonIcon from "src/assets/poison.svg";
import psychicIcon from "src/assets/psychic.svg";
import rockIcon from "src/assets/rock.svg";
import steelIcon from "src/assets/steel.svg";
import waterIcon from "src/assets/water.svg";

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
  children,
  className,
  ...props
}) => {
  const { icon, bgClass } = TYPE_ICON_CONFIG[type.toLowerCase()] ?? {};
  if (!icon) return;

  return (
    <div
      className={cn(
        "tw:rounded-full tw:pe-2 tw:inline-flex tw:items-center tw:bg-(--bug-type)",
        bgClass,
        className
      )}
      {...props}
    >
      <img style={{ height: `${size}px`, width: `${size}px` }} src={icon} />
      <span>
        {type} {children}
      </span>
    </div>
  );
};

export default TypeChip;
