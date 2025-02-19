import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IndianRupee, Users, ArrowRight } from "lucide-react";

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Expense Sharing Made Simple
          </h1>
          <p className="text-xl text-muted-foreground">
            Split expenses with friends and keep track of who owes what.
          </p>
        </div>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Create a new expense group or manage existing ones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              className="w-full"
              onClick={() => navigate("/expenses")}
            >
              Go to Expense Manager
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <IndianRupee className="h-8 w-8 text-primary" />
              <CardTitle>Track Expenses</CardTitle>
              <CardDescription>
                Add and manage expenses within your groups
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary" />
              <CardTitle>Manage Groups</CardTitle>
              <CardDescription>
                Create groups and add friends to split expenses
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};
