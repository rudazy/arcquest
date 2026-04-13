"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const orbs = [
  {
    color: "#7B5EA7",
    size: 320,
    x: "15%",
    y: "20%",
    dx: [0, 40, -30, 0],
    dy: [0, -50, 30, 0],
    duration: 25,
  },
  {
    color: "#00d4ff",
    size: 220,
    x: "65%",
    y: "55%",
    dx: [0, -35, 25, 0],
    dy: [0, 30, -40, 0],
    duration: 20,
  },
  {
    color: "#7B5EA7",
    size: 260,
    x: "75%",
    y: "10%",
    dx: [0, 30, -20, 0],
    dy: [0, -30, 45, 0],
    duration: 28,
  },
  {
    color: "#00d4ff",
    size: 180,
    x: "25%",
    y: "65%",
    dx: [0, -25, 35, 0],
    dy: [0, 40, -25, 0],
    duration: 22,
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {orbs.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              background: orb.color,
              filter: `blur(${Math.round(orb.size / 2)}px)`,
              opacity: 0.15,
            }}
            animate={{ x: orb.dx, y: orb.dy }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1
          className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          style={{
            textShadow:
              "0 0 60px rgba(123, 94, 167, 0.5), 0 0 120px rgba(123, 94, 167, 0.2)",
          }}
        >
          The Arc Ecosystem Hub
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Learn. Complete tasks. Earn XP. Stake your place onchain.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/onboarding"
            className="rounded-md bg-[#7B5EA7] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#6a4e94]"
          >
            Start Journey
          </Link>
          <Link
            href="/quiz"
            className="rounded-md border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Learn Arc
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
