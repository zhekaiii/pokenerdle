import questionMarkIcon from "@/assets/question_mark.png";
import React, { useState } from "react";

interface ArtworkProps {
  src: string | null;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

// A Pokémon's artwork. A missing URL, or one that fails to load, shows the question mark.
const Artwork: React.FC<ArtworkProps> = ({ src, alt, className, style }) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return (
    <img
      className={className}
      style={style}
      src={src && src !== failedSrc ? src : questionMarkIcon}
      alt={alt}
      draggable={false}
      onError={() => setFailedSrc(src)}
    />
  );
};

export default Artwork;
