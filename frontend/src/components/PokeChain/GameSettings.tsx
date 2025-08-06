import { BattleRoomSettings } from "@pokenerdle/shared";
import { Clock4, Settings } from "lucide-react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Label } from "../ui/Label";
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
    <Card className="tw:max-w-full">
      <CardHeader>
        <CardTitle>
          <Settings className="tw:mr-2 tw:inline" />
          Game Settings
        </CardTitle>
      </CardHeader>
      <CardContent className={classes.GameSettings__Content}>
        <div>
          <Label>
            <Clock4 className="tw:mr-2  tw:inline" />
            Time per turn: {settings.timer} seconds
          </Label>
          {setTimer && (
            <Slider
              className="tw:mt-2"
              value={[settings.timer]}
              max={MAX_TIMER}
              min={MIN_TIMER}
              onValueChange={([value]) => setTimer(value)}
              step={5}
            />
          )}
        </div>

        <div className="tw:flex tw:items-center tw:justify-between">
          <Label htmlFor="showAbility">
            <div>
              {!setShowAbility && !settings.showAbility ? "Hide" : "Show"}{" "}
              Pokémon abilities
            </div>
            <small className="tw:text-muted-foreground">
              Abilities of Pokémon during the battle will be{" "}
              {settings.showAbility ? "shown" : "hidden"}
            </small>
          </Label>
          {setShowAbility && (
            <Switch
              id="showAbility"
              checked={settings.showAbility}
              onCheckedChange={(checked) => setShowAbility(checked)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GameSettings;
