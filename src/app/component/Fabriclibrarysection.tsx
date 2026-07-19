import Link from "next/link";

const fabrics = [
  { name: "Charcoal Herringbone", origin: "English wool, 280g", seed: "fabric-charcoal" },
  { name: "Ivory Linen", origin: "Irish linen, summer weight", seed: "fabric-ivory" },
  { name: "Midnight Twill", origin: "Italian wool-silk, 240g", seed: "fabric-midnight" },
  { name: "Rust Corduroy", origin: "Japanese cotton, wide wale", seed: "fabric-rust" },
];

export default function FabricLibrarySection() {
  return (
    <section className="bg-[#F2F0EB] px-[6vw] py-24 text-[#6E6C66]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span
              className="text-sm italic tracking-wide text-[#141414]"
              style={{ fontFamily: "var(--font-display, serif)" }}
            >
              The Library
            </span>
            <h2
              className="mt-2 max-w-xl text-[36px] leading-[1.15] text-[#141414] sm:text-[44px]"
              style={{ fontFamily: "var(--font-display, serif)" }}
            >
              Cloth worth building a garment around.
            </h2>
          </div>
          <Link
            href="/fabrics"
            className="shrink-0 border-b border-[#141414]/40 pb-1 text-sm tracking-wide text-[#141414] transition-colors hover:border-[#141414] hover:text-[#141414]/70"
          >
            View All Fabrics →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {fabrics.map((f) => (
            <div key={f.name} className="group cursor-pointer">
              <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-[#E5E3DE]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://picsum.photos/seed/${f.seed}/500/650`}
                  alt={f.name}
                  className="h-full w-full object-cover grayscale-[10%] transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 border border-[#141414]/0 transition-colors duration-300 group-hover:border-[#141414]/30" />
              </div>
              <h3 className="text-[15px] text-[#141414]" style={{ fontFamily: "var(--font-display, serif)" }}>
                {f.name}
              </h3>
              <p className="mt-1 text-[13px] font-light text-[#A6A296]">{f.origin}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}