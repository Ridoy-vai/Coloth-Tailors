import { redirect } from "next/navigation";
import Link from "next/link";
import { stripe } from "../../../lib/stripe";

async function placeOrder(metadata: Record<string, string>, sessionId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      userId: metadata.userId,
      name: metadata.name,
      phone: metadata.phone,
      district: metadata.district,
      thana: metadata.thana,
      villageCity: metadata.villageCity,
      roadBlockHouse: metadata.roadBlockHouse,
      message: metadata.message,
      address: metadata.address,
      city: metadata.city,
      deliveryLocation: metadata.deliveryLocation,
      shippingFee: metadata.shippingFee ? Number(metadata.shippingFee) : undefined,
      paymentMethod: metadata.paymentMethod,
      paymentStatus: metadata.paymentMethod === "card" ? "paid" : "delivery_fee_paid",
      stripeSessionId: sessionId,
    }),
  });
  return res.json();
}

type OrderItem = {
  productId: string;
  title: string;
  image: string;
  price: number;
  size?: string | null;
  color?: string | null;
  quantity: number;
};

async function fetchOrderItems(orderId: string): Promise<OrderItem[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/details/${orderId}`, {
      cache: "no-store",
    });
    const data = await res.json();
    return data?.result?.items || [];
  } catch (err) {
    console.error("Failed to fetch order items:", err);
    return [];
  }
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    throw new Error("Please provide a valid session_id (`cs_test_...`)");
  }

  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ["line_items", "payment_intent"],
  });

  const { status, customer_details, metadata } = session;

  if (status === "open") {
    redirect("/cart");
  }

  if (status !== "complete") {
    return null;
  }

  const meta = (metadata as Record<string, string>) || {};
  const isCod = meta.paymentMethod === "cod";
  const orderResult = await placeOrder(meta, session_id);
  const orderItems = orderResult?.orderId ? await fetchOrderItems(orderResult.orderId) : [];

  return (
    <section className="max-w-lg mx-auto px-4 py-20">
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
          <svg
            width="30"
            height="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            className="text-green-600"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900">
          {isCod ? "Order Confirmed!" : "Payment Successful!"}
        </h1>

        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          {isCod
            ? "Your delivery fee has been paid, and your order is confirmed. You'll pay for the products in cash when your order arrives."
            : "We appreciate your business! Your order will be delivered to the address below."}
        </p>

        {customer_details?.email && (
          <p className="text-xs text-gray-400 mt-3">
            A confirmation email will be sent to{" "}
            <span className="font-medium text-gray-600">{customer_details.email}</span>.
          </p>
        )}

        {/* Delivery address details */}
        <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-left text-sm">
          <p className="font-semibold text-gray-800 mb-2">Delivery Address</p>
          <div className="space-y-1 text-gray-600">
            <p>
              <span className="text-gray-400">Name:</span> {meta.name}
            </p>
            <p>
              <span className="text-gray-400">Phone:</span> {meta.phone}
            </p>
            {meta.roadBlockHouse && (
              <p>
                <span className="text-gray-400">Road/Block/House:</span> {meta.roadBlockHouse}
              </p>
            )}
            {meta.villageCity && (
              <p>
                <span className="text-gray-400">Village/City:</span> {meta.villageCity}
              </p>
            )}
            {meta.thana && (
              <p>
                <span className="text-gray-400">Thana:</span> {meta.thana}
              </p>
            )}
            {meta.district && (
              <p>
                <span className="text-gray-400">District:</span> {meta.district}
              </p>
            )}
            {meta.message && (
              <p className="pt-1 border-t border-gray-200 mt-2">
                <span className="text-gray-400">Note:</span> {meta.message}
              </p>
            )}
          </div>
        </div>

        {/* Ordered products */}
        {orderItems.length > 0 && (
          <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-left text-sm">
            <p className="font-semibold text-gray-800 mb-3">
              Ordered Products ({orderItems.length})
            </p>
            <div className="space-y-3">
              {orderItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-12 w-12 rounded-lg object-cover border border-gray-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400">
                      {item.size && `Size: ${item.size}`} {item.color && `· Color: ${item.color}`}{" "}
                      · Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium text-gray-700 shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order summary */}
        <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-left text-sm space-y-1.5">
          <p className="font-semibold text-gray-800 mb-1">Order Summary</p>
          <div className="flex justify-between text-gray-500">
            <span>Payment Method</span>
            <span className="font-medium text-gray-700">
              {isCod ? "Cash on Delivery" : "Card Payment"}
            </span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Delivery Location</span>
            <span className="font-medium text-gray-700">
              {meta.deliveryLocation === "inside" ? "Inside Dhaka" : "Outside Dhaka"}
            </span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Delivery Fee {isCod ? "(paid now)" : "(free)"}</span>
            <span className="font-medium text-gray-700">${meta.shippingFee}</span>
          </div>
          {isCod && (
            <div className="flex justify-between text-gray-500">
              <span>Product Total (pay on delivery)</span>
              <span className="font-medium text-gray-700">${meta.subtotal}</span>
            </div>
          )}
        </div>

        {!orderResult?.success && (
          <p className="text-xs text-red-500 mt-4">
            Payment succeeded, but we couldn&apos;t save your order automatically. Please contact
            support with session ID: <span className="font-mono">{session_id}</span>
          </p>
        )}

        <Link
          href="/shop"
          className="inline-block mt-7 px-7 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
        >
          Continue Shopping
        </Link>
      </div>
    </section>
  );
}