import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import React from "react";

const DailyChallengeRules: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="tw:text-3xl tw:text-center">
          Rules of Daily Challenge
        </CardTitle>
      </CardHeader>
      <CardContent className="tw:space-y-6">
        <section>
          <h2 className="tw:text-xl tw:font-semibold tw:mb-3">🔍 Objective</h2>
          <p>Guess the daily mystery Pokémon in 8 tries or less!</p>
        </section>
      </CardContent>
    </Card>
  );
};

export default DailyChallengeRules;
