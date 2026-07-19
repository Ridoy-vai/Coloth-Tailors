"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type CartItem = {
  _id: string;
  productId: string;
  title: string;
  image: string;
  price: number;
  size?: string | null;
  color?: string | null;
  quantity: number;
};

export default function CartPage() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [showCheckout, setShowCheckout] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    if (userId) fetchCart();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/${userId}`);
      const data = await res.json();
      setCartItems(data.result || []);
    } catch (err) {
      console.error("Failed to load cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingId(item._id);
    setCartItems((prev) =>
      prev.map((c) => (c._id === item._id ? { ...c, quantity: newQuantity } : c))
    );

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });
    } catch (err) {
      console.error("Failed to update quantity:", err);
      fetchCart(); // revert by refetching
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (cartItemId: string) => {
    setCartItems((prev) => prev.filter((c) => c._id !== cartItemId));
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/${cartItemId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to remove item:", err);
      fetchCart();
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal > 0 ? 5 : 0;
  const total = subtotal + shippingFee;

  const placeOrder = async () => {
    setOrderError("");

    if (!name.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setOrderError("Please fill in all delivery details.");
      return;
    }

    setPlacingOrder(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          paymentMethod,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setOrderError(data.message || "Failed to place order.");
        return;
      }

      setOrderSuccess(true);
      setCartItems([]);
    } catch (err) {
      console.error(err);
      setOrderError("Something went wrong. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  // ---- Not logged in ----
  if (!userId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={40} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-xl font-semibold text-gray-900">Please log in to view your cart</h1>
        <Link
          href="/login?redirect=/cart"
          className="inline-block mt-5 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
        >
          Log In
        </Link>
      </div>
    );
  }

  // ---- Order placed successfully ----
  if (orderSuccess) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-green-600">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Order placed!</h1>
        <p className="text-sm text-gray-500 mt-2">
          Thanks for your order. We&apos;ll deliver it to your address soon.
        </p>
        <Link
          href="/shop"
          className="inline-block mt-6 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Your Cart</h1>

      {loading ? (
        <p className="text-center text-gray-400 py-16">Loading cart...</p>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 mb-5">Your cart is empty.</p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-4"
              >
                <Link href={`/product/${item.productId}`} className="shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-20 w-20 rounded-xl object-cover border border-gray-100"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.productId}`}
                    className="text-sm font-medium text-gray-800 hover:underline truncate block"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.size && `Size: ${item.size}`} {item.color && `· Color: ${item.color}`}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">${item.price}</p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-1">
                  <button
                    onClick={() => updateQuantity(item, item.quantity - 1)}
                    disabled={updatingId === item._id || item.quantity <= 1}
                    className="p-1.5 disabled:opacity-30"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item, item.quantity + 1)}
                    disabled={updatingId === item._id}
                    className="p-1.5 disabled:opacity-30"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="text-right shrink-0 w-16">
                  <p className="text-sm font-semibold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => removeItem(item._id)}
                  className="p-2 rounded-lg hover:bg-red-50 transition shrink-0"
                  title="Remove"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>

          {/* Summary / Checkout */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 h-fit sticky top-24">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>${shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {!showCheckout ? (
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full mt-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
              >
                Proceed to Checkout
              </button>
            ) : (
              <div className="mt-5 space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setPaymentMethod("cod")}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition ${
                      paymentMethod === "cod"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-300"
                    }`}
                  >
                    Cash on Delivery
                  </button>
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition ${
                      paymentMethod === "card"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-300"
                    }`}
                  >
                    Card Payment
                  </button>
                </div>

                {orderError && <p className="text-xs text-red-500">{orderError}</p>}

                <button
                  onClick={placeOrder}
                  disabled={placingOrder}
                  className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-50 hover:bg-black transition"
                >
                  {placingOrder ? "Placing order..." : `Place Order · $${total.toFixed(2)}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}