"use client";

import { useState, useEffect, useRef } from "react";
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

// Delivery charges — adjust these values as needed
const DELIVERY_FEE_INSIDE_DHAKA = 5;
const DELIVERY_FEE_OUTSIDE_DHAKA = 10;

// All 64 districts of Bangladesh
const DISTRICTS = [
  "Bagerhat", "Bandarban", "Barguna", "Barishal", "Bhola", "Bogura", "Brahmanbaria",
  "Chandpur", "Chattogram", "Chuadanga", "Cox's Bazar", "Cumilla", "Dhaka", "Dinajpur",
  "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj", "Habiganj", "Jamalpur",
  "Jashore", "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachhari", "Khulna",
  "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur",
  "Magura", "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj", "Mymensingh",
  "Naogaon", "Narail", "Narayanganj", "Narsingdi", "Natore", "Netrokona", "Nilphamari",
  "Noakhali", "Pabna", "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi",
  "Rangamati", "Rangpur", "Satkhira", "Shariatpur", "Sherpur", "Sirajganj",
  "Sunamganj", "Sylhet", "Tangail", "Thakurgaon",
];

export default function CartPage() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [showCheckout, setShowCheckout] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [thana, setThana] = useState("");
  const [villageCity, setVillageCity] = useState("");
  const [roadBlockHouse, setRoadBlockHouse] = useState("");
  const [message, setMessage] = useState("");

  const [deliveryLocation, setDeliveryLocation] = useState<"inside" | "outside">("inside");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Tracks whether the user has manually picked a delivery location themselves.
  // Once they do, auto-detection from the district field stops overriding their choice.
  const userOverrodeLocation = useRef(false);

  useEffect(() => {
    if (userId) fetchCart();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session]);

  // Auto-detect delivery location from the selected district.
  // Dhaka -> Inside Dhaka, any other district -> Outside Dhaka.
  // This only runs until the user manually clicks a delivery location button themselves.
  useEffect(() => {
    if (userOverrodeLocation.current) return;
    if (!district) return;

    setDeliveryLocation(district === "Dhaka" ? "inside" : "outside");
  }, [district]);

  const handleManualLocationSelect = (location: "inside" | "outside") => {
    userOverrodeLocation.current = true;
    setDeliveryLocation(location);
  };

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/${userId}`);
      const data = await res.json();
      const items: CartItem[] = data.result || [];
      setCartItems(items);
      // Select everything by default so nothing feels "missed"
      setSelectedIds(new Set(items.map((item) => item._id)));
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
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(cartItemId);
      return next;
    });
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/${cartItemId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to remove item:", err);
      fetchCart();
    }
  };

  const toggleSelect = (cartItemId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cartItemId)) next.delete(cartItemId);
      else next.add(cartItemId);
      return next;
    });
  };

  const allSelected = cartItems.length > 0 && selectedIds.size === cartItems.length;

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(cartItems.map((item) => item._id)));
  };

  // Only the items the user has checked are included in this order
  const selectedItems = cartItems.filter((item) => selectedIds.has(item._id));

  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee =
    subtotal > 0
      ? deliveryLocation === "inside"
        ? DELIVERY_FEE_INSIDE_DHAKA
        : DELIVERY_FEE_OUTSIDE_DHAKA
      : 0;
  const total = subtotal + shippingFee;

  // Combine the detailed address fields into one string for storage/display
  const fullAddress = [roadBlockHouse, villageCity, thana, district].filter(Boolean).join(", ");

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
            {/* Select all */}
            <label className="flex items-center gap-2 text-sm text-gray-600 px-1 cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-gray-300 accent-blue-600"
              />
              {allSelected ? "Deselect all" : "Select all"}
              <span className="text-gray-400">
                ({selectedIds.size}/{cartItems.length} selected)
              </span>
            </label>

            {cartItems.map((item) => (
              <div
                key={item._id}
                className={`flex items-center gap-4 bg-white border rounded-2xl p-4 transition-colors ${
                  selectedIds.has(item._id) ? "border-gray-200" : "border-gray-100 opacity-60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(item._id)}
                  onChange={() => toggleSelect(item._id)}
                  className="h-4 w-4 rounded border-gray-300 accent-blue-600 shrink-0"
                />

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
            <h2 className="text-base font-semibold text-gray-900 mb-1">Order Summary</h2>
            <p className="text-xs text-gray-400 mb-4">
              {selectedItems.length} of {cartItems.length} item{cartItems.length !== 1 && "s"} selected
            </p>

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

            {selectedItems.length === 0 && (
              <p className="text-xs text-amber-600 mt-3 text-center">
                Select at least one item to check out.
              </p>
            )}

            {!showCheckout ? (
              <button
                onClick={() => setShowCheckout(true)}
                disabled={selectedItems.length === 0}
                className="w-full mt-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
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

                {/* District dropdown */}
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select District (জেলা)</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={thana}
                  onChange={(e) => setThana(e.target.value)}
                  placeholder="Thana / Upazila (থানা)"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="text"
                  value={villageCity}
                  onChange={(e) => setVillageCity(e.target.value)}
                  placeholder="Village / City (গ্রাম/শহর)"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="text"
                  value={roadBlockHouse}
                  onChange={(e) => setRoadBlockHouse(e.target.value)}
                  placeholder="Road / Block / House No (রোড/ব্লক/বাড়ি নং)"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Message for delivery (optional)"
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />

                {/* Delivery Location */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1.5">
                    Delivery Location{" "}
                    {!userOverrodeLocation.current && district && (
                      <span className="text-gray-400 font-normal">(auto-detected)</span>
                    )}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleManualLocationSelect("inside")}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition ${deliveryLocation === "inside"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-300"
                        }`}
                    >
                      Inside Dhaka
                    </button>
                    <button
                      onClick={() => handleManualLocationSelect("outside")}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition ${deliveryLocation === "outside"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-300"
                        }`}
                    >
                      Outside Dhaka
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Select your district above and we&apos;ll pick this automatically — or select
                    it yourself.
                  </p>
                </div>

                {/* Payment Method */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1.5">Payment Method</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentMethod("cod")}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition ${paymentMethod === "cod"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-300"
                        }`}
                    >
                      Cash on Delivery
                    </button>
                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition ${paymentMethod === "card"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-300"
                        }`}
                    >
                      Card Payment
                    </button>
                  </div>
                </div>

                {orderError && <p className="text-xs text-red-500">{orderError}</p>}

                <form
                  action={`/api/checkout-sessions`}
                  method="POST"
                  onSubmit={(e) => {
                    if (selectedItems.length === 0) {
                      e.preventDefault();
                      setOrderError("Please select at least one item to check out.");
                      return;
                    }
                    if (
                      !name.trim() ||
                      !phone.trim() ||
                      !district.trim() ||
                      !thana.trim() ||
                      !villageCity.trim() ||
                      !roadBlockHouse.trim()
                    ) {
                      e.preventDefault();
                      setOrderError("Please fill in all delivery details.");
                      return;
                    }
                    setOrderError("");
                  }}
                >
                  <input type="hidden" name="userId" value={userId} />
                  <input type="hidden" name="name" value={name} />
                  <input type="hidden" name="phone" value={phone} />
                  <input type="hidden" name="district" value={district} />
                  <input type="hidden" name="thana" value={thana} />
                  <input type="hidden" name="villageCity" value={villageCity} />
                  <input type="hidden" name="roadBlockHouse" value={roadBlockHouse} />
                  <input type="hidden" name="message" value={message} />
                  <input type="hidden" name="address" value={fullAddress} />
                  <input type="hidden" name="city" value={villageCity} />
                  <input type="hidden" name="deliveryLocation" value={deliveryLocation} />
                  <input type="hidden" name="shippingFee" value={shippingFee} />
                  <input type="hidden" name="subtotal" value={subtotal} />
                  <input
                    type="hidden"
                    name="totalAmount"
                    value={paymentMethod === "card" ? total : shippingFee}
                  />
                  <input type="hidden" name="paymentMethod" value={paymentMethod} />
                  <input type="hidden" name="cartItemIds" value={JSON.stringify(Array.from(selectedIds))} />
                  <input type="hidden" name="cartItems" value={JSON.stringify(selectedItems)} />

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-black transition"
                  >
                    {paymentMethod === "card"
                      ? `Place Order · $${total.toFixed(2)}`
                      : `Pay Delivery Fee · $${shippingFee.toFixed(2)}`}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}