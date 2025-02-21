import React from "react";
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
import { format, startOfMonth } from "date-fns";

const PersonalExpenseDashboard = ({ stats, dateRange }) => {
  if (!stats || !stats.monthlyData || !stats.categoryDistribution) {
    return <div>No data available for the selected period.</div>;
  }

  // In PersonalExpenseDashboard.jsx
  const monthlyChartData = stats.monthlyData.map((item) => {
    // Make sure we're using the correct date format parsing
    // The item.month is expected to be in "YYYY-MM" format
    const [year, month] = item.month.split("-").map(Number);

    // Create a date object manually to avoid timezone issues
    // Use the 15th day of month to avoid any end-of-month/start-of-month timezone issues
    const date = new Date(year, month - 1, 15);

    return {
      name: format(date, "MMM yyyy"),
      credit: parseFloat(item.credit.toFixed(2)),
      debit: parseFloat(item.debit.toFixed(2)),
      balance: parseFloat(item.balance.toFixed(2)),
      // Store raw month data for debugging if needed
      rawMonth: item.month,
    };
  });
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

  const dateRangeLabel =
    dateRange.from && dateRange.to
      ? `${format(dateRange.from, "dd MMM yyyy")} - ${format(
          dateRange.to,
          "dd MMM yyyy"
        )}`
      : "All time";

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-medium">Expense Analysis</h2>
        <p className="text-sm text-muted-foreground">{dateRangeLabel}</p>
      </div>

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
