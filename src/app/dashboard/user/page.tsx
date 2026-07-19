"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ShoppingBag, Heart, Star, Package, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
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

type Order = {
  _id: string;
  items: { title: string; image: string; price: number; quantity: number }[];
  totalAmount: number;
  status: string;
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  processing: "#3b82f6",
  shipped: "#a855f7",
  delivered: "#22c55e",
  cancelled: "#ef4444",
};

export default function UserOverviewPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [orders, setOrders] = useState<Order[]>([]);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [ordersRes, favoritesRes, reviewsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${user.id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites/${user.id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/user/${user.id}`),
        ]);

        const ordersData = await ordersRes.json();
        const favoritesData = await favoritesRes.json();
        const reviewsData = await reviewsRes.json();

        setOrders(ordersData.result || []);
        setFavoriteCount(favoritesData.count || 0);
        setReviewCount(reviewsData.count || 0);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const recentOrders = orders.slice(0, 3);

  // Spending over the last 6 orders (chronological)
  const spendingTrend = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-6)
      .map((order, idx) => ({
        label: new Date(order.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        amount: order.totalAmount,
      }));
  }, [orders]);

  // This user's orders grouped by status
  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({ name: status, value: count }));
  }, [orders]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

  const STATUS_STYLES: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    processing: "bg-blue-50 text-blue-700",
    shipped: "bg-purple-50 text-purple-700",
    delivered: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-600",
  };

  if (!user) {
    return <div className="text-center text-slate-400 py-20">Please log in to view your dashboard.</div>;
  }

  return (
    <div>
      {/* Welcome header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-14 w-14 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
          {user.image ? (
            <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-slate-400">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Welcome back, {user.name?.split(" ")[0]}!
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Here&apos;s what&apos;s happening with your account.</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          href="/dashboard/user/orders"
          className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <ShoppingBag size={18} className="text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{loading ? "—" : orders.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Total Orders</p>
        </Link>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-green-50 flex items-center justify-center mb-3">
            <Package size={18} className="text-green-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {loading ? "—" : `$${totalSpent.toFixed(2)}`}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Total Spent</p>
        </div>

        <Link
          href="/dashboard/user/wishlist"
          className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center mb-3">
            <Heart size={18} className="text-red-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{loading ? "—" : favoriteCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">Favorites</p>
        </Link>

        <Link
          href="/dashboard/user/reviews"
          className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
            <Star size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{loading ? "—" : reviewCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">Reviews Written</p>
        </Link>
      </div>

      {/* Charts */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Spending trend */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-sm p-5">
            <h2 className="text-base font-bold text-slate-800 mb-4">Spending — Recent Orders</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={spendingTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => {
                    const numericValue = typeof value === "number" ? value : 0;
                    return [`$${numericValue.toFixed(2)}`, "Spent"];
                  }}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#2563eb" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order status breakdown */}
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-5">
            <h2 className="text-base font-bold text-slate-800 mb-4">Orders by Status</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={78}
                  paddingAngle={2}
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, textTransform: "capitalize" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Recent Orders</h2>
          <Link
            href="/dashboard/user/orders"
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
          >
            View all
            <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-slate-400 py-12 text-sm">Loading...</p>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag size={32} className="mx-auto text-slate-200 mb-3" />
            <p className="text-sm text-slate-400 mb-4">You haven&apos;t placed any orders yet.</p>
            <Link
              href="/shop"
              className="inline-block px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex -space-x-3 shrink-0">
                  {order.items.slice(0, 2).map((item, idx) => (
                    <img
                      key={idx}
                      src={item.image}
                      alt={item.title}
                      className="h-11 w-11 rounded-xl object-cover border-2 border-white"
                    />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {order.items.length} item{order.items.length !== 1 && "s"} ·{" "}
                    <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${
                    STATUS_STYLES[order.status] || "bg-slate-100 text-slate-600"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}