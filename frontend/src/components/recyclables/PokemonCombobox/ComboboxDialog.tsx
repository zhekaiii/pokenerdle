import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { ArrowLeft } from "lucide-react";
import { useRef } from "react";

interface Props<T> {
  options: T[];
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => React.Key;
  inputProps?: Omit<
    React.ComponentProps<typeof CommandInput>,
    "value" | "onChange"
  >;
  onSelect?: (option: T) => void;
  renderItemContent?: (option: T, index: number) => React.ReactNode;
  value: string;
  setValue: (value: string) => void;
  disabled?: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const ComboboxDialog = (<T,>({
  options,
  getOptionLabel,
  getOptionValue,
  inputProps,
  onSelect,
  renderItemContent,
  value,
  setValue,
  disabled,
  open,
  setOpen,
}: Props<T>) => {
  const commandRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog open={open && !disabled} onOpenChange={setOpen}>
      <DialogTitle className="tw:hidden">Pokemon Combobox</DialogTitle>
      <DialogContent
        showCloseButton={false}
        className="tw:p-0 tw:size-full tw:max-w-full tw:rounded-none tw:bg-transparent"
      >
        <Command
          ref={commandRef}
          shouldFilter={false}
          className="tw:rounded-none tw:bg-popover/80"
        >
          <CommandInput
            icon={
              <ArrowLeft
                className="tw:size-6 tw:opacity-50"
                onClick={() => setOpen(false)}
              />
            }
            value={value}
            onValueChange={setValue}
            wrapperProps={{ className: "tw:bg-popover tw:h-12.5" }}
            className="tw:h-12.5"
            {...inputProps}
          />
          <CommandList
            className="tw:max-h-full"
            onTouchStart={(e) => e.currentTarget.focus()}
          >
            <CommandGroup>
              {options.map((option, index) => (
                <CommandItem
                  key={getOptionValue(option)}
                  value={getOptionLabel(option)}
                  onSelect={(currentValue) => {
                    onSelect?.(option);
                    setValue(currentValue);
                    setOpen(false);
                  }}
                >
                  {renderItemContent
                    ? renderItemContent(option, index)
                    : getOptionLabel(option)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}) satisfies React.FC<Props<unknown>>;
