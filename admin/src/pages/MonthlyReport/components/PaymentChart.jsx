import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#2563eb", "#16a34a"];

const PaymentChart = ({ revenue }) => {
  const websiteData = [
    {
      name: "Online",
      value: revenue?.website?.online || 0,
    },
    {
      name: "COD",
      value: revenue?.website?.cod || 0,
    },
  ];

  const posData = [
    {
      name: "Cash",
      value: revenue?.pos?.cash || 0,
    },
    {
      name: "UPI",
      value: revenue?.pos?.upi || 0,
    },
  ];

  return (
    <div className="payment-chart-grid">

      <div className="chart-card">
        <h3>🌐 Website Payments</h3>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={websiteData}
              dataKey="value"
              outerRadius={90}
              label
            >
              {websiteData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index]}
                />
              ))}
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>🏪 POS Payments</h3>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={posData}
              dataKey="value"
              outerRadius={90}
              label
            >
              {posData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index]}
                />
              ))}
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default PaymentChart;