import api from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatGuessFilter, StatGuessRoundResponse } from "@pokenerdle/shared";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";

import classes from "./StatGuess.module.scss";

const DEFAULT_FILTER: StatGuessFilter = { kind: "all" };

const StatGuessPage: React.FC = () => {
  const [filter] = useState<StatGuessFilter>(DEFAULT_FILTER);
  const [roundIndex] = useState(0);
  const [excludeIds] = useState<number[]>([]);

  const { data, isLoading, error } = useQuery<StatGuessRoundResponse>({
    queryKey: ["statGuess", "round", filter, roundIndex],
    queryFn: () => api.statGuess.getRound(filter, excludeIds),
    staleTime: 0,
  });

  return (
    <div className={classes.StatGuess}>
      <Card className="tw:max-w-2xl tw:mx-auto">
        <CardHeader>
          <CardTitle>Stat Guess</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading…</p>}
          {error && <p>Error: {String(error)}</p>}
          {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatGuessPage;
