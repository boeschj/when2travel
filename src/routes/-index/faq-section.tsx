import { useState } from "react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

interface Faq {
  question: string;
  answer: string;
}

const FAQS: Faq[] = [
  {
    question: "Do my friends need to download an app?",
    answer:
      "Nope. You send one link, they tap it, and pick their dates right in the browser. Nothing to install, on any phone or laptop.",
  },
  {
    question: "Does anyone need to make an account?",
    answer:
      "No accounts, for anyone. You create a trip and get private links you keep on your device, and everyone else just opens the link and taps the days they're free.",
  },
  {
    question: "How many people can respond?",
    answer:
      "As many as you like. Everyone with the link can add their availability, and the heatmap keeps up as responses roll in.",
  },
  {
    question: "Can we change the dates after everyone responds?",
    answer:
      "Absolutely. Edit the date range or trip length anytime and the heatmap and best-window recalculate instantly, with no need to re-share the link.",
  },
  {
    question: "What if there's no week that works for everyone?",
    answer:
      "PlanTheTrip shows exactly who's blocking each window and surfaces the next-best dates, including shorter windows where everyone's free.",
  },
  {
    question: "We picked our dates. Now what?",
    answer:
      "Add the winning window straight to Google Calendar and jump to flights in one tap, then share the final dates with the group.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(current => (current === index ? -1 : index));
  };

  return (
    <section className="mx-auto max-w-[820px] px-6 pt-16 pb-10">
      <div className="mb-9 text-center">
        <div className="text-[13px] font-extrabold tracking-[0.1em] text-[var(--ptt-brand)] uppercase">
          FAQ
        </div>
        <h2 className="mt-3 text-[clamp(2rem,4.4vw,3.25rem)] font-extrabold tracking-tight text-[var(--ptt-ink)]">
          Questions, answered
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {FAQS.map((faq, index) => (
          <FaqItem
            key={faq.question}
            faq={faq}
            isOpen={openIndex === index}
            onToggle={() => handleToggle(index)}
          />
        ))}
      </div>
    </section>
  );
}

interface FaqItemProps {
  faq: Faq;
  isOpen: boolean;
  onToggle: () => void;
}

function FaqItem({ faq, isOpen, onToggle }: FaqItemProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-[var(--ptt-surface)] transition-colors",
        isOpen ? "border-[#C7E7CD]" : "border-[var(--ptt-green-border)]",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-[22px] py-5 text-left"
      >
        <span className="text-[17px] font-bold text-[var(--ptt-ink)]">{faq.question}</span>
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full transition-transform",
            isOpen
              ? "rotate-45 bg-[var(--ptt-brand)] text-white"
              : "bg-[var(--ptt-green-tint)] text-[var(--ptt-brand)]",
          )}
        >
          <Plus className="size-4" />
        </span>
      </button>
      {isOpen && (
        <div className="px-[22px] pb-5 text-[15.5px] leading-relaxed font-medium text-[var(--ptt-ink-soft)]">
          {faq.answer}
        </div>
      )}
    </div>
  );
}
