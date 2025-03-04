import React from "react";
import { Card, CardContent } from "./ui/card";
import { ArrowRight } from "lucide-react";

export const SettleUp = ({ summary }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Settlement Plan</h4>
        <Card>
          <CardContent className="pt-6">
            {summary.detailedBalances && summary.detailedBalances.length > 0 ? (
              <ul className="space-y-4">
                {summary.detailedBalances.map((transfer, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 bg-slate-50 dark:bg-gray-900 p-3 rounded-md"
                  >
                    <span className="font-medium text-red-600">
                      {transfer.from}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                    <span className="font-medium text-green-600">
                      {transfer.to}
                    </span>
                    <span className="ml-auto font-bold">
                      ₹{transfer.amount.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground">
                No settlements needed
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
