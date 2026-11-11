import iconPlaceholder from "@/assets/question_mark.png";
import clsx from "clsx";
import classes from "./index.module.scss";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "onError">;

export const PokemonIcon: React.FC<Props> = ({ className, ...props }) => (
  <img
    {...props}
    className={clsx(classes.PokemonIcon, className)}
    onError={(e) => {
      e.currentTarget.src = iconPlaceholder;
    }}
  />
);
