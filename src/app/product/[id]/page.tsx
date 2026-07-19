"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heart, Star } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type Product = {
  _id: string;
  title: string;
  description: string;
  category: string;
  gender: string;
  sizes: string[];
  colors: string[];
  price: number;
  image: string;
  inStock: boolean;
  stockQuantity: number;
  rating?: number;
};

type Review = {
  _id: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  rating: number;
  comment: string;
  createdAt: string;
};

const GENDER_LABELS: Record<string, string> = {
  men: "Men",
  women: "Women",
  child: "Kids",
};

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const currentUser = session?.user;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.message || "Product not found.");
          return;
        }

        setProduct(data.result);
      } catch (err) {
        console.error(err);
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${id}`);
        const data = await res.json();
        setReviews(data.result || []);
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (id) fetchReviews();
  }, [id]);

  // Check favorite status (only if logged in)
  useEffect(() => {
    const checkFavorite = async () => {
      if (!currentUser?.id || !id) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/favorites/check/${currentUser.id}/${id}`
        );
        const data = await res.json();
        setIsFavorited(!!data.favorited);
      } catch (err) {
        console.error("Failed to check favorite status:", err);
      }
    };

    checkFavorite();
  }, [currentUser?.id, id]);

  const toggleFavorite = async () => {
    if (!currentUser?.id) {
      router.push(`/login?redirect=/product/${id}`);
      return;
    }

    setFavoriteLoading(true);
    // Optimistic update
    setIsFavorited((prev) => !prev);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, productId: id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setIsFavorited(data.favorited);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      setIsFavorited((prev) => !prev); // revert
    } finally {
      setFavoriteLoading(false);
    }
  };

  const addToCart = async (redirectToCheckout = false) => {
    if (!product) return;

    if (redirectToCheckout) setBuyingNow(true);
    else setAddingToCart(true);
    setCartMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id || "guest",
          productId: product._id,
          title: product.title,
          image: product.image,
          price: product.price,
          size: selectedSize || null,
          color: selectedColor || null,
          quantity: 1,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      if (redirectToCheckout) {
        router.push("/checkout");
      } else {
        setCartMessage("Added to cart!");
        setTimeout(() => setCartMessage(""), 2500);
      }
    } catch (err) {
      console.error("Failed to add to cart:", err);
      setCartMessage("Failed to add to cart.");
    } finally {
      setAddingToCart(false);
      setBuyingNow(false);
    }
  };

  const submitReview = async () => {
    if (!currentUser?.id) {
      router.push(`/login?redirect=/product/${id}`);
      return;
    }

    if (newRating === 0) {
      setReviewError("Please select a star rating.");
      return;
    }

    setSubmittingReview(true);
    setReviewError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          userImage: currentUser.image,
          productId: id,
          rating: newRating,
          comment: newComment.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setReviewError(data.message || "Failed to submit review.");
        return;
      }

      // Refresh reviews
      const refreshed = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${id}`);
      const refreshedData = await refreshed.json();
      setReviews(refreshedData.result || []);

      setNewRating(0);
      setNewComment("");
    } catch (err) {
      console.error(err);
      setReviewError("Something went wrong. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  if (loading) {
    return <div className="text-center text-gray-400 py-24">Loading product...</div>;
  }

  if (error || !product) {
    return <div className="text-center text-red-500 py-24">{error || "Product not found."}</div>;
  }

  const genderLabel = GENDER_LABELS[product.gender] || product.gender;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="relative aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden">
          <img
            src={product.image}
            alt={product.title}
            className={`w-full h-full object-cover ${!product.inStock ? "grayscale opacity-70" : ""}`}
          />
          <span className="absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full bg-white/90 text-gray-700">
            {genderLabel}
          </span>

          {/* Favorite button */}
          <button
            onClick={toggleFavorite}
            disabled={favoriteLoading}
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition disabled:opacity-60"
            aria-label="Toggle favorite"
          >
            <Heart
              size={18}
              className={isFavorited ? "text-red-500" : "text-gray-500"}
              fill={isFavorited ? "currentColor" : "none"}
            />
          </button>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-xs text-gray-400 uppercase tracking-wide">{product.category}</p>
          <h1 className="text-2xl font-semibold text-gray-900 mt-1">{product.title}</h1>

          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span className="text-2xl font-bold text-gray-900">${product.price}</span>
            <span
              className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                product.inStock ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${product.inStock ? "bg-green-500" : "bg-red-500"}`} />
              {product.inStock ? `In Stock (${product.stockQuantity})` : "Out of Stock"}
            </span>
            {averageRating ? (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Star size={14} className="text-yellow-400" fill="currentColor" />
                {averageRating} ({reviews.length})
              </span>
            ) : null}
          </div>

          <p className="text-sm text-gray-600 mt-5 leading-relaxed">{product.description}</p>

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      selectedSize === size
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-medium text-gray-700 mb-2">Color</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      selectedColor === color
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to cart + Buy now */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={() => addToCart(false)}
              disabled={!product.inStock || addingToCart || buyingNow}
              className="flex-1 px-8 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition"
            >
              {addingToCart ? "Adding..." : product.inStock ? "Add to Cart" : "Out of Stock"}
            </button>

            <button
              onClick={() => addToCart(true)}
              disabled={!product.inStock || addingToCart || buyingNow}
              className="flex-1 px-8 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black transition"
            >
              {buyingNow ? "Processing..." : "Buy Now"}
            </button>
          </div>

          {cartMessage && (
            <p className="text-sm text-green-600 mt-2 text-center sm:text-left">{cartMessage}</p>
          )}
        </div>
      </div>

      {/* ---------------- Reviews section ---------------- */}
      <div className="mt-16 border-t border-gray-200 pt-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h2>

        {/* Write a review */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-8">
          <p className="text-sm font-medium text-gray-700 mb-2">
            {currentUser ? "Write a review" : "Log in to write a review"}
          </p>

          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => currentUser && setNewRating(star)}
                disabled={!currentUser}
                className="disabled:cursor-not-allowed"
              >
                <Star
                  size={22}
                  className={star <= newRating ? "text-yellow-400" : "text-gray-300"}
                  fill={star <= newRating ? "currentColor" : "none"}
                />
              </button>
            ))}
          </div>

          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!currentUser}
            placeholder={currentUser ? "Share your thoughts about this product..." : "Log in to leave a comment"}
            rows={3}
            className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />

          {reviewError && <p className="text-xs text-red-500 mt-2">{reviewError}</p>}

          <button
            onClick={submitReview}
            disabled={submittingReview}
            className="mt-3 px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium disabled:opacity-50 hover:bg-blue-700 transition"
          >
            {!currentUser
              ? "Log in to Review"
              : submittingReview
              ? "Submitting..."
              : "Submit Review"}
          </button>
        </div>

        {/* Reviews list */}
        {reviewsLoading ? (
          <p className="text-sm text-gray-400 text-center py-6">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            No reviews yet. Be the first to review this product!
          </p>
        ) : (
          <div className="space-y-5">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-100 pb-5 last:border-none">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
                    {review.userImage ? (
                      <img src={review.userImage} alt={review.userName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-gray-500">
                        {review.userName?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{review.userName}</p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={star <= review.rating ? "text-yellow-400" : "text-gray-200"}
                          fill={star <= review.rating ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}