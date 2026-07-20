'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

// Replace these with real photography from your shoot when ready.
// (picsum.photos gives stable placeholder images so nothing breaks in dev.)
const SLIDES = [
    {
        image: 'https://picsum.photos/seed/tailor-atelier/1920/1080',
        label: 'The Atelier',
    },
    {
        image: 'https://picsum.photos/seed/tailor-fabric/1920/1080',
        label: 'Fine Fabrics',
    },
    {
        image: 'https://picsum.photos/seed/tailor-stitch/1920/1080',
        label: 'Hand Stitching',
    },
    {
        image: 'https://picsum.photos/seed/tailor-fitting/1920/1080',
        label: 'The Fitting',
    },
    {
        image: 'https://picsum.photos/seed/tailor-suit/1920/1080',
        label: 'Finished Suits',
    },
    {
        image: 'https://picsum.photos/seed/tailor-craft/1920/1080',
        label: 'Craftsmanship',
    },
    {
        image: 'https://picsum.photos/seed/tailor-detail/1920/1080',
        label: 'The Details',
    },
];

const SLIDE_DURATION = 5500; // ms

export default function Hero() {
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const goTo = useCallback((index: number) => {
        setCurrent((index + SLIDES.length) % SLIDES.length);
    }, []);

    useEffect(() => {
        if (isPaused) return;
        timerRef.current = setInterval(() => {
            setCurrent((prev) => (prev + 1) % SLIDES.length);
        }, SLIDE_DURATION);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPaused]);

    return (
        <section
            className="relative w-full h-[100svh] min-h-[560px] overflow-hidden bg-[#0B0F14]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            aria-roledescription="carousel"
            aria-label="Atelier highlights"
        >
            {/* Background slides */}
            {SLIDES.map((slide, index) => (
                <div
                    key={slide.image}
                    className="absolute inset-0 transition-opacity duration-[1400ms] ease-in-out motion-reduce:transition-none"
                    style={{ opacity: index === current ? 1 : 0 }}
                    aria-hidden={index !== current}
                >
                    <img
                        src={slide.image}
                        alt=""
                        className="w-full h-full object-cover scale-105 motion-safe:animate-[kenburns_9s_ease-in-out_infinite_alternate]"
                        draggable={false}
                    />
                </div>
            ))}

            {/* Scrim for legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/55 to-[#0B0F14]/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F14]/70 via-transparent to-transparent" />

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-28 sm:px-12 sm:pb-32 lg:px-20">
                <div className="max-w-2xl">
                    {/* Eyebrow */}
                    <div className="mb-5 flex items-center gap-3">
                        <span className="font-mono text-[11px] tracking-[0.28em] text-[#C9A24B] uppercase">
                            Bespoke Tailoring
                        </span>
                        <span className="h-px w-10 bg-[#C9A24B]/60" style={{ borderTop: '1px dashed rgba(201,162,75,0.6)', backgroundColor: 'transparent' }} />
                        <span className="font-mono text-[11px] tracking-[0.28em] text-[#F5F1E8]/50 uppercase">
                            Est. Rajshahi
                        </span>
                    </div>

                    {/* Headline */}
                    <h1
                        className="text-[#F5F1E8] leading-[1.04] font-medium"
                        style={{
                            fontFamily: '"Fraunces", Georgia, serif',
                            fontSize: 'clamp(2.5rem, 6vw, 4.75rem)',
                        }}
                    >
                        Every stitch,
                        <br />
                        <span className="italic text-[#C9A24B]">cut to your story.</span>
                    </h1>

                    {/* Subtext */}
                    <p
                        className="mt-6 max-w-md text-[#F5F1E8]/75 text-base sm:text-lg"
                        style={{ fontFamily: '"Manrope", ui-sans-serif, system-ui, sans-serif' }}
                    >
                        Hand-finished suits and everyday wear, measured, cut, and
                        sewn in-house — built to fit a body, not a size chart.
                    </p>

                    {/* CTAs */}
                    <div className="mt-9 flex flex-wrap items-center gap-4">
                        <button
                            type="button"
                            className="rounded-full bg-[#C9A24B] px-7 py-3 text-sm font-semibold text-[#0B0F14] transition hover:bg-[#dcb75d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A24B]"
                        >
                            Explore the Collection
                        </button>
                        <button
                            type="button"
                            className="rounded-full border border-[#F5F1E8]/35 px-7 py-3 text-sm font-semibold text-[#F5F1E8] transition hover:border-[#F5F1E8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5F1E8]"
                        >
                            Book a Fitting
                        </button>
                    </div>
                </div>
            </div>

            {/* Fabric-swatch slide indicators */}
            <div className="absolute bottom-6 left-6 z-10 flex gap-2 sm:bottom-8 sm:left-12 lg:left-20">
                {SLIDES.map((slide, index) => {
                    const active = index === current;
                    return (
                        <button
                            key={slide.image}
                            type="button"
                            onClick={() => goTo(index)}
                            aria-label={`Show slide ${index + 1}: ${slide.label}`}
                            aria-current={active}
                            className={`group relative h-9 overflow-hidden rounded-[3px] border transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A24B] ${active
                                ? 'w-16 border-[#C9A24B]'
                                : 'w-6 border-[#F5F1E8]/30 hover:border-[#F5F1E8]/70'
                                }`}
                        >
                            <span
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url(${slide.image})`, opacity: active ? 0.9 : 0.45 }}
                            />
                            <span className="absolute inset-0 bg-[#0B0F14]/25" />
                            {active && (
                                <span className="absolute bottom-0.5 left-1 font-mono text-[9px] text-[#F5F1E8] tracking-wide">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Active slide label, bottom-right */}
            <div className="absolute bottom-8 right-6 z-10 hidden sm:block sm:right-12 lg:right-20">
                <span className="font-mono text-[11px] tracking-[0.2em] text-[#F5F1E8]/60 uppercase">
                    {String(current + 1).padStart(2, '0')} — {SLIDES[current].label}
                </span>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,500&family=Manrope:wght@400;500;600&display=swap');

                @keyframes kenburns {
                    0% {
                        transform: scale(1.05) translate3d(0, 0, 0);
                    }
                    100% {
                        transform: scale(1.14) translate3d(-1%, -1%, 0);
                    }
                }
            `}</style>
        </section>
    );
}