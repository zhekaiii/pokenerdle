import LinkIcon from "@mui/icons-material/Link";
import { Chip } from "@mui/material";
import React from "react";

type Props = {
  abilityName: string;
};

const AbilityChip: React.FC<Props> = ({ abilityName }) => {
  return (
    <Chip
      icon={<LinkIcon />}
      className="tw-capitalize tw-self-center tw-my-1"
      label={abilityName.replace("-", " ")}
    />
  );
};

export default AbilityChip;
