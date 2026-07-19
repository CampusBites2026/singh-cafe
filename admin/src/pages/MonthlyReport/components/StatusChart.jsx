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

const StatusChart = ({ status }) => {
  const data = [
    {
      name: "Delivered",
      value: status.delivered || 0,
    },
    {
      name: "Preparing",
      value: status.preparing || 0,
    },
    {
      name: "Prepared",
      value: status.prepared || 0,
    },
    {
      name: "Pending",
      value: status.pending || 0,
    },
    {
      name: "Rejected",
      value: status.rejected || 0,
    },
    {
      name: "Cancelled",
      value: status.cancelled || 0,
    },
  ];

  return (
    <div className="chart-card">
      <h3>📊 Order Status Analytics</h3>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="name" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="value"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusChart;