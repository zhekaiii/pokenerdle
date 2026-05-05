import questionMarkIcon from "@/assets/question_mark.png";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholder?: React.ReactNode;
  fallbackSrc?: string;
}

export const ImageWithPlaceholder: React.FC<Props> = ({
  className,
  placeholder = <Loader2 className="tw:animate-spin" />,
  fallbackSrc = questionMarkIcon,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const handleLoad = () => {
    setIsLoading(false);
    setIsError(false);
  };
  useEffect(() => {
    if (props.src) {
      setIsLoading(true);
      const img = new Image();
      img.onload = handleLoad;
      img.onerror = (e) => {
        console.debug("Error loading image", e);
        setIsError(true);
        setIsLoading(false);
      };
      img.src = props.src;
      if (img.complete) {
        handleLoad();
      }
    }
  }, [props.src]);

  return (
    <>
      {isLoading ? (
        <div className="tw:h-14 tw:flex tw:items-end">{placeholder}</div>
      ) : (
        <img {...props} src={isError ? fallbackSrc : props.src} />
      )}
    </>
  );
};
