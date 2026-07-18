"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Marquee from "react-fast-marquee";

type Product = {
  _id: string;
  title: string;
  category: string;
  price: number;
  image: string;
};

type GenderSection = {
  gender: "men" | "women" | "kids";
  label: string;
  bgColor: string;
};

const SECTIONS: GenderSection[] = [
  { gender: "men", label: "Men's Collection", bgColor: "bg-blue-50" },
  { gender: "women", label: "Women's Collection", bgColor: "bg-pink-50" },
  { gender: "kids", label: "Kids' Collection", bgColor: "bg-amber-50" },
];

export default function CategoryShowcase() {
  const [productsByGender, setProductsByGender] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          SECTIONS.map((section) =>
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?gender=${section.gender}`).then((res) =>
              res.json()
            )
          )
        );

        const map: Record<string, Product[]> = {};
        SECTIONS.forEach((section, i) => {
          map[section.gender] = results[i]?.result || [];
        });

        setProductsByGender(map);
      } catch (err) {
        console.error("Failed to load category showcase products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return (
    <div className="py-12 space-y-14">
      {SECTIONS.map((section, index) => {
        const products = productsByGender[section.gender] || [];

        return (
          <div key={section.gender} className={section.bgColor}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Section header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {section.label}
                </h2>
                <Link
                  href={`/shop?gender=${section.gender}`}
                  className="text-sm font-medium text-blue-600 hover:underline shrink-0"
                >
                  View All &rarr;
                </Link>
              </div>
            </div>

            {/* Marquee */}
            {loading ? (
              <div className="text-center text-gray-400 text-sm py-10">Loading {section.label}...</div>
            ) : products.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-10">No products found.</div>
            ) : (
              <Marquee
                speed={40}
                gradient={false}
                direction={index % 2 === 0 ? "left" : "right"}
                pauseOnHover
              >
                {products.map((product) => (
                  <Link
                    key={product._id}
                    href={`/product/${product._id}`}
                    className="group relative mx-3 block w-48 sm:w-56 shrink-0 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow bg-white"
                  >
                    <div className="relative aspect-[3/4]">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <p className="text-sm font-medium truncate">{product.title}</p>
                        <p className="text-xs opacity-90">${product.price}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </Marquee>
            )}
          </div>
        );
      })}
    </div>
  );
}