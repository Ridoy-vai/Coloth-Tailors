const steps = [
  {
    n: "01",
    title: "Measure",
    text: "Twenty-six points taken by hand, on your body — not off a chart. Every fitting starts here.",
  },
  {
    n: "02",
    title: "Cut",
    text: "Pattern drafted from your measurements alone, then cut from cloth you chose in the atelier.",
  },
  {
    n: "03",
    title: "Stitch",
    text: "Hand-finished seams and canvassing, sewn in-house by tailors who've done this for decades.",
  },
  {
    n: "04",
    title: "Fit",
    text: "A final fitting to true the shoulders, sleeves, and drape before it ever leaves the shop.",
  },
];

export default function ProcessSection() {
  return (
    <section className="bg-[#17140F] px-[6vw] py-24 text-[#C9BCA4]">
      <div className="mx-auto max-w-6xl">
        <span
          className="text-sm italic tracking-wide text-[#B7935B]"
          style={{ fontFamily: "var(--font-display, serif)" }}
        >
          How It's Made
        </span>
        <h2
          className="mt-2 mb-14 max-w-xl text-[36px] leading-[1.15] text-[#EDE4D3] sm:text-[44px]"
          style={{ fontFamily: "var(--font-display, serif)" }}
        >
          From measuring tape to finished coat.
        </h2>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.n} className="relative pl-0">
              <div
                className="mb-5 text-[13px] tracking-[0.2em] text-[#6E6350]"
                style={{ fontFamily: "var(--font-display, serif)" }}
              >
                {s.n}
              </div>
              <h3
                className="mb-3 text-xl text-[#EDE4D3]"
                style={{ fontFamily: "var(--font-display, serif)" }}
              >
                {s.title}
              </h3>
              <p className="text-[14.5px] font-light leading-relaxed text-[#C9BCA4]">
                {s.text}
              </p>
              {i < steps.length - 1 && (
                <div className="mt-8 hidden h-px w-full bg-gradient-to-r from-[#B7935B]/40 to-transparent lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}