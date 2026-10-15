import { useState } from "react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

interface Faq {
  question: string;
  answer: string;
}

const FAQ_SECTION_COPY = {
  eyebrow: "FAQ",
  heading: "Questions, answered",
} as const;

const NO_OPEN_INDEX = -1;

const FAQS: Faq[] = [
  {
    question: "Do my friends need to download an app?",
    answer:
      "Nope. You send one link, they tap it, and pick their dates right in the browser. Nothing to install, on any phone or laptop.",
  },
  {
    question: "Is it free?",
    answer:
      "Yep, it's free. No account, no credit card, nothing to pay to plan a trip with your group.",
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
  const [openIndex, setOpenIndex] = useState(0);

  const faqItems = FAQS.map((faq, index) => {
    const isOpen = openIndex === index;
    const onToggle = () => {
      setOpenIndex(current => (current === index ? NO_OPEN_INDEX : index));
    };
    const faqItem = { faq, isOpen, onToggle };
    return faqItem;
  });

  return (
    <section className="mx-auto max-w-[820px] px-4 pt-24 pb-10 sm:pt-28">
      <div className="mb-9 text-center">
        <span className="border-border bg-card text-text-secondary inline-block rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold">
          {FAQ_SECTION_COPY.eyebrow}
        </span>
        <h2 className="mt-3.5 text-[clamp(2rem,4.4vw,3.3rem)] font-extrabold tracking-[-0.04em]">
          {FAQ_SECTION_COPY.heading}
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {faqItems.map(faqItem => (
          <FaqItem
            key={faqItem.faq.question}
            faq={faqItem.faq}
            isOpen={faqItem.isOpen}
            onToggle={faqItem.onToggle}
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
  const itemClassName = cn(
    "bg-card overflow-hidden rounded-[20px] border transition-colors",
    isOpen && "border-primary/40",
    !isOpen && "border-border",
  );
  const toggleIconClassName = cn(
    "flex size-7 shrink-0 items-center justify-center rounded-full transition-transform",
    isOpen && "bg-primary text-primary-foreground rotate-45",
    !isOpen && "bg-surface-darker text-primary",
  );

  return (
    <div className={itemClassName}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-[22px] py-5 text-left"
      >
        <span className="text-[17px] font-bold">{faq.question}</span>
        <span className={toggleIconClassName}>
          <Plus className="size-4" />
        </span>
      </button>
      {isOpen && (
        <div className="text-text-secondary px-[22px] pb-5 text-[15.5px] leading-relaxed font-medium">
          {faq.answer}
        </div>
      )}
    </div>
  );
}
