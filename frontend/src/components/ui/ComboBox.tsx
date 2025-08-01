import * as React from "react";

import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { Input } from "./Input";

type ComboboxProps<T> = {
  options: T[];
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => React.Key;
  inputProps?: Omit<React.ComponentProps<typeof Input>, "value" | "onChange">;
  onSelect?: (option: T) => void;
  renderItemContent?: (option: T) => React.ReactNode;
  value: string;
  setValue: (value: string) => void;
  disabled?: boolean;
};

const ComboBox = (<T,>({
  options,
  getOptionLabel,
  getOptionValue,
  inputProps,
  onSelect,
  renderItemContent,
  value,
  setValue,
  disabled = false,
}: ComboboxProps<T>) => {
  const [open, setOpen] = React.useState(false);

  // This is a workaround to make the ComboBox work with the keyboard. Normally the CommandInput
  // component is used with the Command component and the keydown event would somehow propagate, but
  // in this case we are not using CommandInput here. So we need to manually dispatch the keydown event
  const onKeyDown = (e: React.KeyboardEvent) => {
    // @ts-expect-error This still works
    commandRef.current?.dispatchEvent(new KeyboardEvent("keydown", e));
  };
  const commandRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (value && !open) {
      setOpen(true);
    }
  }, [value]);

  return (
    <Popover open={open && !disabled && !!value} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          onClick={open ? (e) => e.preventDefault() : undefined}
          onKeyDown={onKeyDown}
          {...inputProps}
        />
      </PopoverTrigger>
      <PopoverContent
        className="tw:w-[var(--radix-popover-trigger-width)] p-0"
        onCloseAutoFocus={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command ref={commandRef}>
          <CommandList>
            <CommandGroup>
              {options.map((option) => (
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
                    ? renderItemContent(option)
                    : getOptionLabel(option)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}) satisfies React.FC<ComboboxProps<unknown>>;

export { ComboBox };
