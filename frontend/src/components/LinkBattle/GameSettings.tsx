import { Clock4, Settings } from "lucide-react";
import React from "react";
import { BattleRoomSettings } from "../../api/battles/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Slider } from "../ui/Slider";
import { Switch } from "../ui/Switch";
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
    <Card>
      <CardHeader>
        <CardTitle>
          <Settings className="tw-mr-2 tw-inline" />
          Game Settings
        </CardTitle>
      </CardHeader>
      <CardContent className={classes.GameSettings__Content}>
        <div>
          <span>
            <Clock4 className="tw-mr-2  tw-inline" />
            Time per turn: {settings.timer} seconds
          </span>
          <Slider
            className="tw-mt-2"
            value={[settings.timer]}
            max={MAX_TIMER}
            min={MIN_TIMER}
            onValueChange={setTimer && (([value]) => setTimer(value))}
            disabled={!setTimer}
          />
        </div>

        <div className="tw-flex tw-items-center tw-justify-between">
          <label htmlFor="showAbility">
            <div>Show Pokémon abilities</div>
            <small className="tw-text-muted-foreground">
              Show the abilities of Pokémon during the battle
            </small>
          </label>
          <Switch
            id="showAbility"
            checked={settings.showAbility}
            onCheckedChange={
              setShowAbility && ((checked) => setShowAbility(checked))
            }
            disabled={!setShowAbility}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GameSettings;
