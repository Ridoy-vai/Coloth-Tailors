"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { DollarSign, ShoppingCart, Package, Users } from "lucide-react";

type Order = {
  _id: string;
  totalAmount?: number;
  itemsTotal?: number;
  shippingFee?: number;
  status: string;
  createdAt: string;
};

// Safely resolve an order's amount even if totalAmount is missing on older records
const getOrderAmount = (order: Order) =>
  order.totalAmount ?? (order.itemsTotal || 0) + (order.shippingFee || 0);

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  processing: "#3b82f6",
  shipped: "#a855f7",
  delivered: "#22c55e",
  cancelled: "#ef4444",
};

export default function AdminOverviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersResult, productsResult, usersResult] = await Promise.allSettled([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`).then((r) => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`).then((r) => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`).then((r) => r.json()),
      ]);

      if (ordersResult.status === "fulfilled") {
        if (ordersResult.value.success) {
          setOrders(ordersResult.value.result || []);
        } else {
          console.error("Orders API returned an error:", ordersResult.value.message);
        }
      } else {
        console.error("Failed to fetch orders:", ordersResult.reason);
      }

      if (productsResult.status === "fulfilled") {
        if (productsResult.value.success) {
          setProductCount(productsResult.value.count || 0);
        } else {
          console.error("Products API returned an error:", productsResult.value.message);
        }
      } else {
        console.error("Failed to fetch products:", productsResult.reason);
      }

      if (usersResult.status === "fulfilled") {
        if (usersResult.value.success) {
          setUserCount(usersResult.value.count || 0);
        } else {
          console.error("Users API returned an error:", usersResult.value.message);
        }
      } else {
        console.error("Failed to fetch users:", usersResult.reason);
      }
    } finally {
      setLoading(false);
    }
  };

  const deliveredOrders = orders.filter((o) => o.status === "delivered");
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + getOrderAmount(o), 0);

  // Revenue for the last 7 days
  const revenueTrend = useMemo(() => {
    const days: { date: string; label: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      days.push({ date: dateKey, label, revenue: 0 });
    }

    deliveredOrders.forEach((order) => {
      const dateKey = new Date(order.createdAt).toISOString().slice(0, 10);
      const day = days.find((d) => d.date === dateKey);
      if (day) day.revenue += getOrderAmount(order);
    });

    return days;
  }, [deliveredOrders]);

  // Orders grouped by status
  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      name: status,
      value: count,
    }));
  }, [orders]);

  const statCards = [
    {
      label: "Revenue (Delivered)",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Total Orders",
      value: orders.length,
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Products",
      value: productCount,
      icon: Package,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Total Users",
      value: userCount,
      icon: Users,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-1">Overview</h1>
      <p className="text-sm text-slate-400 mb-6">A snapshot of your store&apos;s performance.</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
            >
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-black text-slate-900">{loading ? "—" : card.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue trend chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-sm p-5">
          <h2 className="text-base font-bold text-slate-800 mb-4">Revenue (Delivered Orders) — Last 7 Days</h2>
          {loading ? (
            <p className="text-center text-slate-400 py-16 text-sm">Loading chart...</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => {
                    const numericValue = typeof value === "number" ? value : 0;
                    return [`$${numericValue.toFixed(2)}`, "Revenue"];
                  }}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1e293b"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#1e293b" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Order status breakdown */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-5">
          <h2 className="text-base font-bold text-slate-800 mb-4">Orders by Status</h2>
          {loading ? (
            <p className="text-center text-slate-400 py-16 text-sm">Loading chart...</p>
          ) : statusBreakdown.length === 0 ? (
            <p className="text-center text-slate-400 py-16 text-sm">No orders yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name] || "#94a3b8"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => {
                    const numericValue = typeof value === "number" ? value : Number(value ?? 0);
                    const label = typeof name === "string" ? name : String(name);
                    return [numericValue, label] as [number, string];
                  }}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, textTransform: "capitalize" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}