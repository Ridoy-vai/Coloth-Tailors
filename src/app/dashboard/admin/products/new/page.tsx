"use client";

import { useState } from "react";

const CATEGORY_OPTIONS = [
  "T-Shirt",
  "Shirt",
  "Jeans",
  "Pants",
  "Shorts",
  "Dress",
  "Skirt",
  "Blouse",
  "Jacket",
  "Hoodie",
  "Cardigan",
  "Polo",
  "Overalls",
  "Activewear",
  "Leggings",
  "Shoes",
  "Accessories",
];

const SIZE_OPTIONS = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "2-3Y",
  "4-5Y",
  "6-7Y",
  "8-9Y",
  "10-11Y",
];

const COLOR_OPTIONS = [
  "Black",
  "White",
  "Navy",
  "Blue",
  "Red",
  "Green",
  "Yellow",
  "Grey",
  "Beige",
  "Maroon",
  "Olive",
  "Pink",
  "Purple",
];

export default function AddProductPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState<"men" | "women" | "child">("men");
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [inStock, setInStock] = useState(true);
  const [stockQuantity, setStockQuantity] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [rating, setRating] = useState("");

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const toggleValue = (
    value: string,
    list: string[],
    setList: (v: string[]) => void
  ) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Uploads to ImgBB and returns the hosted image URL
  const uploadImageToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    if (!data.success) {
      throw new Error("Image upload failed.");
    }
    return data.data.url as string;
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setGender("men");
    setSizes([]);
    setColors([]);
    setPrice("");
    setInStock(true);
    setStockQuantity("");
    setImageFile(null);
    setImagePreview("");
    setRating("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (
      !title.trim() ||
      !description.trim() ||
      !category ||
      sizes.length === 0 ||
      colors.length === 0 ||
      !price ||
      !imageFile
    ) {
      setError("Please fill in all required fields and select an image.");
      return;
    }

    try {
      setSubmitting(true);

      setUploading(true);
      const imageUrl = await uploadImageToImgBB(imageFile);
      setUploading(false);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        gender,
        sizes,
        colors,
        price: Number(price),
        inStock,
        stockQuantity: Number(stockQuantity) || 0,
        image: imageUrl,
        rating: rating ? Number(rating) : 0,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to add product.");
        return;
      }

      setMessage("Product added successfully!");
      resetForm();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Classic Crew Neck T-Shirt"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Short description of the product"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category + Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as "men" | "women" | "child")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="child">Child</option>
            </select>
          </div>
        </div>

        {/* Sizes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
          <div className="flex flex-wrap gap-2">
            {SIZE_OPTIONS.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => toggleValue(s, sizes, setSizes)}
                className={`px-3 py-1.5 rounded-full text-xs border ${
                  sizes.includes(s)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => toggleValue(c, colors, setColors)}
                className={`px-3 py-1.5 rounded-full text-xs border ${
                  colors.includes(c)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Price + Stock Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 19.99"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
            <input
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              placeholder="e.g. 50"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* In Stock + Rating */}
        <div className="grid grid-cols-2 gap-4 items-end">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="inStock"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="inStock" className="text-sm text-gray-700">
              In Stock
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating (optional)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="e.g. 4.5"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-3 h-32 w-32 object-cover rounded-lg border"
            />
          )}
        </div>

        {/* Messages */}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50 hover:bg-blue-700 transition"
        >
          {uploading ? "Uploading image..." : submitting ? "Adding product..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}