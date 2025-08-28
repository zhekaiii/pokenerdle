import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholder?: React.ReactNode;
}

export const ImageWithPlaceholder: React.FC<Props> = ({
  className,
  placeholder = <Loader2 className="tw:animate-spin" />,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const handleLoad = () => {
    setIsLoading(false);
  };
  useEffect(() => {
    if (props.src) {
      setIsLoading(true);
      const img = new Image();
      img.onload = handleLoad;
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
        <img {...props} />
      )}
    </>
  );
};
