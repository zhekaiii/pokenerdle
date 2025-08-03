import { clsx, type ClassValue } from "clsx";
import { isIOS, isMacOs } from "react-device-detect";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isApple = () => {
  return isIOS || isMacOs;
};

export const isCmdOrCtrl = (e: React.KeyboardEvent) => {
  return isApple() ? e.metaKey : e.ctrlKey;
};
