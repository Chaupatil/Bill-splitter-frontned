import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, IndianRupee, Percent, Calculator } from "lucide-react";

export const SplitOptions = ({
  form,
  showSplitOptions,
  setShowSplitOptions,
  participatingFriends,
  setParticipatingFriends,
  toggleParticipation,
  handleCustomSplitChange,
  validateSplitTotal,
  getTotalPercentage,
}) => {
  const watchAmount = form.watch("amount");
  const watchSplitType = form.watch("splitType");

  // Get only participating friends
  const activeParticipants = participatingFriends.filter(
    (f) => f.participating
  );

  // Calculate actual participant count
  const participantCount = activeParticipants.length;

  return (
    <Accordion
      type="single"
      collapsible
      value={showSplitOptions ? "split-options" : ""}
      onValueChange={(val) => setShowSplitOptions(val === "split-options")}
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
                          <span className="text-xs sm:text-sm">{label}</span>
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
                {participantCount} selected
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
                    onCheckedChange={() => toggleParticipation(friend.name)}
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
                  variant={validateSplitTotal() ? "success" : "destructive"}
                  className={
                    validateSplitTotal()
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      : ""
                  }
                >
                  {validateSplitTotal() ? "Balanced" : "Unbalanced"}
                </Badge>
              </div>

              {participantCount === 0 && (
                <div className="bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 p-3 rounded-md text-sm">
                  Please select at least one participant
                </div>
              )}

              {watchSplitType === "equal" && participantCount > 0 && (
                <div className="bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 p-4 rounded-md flex items-center justify-between">
                  <span>Each person pays:</span>
                  <span className="font-medium text-lg">
                    ₹{(parseFloat(watchAmount) / participantCount).toFixed(2)}
                  </span>
                </div>
              )}

              {watchSplitType === "exact" && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md space-y-3">
                  {activeParticipants.map((friend, index) => (
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
                          ₹{parseFloat(watchAmount).toFixed(2)}
                        </span>
                      </p>
                    ) : (
                      <div className="space-y-1">
                        <p className="flex items-center justify-between">
                          <span>Current total:</span>
                          <span className="font-medium">
                            ₹
                            {activeParticipants
                              .reduce(
                                (sum, f) => sum + parseFloat(f.amount || 0),
                                0
                              )
                              .toFixed(2)}
                          </span>
                        </p>
                        <p className="flex items-center justify-between">
                          <span>Expected total:</span>
                          <span className="font-medium">
                            ₹{parseFloat(watchAmount).toFixed(2)}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {watchSplitType === "percentage" && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md space-y-3">
                  {activeParticipants.map((friend, index) => (
                    <div key={index} className="flex items-center gap-2">
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
                        ₹{parseFloat(friend.amount || 0).toFixed(2)}
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
                      {participantCount > 0
                        ? (parseFloat(watchAmount) / participantCount).toFixed(
                            2
                          )
                        : "0.00"}
                    </span>
                  </div>

                  {activeParticipants.map((friend, index) => (
                    <div key={index} className="flex items-center gap-2">
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
                        ₹{parseFloat(friend.amount || 0).toFixed(2)}
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
                      <p>Adjustments must sum to zero for the total to match</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
