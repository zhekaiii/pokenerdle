import { Commit } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import LinkIcon from "@mui/icons-material/Link";
import { Chip, Stack } from "@mui/material";
import React, { useState } from "react";
import { formatAbilityName } from "../../utils/formatters";

type Props =
  | {
      variant: "evolution";
      count?: number;
    }
  | {
      variant: "ability";
      abilityName: string;
      count?: number;
    };

const LinkChip: React.FC<Props> = (props) => {
  const [frozenCount] = useState(props.count ?? 0);
  return (
    <Chip
      icon={props.variant == "ability" ? <LinkIcon /> : <Commit />}
      className="tw-capitalize tw-self-center tw-my-1 tw-whitespace-nowrap"
      label={
        <>
          <Stack direction="row" display="inline-flex" alignItems="center">
            {props.variant == "ability"
              ? formatAbilityName(props.abilityName)
              : "Same evolution line"}
            {Array.from({ length: frozenCount }, (_, i) => (
              <CloseIcon
                sx={i > 0 ? { marginLeft: "-8px" } : {}}
                fontSize="small"
                key={i}
                color="error"
              />
            ))}
          </Stack>
        </>
      }
    />
  );
};

export default LinkChip;
