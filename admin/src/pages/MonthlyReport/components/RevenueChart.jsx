import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const RevenueChart = ({ report, mode }) => {
  const chartData = useMemo(() => {
    if (!report?.orders) return [];

    const grouped = {};

    report.orders.forEach((order) => {
      if (String(order.status).toLowerCase() !== "delivered") return;

      const date = new Date(order.createdAt);

      const key =
        mode === "monthly"
          ? date.getDate().toString()
          : `${date.getHours()}:00`;

      const amount =
        Number(order.totalAmount || order.amount || 0);

      grouped[key] = (grouped[key] || 0) + amount;
    });

    return Object.keys(grouped).map((key) => ({
      label: key,
      revenue: grouped[key],
    }));
  }, [report, mode]);

  return (
    <div className="chart-card">
      <h3>Revenue Trend</h3>

      <ResponsiveContainer
        width="100%"
        height={350}
      >
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="label" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#ff6b00"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;