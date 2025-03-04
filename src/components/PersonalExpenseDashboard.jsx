import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  format,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
} from "date-fns";

const PersonalExpenseDashboard = ({ stats, dateRange }) => {
  if (!stats || !stats.monthlyData || !stats.categoryDistribution) {
    return <div>No data available for the selected period.</div>;
  }

  // Calculate analytics metrics
  const analyticsMetrics = useMemo(() => {
    // Calculate total amounts
    const totalDebit = stats.categoryDistribution.reduce(
      (sum, item) => sum + item.total,
      0
    );

    const totalCredit = stats.monthlyData.reduce(
      (sum, item) => sum + item.credit,
      0
    );

    // Calculate time periods for averages
    let daysDiff = 30; // Default to a month if no date range
    let monthsDiff = 1;
    let yearsDiff = monthsDiff / 12;

    if (dateRange.from && dateRange.to) {
      daysDiff = Math.max(
        differenceInDays(dateRange.to, dateRange.from) + 1,
        1
      );
      monthsDiff = Math.max(
        differenceInMonths(dateRange.to, dateRange.from) + 1,
        1
      );
      yearsDiff = Math.max(
        differenceInYears(dateRange.to, dateRange.from) + 1,
        1
      );

      // Handle edge case where months cross but it's less than a full month
      if (monthsDiff < 1) {
        monthsDiff = 1;
      }

      // Handle case where years cross but it's less than a full year
      if (yearsDiff < 1) {
        yearsDiff = monthsDiff / 12;
      }
    }

    // Calculate spending metrics
    const avgDailySpend = totalDebit / daysDiff;
    const avgMonthlySpend = totalDebit / monthsDiff;
    const avgYearlySpend = totalDebit * (12 / monthsDiff);

    // Calculate income metrics
    const avgDailyIncome = totalCredit / daysDiff;
    const avgMonthlyIncome = totalCredit / monthsDiff;
    const avgYearlyIncome = totalCredit * (12 / monthsDiff);

    // Calculate savings rate
    const savingsRate =
      totalCredit > 0 ? ((totalCredit - totalDebit) / totalCredit) * 100 : 0;

    // Find highest spending day/category combination (if available in data)
    const highestSpendCategory =
      stats.categoryDistribution.length > 0
        ? stats.categoryDistribution.reduce((prev, current) =>
            current.total > prev.total ? current : prev
          )
        : { _id: "N/A", total: 0 };

    // Find month with highest spending
    const highestSpendMonth =
      stats.monthlyData.length > 0
        ? stats.monthlyData.reduce((prev, current) =>
            current.debit > prev.debit ? current : prev
          )
        : { month: "N/A", debit: 0 };

    // Find month with highest income
    const highestIncomeMonth =
      stats.monthlyData.length > 0
        ? stats.monthlyData.reduce((prev, current) =>
            current.credit > prev.credit ? current : prev
          )
        : { month: "N/A", credit: 0 };

    // Calculate spending trend (increasing or decreasing)
    let spendingTrend = "stable";
    if (stats.monthlyData.length >= 2) {
      const sortedMonths = [...stats.monthlyData].sort((a, b) => {
        const [yearA, monthA] = a.month.split("-").map(Number);
        const [yearB, monthB] = b.month.split("-").map(Number);
        return new Date(yearB, monthB - 1, 1) - new Date(yearA, monthA - 1, 1);
      });

      if (sortedMonths.length >= 2) {
        const lastMonth = sortedMonths[0];
        const previousMonth = sortedMonths[1];

        const percentChange =
          ((lastMonth.debit - previousMonth.debit) / previousMonth.debit) * 100;

        if (percentChange > 5) {
          spendingTrend = "increasing";
        } else if (percentChange < -5) {
          spendingTrend = "decreasing";
        }
      }
    }

    // Prepare data for daily spending trend if available
    const spendingTrendData = stats.monthlyData.map((item) => {
      const [year, month] = item.month.split("-").map(Number);
      return {
        name: format(new Date(year, month - 1, 15), "MMM yyyy"),
        amount: item.debit,
      };
    });

    return {
      totalDebit,
      totalCredit,
      avgDailySpend,
      avgMonthlySpend,
      avgYearlySpend,
      avgDailyIncome,
      avgMonthlyIncome,
      avgYearlyIncome,
      savingsRate,
      highestSpendCategory,
      highestSpendMonth,
      highestIncomeMonth,
      spendingTrend,
      spendingTrendData,
    };
  }, [stats, dateRange]);

  // Prepare category distribution data for pie chart
  const totalDebitAmount = stats.categoryDistribution.reduce(
    (sum, item) => sum + item.total,
    0
  );

  const categoryData = stats.categoryDistribution
    .filter((item) => item.total > 0)
    .map((item) => ({
      name: item._id,
      value: item.total,
      percentage: ((item.total / totalDebitAmount) * 100).toFixed(1),
    }))
    .sort((a, b) => b.value - a.value);

  // Format monthly chart data
  const monthlyChartData = stats.monthlyData.map((item) => {
    const [year, month] = item.month.split("-").map(Number);
    const date = new Date(year, month - 1, 15);

    return {
      name: format(date, "MMM yyyy"),
      credit: parseFloat(item.credit.toFixed(2)),
      debit: parseFloat(item.debit.toFixed(2)),
      balance: parseFloat(item.balance.toFixed(2)),
      rawMonth: item.month,
    };
  });

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82ca9d",
    "#ffc658",
    "#8dd1e1",
    "#a4de6c",
    "#d0ed57",
    "#83a6ed",
    "#8884d8",
    "#fa8072",
    "#af19ff",
  ];

  // Get spending trend color
  const getTrendColor = (trend) => {
    switch (trend) {
      case "increasing":
        return "text-red-500";
      case "decreasing":
        return "text-green-500";
      default:
        return "text-blue-500";
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-medium">Expense Analysis</h2>
      </div>

      {/* New Analytics Overview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Average Spending</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily</span>
                  <span className="font-medium">
                    {formatCurrency(analyticsMetrics.avgDailySpend)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly</span>
                  <span className="font-medium">
                    {formatCurrency(analyticsMetrics.avgMonthlySpend)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Yearly (Projected)
                  </span>
                  <span className="font-medium">
                    {formatCurrency(analyticsMetrics.avgYearlySpend)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Income Analytics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Average</span>
                  <span className="font-medium">
                    {formatCurrency(analyticsMetrics.avgMonthlyIncome)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Savings Rate</span>
                  <span className="font-medium">
                    {analyticsMetrics.savingsRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Best Income Month
                  </span>
                  <span className="font-medium">
                    {analyticsMetrics.highestIncomeMonth.month !== "N/A"
                      ? format(
                          new Date(
                            analyticsMetrics.highestIncomeMonth.month.split(
                              "-"
                            )[0],
                            analyticsMetrics.highestIncomeMonth.month.split(
                              "-"
                            )[1] - 1,
                            15
                          ),
                          "MMM yyyy"
                        )
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Spending Insights</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Top Expense Category
                  </span>
                  <span className="font-medium">
                    {analyticsMetrics.highestSpendCategory._id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Highest Spending Month
                  </span>
                  <span className="font-medium">
                    {analyticsMetrics.highestSpendMonth.month !== "N/A"
                      ? format(
                          new Date(
                            analyticsMetrics.highestSpendMonth.month.split(
                              "-"
                            )[0],
                            analyticsMetrics.highestSpendMonth.month.split(
                              "-"
                            )[1] - 1,
                            15
                          ),
                          "MMM yyyy"
                        )
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Spending Trend</span>
                  <span
                    className={`font-medium ${getTrendColor(
                      analyticsMetrics.spendingTrend
                    )}`}
                  >
                    {analyticsMetrics.spendingTrend.charAt(0).toUpperCase() +
                      analyticsMetrics.spendingTrend.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Original Monthly Income & Expenses Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Income & Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Legend />
                <Bar dataKey="credit" name="Income" fill="#4ade80" />
                <Bar dataKey="debit" name="Expenses" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Original Category Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-auto max-h-80">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2">Category</th>
                    <th className="text-right py-2">Amount (₹)</th>
                    <th className="text-right py-2">%</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData.map((category, index) => (
                    <tr key={index}>
                      <td className="py-1.5 flex items-center">
                        <span
                          className="w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        ></span>
                        {category.name}
                      </td>
                      <td className="text-right py-1.5">
                        {category.value.toFixed(2)}
                      </td>
                      <td className="text-right py-1.5">
                        {category.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalExpenseDashboard;
