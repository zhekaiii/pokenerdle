import CloseIcon from "@mui/icons-material/Close";
import LinkIcon from "@mui/icons-material/Link";
import { Chip, Stack } from "@mui/material";
import React, { useState } from "react";
import { formatAbilityName } from "../../utils/formatters";
type Props = {
  abilityName: string;
  count?: number;
};

const AbilityChip: React.FC<Props> = ({ abilityName, count = 0 }) => {
  const [frozenCount] = useState(count);
  return (
    <Chip
      icon={<LinkIcon />}
      className="tw-capitalize tw-self-center tw-my-1 tw-whitespace-nowrap"
      label={
        <>
          <Stack direction="row" display="inline-flex" alignItems="center">
            {formatAbilityName(abilityName)}
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

export default AbilityChip;
