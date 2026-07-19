import Link from "next/link";

export default function BookFittingSection() {
  return (
    <section className="relative overflow-hidden bg-[#F2F0EB] px-[6vw] py-28 text-center text-[#6E6C66]">
      <div className="relative mx-auto max-w-2xl">
        <span
          className="text-sm italic tracking-wide text-[#141414]"
          style={{ fontFamily: "var(--font-display, serif)" }}
        >
          Next Step
        </span>
        <h2
          className="mt-3 mb-6 text-[36px] leading-[1.15] text-[#141414] sm:text-[46px]"
          style={{ fontFamily: "var(--font-display, serif)" }}
        >
          Bring your measurements. Leave with a garment.
        </h2>
        <p className="mx-auto mb-10 max-w-md text-[15px] font-light leading-relaxed text-[#6E6C66]">
          Fittings run about 40 minutes at our Rajshahi atelier. Bring reference
          photos if you have them — we'll handle the rest.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/contact"
            className="border border-[#141414] px-8 py-3 text-sm tracking-[0.08em] text-[#141414] transition-colors hover:bg-[#141414] hover:text-[#FAFAF8]"
            style={{ fontFamily: "var(--font-display, serif)" }}
          >
            BOOK A FITTING
          </Link>
          <Link
            href="/Shop-page"
            className="px-8 py-3 text-sm tracking-[0.08em] text-[#A6A296] transition-colors hover:text-[#141414]"
            style={{ fontFamily: "var(--font-display, serif)" }}
          >
            BROWSE READY-TO-WEAR
          </Link>
        </div>
      </div>
    </section>
  );
}