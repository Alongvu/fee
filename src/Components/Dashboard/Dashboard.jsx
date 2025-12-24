import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { LineChart } from "@mui/x-charts/LineChart";

import categoryBarChart from "./chart/category-bar-chart";
import soldPieChart from "./chart/sold-pie-chart";
import revenueLineChart from "./chart/revenue-line-chart";

import "./Dashboard.css";

// const categoryOrder = ["men", "women", "kid", "accessory"]; 
const displayNames = {
  men: "Men",
  women: "Women",
  kid: "Kid",
  accessory: "Accessory",
  "khác": "Khác",
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setError(null);
      const res = await axios.get("http://localhost:4000/stats");
      setStats(res.data);
    } catch (err) {
      console.error(" Lỗi khi gọi /stats:", err);
      setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const doFetch = async () => {
      await fetchStats();
    };
    doFetch();
    // Thêm polling để cập nhật real-time mỗi 30 giây
    const interval = setInterval(doFetch, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!stats) return null;

  const {
    productsByCategory = {},
    productsSoldByCategory = {},
    orders: ordersSummary = {},
    revenueByMonth = {},
    monthlyLabels = [],
  } = stats;

  const { totalOrders = 0, totalRevenue = 0, totalSoldProducts = 0 } =
    ordersSummary;

  console.log("productsByCategory:", productsByCategory);
  console.log("productsSoldByCategory:", productsSoldByCategory);

  const allCategories = [
    ...new Set([
      ...Object.keys(productsByCategory),
      ...Object.keys(productsSoldByCategory),
    ]),
  ];

  const barData = allCategories.map((cat) => ({
    category: displayNames[cat] || cat.charAt(0).toUpperCase() + cat.slice(1),
    total: Number(productsByCategory[cat] || 0),
    sold: Number(productsSoldByCategory[cat] || 0),
  }));

  const pieData = allCategories
    .filter((cat) => Number(productsSoldByCategory[cat] || 0) > 0)
    .map((cat, idx) => ({
      id: idx,
      label: displayNames[cat] || cat.charAt(0).toUpperCase() + cat.slice(1),
      value: Number(productsSoldByCategory[cat] || 0),
    }));

  // 🔹 Nhãn hiển thị trên trục X
  const lineLabels =
    monthlyLabels.length > 0
      ? monthlyLabels
      : Object.keys(revenueByMonth || {});

  const lineData = lineLabels.map((lbl) => {
    const raw = revenueByMonth?.[lbl];
    const val = parseFloat(raw);
    return Number.isFinite(val) ? val : 0; // ✅ Giữ nguyên giá trị $
  });

  // 🔹 Debug nếu cần
  console.log(" lineLabels:", lineLabels);
  console.log(" lineData:", lineData);



  const totalProducts = Object.values(productsByCategory || {}).reduce(
    (s, v) => s + Number(v || 0),
    0
  );

  return (
    <div className="dashboard-wrapper">
      <h1 className="dashboard-title">📊 Statistics dashboard</h1>

      <div className="dashboard-cards">
        <div className="dashboard-card blue">
          <h3>Order</h3>
          <p>{totalOrders}</p>
        </div>
        <div className="dashboard-card yellow">
          <h3>Revenue</h3>
          <p>{Number(totalRevenue).toLocaleString()} $</p>
        </div>
        <div className="dashboard-card red">
          <h3>Total Products</h3>
          <p>{totalProducts}</p>
        </div>
        <div className="dashboard-card green">
          <h3>Sold Products</h3>
          <p>{totalSoldProducts}</p>
        </div>
      </div>

      {/* --- Biểu đồ Cột --- */}
      <div className="dashboard-chart">
        <h4> Products in stock & sold by category</h4>
        <BarChart {...categoryBarChart(barData)} />
      </div>
{/* --- Biểu đồ Đường --- */}
      <div className="dashboard-chart wide">
        <h4> Revenue by month</h4>
        <LineChart {...revenueLineChart(lineLabels, lineData)} />
      </div>
      {/* --- Biểu đồ Tròn --- */}
      <div className="dashboard-chart">
        <h4> Percentage of products sold by category</h4>
        {pieData.length > 0 ? (
          <PieChart {...soldPieChart(pieData)} />
        ) : (
          <p>No data to display in the pie chart.</p>
        )}
      </div>

      
    </div>
  );
}
