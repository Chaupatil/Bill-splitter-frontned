import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  CalendarIcon,
  IndianRupee,
  Users,
  Percent,
  Calculator,
} from "lucide-react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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
  const [showSplitOptions, setShowSplitOptions] = useState(false);
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

    // Update form splitDetails
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
            const participants = prev.filter((f) => f.participating);
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

      // Update form splitDetails
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
    const splitSum = participatingFriends
      .filter((f) => f.participating)
      .reduce((sum, friend) => sum + parseFloat(friend.amount || 0), 0);

    // Allow small floating point differences (less than 1 cent)
    return Math.abs(totalAmount - splitSum) < 0.01;
  };

  // Get total percentage
  const getTotalPercentage = () => {
    return participatingFriends
      .filter((f) => f.participating)
      .reduce((sum, f) => sum + (f.percentage || 0), 0);
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

    // Add split information to the expense data
    const expenseData = {
      ...values,
      splitDetails: Object.fromEntries(
        participatingFriends
          .filter((f) => f.participating)
          .map((friend) => [friend.name, { amount: parseFloat(friend.amount) }])
      ),
    };

    onAddExpense(expenseData);
    setShowSplitOptions(false);
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

  // Get icon based on split type
  const getSplitTypeIcon = (type) => {
    switch (type) {
      case "equal":
        return <Users className="w-4 h-4" />;
      case "exact":
        return <IndianRupee className="w-4 h-4" />;
      case "percentage":
        return <Percent className="w-4 h-4" />;
      case "adjust":
        return <Calculator className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Get split type label
  const getSplitTypeLabel = (type) => {
    switch (type) {
      case "equal":
        return "Equal Split";
      case "exact":
        return "Exact Amount";
      case "percentage":
        return "By Percentage";
      case "adjust":
        return "Equal with Adjustments";
      default:
        return "";
    }
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

            {/* Redesigned Split Options Accordion */}
            <Accordion
              type="single"
              collapsible
              value={showSplitOptions ? "split-options" : ""}
              onValueChange={(val) =>
                setShowSplitOptions(val === "split-options")
              }
              className="border rounded-lg overflow-hidden"
            >
              <AccordionItem value="split-options" className="border-none">
                <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium">
                  Split Options
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-6">
                  {/* Split Type Selection - Tabs */}
                  <FormField
                    control={form.control}
                    name="splitType"
                    render={({ field }) => (
                      <FormItem className="space-y-4 mb-6">
                        <FormLabel>Split Type</FormLabel>
                        <FormControl>
                          <Tabs
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                            className="w-full mt-2"
                          >
                            <TabsList className="h-full grid grid-cols-4 mb-2">
                              {[
                                {
                                  type: "equal",
                                  label: "Equal",
                                  icon: <Users className="w-4 h-4" />,
                                },
                                {
                                  type: "exact",
                                  label: "Exact",
                                  icon: <IndianRupee className="w-4 h-4" />,
                                },
                                {
                                  type: "percentage",
                                  label: "Percent",
                                  icon: <Percent className="w-4 h-4" />,
                                },
                                {
                                  type: "adjust",
                                  label: "Adjust",
                                  icon: <Calculator className="w-4 h-4" />,
                                },
                              ].map(({ type, label, icon }) => (
                                <TabsTrigger
                                  key={type}
                                  value={type}
                                  className="flex flex-col items-center gap-1 py-2 px-1 sm:flex-row sm:gap-2"
                                >
                                  {icon}
                                  <span className="text-xs sm:text-sm">
                                    {label}
                                  </span>
                                </TabsTrigger>
                              ))}
                            </TabsList>

                            {/* Tab content description in a fixed height container */}
                            <div className="min-h-[48px] text-sm text-slate-500 dark:text-slate-400 mb-4 mt-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                              {watchSplitType === "equal" &&
                                "Split expense equally between all participants"}
                              {watchSplitType === "exact" &&
                                "Specify exact amount each person pays"}
                              {watchSplitType === "percentage" &&
                                "Split by percentage (total must be 100%)"}
                              {watchSplitType === "adjust" &&
                                "Equal split with individual adjustments"}
                            </div>
                          </Tabs>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Participants Selection */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Participants</h4>
                      <Badge variant="outline" className="text-xs">
                        {
                          participatingFriends.filter((f) => f.participating)
                            .length
                        }{" "}
                        selected
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-md">
                      {participatingFriends.map((friend, index) => (
                        <div
                          key={index}
                          className={`flex items-center space-x-2 p-2 rounded ${
                            friend.participating
                              ? "bg-white dark:bg-slate-700 shadow-sm"
                              : ""
                          }`}
                        >
                          <Checkbox
                            id={`friend-${index}`}
                            checked={friend.participating}
                            onCheckedChange={() =>
                              toggleParticipation(friend.name)
                            }
                          />
                          <label
                            htmlFor={`friend-${index}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {friend.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Split Details */}
                  {watchAmount && parseFloat(watchAmount) > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Split Details</h4>
                        <Badge
                          variant={
                            validateSplitTotal() ? "success" : "destructive"
                          }
                          className={
                            validateSplitTotal()
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : ""
                          }
                        >
                          {validateSplitTotal() ? "Balanced" : "Unbalanced"}
                        </Badge>
                      </div>

                      {participatingFriends.filter((f) => f.participating)
                        .length === 0 && (
                        <div className="bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 p-3 rounded-md text-sm">
                          Please select at least one participant
                        </div>
                      )}

                      {watchSplitType === "equal" &&
                        participatingFriends.some((f) => f.participating) && (
                          <div className="bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 p-4 rounded-md flex items-center justify-between">
                            <span>Each person pays:</span>
                            <span className="font-medium text-lg">
                              ₹
                              {(
                                parseFloat(watchAmount) /
                                participatingFriends.filter(
                                  (f) => f.participating
                                ).length
                              ).toFixed(2)}
                            </span>
                          </div>
                        )}

                      {watchSplitType === "exact" && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md space-y-3">
                          {participatingFriends
                            .filter((friend) => friend.participating)
                            .map((friend, index) => (
                              <div key={index} className="flex items-center">
                                <span className="w-1/3 text-sm font-medium">
                                  {friend.name}
                                </span>
                                <div className="w-2/3 relative">
                                  <IndianRupee className="h-4 w-4 absolute left-3 top-2.5 text-gray-500" />
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="pl-10"
                                    value={friend.amount || ""}
                                    onChange={(e) =>
                                      handleCustomSplitChange(
                                        friend.name,
                                        "amount",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Amount"
                                  />
                                </div>
                              </div>
                            ))}

                          <div
                            className={`mt-4 p-3 rounded-md text-sm ${
                              validateSplitTotal()
                                ? "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                                : "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                            }`}
                          >
                            {validateSplitTotal() ? (
                              <p className="flex items-center justify-between">
                                <span>Total amount:</span>
                                <span className="font-medium">
                                  ${parseFloat(watchAmount).toFixed(2)}
                                </span>
                              </p>
                            ) : (
                              <div className="space-y-1">
                                <p className="flex items-center justify-between">
                                  <span>Current total:</span>
                                  <span className="font-medium">
                                    ₹
                                    {participatingFriends
                                      .filter((f) => f.participating)
                                      .reduce(
                                        (sum, f) =>
                                          sum + parseFloat(f.amount || 0),
                                        0
                                      )
                                      .toFixed(2)}
                                  </span>
                                </p>
                                <p className="flex items-center justify-between">
                                  <span>Expected total:</span>
                                  <span className="font-medium">
                                    ${parseFloat(watchAmount).toFixed(2)}
                                  </span>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {watchSplitType === "percentage" && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md space-y-3">
                          {participatingFriends
                            .filter((friend) => friend.participating)
                            .map((friend, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <span className="w-1/4 text-sm font-medium truncate">
                                  {friend.name}
                                </span>
                                <div className="w-1/3 relative">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={friend.percentage || ""}
                                    onChange={(e) =>
                                      handleCustomSplitChange(
                                        friend.name,
                                        "percentage",
                                        e.target.value
                                      )
                                    }
                                    placeholder="%"
                                  />
                                  <span className="absolute right-3 top-2.5 text-gray-500">
                                    %
                                  </span>
                                </div>
                                <span className="text-sm">=</span>
                                <div className="flex-1 bg-white dark:bg-slate-700 p-2 rounded-md text-sm">
                                  ${parseFloat(friend.amount || 0).toFixed(2)}
                                </div>
                              </div>
                            ))}

                          <div
                            className={`mt-4 p-3 rounded-md text-sm ${
                              getTotalPercentage() === 100
                                ? "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                                : "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                            }`}
                          >
                            <p className="flex items-center justify-between">
                              <span>Total percentage:</span>
                              <span className="font-medium">
                                {getTotalPercentage().toFixed(1)}%
                              </span>
                            </p>
                            {getTotalPercentage() !== 100 && (
                              <p className="mt-1 text-xs italic">
                                Percentages must total exactly 100%
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {watchSplitType === "adjust" && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md space-y-3">
                          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md mb-4 flex items-center justify-between">
                            <span className="text-sm text-blue-800 dark:text-blue-200">
                              Base amount per person:
                            </span>
                            <span className="font-medium text-blue-800 dark:text-blue-200">
                              ₹
                              {(
                                parseFloat(watchAmount) /
                                participatingFriends.filter(
                                  (f) => f.participating
                                ).length
                              ).toFixed(2)}
                            </span>
                          </div>

                          {participatingFriends
                            .filter((friend) => friend.participating)
                            .map((friend, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <span className="w-1/4 text-sm font-medium truncate">
                                  {friend.name}
                                </span>
                                <div className="w-1/3 relative">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={friend.adjustment || ""}
                                    onChange={(e) =>
                                      handleCustomSplitChange(
                                        friend.name,
                                        "adjustment",
                                        e.target.value
                                      )
                                    }
                                    placeholder="+/- amount"
                                    className={
                                      friend.adjustment > 0
                                        ? "border-green-300"
                                        : friend.adjustment < 0
                                        ? "border-red-300"
                                        : ""
                                    }
                                  />
                                  <span className="absolute left-3 top-2.5 text-gray-500">
                                    {friend.adjustment > 0 ? "+" : ""}
                                  </span>
                                </div>
                                <span className="text-sm">=</span>
                                <div className="flex-1 bg-white dark:bg-slate-700 p-2 rounded-md text-sm font-medium">
                                  ${parseFloat(friend.amount || 0).toFixed(2)}
                                </div>
                              </div>
                            ))}

                          <div
                            className={`mt-4 p-3 rounded-md text-sm ${
                              validateSplitTotal()
                                ? "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                                : "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                            }`}
                          >
                            {validateSplitTotal() ? (
                              <p>Adjustments are balanced correctly</p>
                            ) : (
                              <p>
                                Adjustments must sum to zero for the total to
                                match
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

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
