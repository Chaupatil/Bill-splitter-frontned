import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { X, PlusCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

const emptyRow = {
  amount: "",
  type: "debit",
  category: "",
  description: "",
  date: format(new Date(), "yyyy-MM-dd"),
};

const MultiAddExpensesDialog = ({ open, onOpenChange, onSave }) => {
  const [rows, setRows] = useState([emptyRow]);
  const [isSaving, setIsSaving] = useState(false);

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      {
        amount: "",
        type: "debit",
        category: "",
        description: "",
        date: format(new Date(), "yyyy-MM-dd"),
      },
    ]);
  const removeRow = (index) => setRows(rows.filter((_, i) => i !== index));

  const handleChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const handleSave = async () => {
    const valid = rows.filter((r) => r.amount && r.category && r.type);
    if (valid.length === 0) {
      alert("Please enter at least one valid expense.");
      return;
    }
    setIsSaving(true);
    try {
      await onSave(valid);
      setRows([emptyRow]);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-3 border-b">
          <DialogTitle className="text-xl font-semibold text-foreground">
            Add Multiple Expenses
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Quickly add several expenses at once. Fill in the rows below.
          </p>
        </DialogHeader>

        {/* Table container */}
        <div className="max-h-[65vh] overflow-auto px-6 py-4">
          <table className="w-full border-collapse text-sm rounded-md overflow-hidden">
            <thead className="sticky top-0 bg-muted/50 backdrop-blur-md border-b text-xs text-muted-foreground uppercase">
              <tr>
                <th className="p-2 text-left">Amount (₹)</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={index}
                  className="border-b last:border-none hover:bg-muted/30 transition-colors"
                >
                  <td className="p-2">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={row.amount}
                      onChange={(e) =>
                        handleChange(index, "amount", e.target.value)
                      }
                      className="h-8"
                    />
                  </td>
                  <td className="p-2">
                    <Select
                      value={row.type}
                      onValueChange={(val) => handleChange(index, "type", val)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debit">Debit</SelectItem>
                        <SelectItem value="credit">Credit</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-2">
                    <Input
                      placeholder="e.g. Food"
                      value={row.category}
                      onChange={(e) =>
                        handleChange(index, "category", e.target.value)
                      }
                      className="h-8"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      placeholder="Optional"
                      value={row.description}
                      onChange={(e) =>
                        handleChange(index, "description", e.target.value)
                      }
                      className="h-8"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="date"
                      value={row.date}
                      onChange={(e) =>
                        handleChange(index, "date", e.target.value)
                      }
                      className="h-8"
                    />
                  </td>
                  <td className="text-center">
                    {rows.length > 1 && (
                      <button
                        onClick={() => removeRow(index)}
                        className="p-1 rounded-md text-red-500 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom bar */}
        <div className="flex justify-between items-center px-6 py-4 border-t bg-muted/10">
          <Button
            variant="outline"
            onClick={addRow}
            className="cursor-pointer flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Add Row
          </Button>

          <DialogFooter className="m-0">
            <Button
              onClick={handleSave}
              className="cursor-pointer flex items-center gap-2"
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save All"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MultiAddExpensesDialog;
