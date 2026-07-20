"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { usePathname } from "next/navigation";

// Gender-based dropdowns (hover shows categories)
const NAV_STRUCTURE = [
  {
    gender: "men",
    label: "Men",
    categories: ["T-Shirt", "Shirt", "Jeans", "Pants", "Shorts", "Jacket", "Polo", "Accessories"],
  },
  {
    gender: "women",
    label: "Women",
    categories: ["Dress", "Blouse", "Skirt", "Jacket", "Leggings", "Activewear", "Cardigan", "Accessories"],
  },
  {
    gender: "child",
    label: "Kids",
    categories: ["T-Shirt", "Hoodie", "Dress", "Jacket", "Overalls", "Shoes"],
  },
];

// Plain direct links, no dropdown
const DIRECT_LINKS = [
  { label: "All Products", href: "/Shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

type SearchResult = {
  _id: string;
  title: string;
  price: number;
  image: string;
  category: string;
};

// Small delay so moving the cursor from the trigger into the dropdown
// doesn't close it before it arrives (fixes the "closes on the way down" bug).
const HOVER_CLOSE_DELAY = 200;

export default function Navbar() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null); // mobile account menu container
  const desktopAccountRef = useRef<HTMLDivElement>(null); // desktop account menu container
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Gender dropdown hover handlers (delayed close, desktop only) ----
  const openGenderDropdown = useCallback((gender: string) => {
    if (dropdownCloseTimer.current) clearTimeout(dropdownCloseTimer.current);
    setOpenDropdown(gender);
  }, []);

  const scheduleCloseGenderDropdown = useCallback(() => {
    if (dropdownCloseTimer.current) clearTimeout(dropdownCloseTimer.current);
    dropdownCloseTimer.current = setTimeout(() => setOpenDropdown(null), HOVER_CLOSE_DELAY);
  }, []);



  // ---- Account dropdown: pure click-toggle (see button onClick below) ----

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
      const target = e.target as Node;
      const insideMobileAccount = accountRef.current?.contains(target);
      const insideDesktopAccount = desktopAccountRef.current?.contains(target);
      if (!insideMobileAccount && !insideDesktopAccount) {
        setAccountMenuOpen(false);
        setMobileExpanded(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clear pending timers on unmount
  useEffect(() => {
    return () => {
      if (dropdownCloseTimer.current) clearTimeout(dropdownCloseTimer.current);
    };
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products?search=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setResults(data.result || []);
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const { data: session } = authClient.useSession();
  const user = session?.user;

  const handleLogout = async () => {
    await authClient.signOut();
    setAccountMenuOpen(false);
  };

  const closeAccountMenu = () => {
    setAccountMenuOpen(false);
    setMobileExpanded(null);
  };

  if (pathname.includes("dashboard")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-gray-900 tracking-tight shrink-0"
          >
            Shopify<span className="text-blue-600">Store</span>
          </Link>

          {/* Desktop Nav links */}
          <div className="hidden md:flex items-center gap-7 shrink-0">
            {/* Gender dropdowns */}
            {NAV_STRUCTURE.map((section) => (
              <div
                key={section.gender}
                className="relative"
                onMouseEnter={() => openGenderDropdown(section.gender)}
                onMouseLeave={scheduleCloseGenderDropdown}
              >
                <button className="text-sm font-medium text-gray-700 hover:text-blue-600 py-6 transition-colors">
                  {section.label}
                </button>

                {openDropdown === section.gender && (
                  <div
                    className="absolute left-0 top-full w-52 bg-white border border-gray-200 rounded-xl shadow-xl py-2"
                    onMouseEnter={() => openGenderDropdown(section.gender)}
                    onMouseLeave={scheduleCloseGenderDropdown}
                  >
                    {section.categories.map((cat) => (
                      <Link
                        key={cat}
                        href={`/Shop?gender=${section.gender}&category=${encodeURIComponent(cat)}`}
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Plain direct links */}
            {DIRECT_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search bar (desktop, center-grown) */}
          <div className="hidden md:block flex-1 max-w-md relative" ref={searchRef}>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowResults(true)}
                placeholder="Search products..."
                className="w-full rounded-full border border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Search results dropdown */}
            {showResults && query.trim() && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-96 overflow-y-auto">
                {searching ? (
                  <div className="px-4 py-6 text-sm text-gray-400 text-center">Searching...</div>
                ) : results.length > 0 ? (
                  <>
                    {results.map((item) => (
                      <Link
                        key={item._id}
                        href={`/product/${item._id}`}
                        onClick={() => setShowResults(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-10 w-10 rounded-md object-cover border border-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 truncate">{item.title}</p>
                          <p className="text-xs text-gray-400">{item.category}</p>
                        </div>
                        <span className="text-sm font-medium text-gray-700 shrink-0">
                          ${item.price}
                        </span>
                      </Link>
                    ))}
                    <Link
                      href={`/Shop?search=${encodeURIComponent(query)}`}
                      onClick={() => setShowResults(false)}
                      className="block text-center py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 border-t border-gray-100"
                    >
                      View all results for &quot;{query}&quot;
                    </Link>
                  </>
                ) : (
                  <div className="px-4 py-6 text-sm text-gray-400 text-center">
                    No products found for &quot;{query}&quot;
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side icons (desktop) */}
          <div className="hidden md:flex items-center gap-5 shrink-0">
            <Link href="/cart" className="text-gray-600 hover:text-blue-600 transition-colors" aria-label="Cart">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </Link>

            {/* Account icon + dropdown (click to open on desktop — hover removed to avoid
                the open/close timing race that was blocking clicks on the links inside) */}
            <div className="relative" ref={desktopAccountRef}>
              <button
                type="button"
                onClick={() => setAccountMenuOpen((v) => !v)}
                className="text-gray-600 hover:text-blue-600 transition-colors"
                aria-label="Account menu"
                aria-expanded={accountMenuOpen}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-2">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {user.name || user.email}
                        </p>
                      </div>
                      <Link
                        href="/account/profile"
                        onClick={closeAccountMenu}
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                      >
                        Profile
                      </Link>
                      <Link
                        href={(user as any)?.role === "admin" ? "/dashboard/admin" : "/dashboard/user"}
                        onClick={closeAccountMenu}
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                      >
                        Dashboard
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/account/login"
                        onClick={closeAccountMenu}
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        href="/account/Register"
                        onClick={closeAccountMenu}
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile: search + account (hamburger removed — nav lives inside the account menu) */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="text-gray-700"
              aria-label="Toggle search"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* Single icon holds everything: nav categories, direct links, cart, and auth */}
            <div className="relative" ref={accountRef}>
              <Link href={"/cart"}>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((v) => !v)}
                  className="text-gray-700"
                  aria-label="Menu"
                  aria-expanded={accountMenuOpen}
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>
              </Link>

              {accountMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 max-h-[75vh] overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50">
                  {/* Auth section first */}
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {user.name || user.email}
                        </p>
                      </div>
                      <Link
                        href="/account/profile"
                        onClick={closeAccountMenu}
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={closeAccountMenu}
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                      >
                        Dashboard
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/account/login"
                        onClick={closeAccountMenu}
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        href="/account/Register"
                        onClick={closeAccountMenu}
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                      >
                        Register
                      </Link>
                    </>
                  )}

                  <div className="my-2 border-t border-gray-100" />

                  {/* Cart */}
                  <Link
                    href="/cart"
                    onClick={closeAccountMenu}
                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                  >
                    Cart
                  </Link>

                  <div className="my-2 border-t border-gray-100" />

                  {/* Gender categories (accordion) */}
                  {NAV_STRUCTURE.map((section) => (
                    <div key={section.gender}>
                      <button
                        onClick={() =>
                          setMobileExpanded(mobileExpanded === section.gender ? null : section.gender)
                        }
                        className="w-full flex justify-between items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {section.label}
                        <span>{mobileExpanded === section.gender ? "\u2212" : "+"}</span>
                      </button>

                      {mobileExpanded === section.gender && (
                        <div className="pb-1 pl-7 space-y-1">
                          {section.categories.map((cat) => (
                            <Link
                              key={cat}
                              href={`/Shop?gender=${section.gender}&category=${encodeURIComponent(cat)}`}
                              onClick={closeAccountMenu}
                              className="block py-1.5 text-sm text-gray-600 hover:text-blue-600"
                            >
                              {cat}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="my-2 border-t border-gray-100" />

                  {/* Direct links */}
                  {DIRECT_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeAccountMenu}
                      className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile search bar */}
        {mobileSearchOpen && (
          <div className="md:hidden pb-3" ref={searchRef}>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowResults(true)}
                placeholder="Search products..."
                className="w-full rounded-full border border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {showResults && query.trim() && (
              <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                {searching ? (
                  <div className="px-4 py-6 text-sm text-gray-400 text-center">Searching...</div>
                ) : results.length > 0 ? (
                  <>
                    {results.map((item) => (
                      <Link
                        key={item._id}
                        href={`/product/${item._id}`}
                        onClick={() => {
                          setShowResults(false);
                          setMobileSearchOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-10 w-10 rounded-md object-cover border border-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 truncate">{item.title}</p>
                          <p className="text-xs text-gray-400">{item.category}</p>
                        </div>
                        <span className="text-sm font-medium text-gray-700 shrink-0">
                          ${item.price}
                        </span>
                      </Link>
                    ))}
                    <Link
                      href={`/Shop?search=${encodeURIComponent(query)}`}
                      onClick={() => {
                        setShowResults(false);
                        setMobileSearchOpen(false);
                      }}
                      className="block text-center py-2.5 text-sm font-medium text-blue-600 border-t border-gray-100"
                    >
                      View all results
                    </Link>
                  </>
                ) : (
                  <div className="px-4 py-6 text-sm text-gray-400 text-center">
                    No products found
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </nav >
  );
}