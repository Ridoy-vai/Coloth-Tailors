"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  X,
  AlertTriangle,
  BadgeCheck,
  CircleDashed,
  Ban,
  ShieldCheck,
} from "lucide-react";

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  image?: string | null;
  banned?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
}

type StatusFilterValue = "all" | "active" | "blocked";

const PAGE_SIZE = 8;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers();
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to load users.");
        return;
      }

      setUsers(data.result || []);
      setPage(1);
    } catch (err) {
      console.error(err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let list = [...users];
    if (statusFilter === "active") list = list.filter((u) => !u.banned);
    if (statusFilter === "blocked") list = list.filter((u) => u.banned);
    return list;
  }, [users, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleBlock = async (targetUser: UserRecord) => {
    const newBanned = !targetUser.banned;
    setUpdatingId(targetUser._id);

    // Optimistic update
    setUsers((prev) =>
      prev.map((u) => (u._id === targetUser._id ? { ...u, banned: newBanned } : u))
    );

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${targetUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: newBanned }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
    } catch (err) {
      console.error("Failed to update user status:", err);
      setUsers((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, banned: targetUser.banned } : u))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
    } catch (err) {
      console.error("Failed to delete user:", err);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Users</h1>
          <p className="text-sm text-slate-400 mt-1">Manage registered users and their roles.</p>
        </div>
      </div>

      {/* Toolbar: search + role filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        <div className="relative max-w-xs w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setStatusFilterOpen(!statusFilterOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            {statusFilter === "all" ? "All Users" : statusFilter === "active" ? "Active" : "Blocked"}
            <ChevronDown size={14} />
          </button>

          {statusFilterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setStatusFilterOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20">
                {(["all", "active", "blocked"] as StatusFilterValue[]).map((val) => (
                  <button
                    key={val}
                    onClick={() => {
                      setStatusFilter(val);
                      setStatusFilterOpen(false);
                      setPage(1);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${
                      statusFilter === val ? "text-slate-900 font-semibold" : "text-slate-600"
                    }`}
                  >
                    {val === "all" ? "All Users" : val === "active" ? "Active" : "Blocked"}
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
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500">
                <th className="text-left font-semibold px-5 py-3.5">User</th>
                <th className="text-left font-semibold px-5 py-3.5">Email Status</th>
                <th className="text-left font-semibold px-5 py-3.5">Status</th>
                <th className="text-left font-semibold px-5 py-3.5">Joined</th>
                <th className="text-right font-semibold px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 py-10">
                    Loading users...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="text-center text-red-500 py-10">
                    {error}
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 py-10">
                    No users found.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center shrink-0">
                          {u.image ? (
                            <img src={u.image} alt={u.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-slate-500">
                              {u.name?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate max-w-[160px]">{u.name}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[180px]">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      {u.emailVerified ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-green-700">
                          <BadgeCheck size={14} />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                          <CircleDashed size={14} />
                          Unverified
                        </span>
                      )}
                    </td>

                    {/* Block / Unblock toggle */}
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleBlock(u)}
                        disabled={updatingId === u._id}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition disabled:opacity-50 ${
                          u.banned
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                        title={u.banned ? "Click to unblock" : "Click to block"}
                      >
                        {u.banned ? <Ban size={12} /> : <ShieldCheck size={12} />}
                        {updatingId === u._id ? "Updating..." : u.banned ? "Blocked" : "Active"}
                      </button>
                    </td>

                    <td className="px-5 py-3 text-slate-500 text-xs">{formatDate(u.createdAt)}</td>

                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="p-2 rounded-lg hover:bg-red-50 transition"
                          title="Delete user"
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
        {!loading && filteredUsers.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}
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
              <h2 className="text-base font-bold text-slate-900">Delete this user?</h2>
            </div>

            <p className="text-sm text-slate-500 mb-6">
              This will permanently delete <strong>{deleteTarget.name}</strong> (
              {deleteTarget.email}) and their account. This action cannot be undone.
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
                {deleting ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}