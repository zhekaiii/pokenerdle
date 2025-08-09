import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

const OPTIONS = [
  {
    label: "Daily Challenge",
    value: "/how-to-play/daily",
  },
  {
    label: "PokéChain",
    value: "/how-to-play/pokechain",
  },
  {
    label: "Path Finder",
    value: "/how-to-play/path-finder",
  },
];

const HowToPlayPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const value = OPTIONS.find((option) =>
    location.pathname.includes(option.value)
  )!.value;

  return (
    <div className="tw:max-w-3xl tw:mx-auto tw:w-full">
      <Select value={value} onValueChange={navigate}>
        <SelectTrigger className="tw:mb-4 tw:w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Outlet />
    </div>
  );
};

export default HowToPlayPage;
