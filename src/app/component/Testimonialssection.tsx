const quotes = [
  {
    text: "The first jacket I've owned that actually fit my shoulders. No alterations needed — none.",
    name: "Rafiul Islam",
    role: "Suit, 2025",
  },
  {
    text: "Two fittings and they caught a posture quirk my old tailor never noticed in ten years.",
    name: "Nusrat Jahan",
    role: "Wedding Sherwani, 2024",
  },
  {
    text: "Ordered from Dhaka, fitted over two visits. Worth the trip both times.",
    name: "Tanvir Ahmed",
    role: "Blazer, 2025",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-[#FAFAF8] px-[6vw] py-24 text-[#6E6C66]">
      <div className="mx-auto max-w-6xl">
        <span
          className="text-sm italic tracking-wide text-[#141414]"
          style={{ fontFamily: "var(--font-display, serif)" }}
        >
          Client Notes
        </span>
        <h2
          className="mt-2 mb-14 max-w-xl text-[36px] leading-[1.15] text-[#141414] sm:text-[44px]"
          style={{ fontFamily: "var(--font-display, serif)" }}
        >
          Fit, in their own words.
        </h2>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-sm bg-[#141414]/10 md:grid-cols-3">
          {quotes.map((q) => (
            <figure key={q.name} className="flex flex-col justify-between bg-[#FAFAF8] p-8">
              <svg viewBox="0 0 24 24" className="mb-6 h-6 w-6 fill-[#141414]/25">
                <path d="M9 7c-2.8 0-5 2.2-5 5v5h5v-5H6.5C6.5 9.8 7.6 8.6 9 8.4V7zm9 0c-2.8 0-5 2.2-5 5v5h5v-5h-2.5c0-2.2 1.1-3.4 2.5-3.6V7z" />
              </svg>
              <blockquote className="mb-6 text-[15px] font-light italic leading-relaxed text-[#141414]">
                {q.text}
              </blockquote>
              <figcaption className="text-[13px] not-italic text-[#A6A296]">
                <span className="text-[#141414]">{q.name}</span> — {q.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}