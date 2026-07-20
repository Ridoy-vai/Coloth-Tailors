import Link from "next/link";
import { PackageSearch } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
          <PackageSearch size={36} className="text-blue-600" />
        </div>

        <h1 className="text-6xl font-black text-gray-900 tracking-tight">404</h1>
        <h2 className="text-xl font-semibold text-gray-800 mt-2">Page not found</h2>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved. Let&apos;s get
          you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            Go to Homepage
          </Link>
          <Link
            href="/Shop"
            className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}