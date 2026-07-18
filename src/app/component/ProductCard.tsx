import Link from "next/link";

type Product = {
  _id: string;
  title: string;
  description: string;
  category: string;
  gender: string;
  price: number;
  image: string;
  inStock: boolean;
  rating?: number;
};

const GENDER_STYLES: Record<string, string> = {
  men: "bg-blue-50 text-blue-700",
  women: "bg-pink-50 text-pink-700",
  child: "bg-amber-50 text-amber-700",
};

const GENDER_LABELS: Record<string, string> = {
  men: "Men",
  women: "Women",
  child: "Kids",
};

export default function ProductCard({ product }: { product: Product }) {
  const genderStyle = GENDER_STYLES[product.gender] || "bg-gray-50 text-gray-600";
  const genderLabel = GENDER_LABELS[product.gender] || product.gender;

  return (
    <Link
      href={`/product/${product._id}`}
      className="group block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            !product.inStock ? "grayscale opacity-70" : ""
          }`}
        />

        {/* Gender badge */}
        <span
          className={`absolute top-2 left-2 text-[11px] font-medium px-2 py-1 rounded-full ${genderStyle}`}
        >
          {genderLabel}
        </span>

        {/* Stock status */}
        <span
          className={`absolute top-2 right-2 flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full ${
            product.inStock ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              product.inStock ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {product.inStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[11px] text-gray-400 uppercase tracking-wide">{product.category}</p>
        <h3 className="text-sm font-medium text-gray-800 mt-1 leading-snug line-clamp-2">
          {product.title}
        </h3>

        <div className="flex items-center justify-between mt-3">
          <span className="text-base font-semibold text-gray-900">${product.price}</span>
          {product.rating ? (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20" className="text-yellow-400">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              {product.rating}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}