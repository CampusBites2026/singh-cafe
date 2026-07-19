import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const OrderSourceChart = ({ report }) => {
  const data = [
    {
      name: "Website",
      orders: report.websiteOrders || 0,
    },
    {
      name: "POS",
      orders: report.posOrders || 0,
    },
  ];

  return (
    <div className="chart-card">
      <h3>📍 Order Source Analytics</h3>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="name" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="orders"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OrderSourceChart;