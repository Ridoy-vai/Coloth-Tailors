"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

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

const GENDER_LABELS: Record<string, string> = {
  men: "Men",
  women: "Women",
  child: "Kids",
};

export default function ProductDetailsPage() {
  const { id } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

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
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-xs text-gray-400 uppercase tracking-wide">{product.category}</p>
          <h1 className="text-2xl font-semibold text-gray-900 mt-1">{product.title}</h1>

          <div className="flex items-center gap-3 mt-3">
            <span className="text-2xl font-bold text-gray-900">${product.price}</span>
            <span
              className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                product.inStock ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${product.inStock ? "bg-green-500" : "bg-red-500"}`} />
              {product.inStock ? `In Stock (${product.stockQuantity})` : "Out of Stock"}
            </span>
            {product.rating ? (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" className="text-yellow-400">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                {product.rating}
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

          {/* Add to cart */}
          <button
            disabled={!product.inStock}
            className="mt-8 w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition"
          >
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}