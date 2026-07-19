import React, { useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./MonthlyReport.css";
import DashboardCards from "./components/DashboardCards";
import RevenueChart from "./components/RevenueChart";
import PaymentChart from "./components/PaymentChart";
import StatusChart from "./components/StatusChart";
import OrderSourceChart from "./components/OrderSourceChart";

const API_MONTHLY =
  "https://singh-cafe-4pum.onrender.com/api/reports/monthly";

const API_DAILY =
  "https://singh-cafe-4pum.onrender.com/api/reports/daily";

const MonthlyReport = () => {
  const [mode, setMode] = useState("monthly");
  const [date, setDate] = useState("");

  const [loading, setLoading] = useState(false);

  const [report, setReport] = useState(null);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [paymentFilter, setPaymentFilter] =
    useState("all");

  const [showModal, setShowModal] =
    useState(false);

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const fetchReport = async () => {
    if (!date) {
      toast.warning(
        `Please select ${
          mode === "monthly"
            ? "a month"
            : "a date"
        }`
      );
      return;
    }

    setLoading(true);

    try {
      const url =
        mode === "monthly"
          ? `${API_MONTHLY}?month=${date}`
          : `${API_DAILY}?date=${date}`;

      const res = await axios.get(url);

      if (res.data.success === false) {
        toast.error(
          res.data.message ||
            "Unable to generate report"
        );
      } else {
        setReport(res.data);
      }
    } catch (err) {
      console.error(err);

      toast.error(
        "Unable to load report."
      );
    }

    setLoading(false);
  };

  const openOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeOrder = () => {
    setSelectedOrder(null);
    setShowModal(false);
  };

  const summary = report || {};

  const revenue =
    summary.revenue || {};

  const sales =
    summary.sales || {};

  const status =
    summary.status || {};

  const orders =
    summary.orders || [];

  const filteredOrders =
    useMemo(() => {
      return orders.filter((order) => {
        const matchesSearch =
          search === "" ||
          order.orderNumber
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          order.address?.fullName
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesStatus =
          statusFilter === "all" ||
          order.status?.toLowerCase() ===
            statusFilter.toLowerCase();

        let paymentName = "";

        if (order.source === "POS") {
          paymentName =
            order.paymentMethod;
        } else {
          paymentName = order.payment
            ? "online"
            : "cod";
        }

        const matchesPayment =
          paymentFilter === "all" ||
          paymentName
            ?.toLowerCase()
            .includes(
              paymentFilter.toLowerCase()
            );

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPayment
        );
      });
    }, [
      orders,
      search,
      statusFilter,
      paymentFilter,
    ]);
      return (
    <div className="mr-page">

      <div className="mr-header no-print">

        <h2 className="mr-title">
          📊 Sales & Accounting Report
        </h2>

        <div className="mr-controls">

          <select
            value={mode}
            onChange={(e) =>
              setMode(e.target.value)
            }
          >
            <option value="monthly">
              Monthly
            </option>

            <option value="daily">
              Daily
            </option>
          </select>

          {mode === "monthly" ? (
            <input
              type="month"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
            />
          ) : (
            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
            />
          )}

          <input
            type="text"
            placeholder="Search Order / Customer..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
          >
            <option value="all">
              All Status
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="preparing">
              Preparing
            </option>

            <option value="prepared">
              Prepared
            </option>

            <option value="delivered">
              Delivered
            </option>

            <option value="rejected">
              Rejected
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) =>
              setPaymentFilter(
                e.target.value
              )
            }
          >
            <option value="all">
              All Payments
            </option>

            <option value="online">
              Online
            </option>

            <option value="cod">
              COD
            </option>

            <option value="cash">
              Cash
            </option>

            <option value="upi">
              UPI
            </option>
          </select>

          <button
            className="btn-load"
            disabled={loading}
            onClick={fetchReport}
          >
            {loading
              ? "Loading..."
              : "Load Report"}
          </button>

          {report && (
            <button
              className="btn-print"
              onClick={() =>
                window.print()
              }
            >
              Print
            </button>
          )}
        </div>

      </div>

      {!report && !loading && (
        <p className="mr-placeholder">
          Select a{" "}
          {mode === "monthly"
            ? "month"
            : "date"}{" "}
          and click Load Report.
        </p>
      )}

{report && (
  <>
<DashboardCards report={report} />

<RevenueChart
  report={report}
  mode={mode}
/>

<PaymentChart
  revenue={revenue}
/>

<StatusChart
  status={status}
/>

<OrderSourceChart
  report={report}
/>

<div className="mr-card">

          <h3 className="mr-section-title">
            📈 Order Summary
          </h3>

          <div className="mr-grid">

            <div className="mr-box highlight">
              <h4>Total Orders</h4>
              <p>
                {summary.totalOrders}
              </p>
            </div>

            <div className="mr-box">
              <h4>Delivered</h4>
              <p>
                {status.delivered || 0}
              </p>
            </div>

            <div className="mr-box">
              <h4>Preparing</h4>
              <p>
                {status.preparing || 0}
              </p>
            </div>

            <div className="mr-box">
              <h4>Prepared</h4>
              <p>
                {status.prepared || 0}
              </p>
            </div>

            <div className="mr-box">
              <h4>Pending</h4>
              <p>
                {status.pending || 0}
              </p>
            </div>

            <div className="mr-box">
              <h4>Rejected</h4>
              <p>
                {status.rejected || 0}
              </p>
            </div>

            <div className="mr-box">
              <h4>Cancelled</h4>
              <p>
                {status.cancelled || 0}
              </p>
            </div>

          </div>

          <h3 className="mr-section-title">
            💰 Revenue
          </h3>

          <div className="mr-grid">

            <div className="mr-box revenue-card">
    <h4>Gross Revenue</h4>
    <p>₹{revenue.grossRevenue || 0}</p>
</div>

            <div className="mr-box revenue-card">
    <h4>Net Revenue</h4>
              <p>
                ₹
                {revenue.netRevenue ||
                  0}
              </p>
            </div>

            <div className="mr-box">
              <h4>Discount</h4>
              <p>
                ₹
                {revenue.totalDiscount ||
                  0}
              </p>
            </div>

            <div className="mr-box">
              <h4>Delivery Fee</h4>
              <p>
                ₹
                {revenue.totalDeliveryCharge ||
                  0}
              </p>
            </div>

          </div>

<h3 className="mr-section-title">
  🌐 Website Payments
</h3>

<div className="mr-grid">

  <div className="mr-box payment-online">
    <h4>Online Payments</h4>
    <p>₹{revenue.website?.online || 0}</p>
  </div>

  <div className="mr-box payment-cod">
    <h4>COD Orders</h4>
    <p>₹{revenue.website?.cod || 0}</p>
  </div>

  <div className="mr-box payment-total">
    <h4>Total Website Revenue</h4>
    <p>₹{revenue.website?.total || 0}</p>
  </div>

</div>

<h3 className="mr-section-title">
  🏪 POS Collection
</h3>

<div className="mr-grid">

  <div className="mr-box payment-cash">
    <h4>Cash Collection</h4>
    <p>₹{revenue.pos?.cash || 0}</p>
  </div>

  <div className="mr-box payment-upi">
    <h4>UPI Collection</h4>
    <p>₹{revenue.pos?.upi || 0}</p>
  </div>

  <div className="mr-box payment-total">
    <h4>Total POS Collection</h4>
    <p>₹{revenue.pos?.total || 0}</p>
  </div>

</div>

          <h3 className="mr-section-title">
            📦 Sales Breakdown
          </h3>

          <div className="mr-grid">

            <div className="mr-box Packed-box">
              <h4>Packed Sales</h4>
              <p>
                ₹
                {sales.packedSales ||
                  0}
              </p>
            </div>

            <div className="mr-box Unpacked-box">
              <h4>Unpacked Sales</h4>
              <p>
                ₹
                {sales.unpackedSales ||
                  0}
              </p>
            </div>

          </div>
                    <h3 className="mr-section-title">
            🔥 Top Selling Items
          </h3>

          <ul className="mr-list">
            {report.topItems &&
            report.topItems.length > 0 ? (
              report.topItems.map((item, index) => (
                <li key={index}>
                  <span>{item.name}</span>

                  <div
                    style={{
                      display: "flex",
                      gap: "15px",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      Qty :
                      <b>
                        {" "}
                        {item.quantity ||
                          item.count ||
                          0}
                      </b>
                    </span>

                    {item.revenue != null && (
                      <span>
                        ₹{item.revenue}
                      </span>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li>No Items Sold</li>
            )}
          </ul>

          <h3 className="mr-section-title">
            📋 Orders (
            {filteredOrders.length})
          </h3>

          <div className="mr-orders-table">

            <table>

              <thead>

                <tr>

                  <th>Order No.</th>

                  <th>Customer</th>

                  <th>Source</th>

                  <th>Payment</th>

                  <th>Status</th>

                  <th>Order Type</th>

                  <th>Amount</th>

                  <th>Date</th>

                  <th>Action</th>

                </tr>

              </thead>

              <tbody>

                {filteredOrders.length === 0 ? (

                  <tr>

                    <td
                      colSpan="9"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                      }}
                    >
                      No Orders Found
                    </td>

                  </tr>

                ) : (

                  filteredOrders.map((order) => {

                    const payment =
                      order.source === "POS"
                        ? order.paymentMethod
                        : order.payment
                        ? "Online"
                        : "COD";

                    return (

                      <tr key={order._id}>

                        <td>
                          {order.orderNumber}
                        </td>

                        <td>
                          {order.address
                            ?.fullName ||
                            "Walk-in"}
                        </td>

                        <td>
                          {order.source}
                        </td>

                        <td>
                          {payment}
                        </td>

                        <td
                          className={`status ${String(
                            order.status || ""
                          ).toLowerCase()}`}
                        >
                          {order.status}
                        </td>

                        <td>
                          {order.orderType ||
                            "-"}
                        </td>

                        <td>
                          ₹
                          {order.totalAmount ||
                            order.amount ||
                            0}
                        </td>

                        <td>
                          {new Date(
                            order.createdAt
                          ).toLocaleString()}
                        </td>

                        <td>

                          <button
                            className="btn-view"
                            onClick={() =>
                              openOrder(order)
                            }
                          >
                            View
                          </button>

                        </td>

                      </tr>

                    );
                  })

                )}

              </tbody>

            </table>

          </div>

          <div className="mr-footer">
            Generated on{" "}
            {new Date().toLocaleString()}
          </div>

        </div>
</>
      )}
            {/* =========================
          ORDER DETAILS MODAL
      ========================== */}

      {showModal && selectedOrder && (
        <div className="modal-overlay no-print">

          <div className="modal fancy-modal">

            <div className="modal-header">

              <h3>
                🧾 Order Details
              </h3>

              <button
                className="modal-close"
                onClick={closeOrder}
              >
                ✕
              </button>

            </div>

            <div
              className="modal-body"
              style={{
                maxHeight: "70vh",
                overflowY: "auto",
              }}
            >

              <div className="detail-grid">

                <p>
                  <strong>Order No :</strong>{" "}
                  {selectedOrder.orderNumber}
                </p>

                <p>
                  <strong>Status :</strong>{" "}
                  {selectedOrder.status}
                </p>

                <p>
                  <strong>Source :</strong>{" "}
                  {selectedOrder.source}
                </p>

                <p>
                  <strong>Payment :</strong>{" "}
                  {selectedOrder.source === "POS"
                    ? selectedOrder.paymentMethod
                    : selectedOrder.payment
                    ? "Online"
                    : "COD"}
                </p>

                <p>
                  <strong>Order Type :</strong>{" "}
                  {selectedOrder.orderType || "-"}
                </p>

                <p>
                  <strong>Date :</strong>{" "}
                  {new Date(
                    selectedOrder.createdAt
                  ).toLocaleString()}
                </p>

              </div>

              <hr />

              <h4>👤 Customer Details</h4>

              <p>
                <strong>Name :</strong>{" "}
                {selectedOrder.address
                  ?.fullName || "Walk-in Customer"}
              </p>

              <p>
                <strong>Phone :</strong>{" "}
                {selectedOrder.address
                  ?.phone || "-"}
              </p>

              <p>
                <strong>Email :</strong>{" "}
                {selectedOrder.address
                  ?.email || "-"}
              </p>

              <hr />

              <h4>🍔 Ordered Items</h4>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >

                <thead>

                  <tr>

                    <th align="left">Item</th>

                    <th>Qty</th>

                    <th>Type</th>

                    <th>Price</th>

                    <th>Total</th>

                  </tr>

                </thead>

                <tbody>

                  {(selectedOrder.items || []).map(
                    (item, index) => (

                      <tr key={index}>

                        <td>{item.name}</td>

                        <td align="center">
                          {item.quantity}
                        </td>

                        <td align="center">

                          <span
                            style={{
                              padding:
                                "4px 10px",
                              borderRadius: 6,
                              background:
                                String(
                                  item.productType
                                ).toLowerCase() ===
                                "packed"
                                  ? "#dcfce7"
                                  : "#fee2e2",
                              color:
                                String(
                                  item.productType
                                ).toLowerCase() ===
                                "packed"
                                  ? "#166534"
                                  : "#991b1b",
                            }}
                          >
                            {item.productType}
                          </span>

                        </td>

                        <td align="center">
                          ₹{item.price}
                        </td>

                        <td align="center">
                          ₹
                          {item.price *
                            item.quantity}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

              <hr />

              <h4>💰 Bill Summary</h4>

              <div className="detail-grid">

                <p>
                  <strong>Food Total :</strong>
                  ₹
                  {selectedOrder.amount || 0}
                </p>

                <p>
                  <strong>Discount :</strong>
                  ₹
                  {selectedOrder.discount || 0}
                </p>

                <p>
                  <strong>Delivery Fee :</strong>
                  ₹
                  {selectedOrder.deliveryFee || 0}
                </p>

                <p>
                  <strong>
                    Final Amount :
                  </strong>

                  ₹
                  {selectedOrder.totalAmount ||
                    (selectedOrder.amount || 0) +
                      (selectedOrder.deliveryFee ||
                        0)}

                </p>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default MonthlyReport;
