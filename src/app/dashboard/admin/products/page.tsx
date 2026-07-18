"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
} from "lucide-react";

interface Product {
  _id: string;
  title: string;
  image: string;
  category: string;
  gender: string;
  price: number;
  inStock: boolean;
  stockQuantity: number;
}

type SortColumn = "title" | "category" | "price";
type SortDirection = "asc" | "desc";
type StockFilterValue = "all" | "in" | "out";

const PAGE_SIZE = 8;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilterValue>("all");
  const [stockDropdownOpen, setStockDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [sortColumn, setSortColumn] = useState<SortColumn>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const [openRowDropdown, setOpenRowDropdown] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch products whenever search changes (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchProducts();
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to load products.");
        return;
      }

      setProducts(data.result || []);
      setPage(1);
    } catch (err) {
      console.error(err);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Filter (stock) + sort — search is already applied server-side
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (stockFilter === "in") list = list.filter((p) => p.inStock);
    if (stockFilter === "out") list = list.filter((p) => !p.inStock);

    list.sort((a, b) => {
      const first = String(a[sortColumn]);
      const second = String(b[sortColumn]);
      let cmp = first.localeCompare(second, undefined, { numeric: true });
      if (sortDirection === "desc") cmp *= -1;
      return cmp;
    });

    return list;
  }, [products, stockFilter, sortColumn, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleStock = async (product: Product, newStatus: boolean) => {
    setOpenRowDropdown(null);
    if (newStatus === product.inStock) return;

    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p._id === product._id ? { ...p, inStock: newStatus } : p))
    );

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
    } catch (err) {
      console.error("Failed to update stock status:", err);
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, inStock: product.inStock } : p))
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
    } catch (err) {
      console.error("Failed to delete product:", err);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? (
      <ChevronUp size={14} className="inline ml-1" />
    ) : (
      <ChevronDown size={14} className="inline ml-1" />
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Products</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your store&apos;s product catalog.</p>
        </div>
        <Link
          href="/dashboard/admin/products/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-900 transition"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* Toolbar: search + stock filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        <div className="relative max-w-xs w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name..."
            className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        {/* Stock filter dropdown */}
        <div className="relative">
          <button
            onClick={() => setStockDropdownOpen(!stockDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            {stockFilter === "all" ? "All" : stockFilter === "in" ? "In Stock" : "Out of Stock"}
            <ChevronDown size={14} />
          </button>

          {stockDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setStockDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20">
                {(["all", "in", "out"] as StockFilterValue[]).map((val) => (
                  <button
                    key={val}
                    onClick={() => {
                      setStockFilter(val);
                      setStockDropdownOpen(false);
                      setPage(1);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${
                      stockFilter === val ? "text-slate-900 font-semibold" : "text-slate-600"
                    }`}
                  >
                    {val === "all" ? "All" : val === "in" ? "In Stock" : "Out of Stock"}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500">
                <th
                  onClick={() => toggleSort("title")}
                  className="text-left font-semibold px-5 py-3.5 cursor-pointer select-none"
                >
                  Product <SortIcon column="title" />
                </th>
                <th
                  onClick={() => toggleSort("category")}
                  className="text-left font-semibold px-5 py-3.5 cursor-pointer select-none"
                >
                  Category <SortIcon column="category" />
                </th>
                <th className="text-left font-semibold px-5 py-3.5">Gender</th>
                <th
                  onClick={() => toggleSort("price")}
                  className="text-left font-semibold px-5 py-3.5 cursor-pointer select-none"
                >
                  Price <SortIcon column="price" />
                </th>
                <th className="text-left font-semibold px-5 py-3.5">Stock</th>
                <th className="text-right font-semibold px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-400 py-10">
                    Loading products...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="text-center text-red-500 py-10">
                    {error}
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-400 py-10">
                    No products found.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="h-10 w-10 rounded-lg object-cover border border-slate-100 shrink-0"
                        />
                        <span className="font-medium text-slate-800 truncate max-w-[180px]">
                          {product.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{product.category}</td>
                    <td className="px-5 py-3 text-slate-600 capitalize">{product.gender}</td>
                    <td className="px-5 py-3 text-slate-800 font-medium">${product.price}</td>

                    {/* Stock toggle dropdown */}
                    <td className="px-5 py-3">
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            setOpenRowDropdown(openRowDropdown === product._id ? null : product._id)
                          }
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            product.inStock
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              product.inStock ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          {product.inStock ? "In Stock" : "Out of Stock"}
                          <ChevronDown size={12} />
                        </button>

                        {openRowDropdown === product._id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenRowDropdown(null)}
                            />
                            <div className="absolute left-0 top-full mt-2 w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20">
                              <button
                                onClick={() => toggleStock(product, true)}
                                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50"
                              >
                                In Stock
                              </button>
                              <button
                                onClick={() => toggleStock(product, false)}
                                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50"
                              >
                                Out of Stock
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/dashboard/admin/products/edit/${product._id}`}
                          className="p-2 rounded-lg hover:bg-slate-100 transition"
                          title="Edit"
                        >
                          <Pencil size={15} className="text-slate-600" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="p-2 rounded-lg hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <Trash2 size={15} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredProducts.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filteredProducts.length)} of {filteredProducts.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition"
              >
                <ChevronLeft size={14} />
                Prev
              </button>
              <span className="text-xs text-slate-500 px-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteTarget(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-[400px] w-full p-6">
            <button
              onClick={() => setDeleteTarget(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              disabled={deleting}
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Delete this product permanently?
              </h2>
            </div>

            <p className="text-sm text-slate-500 mb-6">
              This will permanently delete <strong>{deleteTarget.title}</strong> and all of its
              data. This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}