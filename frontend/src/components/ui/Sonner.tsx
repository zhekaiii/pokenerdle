import { themeAtom } from "@/atoms/theme";
import { useAtomValue } from "jotai";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster: React.FC<ToasterProps> = (props) => {
  const theme = useAtomValue(themeAtom);

  return (
    <Sonner
      theme={theme}
      richColors
      className="toaster tw:group"
      offset={{
        top: "calc(var(--page-padding-y) + var(--header-height))",
        bottom: "calc(var(--page-padding-y) + var(--footer-height))",
      }}
      mobileOffset={{
        top: "calc(var(--page-padding-y) + var(--header-height))",
        bottom: "calc(var(--page-padding-y) + var(--footer-height))",
      }}
      toastOptions={{
        classNames: {
          toast:
            "tw:group toast tw:group-[.toaster]:bg-background tw:group-[.toaster]:text-foreground tw:group-[.toaster]:border-border! tw:group-[.toaster]:shadow-lg",
          description: "tw:group-[.toast]:text-muted-foreground",
          actionButton:
            "tw:group-[.toast]:bg-primary tw:group-[.toast]:text-primary-foreground",
          cancelButton:
            "tw:group-[.toast]:bg-muted tw:group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
