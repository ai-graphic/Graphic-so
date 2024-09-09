import React from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

type Props = {
  credits: number;
  tier: string;
};

const CreditTracker = ({ credits, tier }: Props) => {
  const maxCredits = tier === "Free" ? 40 : tier === "Pro" ? 100 : Infinity;
  const progressValue = Math.min((credits / maxCredits) * 100, 100); // Cap progress at 100%

  return (
    <div className="p-6">
      <Card className="p-6">
        <CardContent className="flex flex-col gap-6">
          <CardTitle className="font-light">Credit Tracker</CardTitle>
          <Progress
            value={progressValue} // Use capped progress value
            className="w-full"
          />
          <div className="flex justify-end">
            <p>
              {credits}/{maxCredits === Infinity ? "Unlimited" : maxCredits}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditTracker;
