"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Star, ShoppingBag, Trash2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type FavoriteItem = {
  _id: string;
  productId: string;
};

type ReviewItem = {
  _id: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

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

type ProductInfo = {
  _id: string;
  title: string;
  image: string;
  price: number;
};

type Tab = "favorites" | "reviews" | "cart";

export default function UserActivityPage() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [activeTab, setActiveTab] = useState<Tab>("favorites");

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<Record<string, ProductInfo>>({});
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewProducts, setReviewProducts] = useState<Record<string, ProductInfo>>({});
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchFavorites();
    fetchReviews();
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchFavorites = async () => {
    setLoadingFavorites(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites/${userId}`);
      const data = await res.json();
      const items: FavoriteItem[] = data.result || [];
      setFavorites(items);

      const productEntries = await Promise.all(
        items.map(async (fav) => {
          try {
            const pRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${fav.productId}`);
            const pData = await pRes.json();
            return [fav.productId, pData.result] as [string, ProductInfo];
          } catch {
            return [fav.productId, null] as [string, null];
          }
        })
      );
      setFavoriteProducts(Object.fromEntries(productEntries.filter(([, v]) => v)));
    } catch (err) {
      console.error("Failed to load favorites:", err);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/user/${userId}`);
      const data = await res.json();
      const items: ReviewItem[] = data.result || [];
      setReviews(items);

      const productEntries = await Promise.all(
        items.map(async (review) => {
          try {
            const pRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${review.productId}`);
            const pData = await pRes.json();
            return [review.productId, pData.result] as [string, ProductInfo];
          } catch {
            return [review.productId, null] as [string, null];
          }
        })
      );
      setReviewProducts(Object.fromEntries(productEntries.filter(([, v]) => v)));
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchCart = async () => {
    setLoadingCart(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/${userId}`);
      const data = await res.json();
      setCartItems(data.result || []);
    } catch (err) {
      console.error("Failed to load cart:", err);
    } finally {
      setLoadingCart(false);
    }
  };

  const removeFavorite = async (productId: string) => {
    setFavorites((prev) => prev.filter((f) => f.productId !== productId));
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId }),
      });
    } catch (err) {
      console.error("Failed to remove favorite:", err);
      fetchFavorites();
    }
  };

  const removeCartItem = async (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item._id !== cartItemId));
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/${cartItemId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to remove cart item:", err);
      fetchCart();
    }
  };

  const deleteReview = async (reviewId: string) => {
    const previousReviews = reviews;
    setReviews((prev) => prev.filter((r) => r._id !== reviewId));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
    } catch (err) {
      console.error("Failed to delete review:", err);
      setReviews(previousReviews); // revert on failure
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const TABS: { id: Tab; label: string; icon: typeof Heart; count: number }[] = [
    { id: "favorites", label: "Favorites", icon: Heart, count: favorites.length },
    { id: "reviews", label: "My Reviews", icon: Star, count: reviews.length },
    { id: "cart", label: "Cart", icon: ShoppingBag, count: cartItems.length },
  ];

  if (!userId) {
    return <div className="text-center text-gray-400 py-20">Please log in to view your activity.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-1">My Activity</h1>
      <p className="text-sm text-slate-400 mb-6">Your favorites, reviews, and cart in one place.</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                isActive
                  ? "border-slate-800 text-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon size={16} />
              {tab.label}
              {tab.count > 0 && (
                <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Favorites tab */}
      {activeTab === "favorites" && (
        <div>
          {loadingFavorites ? (
            <p className="text-center text-slate-400 py-16">Loading favorites...</p>
          ) : favorites.length === 0 ? (
            <p className="text-center text-slate-400 py-16">
              You haven&apos;t favorited any products yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {favorites.map((fav) => {
                const product = favoriteProducts[fav.productId];
                if (!product) return null;
                return (
                  <div
                    key={fav._id}
                    className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm group"
                  >
                    <Link href={`/product/${product._id}`} className="block relative aspect-[4/5]">
                      <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                    </Link>
                    <div className="p-3">
                      <p className="text-sm font-medium text-slate-800 truncate">{product.title}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-sm font-semibold text-slate-900">${product.price}</span>
                        <button
                          onClick={() => removeFavorite(product._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition"
                          title="Remove from favorites"
                        >
                          <Heart size={15} className="text-red-500" fill="currentColor" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Reviews tab */}
      {activeTab === "reviews" && (
        <div>
          {loadingReviews ? (
            <p className="text-center text-slate-400 py-16">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-center text-slate-400 py-16">You haven&apos;t written any reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => {
                const product = reviewProducts[review.productId];
                return (
                  <div
                    key={review._id}
                    className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex gap-4"
                  >
                    {product && (
                      <Link href={`/product/${product._id}`} className="shrink-0">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="h-16 w-16 rounded-xl object-cover border border-slate-100"
                        />
                      </Link>
                    )}
                    <div className="flex-1 min-w-0">
                      {product && (
                        <Link
                          href={`/product/${product._id}`}
                          className="text-sm font-medium text-slate-800 hover:underline"
                        >
                          {product.title}
                        </Link>
                      )}
                      <div className="flex items-center gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={13}
                            className={star <= review.rating ? "text-yellow-400" : "text-slate-200"}
                            fill={star <= review.rating ? "currentColor" : "none"}
                          />
                        ))}
                        <span className="text-xs text-slate-400 ml-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-slate-600 mt-1.5">{review.comment}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteReview(review._id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition shrink-0 h-fit"
                      title="Delete review"
                    >
                      <Trash2 size={15} className="text-red-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Cart tab */}
      {activeTab === "cart" && (
        <div>
          {loadingCart ? (
            <p className="text-center text-slate-400 py-16">Loading cart...</p>
          ) : cartItems.length === 0 ? (
            <p className="text-center text-slate-400 py-16">Your cart is empty.</p>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm divide-y divide-slate-100">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center gap-4 p-4">
                  <Link href={`/product/${item.productId}`} className="shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-16 w-16 rounded-xl object-cover border border-slate-100"
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
                      {item.size && `Size: ${item.size}`} {item.color && `· Color: ${item.color}`}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeCartItem(item._id)}
                      className="mt-1.5 p-1.5 rounded-lg hover:bg-red-50 transition"
                      title="Remove from cart"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between p-4 bg-slate-50">
                <span className="text-sm font-medium text-slate-600">Total</span>
                <span className="text-base font-bold text-slate-900">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}