import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PersonalExpensesList = ({
  expenses,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
}) => {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="text-center p-10 bg-muted/20 rounded-md">
        <p className="text-muted-foreground">No expenses found</p>
        <p className="text-sm mt-2">
          Add your first expense using the "Add Expense" button
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense._id}>
                <TableCell>
                  {format(new Date(expense.date), "dd MMM yyyy")}
                </TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {expense.description || "-"}
                </TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    expense.type === "credit"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {expense.type === "credit" ? "+" : "-"} ₹
                  {expense.amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(expense)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => onDelete(expense._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.pages > 1 && (
        <Pagination className="justify-center">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  pagination.page > 1 && onPageChange(pagination.page - 1)
                }
                className={
                  pagination.page <= 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              // Show pages around current page
              let pageToShow = i + 1;
              if (pagination.pages > 5) {
                if (pagination.page > 3) {
                  pageToShow = pagination.page - 3 + i;
                }
                if (pageToShow > pagination.pages) {
                  pageToShow = pagination.pages - (4 - i);
                }
              }
              return (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={pageToShow === pagination.page}
                    onClick={() => onPageChange(pageToShow)}
                  >
                    {pageToShow}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  pagination.page < pagination.pages &&
                  onPageChange(pagination.page + 1)
                }
                className={
                  pagination.page >= pagination.pages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default PersonalExpensesList;
