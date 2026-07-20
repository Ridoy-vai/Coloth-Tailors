"use client"
import Link from "next/link";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { usePathname } from "next/navigation";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
});

export default function Footer() {
  const pathname = usePathname();
  if (pathname.includes("dashboard")) {
    return null;
  }
  return (
    <footer
      className={`${cormorant.variable} ${jost.variable} relative bg-[#17140F] px-[6vw] font-[family-name:var(--font-body)] font-light text-[#C9BCA4]`}
      style={{
        backgroundImage:
          "radial-gradient(ellipse 900px 400px at 15% -10%, rgba(183,147,91,0.08), transparent 60%)",
      }}
    >
      {/* stitched top border */}
      <div
        className="h-px opacity-55"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #B7935B 0 10px, transparent 10px 20px)",
        }}
      />

      <div className="grid grid-cols-1 gap-10 py-16 pb-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:gap-12">
        {/* Brand */}
        <div>
          <p className="mb-4 flex items-center gap-2.5 font-[family-name:var(--font-display)] text-[28px] tracking-wide text-[#EDE4D3]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#B7935B"
              strokeWidth={1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[22px] w-[22px] shrink-0"
            >
              <path d="M12 2 L4 6 v6c0 5 3.6 8.4 8 10 4.4-1.6 8-5 8-10V6z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            ShopifyStore
          </p>
          <p className="mb-5 max-w-[340px] text-[14.5px] leading-[1.8] text-[#C9BCA4]">
            Hand-finished suits and everyday wear — measured, cut, and sewn
            in-house at our Rajshahi atelier. Built to fit a body, not a size
            chart.
          </p>
          <span className="font-[family-name:var(--font-display)] text-sm italic tracking-wide text-[#B7935B]">
            Bespoke Tailoring · Est. Rajshahi
          </span>

          <div className="mt-6 flex gap-3.5">
            {[
              {
                label: "Instagram",
                path: (
                  <>
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
                  </>
                ),
              },
              {
                label: "Facebook",
                path: (
                  <path d="M15 4h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3z" />
                ),
              },
              {
                label: "WhatsApp",
                path: (
                  <>
                    <path d="M3 21l1.6-4.7A8 8 0 1 1 8.7 19.4z" />
                    <path d="M8.5 9.5c0 3.5 2.5 6 6 6" />
                  </>
                ),
              },
            ].map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-[#B7935B]/35 text-[#C9BCA4] transition-all duration-200 hover:border-[#B7935B] hover:bg-[#B7935B] hover:text-[#17140F]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} className="h-[15px] w-[15px]">
                  {s.path}
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Shop links */}
        <div>
          <h4 className="relative mb-5 pb-3 font-[family-name:var(--font-display)] text-base font-semibold uppercase tracking-[0.12em] text-[#EDE4D3] after:absolute after:bottom-0 after:left-0 after:h-px after:w-[26px] after:bg-[#B7935B]">
            Shop
          </h4>
          <ul className="flex flex-col gap-3">
            {[
              { label: "Men's Collection", href: "/shop?gender=men" },
              { label: "Women's Collection", href: "/shop?gender=women" },
              { label: "Kids' Collection", href: "/shop?gender=kids" },
              { label: "All Products", href: "/Shop" },
            ].map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-[14.5px] text-[#C9BCA4] transition-all duration-200 hover:pl-1.5 hover:text-[#B7935B]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Studio links */}
        <div>
          <h4 className="relative mb-5 pb-3 font-[family-name:var(--font-display)] text-base font-semibold uppercase tracking-[0.12em] text-[#EDE4D3] after:absolute after:bottom-0 after:left-0 after:h-px after:w-[26px] after:bg-[#B7935B]">
            Studio
          </h4>
          <ul className="flex flex-col gap-3">
            {[
              { label: "About Us", href: "/about" },
              { label: "Contact", href: "/contact" },
              { label: "Cart", href: "/cart" },
              { label: "Book a Fitting", href: "#" },
            ].map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-[14.5px] text-[#C9BCA4] transition-all duration-200 hover:pl-1.5 hover:text-[#B7935B]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <address className="mt-6 text-[14.5px] not-italic leading-[1.9] text-[#C9BCA4]">
            Shaheb Bazar, Rajshahi
            <br />
            Bangladesh
            <br />
            <a href="tel:+8801000000000" className="hover:text-[#B7935B]">
              +880 1000‑000000
            </a>
            <br />
            <a href="mailto:hello@shopifystore.com" className="hover:text-[#B7935B]">
              hello@shopifystore.com
            </a>
          </address>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="relative mb-5 pb-3 font-[family-name:var(--font-display)] text-base font-semibold uppercase tracking-[0.12em] text-[#EDE4D3] after:absolute after:bottom-0 after:left-0 after:h-px after:w-[26px] after:bg-[#B7935B]">
            Stay Measured
          </h4>
          <p className="mb-4.5 max-w-[300px] text-[14.5px] leading-[1.75] text-[#C9BCA4]">
            Notes on new fabrics, seasonal fittings, and studio hours — sent
            occasionally, never as noise.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex gap-2.5 border-b border-[#B7935B]/35 pb-2.5"
          >
            <input
              type="email"
              required
              placeholder="Your email address"
              className="flex-1 bg-transparent text-sm font-light text-[#EDE4D3] outline-none placeholder:text-[#6E6350]"
            />
            <button
              type="submit"
              className="group flex items-center gap-1.5 font-[family-name:var(--font-display)] text-sm uppercase tracking-[0.08em] text-[#B7935B]"
            >
              Join
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3.5 border-t border-[#B7935B]/[0.18] py-6 pb-7 text-[12.5px] tracking-wide text-[#6E6350]">
        <span>© 2026 ShopifyStore Bespoke Tailoring. All rights reserved.</span>
        <span className="flex flex-col gap-1.5 sm:flex-row sm:gap-0">
          <Link href="#" className="sm:ml-4.5 hover:text-[#B7935B]">
            Privacy Policy
          </Link>
          <Link href="#" className="sm:ml-4.5 hover:text-[#B7935B]">
            Terms of Service
          </Link>
          <Link href="#" className="sm:ml-4.5 hover:text-[#B7935B]">
            Size Guide
          </Link>
        </span>
      </div>
    </footer>
  );
}