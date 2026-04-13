import { Hero } from "@/components/home/hero";
import { StatsBar } from "@/components/home/stats-bar";
import { PhaseCarousel } from "@/components/home/phase-carousel";

const phase1Slides = [
  {
    title: "Learn About Arc",
    description: "Read the Arc guide and take the quiz to earn 20 XP",
    cta_label: "Take the Quiz",
    cta_href: "/quiz",
  },
  {
    title: "Join the Community",
    description: "Follow Arc and ArcTerminal on X to get started",
    cta_label: "Follow & Earn 5 XP",
    cta_href: "/onboarding",
  },
  {
    title: "Climb the Leaderboard",
    description:
      "Complete tasks, level up, and stand tall in the Arc ecosystem",
    cta_label: "View Leaderboard",
    cta_href: "/leaderboard",
  },
];

const phase2Slides = [
  {
    title: "Aave on Arc",
    description:
      "Lend and borrow with the leading DeFi protocol now live on Arc",
    cta_label: "View Tasks",
    cta_href: "/projects/aave",
    badge: "\u2713 Verified",
  },
  {
    title: "Maple Finance",
    description: "Institutional lending built for the onchain economy",
    cta_label: "View Tasks",
    cta_href: "/projects/maple",
    badge: "\u2713 Verified",
  },
  {
    title: "Curve Finance",
    description: "Stablecoin swaps with deep liquidity on Arc",
    cta_label: "View Tasks",
    cta_href: "/projects/curve",
    badge: "\u2713 Verified",
  },
];

const phase3Slides = [
  {
    title: "Community Project Alpha",
    description:
      "Early stage project building on Arc. Proceed with caution.",
    cta_label: "View Tasks",
    cta_href: "/projects/alpha",
    badge: "\u26A0 Community",
  },
  {
    title: "Community Project Beta",
    description:
      "Unaudited protocol. Do your own research before interacting.",
    cta_label: "View Tasks",
    cta_href: "/projects/beta",
    badge: "\u26A0 Community",
  },
  {
    title: "Community Project Gamma",
    description:
      "Community-submitted project. Not officially verified by Arc Terminal.",
    cta_label: "View Tasks",
    cta_href: "/projects/gamma",
    badge: "\u26A0 Community",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      <StatsBar />

      <div className="mx-auto max-w-5xl space-y-12 px-4 py-16 sm:px-6">
        <PhaseCarousel
          phase={1}
          title="Get Started on Arc"
          subtitle="Complete these to unlock the full ecosystem"
          accentColor="#7B5EA7"
          slides={phase1Slides}
        />

        <hr className="border-border" />

        <PhaseCarousel
          phase={2}
          title="Verified Projects"
          subtitle="Official Arc ecosystem protocols — use them and earn XP"
          accentColor="#00d4ff"
          slides={phase2Slides}
        />

        <hr className="border-border" />

        <PhaseCarousel
          phase={3}
          title="Community Projects"
          subtitle="Built by Arc builders — DYOR before interacting"
          accentColor="#f59e0b"
          slides={phase3Slides}
        />
      </div>
    </>
  );
}
