import React from "react";
import "./DashboardCards.css";

const DashboardCards = ({ report }) => {
  if (!report) return null;

  const revenue = report.revenue || {};
  const status = report.status || {};

  const cards = [
    {
      title: "Total Orders",
      value: report.totalOrders || 0,
      icon: "📦",
    },
    {
      title: "Delivered",
      value: status.delivered || 0,
      icon: "✅",
    },
    {
      title: "Rejected",
      value: status.rejected || 0,
      icon: "❌",
    },
    {
      title: "Gross Revenue",
      value: `₹${revenue.grossRevenue || 0}`,
      icon: "💰",
    },
    {
      title: "Net Revenue",
      value: `₹${revenue.netRevenue || 0}`,
      icon: "💵",
    },
    {
      title: "Average Order",
      value: `₹${revenue.averageOrderValue || 0}`,
      icon: "📊",
    },
    {
      title: "Website Orders",
      value: report.websiteOrders || 0,
      icon: "🌐",
    },
    {
      title: "POS Orders",
      value: report.posOrders || 0,
      icon: "🏪",
    },
  ];

  return (
    <div className="dashboard-grid">
      {cards.map((card, index) => (
        <div className="dashboard-card" key={index}>
          <div className="card-icon">{card.icon}</div>

          <div className="card-info">
            <h4>{card.title}</h4>
            <h2>{card.value}</h2>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;