import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { expenseGroupService } from "../services/api";
import { Card, CardContent } from "./ui/card";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";

export const SettleUp = ({
  groupId,
  settlements,
  onSettlementsUpdated,
  summary,
}) => {
  const { toast } = useToast();
  const [selectedSettlement, setSelectedSettlement] = useState(null);

  const pendingSettlements = settlements.filter((s) => s.status === "PENDING");
  const completedSettlements = settlements.filter(
    (s) => s.status === "COMPLETED"
  );

  const handleSettleUp = async (settlement) => {
    try {
      await expenseGroupService.completeSettlement(groupId, settlement._id);
      toast({
        title: "Success",
        description: "Settlement marked as completed",
      });
      // Refresh settlements list
      onSettlementsUpdated();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete settlement",
        variant: "destructive",
      });
    }
  };

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
      {/* <Separator className="my-6" />
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingSettlements.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            History ({completedSettlements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-2 mt-4">
          {pendingSettlements.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              No pending settlements. Everyone's all settled up!
            </div>
          ) : (
            pendingSettlements.map((settlement) => (
              <SettlementCard
                key={settlement._id}
                settlement={settlement}
                onSettleUp={handleSettleUp}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-2 mt-4">
          {completedSettlements.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              No completed settlements yet.
            </div>
          ) : (
            completedSettlements.map((settlement) => (
              <SettlementCard
                key={settlement._id}
                settlement={settlement}
                completed={true}
              />
            ))
          )}
        </TabsContent>
      </Tabs> */}
    </div>
  );
};

const SettlementCard = ({ settlement, onSettleUp, completed = false }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div>
        <p className="font-medium">
          {settlement.from} owes {settlement.to}
        </p>
        <p className="text-lg">${settlement.amount.toFixed(2)}</p>
        <p className="text-sm text-muted-foreground">
          Status: {settlement.status}
        </p>
        {settlement.settledAt && (
          <p className="text-sm text-muted-foreground">
            Settled on: {new Date(settlement.settledAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {!completed && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Settle Up</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Settlement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                Confirm that {settlement.from} has paid {settlement.to} $
                {settlement.amount.toFixed(2)}
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    onSettleUp(settlement);
                    setDialogOpen(false);
                  }}
                >
                  Confirm Settlement
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const SettlementStats = ({ settlements }) => {
  const totalPending = settlements
    .filter((s) => s.status === "PENDING")
    .reduce((sum, s) => sum + s.amount, 0);

  const totalSettled = settlements
    .filter((s) => s.status === "COMPLETED")
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="p-4 border rounded-lg bg-muted">
        <h4 className="text-sm font-medium text-muted-foreground">Pending</h4>
        <p className="text-2xl font-bold">${totalPending.toFixed(2)}</p>
      </div>
      <div className="p-4 border rounded-lg bg-muted">
        <h4 className="text-sm font-medium text-muted-foreground">Settled</h4>
        <p className="text-2xl font-bold">${totalSettled.toFixed(2)}</p>
      </div>
    </div>
  );
};
