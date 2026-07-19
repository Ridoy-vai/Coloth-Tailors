"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

type OrderItem = {
    productId: string;
    title: string;
    image: string;
    price: number;
    size?: string | null;
    color?: string | null;
    quantity: number;
};

type Order = {
    _id: string;
    userId: string;
    items: OrderItem[];
    itemsTotal: number;
    shippingFee: number;
    deliveryLocation?: string | null;
    totalAmount: number;
    shipping: {
        name: string;
        phone: string;
        district?: string | null;
        thana?: string | null;
        villageCity?: string | null;
        roadBlockHouse?: string | null;
        message?: string | null;
        address?: string | null;
        city?: string | null;
    };
    paymentMethod: "cod" | "card";
    paymentStatus: "pending" | "paid" | "delivery_fee_paid";
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    createdAt: string;
};

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    processing: "bg-blue-50 text-blue-700",
    shipped: "bg-purple-50 text-purple-700",
    delivered: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-600",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
    pending: "Payment Pending",
    paid: "Paid",
    delivery_fee_paid: "Delivery Fee Paid (COD)",
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [statusFilterOpen, setStatusFilterOpen] = useState(false);

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchOrders();
        }, 400);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const fetchOrders = async () => {
        setLoading(true);
        setError("");
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders${params.toString()}`);
            const data = await res.json();
            console.log("ordet data ", data)
            if (!res.ok || !data.success) {
                setError(data.message || "Failed to load orders.");
                return;
            }

            setOrders(data.result || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = useMemo(() => {
        if (statusFilter === "all") return orders;
        return orders.filter((o) => o.status === statusFilter);
    }, [orders, statusFilter]);

    const updateStatus = async (order: Order, newStatus: string) => {
        setOpenStatusDropdown(null);
        if (newStatus === order.status) return;

        setUpdatingId(order._id);
        setOrders((prev) =>
            prev.map((o) => (o._id === order._id ? { ...o, status: newStatus as Order["status"] } : o))
        );

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${order._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message);
        } catch (err) {
            console.error("Failed to update order status:", err);
            setOrders((prev) =>
                prev.map((o) => (o._id === order._id ? { ...o, status: order.status } : o))
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const buildAddress = (shipping: Order["shipping"]) => {
        const detailed = [
            shipping.roadBlockHouse,
            shipping.villageCity,
            shipping.thana,
            shipping.district,
        ]
            .filter(Boolean)
            .join(", ");
        return detailed || [shipping.address, shipping.city].filter(Boolean).join(", ");
    };

    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { all: orders.length };
        STATUS_OPTIONS.forEach((s) => {
            counts[s] = orders.filter((o) => o.status === s).length;
        });
        return counts;
    }, [orders]);

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">Orders</h1>
                    <p className="text-sm text-slate-400 mt-1">Manage and track all customer orders.</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
                <div className="relative max-w-xs w-full">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by customer name or phone..."
                        className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                </div>

                <div className="relative">
                    <button
                        onClick={() => setStatusFilterOpen(!statusFilterOpen)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition capitalize"
                    >
                        {statusFilter === "all" ? "All Statuses" : statusFilter} ({statusCounts[statusFilter] ?? 0})
                        <ChevronDown size={14} />
                    </button>

                    {statusFilterOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setStatusFilterOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20">
                                <button
                                    onClick={() => {
                                        setStatusFilter("all");
                                        setStatusFilterOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex justify-between ${statusFilter === "all" ? "text-slate-900 font-semibold" : "text-slate-600"
                                        }`}
                                >
                                    All Statuses <span className="text-slate-400">{statusCounts.all}</span>
                                </button>
                                {STATUS_OPTIONS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => {
                                            setStatusFilter(s);
                                            setStatusFilterOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 capitalize flex justify-between ${statusFilter === s ? "text-slate-900 font-semibold" : "text-slate-600"
                                            }`}
                                    >
                                        {s} <span className="text-slate-400">{statusCounts[s]}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Orders list */}
            {loading ? (
                <p className="text-center text-slate-400 py-16">Loading orders...</p>
            ) : error ? (
                <p className="text-center text-red-500 py-16">{error}</p>
            ) : filteredOrders.length === 0 ? (
                <p className="text-center text-slate-400 py-16">No orders found.</p>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => {
                        const isExpanded = expandedId === order._id;

                        return (
                            <div
                                key={order._id}
                                className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
                            >
                                {/* Header row */}
                                <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : order._id)}
                                        className="flex items-center gap-4 min-w-0 flex-1 text-left"
                                    >
                                        <div className="flex -space-x-3 shrink-0">
                                            {order.items.slice(0, 3).map((item, idx) => (
                                                <img
                                                    key={idx}
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="h-12 w-12 rounded-xl object-cover border-2 border-white"
                                                />
                                            ))}
                                            {order.items.length > 3 && (
                                                <div className="h-12 w-12 rounded-xl bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-semibold text-slate-500">
                                                    +{order.items.length - 3}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-800 truncate">
                                                {order.shipping.name} · {order.items.length} item
                                                {order.items.length !== 1 && "s"} ·{" "}
                                                <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {formatDate(order.createdAt)} · {order.shipping.phone}
                                            </p>
                                        </div>
                                    </button>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {/* Status dropdown */}
                                        <div className="relative">
                                            <button
                                                onClick={() =>
                                                    setOpenStatusDropdown(openStatusDropdown === order._id ? null : order._id)
                                                }
                                                disabled={updatingId === order._id}
                                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize disabled:opacity-50 ${STATUS_STYLES[order.status] || "bg-slate-100 text-slate-600"
                                                    }`}
                                            >
                                                {updatingId === order._id ? "Updating..." : order.status}
                                                <ChevronDown size={12} />
                                            </button>

                                            {openStatusDropdown === order._id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setOpenStatusDropdown(null)}
                                                    />
                                                    <div className="absolute right-0 top-full mt-2 w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20">
                                                        {STATUS_OPTIONS.map((s) => (
                                                            <button
                                                                key={s}
                                                                onClick={() => updateStatus(order, s)}
                                                                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 capitalize"
                                                            >
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : order._id)}
                                            className="p-1"
                                        >
                                            {isExpanded ? (
                                                <ChevronUp size={18} className="text-slate-400" />
                                            ) : (
                                                <ChevronDown size={18} className="text-slate-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded details */}
                                {isExpanded && (
                                    <div className="border-t border-slate-100 p-4 sm:p-5 space-y-5 bg-slate-50/50">
                                        {/* Items */}
                                        <div className="space-y-3">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <Link href={`/product/${item.productId}`} className="shrink-0">
                                                        <img
                                                            src={item.image}
                                                            alt={item.title}
                                                            className="h-14 w-14 rounded-xl object-cover border border-slate-200"
                                                        />
                                                    </Link>
                                                    <div className="flex-1 min-w-0">
                                                        <Link
                                                            href={`/product/${item.productId}`}
                                                            className="text-sm font-medium text-slate-800 hover:underline truncate block"
                                                        >
                                                            {item.title}
                                                        </Link>
                                                        <p className="text-xs text-slate-400 mt-0.5">
                                                            {item.size && `Size: ${item.size}`}{" "}
                                                            {item.color && `· Color: ${item.color}`} · Qty: {item.quantity}
                                                        </p>
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-800 shrink-0">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Delivery info */}
                                        <div className="rounded-xl bg-white border border-slate-200 p-4 text-sm">
                                            <p className="font-semibold text-slate-700 mb-2">Delivery Details</p>
                                            <p className="text-slate-600">
                                                {order.shipping.name} · {order.shipping.phone}
                                            </p>
                                            <p className="text-slate-500 mt-0.5">{buildAddress(order.shipping)}</p>
                                            {order.shipping.message && (
                                                <p className="text-slate-400 mt-1.5 italic">
                                                    Note: {order.shipping.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Payment + totals */}
                                        <div className="rounded-xl bg-white border border-slate-200 p-4 text-sm space-y-1.5">
                                            <div className="flex justify-between text-slate-500">
                                                <span>Payment Method</span>
                                                <span className="font-medium text-slate-700">
                                                    {order.paymentMethod === "cod" ? "Cash on Delivery" : "Card Payment"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-slate-500">
                                                <span>Payment Status</span>
                                                <span className="font-medium text-slate-700">
                                                    {PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-slate-500">
                                                <span>Items Total</span>
                                                <span className="font-medium text-slate-700">
                                                    ${order.itemsTotal.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-slate-500">
                                                <span>Delivery Fee</span>
                                                <span className="font-medium text-slate-700">
                                                    ${order.shippingFee.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between font-semibold text-slate-900 pt-1.5 border-t border-slate-100">
                                                <span>Total</span>
                                                <span>${order.totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}