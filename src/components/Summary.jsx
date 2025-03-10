import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const Summary = ({ summary, friends }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Expense Summary</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ₹{summary.totalExpenses.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Per Person Share</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ₹
              {(
                summary.totalExpenses / friends.filter((f) => f).length
              ).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Individual Balances</h4>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(summary.perPersonOwed).map(
            ([person, amount]) =>
              person && (
                <Alert
                  key={person}
                  variant={amount >= 0 ? "default" : "destructive"}
                  className="flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertDescription className="text-md">
                    <span className="font-medium">{person}</span>:{" "}
                    {amount >= 0 ? "Gets back" : "Owes"} ₹
                    {Math.abs(amount).toFixed(2)}
                  </AlertDescription>
                </Alert>
              )
          )}
        </div>
      </div>
    </div>
  );
};
