"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, ChevronDown, ChevronUp } from "lucide-react";
import { authClient } from "@/lib/auth-client";

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

export default function MyOrdersPage() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (userId) fetchOrders();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${userId}`);
      const data = await res.json();

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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
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

  if (!userId) {
    return (
      <div className="text-center py-20">
        <Package size={40} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-400">Please log in to view your orders.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-1">My Orders</h1>
      <p className="text-sm text-slate-400 mb-6">Track and review everything you&apos;ve ordered.</p>

      {loading ? (
        <p className="text-center text-slate-400 py-16">Loading orders...</p>
      ) : error ? (
        <p className="text-center text-red-500 py-16">{error}</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 mb-5">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedId === order._id;

            return (
              <div
                key={order._id}
                className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Header row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order._id)}
                  className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4 min-w-0">
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
                        {order.items.length} item{order.items.length !== 1 && "s"} ·{" "}
                        <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Ordered on {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                        STATUS_STYLES[order.status] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {order.status}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={18} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={18} className="text-slate-400" />
                    )}
                  </div>
                </button>

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