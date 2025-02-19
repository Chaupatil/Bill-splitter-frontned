import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export const ExpensesList = ({ expenses, onDeleteExpense }) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const formatDate = (expense) => {
    const dateValue = expense.date || expense.createdAt;
    if (!dateValue) {
      return "Date not available";
    }

    try {
      if (dateValue instanceof Date) {
        return isValid(dateValue)
          ? format(dateValue, "PPP")
          : "Date not available";
      }

      if (typeof dateValue === "string") {
        const date = parseISO(dateValue);
        return isValid(date) ? format(date, "PPP") : "Date not available";
      }

      return "Date not available";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date not available";
    }
  };

  const handleDeleteClick = (expenseId) => {
    setExpenseToDelete(expenseId);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (expenseToDelete) {
      onDeleteExpense(expenseToDelete);
      setIsDeleteOpen(false);
      setExpenseToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteOpen(false);
    setExpenseToDelete(null);
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Expenses</h3>
      {expenses && expenses.length > 0 ? (
        <div className="space-y-2">
          {expenses.map((expense, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg flex justify-between items-center"
            >
              <div className="space-y-1">
                <p className="font-medium">{expense.description}</p>
                <div className="text-sm text-gray-600 space-y-0.5">
                  <p>
                    {expense.paidBy} paid ₹
                    {parseFloat(expense.amount).toFixed(2)}
                  </p>
                  <p className="text-gray-500">{formatDate(expense)}</p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDeleteClick(expense._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No expenses found</p>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
