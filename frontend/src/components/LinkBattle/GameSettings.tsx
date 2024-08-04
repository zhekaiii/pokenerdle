import {
  FormControlLabel,
  FormGroup,
  Slider,
  Stack,
  Switch,
} from "@mui/material";
import React from "react";
import { BattleRoomSettings } from "../../api/battles/types";
import classes from "./GameSettings.module.scss";

type Props = {
  settings: BattleRoomSettings;
  setTimer?: (timer: number) => void;
  setShowAbility?: (showAbility: boolean) => void;
};

const MAX_TIMER = 90;
const MIN_TIMER = 5;

const GameSettings: React.FC<Props> = ({
  settings,
  setTimer,
  setShowAbility,
}) => {
  return (
    <FormGroup className={classes.GameSettings}>
      <div>
        Time per turn
        <Stack direction="row" spacing={2}>
          <Slider
            value={settings.timer}
            max={MAX_TIMER}
            min={MIN_TIMER}
            onChange={setTimer && ((_, value) => setTimer(value as number))}
            disabled={!setTimer}
          />
          <span>{settings.timer} seconds</span>
        </Stack>
      </div>
      <FormControlLabel
        control={
          <Switch
            checked={settings.showAbility}
            onChange={
              setShowAbility && ((_, checked) => setShowAbility(checked))
            }
            readOnly={!setShowAbility}
          />
        }
        label="Show abilities"
        labelPlacement="start"
      ></FormControlLabel>
    </FormGroup>
  );
};

export default GameSettings;
