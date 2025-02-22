import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { personalExpenseService } from "../services/personalExpenseService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonalExpenseForm from "../components/PersonalExpenseForm";
import PersonalExpensesList from "../components/PersonalExpensesList";
import PersonalExpenseDashboard from "../components/PersonalExpenseDashboard";
import { CalendarDateRangePicker } from "../components/CalendarDateRangePicker";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import LoadingSpinner from "../components/LoadingSpinner";

const PersonalExpenses = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    totalCredit: 0,
    totalDebit: 0,
    balance: 0,
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Set time to the beginning of the first day and the current time for 'today'
    firstDayOfMonth.setHours(0, 0, 0, 0);
    today.setHours(23, 59, 59, 999);

    return {
      from: firstDayOfMonth,
      to: today,
    };
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    pages: 1,
  });

  // Fetch expenses based on current filters and pagination
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (dateRange?.from) {
        // If only one date is selected (from === to or to is null)
        if (
          !dateRange.to ||
          dateRange.from.toDateString() === dateRange.to.toDateString()
        ) {
          // Set start of day
          const startDate = new Date(dateRange.from);
          startDate.setHours(0, 0, 0, 0);
          params.startDate = startDate.toISOString();

          // Set end of day
          const endDate = new Date(dateRange.from);
          endDate.setHours(23, 59, 59, 999);
          params.endDate = endDate.toISOString();
        } else {
          // Date range case
          params.startDate = dateRange.from.toISOString();
          params.endDate = dateRange.to.toISOString();
        }
      }

      const response = await personalExpenseService.getPersonalExpenses(params);
      setExpenses(response.data);
      setSummary(response.summary);
      setPagination(response.pagination);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load expenses",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Fetch statistics for dashboard
  const fetchStats = async () => {
    try {
      const params = {
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
      };

      const response = await personalExpenseService.getExpenseStats(params);
      setStats(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load expense statistics",
        variant: "destructive",
      });
    }
  };

  // Initial data load
  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, [dateRange, pagination.page, pagination.limit]);

  // Handle adding a new expense
  const handleAddExpense = async (formData) => {
    setIsSubmitting(true);
    try {
      await personalExpenseService.addPersonalExpense(formData);
      setDialogOpen(false);
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
      fetchExpenses();
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add expense",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle updating an expense
  const handleUpdateExpense = async (id, formData) => {
    setIsSubmitting(true);
    try {
      await personalExpenseService.updatePersonalExpense(id, formData);
      setDialogOpen(false);
      setEditingExpense(null);
      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
      fetchExpenses();
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update expense",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting an expense
  const handleDeleteExpense = async (id) => {
    setIsDeleting(true);
    try {
      await personalExpenseService.deletePersonalExpense(id);

      // Fetch both expenses and summary data
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
      };

      // Fetch new data after deletion
      const response = await personalExpenseService.getPersonalExpenses(params);
      setExpenses(response.data);
      setSummary(response.summary);
      setPagination(response.pagination);

      // Update stats for dashboard
      await fetchStats();

      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (expense) => {
    setEditingExpense(expense);
    setDialogOpen(true);
  };

  // Handle date range change
  const handleDateRangeChange = (range) => {
    // If range is null, set to today
    if (!range || (!range.from && !range.to)) {
      const today = new Date();
      setDateRange({
        from: new Date(today.setHours(0, 0, 0, 0)),
        to: new Date(today.setHours(23, 59, 59, 999)),
      });
    } else {
      // If only one date is selected, set both from and to to that date
      const newRange = {
        from: range.from,
        to: range.to || range.from,
      };
      setDateRange(newRange);
    }
    setPagination({ ...pagination, page: 1 }); // Reset to first page on filter change
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold text-center md:text-left">
              Personal Expenses
            </h1>
            <div className="flex flex-col sm:flex-row justify-center md:justify-end items-center gap-4 w-full">
              <div className="w-full sm:w-auto">
                <CalendarDateRangePicker
                  date={dateRange}
                  setDate={handleDateRangeChange}
                  className="w-full sm:w-auto"
                />
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Expense
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogTitle>
                    {editingExpense ? "Edit Expense" : "Add New Expense"}
                  </DialogTitle>
                  <DialogDescription>
                    Fill out the form below to{" "}
                    {editingExpense ? "update the" : "add a new"} expense.
                  </DialogDescription>
                  <PersonalExpenseForm
                    onSubmit={
                      editingExpense
                        ? (data) =>
                            handleUpdateExpense(editingExpense._id, data)
                        : handleAddExpense
                    }
                    initialData={editingExpense}
                    isLoading={isSubmitting}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-green-50 dark:bg-green-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-600 dark:text-green-400">
                  Total Credit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{summary.totalCredit.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 dark:bg-red-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-600 dark:text-red-400">
                  Total Debit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{summary.totalDebit.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card
              className={`${
                summary.balance >= 0
                  ? "bg-blue-50 dark:bg-blue-900/20"
                  : "bg-orange-50 dark:bg-orange-900/20"
              }`}
            >
              <CardHeader className="pb-2">
                <CardTitle
                  className={`text-sm ${
                    summary.balance >= 0
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-orange-600 dark:text-orange-400"
                  }`}
                >
                  Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{summary.balance.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="list" className="w-full">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
              <TabsTrigger value="list">Expenses List</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-6">
              {loading ? (
                <div className="flex justify-center py-10">
                  <LoadingSpinner />
                </div>
              ) : (
                <PersonalExpensesList
                  expenses={expenses}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onEdit={openEditDialog}
                  onDelete={handleDeleteExpense}
                  isLoading={loading}
                />
              )}
            </TabsContent>

            <TabsContent value="dashboard" className="mt-6">
              {stats ? (
                <PersonalExpenseDashboard stats={stats} dateRange={dateRange} />
              ) : (
                <div className="flex justify-center py-10">
                  <LoadingSpinner />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );
};

export default PersonalExpenses;
