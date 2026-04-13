"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Slide {
  title: string;
  description: string;
  cta_label: string;
  cta_href: string;
  badge?: string;
}

interface PhaseCarouselProps {
  phase: 1 | 2 | 3;
  title: string;
  subtitle: string;
  slides: Slide[];
  accentColor: string;
}

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#0a0a0a" : "#ffffff";
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
};

export function PhaseCarousel({
  phase,
  title,
  subtitle,
  slides,
  accentColor,
}: PhaseCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback(
    (index: number) => {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
    },
    [currentIndex],
  );

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(goNext, 3000);
    return () => clearInterval(id);
  }, [isPaused, goNext, currentIndex]);

  const slide = slides[currentIndex];
  if (!slide) return null;

  const ctaTextColor = getContrastColor(accentColor);

  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <span
          className="h-5 w-1 rounded-full"
          style={{ backgroundColor: accentColor }}
          aria-hidden="true"
        />
        <div>
          <p
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: accentColor }}
          >
            Phase {phase}
          </p>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div
        className="rounded-lg border border-border bg-card"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ borderLeftColor: accentColor, borderLeftWidth: 2 }}
      >
        <div className="relative min-h-[180px] overflow-hidden p-6">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex flex-col gap-3"
            >
              {slide.badge && (
                <span
                  className="inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: `${accentColor}15`,
                    color: accentColor,
                    border: `1px solid ${accentColor}30`,
                  }}
                >
                  {slide.badge}
                </span>
              )}

              <h3 className="text-lg font-semibold text-foreground">
                {slide.title}
              </h3>

              <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
                {slide.description}
              </p>

              <div className="mt-2">
                <Link
                  href={slide.cta_href}
                  className="inline-flex rounded-md px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: accentColor,
                    color: ctaTextColor,
                  }}
                >
                  {slide.cta_label}
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goNext}
              className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div
            className="flex items-center gap-1.5"
            role="tablist"
            aria-label="Slide indicators"
          >
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                role="tab"
                aria-selected={i === currentIndex}
                aria-label={`Slide ${i + 1}`}
                className="rounded-full p-0.5"
              >
                <span
                  className="block h-2 w-2 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor:
                      i === currentIndex
                        ? accentColor
                        : "hsl(var(--muted))",
                    transform:
                      i === currentIndex ? "scale(1.25)" : "scale(1)",
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
