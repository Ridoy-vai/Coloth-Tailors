"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto h-20 w-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
          <AlertTriangle size={34} className="text-red-500" />
        </div>

        <h1 className="text-xl font-semibold text-gray-900">Something went wrong</h1>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          An unexpected error occurred while loading this page. You can try again, or head back to
          the homepage.
        </p>

        {process.env.NODE_ENV === "development" && (
          <p className="text-xs text-gray-400 mt-3 font-mono bg-gray-50 rounded-lg p-3 text-left break-words">
            {error.message}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}