import iconPlaceholder from "@/assets/question_mark.png";
import clsx from "clsx";
import { useState } from "react";
import classes from "./index.module.scss";

// Standard menu icons are 68x56 with padding around the Pokemon, so they are
// cropped to the 40x40 box at native size. Anything larger (e.g. the 96x96
// front_default sprites used for newer Megas) fills its frame, so it is
// scaled to fit the box instead of being cropped.
const MENU_ICON_WIDTH = 68;
const MENU_ICON_HEIGHT = 56;

export const PokemonComboboxIcon: React.FC<{ src: string }> = ({ src }) => {
  const [isOversized, setIsOversized] = useState(false);

  return (
    <div className={classes["PokemonCombobox__PokemonIconWrapper"]}>
      <img
        className={clsx(
          classes["PokemonCombobox__PokemonIcon"],
          isOversized && classes["PokemonCombobox__PokemonIcon--fit"],
        )}
        src={src}
        onLoad={(e) => {
          const { naturalWidth, naturalHeight } = e.currentTarget;
          setIsOversized(
            naturalWidth > MENU_ICON_WIDTH || naturalHeight > MENU_ICON_HEIGHT,
          );
        }}
        onError={(e) => {
          e.currentTarget.src = iconPlaceholder;
        }}
      />
    </div>
  );
};
