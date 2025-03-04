import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, CalendarIcon, IndianRupee } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Extended form validation schema
const expenseFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.string().min(1, "Amount is required"),
  paidBy: z.string().min(1, "Paid by is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  splitType: z.enum(["equal", "exact", "percentage", "adjust"]),
  splitDetails: z.record(z.any()).optional(),
});

export const ExpenseForm = ({ onAddExpense, friends, loading }) => {
  const [participatingFriends, setParticipatingFriends] = useState([]);

  // Initialize form with extended schema
  const form = useForm({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: "",
      amount: "",
      paidBy: "",
      date: new Date(),
      splitType: "equal",
      splitDetails: {},
    },
  });

  const watchAmount = form.watch("amount");
  const watchSplitType = form.watch("splitType");

  // Initialize participating friends when form loads or friends change
  React.useEffect(() => {
    if (friends && friends.length > 0) {
      const initialParticipants = friends
        .filter((friend) => friend?.trim())
        .map((friend) => ({
          name: friend,
          participating: true,
          amount: 0,
          percentage: 0,
          adjustment: 0,
        }));

      setParticipatingFriends(initialParticipants);
    }
  }, [friends]);

  // Toggle participation of a friend
  const toggleParticipation = (friendName) => {
    setParticipatingFriends((prev) =>
      prev.map((friend) =>
        friend.name === friendName
          ? { ...friend, participating: !friend.participating }
          : friend
      )
    );
  };

  // Calculate split amounts based on split type
  React.useEffect(() => {
    if (!watchAmount || isNaN(parseFloat(watchAmount))) return;

    const totalAmount = parseFloat(watchAmount);
    // Get only participating friends
    const participants = participatingFriends.filter((f) => f.participating);

    if (participants.length === 0) return;

    let updatedFriends = [...participatingFriends];

    switch (watchSplitType) {
      case "equal":
        const equalShare = totalAmount / participants.length;
        updatedFriends = updatedFriends.map((friend) => ({
          ...friend,
          amount: friend.participating ? equalShare.toFixed(2) : 0,
        }));
        break;

      case "percentage":
        // Default to equal percentage if not yet set
        if (participants.every((p) => p.percentage === 0)) {
          const equalPercentage = 100 / participants.length;
          updatedFriends = updatedFriends.map((friend) => ({
            ...friend,
            percentage: friend.participating ? equalPercentage : 0,
            amount: friend.participating
              ? ((totalAmount * equalPercentage) / 100).toFixed(2)
              : 0,
          }));
        } else {
          // Update amounts based on current percentages
          updatedFriends = updatedFriends.map((friend) => ({
            ...friend,
            amount: friend.participating
              ? ((totalAmount * friend.percentage) / 100).toFixed(2)
              : 0,
          }));
        }
        break;

      case "adjust":
        // Equal base amount with adjustments
        const baseAmount = totalAmount / participants.length;
        updatedFriends = updatedFriends.map((friend) => ({
          ...friend,
          amount: friend.participating
            ? (baseAmount + (friend.adjustment || 0)).toFixed(2)
            : 0,
        }));
        break;

      // For exact amounts, we don't auto-calculate - user sets them directly
    }

    setParticipatingFriends(updatedFriends);

    // Update form splitDetails - ONLY for participating friends
    const splitDetails = {};
    updatedFriends.forEach((friend) => {
      if (friend.participating) {
        splitDetails[friend.name] = {
          amount: parseFloat(friend.amount),
          percentage: friend.percentage || 0,
          adjustment: friend.adjustment || 0,
        };
      }
    });
    form.setValue("splitDetails", splitDetails);
  }, [
    watchAmount,
    watchSplitType,
    participatingFriends.map((f) => f.participating).join(),
  ]);

  // Handle custom input changes for different split types
  const handleCustomSplitChange = (friendName, field, value) => {
    const numValue = parseFloat(value);
    const totalAmount = parseFloat(watchAmount);

    // Get only participating friends
    const participants = participatingFriends.filter((f) => f.participating);

    if (isNaN(numValue) || isNaN(totalAmount)) return;

    setParticipatingFriends((prev) => {
      const updated = prev.map((friend) => {
        if (friend.name !== friendName) return friend;

        switch (field) {
          case "amount":
            return { ...friend, amount: value };
          case "percentage":
            return {
              ...friend,
              percentage: numValue,
              amount: ((totalAmount * numValue) / 100).toFixed(2),
            };
          case "adjustment":
            const baseAmount = totalAmount / participants.length;
            return {
              ...friend,
              adjustment: numValue,
              amount: (baseAmount + numValue).toFixed(2),
            };
          default:
            return friend;
        }
      });

      // Update form splitDetails - ONLY for participating friends
      const splitDetails = {};
      updated.forEach((friend) => {
        if (friend.participating) {
          splitDetails[friend.name] = {
            amount: parseFloat(friend.amount),
            percentage: friend.percentage || 0,
            adjustment: friend.adjustment || 0,
          };
        }
      });
      form.setValue("splitDetails", splitDetails);

      return updated;
    });
  };

  // Validate total split before submission
  const validateSplitTotal = () => {
    if (watchSplitType === "equal") return true;

    const totalAmount = parseFloat(watchAmount);

    // Only sum participating friends
    const splitSum = participatingFriends
      .filter((f) => f.participating)
      .reduce((sum, friend) => sum + parseFloat(friend.amount || 0), 0);

    // Allow small floating point differences (less than 1 cent)
    return Math.abs(totalAmount - splitSum) < 0.01;
  };

  // Get total percentage (only from participating friends)
  const getTotalPercentage = () => {
    return participatingFriends
      .filter((f) => f.participating)
      .reduce((sum, f) => sum + (parseFloat(f.percentage) || 0), 0);
  };

  // Handle form submission
  const onSubmit = (values) => {
    // Validate split totals match expense amount
    if (!validateSplitTotal()) {
      form.setError("splitDetails", {
        type: "manual",
        message: "Split amounts must equal the total expense amount",
      });
      return;
    }

    // Get the list of participating friends
    const participants = participatingFriends
      .filter((f) => f.participating)
      .map((friend) => friend.name);

    // Add split information to the expense data
    const expenseData = {
      ...values,
      amount: parseFloat(values.amount),
      // Only include participating friends in the split details
      splitDetails: Object.fromEntries(
        participatingFriends
          .filter((f) => f.participating)
          .map((friend) => [
            friend.name,
            {
              amount: parseFloat(friend.amount),
              percentage: friend.percentage || 0,
              adjustment: friend.adjustment || 0,
            },
          ])
      ),
      // Add a participants array to explicitly track who's in this expense
      participants: participants,
    };

    onAddExpense(expenseData);
    form.reset();

    // Reset participating friends on submit
    const resetParticipants = friends
      .filter((friend) => friend?.trim())
      .map((friend) => ({
        name: friend,
        participating: true,
        amount: 0,
        percentage: 0,
        adjustment: 0,
      }));
    setParticipatingFriends(resetParticipants);
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-slate-50 dark:bg-slate-800">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Expense
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Description"
                        {...field}
                        className="shadow-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <IndianRupee className="h-4 w-4 absolute left-3 top-3 text-gray-500" />
                        <Input
                          type="number"
                          placeholder="Amount"
                          min="0"
                          step="0.01"
                          className="pl-10 shadow-sm"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paidBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paid By</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                      >
                        <option value="">Select person</option>
                        {friends.map((friend, index) =>
                          friend ? (
                            <option key={index} value={friend}>
                              {friend}
                            </option>
                          ) : null
                        )}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal shadow-sm",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormMessage name="splitDetails" />

            <Button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
