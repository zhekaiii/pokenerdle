import ExtremelyEffective from "@/assets/icons/effectiveness/ExtremelyEffective.svg?react";
import MostlyIneffective from "@/assets/icons/effectiveness/MostlyIneffective.svg?react";
import NA from "@/assets/icons/effectiveness/NA.svg?react";
import NoEffect from "@/assets/icons/effectiveness/NoEffect.svg?react";
import NormalEffective from "@/assets/icons/effectiveness/NormalEffective.svg?react";
import NotVeryEffective from "@/assets/icons/effectiveness/NotVeryEffective.svg?react";
import SuperEffective from "@/assets/icons/effectiveness/SuperEffective.svg?react";
import React from "react";

interface Props {
  value: number | "NA";
}

const EffectivenessIcon: React.FC<Props> = ({ value }) => {
  switch (value) {
    case "NA":
      return <NA />;
    case 0:
      return <NoEffect />;
    case 0.25:
      return <MostlyIneffective />;
    case 0.5:
      return <NotVeryEffective />;
    case 1:
      return <NormalEffective />;
    case 2:
      return <SuperEffective />;
    case 4:
      return <ExtremelyEffective />;
  }
};

export default EffectivenessIcon;
