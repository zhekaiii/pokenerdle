import {
  AccessTimeOutlined,
  SettingsOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import {
  FormControlLabel,
  FormGroup,
  Slider,
  Stack,
  Switch,
  Typography,
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
      <Typography>
        <SettingsOutlined className="tw-mr-2" fontSize="small" />
        <b>Game Settings</b>
      </Typography>

      <div>
        <Typography variant="subtitle2">
          <AccessTimeOutlined className="tw-mr-2" fontSize="small" />
          Time per turn: {settings.timer} seconds
        </Typography>
        <Stack direction="row" spacing={2}>
          <Slider
            value={settings.timer}
            max={MAX_TIMER}
            min={MIN_TIMER}
            onChange={setTimer && ((_, value) => setTimer(value as number))}
            disabled={!setTimer}
            size="small"
          />
        </Stack>
      </div>

      <FormControlLabel
        className="tw-justify-between !tw-mx-0"
        control={
          <Switch
            checked={settings.showAbility}
            onChange={
              setShowAbility && ((_, checked) => setShowAbility(checked))
            }
          />
        }
        label={
          <div>
            <Typography variant="subtitle2">
              {settings.showAbility ? (
                <VisibilityOutlined className="tw-mr-2" fontSize="small" />
              ) : (
                <VisibilityOffOutlined className="tw-mr-2" fontSize="small" />
              )}
              Show abilities
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Show the abilities of Pokémon during the battle
            </Typography>
          </div>
        }
        labelPlacement="start"
        disabled={!setShowAbility}
      ></FormControlLabel>
    </FormGroup>
  );
};

export default GameSettings;
