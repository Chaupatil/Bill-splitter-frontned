// // src/components/SettleUp.jsx
// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";

// export const SettleUp = ({ settlements, onSettleExpense }) => {
//   const [selectedSettlement, setSelectedSettlement] = useState(null);

//   return (
//     <div className="space-y-4">
//       <h3 className="text-lg font-medium">Settlements</h3>
//       <div className="space-y-2">
//         {settlements.map((settlement, index) => (
//           <div
//             key={index}
//             className="flex items-center justify-between p-4 border rounded-lg"
//           >
//             <div>
//               <p className="font-medium">
//                 {settlement.from} owes {settlement.to}
//               </p>
//               <p className="text-lg">${settlement.amount.toFixed(2)}</p>
//             </div>
//             <Dialog>
//               <DialogTrigger asChild>
//                 <Button
//                   variant="outline"
//                   onClick={() => setSelectedSettlement(settlement)}
//                 >
//                   Settle Up
//                 </Button>
//               </DialogTrigger>
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Settle Payment</DialogTitle>
//                 </DialogHeader>
//                 <div className="space-y-4">
//                   <p>
//                     Confirm that {settlement.from} has paid {settlement.to} $
//                     {settlement.amount.toFixed(2)}
//                   </p>
//                   <div className="flex justify-end gap-2">
//                     <Button
//                       variant="outline"
//                       onClick={() => setSelectedSettlement(null)}
//                     >
//                       Cancel
//                     </Button>
//                     <Button
//                       onClick={() => {
//                         onSettleExpense(settlement);
//                         setSelectedSettlement(null);
//                       }}
//                     >
//                       Confirm Settlement
//                     </Button>
//                   </div>
//                 </div>
//               </DialogContent>
//             </Dialog>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// src/components/SettleUp.jsx
import React from "react";
import { Button } from "@/components/ui/button";
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

export const SettleUp = ({ groupId, settlements, onSettlementsUpdated }) => {
  const toast = useToast();

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
      <h3 className="text-lg font-medium">Settlements</h3>
      <div className="space-y-2">
        {settlements.map((settlement) => (
          <div
            key={settlement._id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
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
                  Settled on:{" "}
                  {new Date(settlement.settledAt).toLocaleDateString()}
                </p>
              )}
            </div>
            {settlement.status === "PENDING" && (
              <Dialog>
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
                      <Button
                        variant="outline"
                        onClick={() => setSelectedSettlement(null)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={() => handleSettleUp(settlement)}>
                        Confirm Settlement
                      </Button>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
