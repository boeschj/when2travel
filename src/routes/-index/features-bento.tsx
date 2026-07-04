import type { ReactNode } from "react";
import { Calendar, Check, Link2, Minus, Plane, Plus, Tag } from "lucide-react";

const CARD_SHELL =
  "flex flex-col rounded-[22px] border border-[var(--ptt-card-border)] bg-[var(--ptt-surface)] p-4 pb-[22px] shadow-[0_6px_18px_-18px_rgba(16,60,30,0.4)]";

const SAMPLE_PANEL =
  "flex items-center justify-center overflow-hidden rounded-[15px] border border-[var(--ptt-sample-border)] bg-[var(--ptt-sample)] p-[18px]";

const HEAT = {
  busy: "#F87171",
  partial: "#FACC15",
  high: "#4ADE80",
  full: "#16A34A",
} as const;

const HEATMAP_DOTS = [
  HEAT.busy,
  HEAT.busy,
  HEAT.partial,
  HEAT.partial,
  HEAT.high,
  HEAT.high,
  HEAT.full,
  HEAT.busy,
  HEAT.partial,
  HEAT.partial,
  HEAT.high,
  HEAT.high,
  HEAT.full,
  HEAT.full,
  HEAT.partial,
  HEAT.partial,
  HEAT.high,
  HEAT.high,
  HEAT.full,
  HEAT.full,
  HEAT.full,
  HEAT.partial,
  HEAT.high,
  HEAT.high,
  HEAT.full,
  HEAT.full,
  HEAT.full,
  HEAT.high,
  HEAT.high,
  HEAT.high,
  HEAT.full,
  HEAT.full,
  HEAT.full,
  HEAT.high,
  HEAT.partial,
] as const;

export function FeaturesBento() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-[1120px] px-6 pt-20 pb-8"
    >
      <SectionHeader />
      <div className="grid grid-cols-1 gap-[18px] md:grid-cols-6">
        <VerticalCard
          className="md:col-span-2"
          title="Create in 10 seconds"
          description="Name it, set a window, pick how many days. Done before your coffee's cold."
          visual={<CreateVisual />}
        />
        <VerticalCard
          className="md:col-span-2"
          title="Share one link"
          description="Drop it in the group chat. No downloads, no accounts, friends just tap and pick."
          visual={<ShareVisual />}
        />
        <VerticalCard
          className="md:col-span-2"
          title="Filter by person"
          description="Tap anyone to see just their dates on the heatmap. Spot who's flexible in a glance."
          visual={<FilterVisual />}
        />
        <VerticalCard
          className="md:col-span-4"
          title="Live availability heatmap"
          description="Watch the calendar light up as people respond. Green means go, so you can spot the perfect overlap without scrolling through replies."
          visual={<HeatmapVisual />}
        />
        <VerticalCard
          className="md:col-span-2"
          title="Best window, found for you"
          description="We rank every window by who can make it and hand you the winner."
          visual={<BestWindowVisual />}
        />
        <ConflictCard />
      </div>
    </section>
  );
}

function SectionHeader() {
  return (
    <div className="mx-auto mb-11 max-w-[60ch] text-center">
      <div className="text-[13px] font-bold tracking-[0.14em] text-[var(--ptt-brand)] uppercase">
        Features
      </div>
      <h2 className="mt-3 text-[clamp(2rem,4.4vw,3.25rem)] font-bold tracking-tight text-[var(--ptt-ink)]">
        Everything you need to lock in the dates
      </h2>
      <p className="mt-3.5 text-lg leading-relaxed text-[var(--ptt-muted)]">
        No spreadsheets, no "so what weekend works for everyone???" Just a link and a calendar that
        fills itself in.
      </p>
    </div>
  );
}

interface VerticalCardProps {
  className: string;
  title: string;
  description: string;
  visual: ReactNode;
}

function VerticalCard({ className, title, description, visual }: VerticalCardProps) {
  return (
    <article className={`${CARD_SHELL} ${className}`}>
      <div className={`${SAMPLE_PANEL} h-[214px]`}>{visual}</div>
      <h3 className="mt-[18px] px-1 text-xl font-semibold tracking-tight text-[var(--ptt-ink)]">
        {title}
      </h3>
      <p className="mt-2 px-1 text-[15px] leading-relaxed text-[var(--ptt-muted)]">{description}</p>
    </article>
  );
}

function ConflictCard() {
  return (
    <article
      className={`${CARD_SHELL} gap-6 md:col-span-6 md:grid md:grid-cols-[1.15fr_1fr] md:items-center md:gap-7 md:p-[22px]`}
    >
      <div className={`${SAMPLE_PANEL} h-[180px] flex-col gap-4`}>
        <ConflictAvatars />
        <SampleNote>
          Charles is out Jul 13&ndash;19. Next best:{" "}
          <b className="text-[var(--ptt-brand)]">Jul 20&ndash;26</b> &middot; 7/7 free
        </SampleNote>
      </div>
      <div>
        <h3 className="text-2xl font-semibold tracking-tight text-[var(--ptt-ink)]">
          Spot the conflicts
        </h3>
        <p className="mt-2.5 text-base leading-relaxed text-[var(--ptt-muted)]">
          One person blocking the perfect week? PlanTheTrip points them out and instantly surfaces
          the next-best window that works for everyone, so you can decide instead of debate.
        </p>
      </div>
    </article>
  );
}

function CreateVisual() {
  return (
    <div className="flex w-full max-w-[250px] flex-col gap-2.5">
      <SampleField className="border-[1.5px] border-[var(--ptt-brand)] bg-[var(--ptt-green-tint)] font-semibold text-[var(--ptt-ink)]">
        <Tag className="size-4 text-[var(--ptt-brand)]" />
        Ibiza 2026
      </SampleField>
      <SampleField className="justify-between border border-[var(--ptt-green-line)] bg-[var(--ptt-surface)] font-medium text-[var(--ptt-ink-soft)]">
        Aug 1 &ndash; Sep 15
        <Calendar className="size-4" />
      </SampleField>
      <div className="flex items-center justify-between rounded-[11px] border border-[var(--ptt-green-line)] bg-[var(--ptt-surface)] px-2.5 py-1.5">
        <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--ptt-green-tint)] text-[var(--ptt-brand)]">
          <Minus className="size-4" />
        </span>
        <span className="text-[15px] font-bold text-[var(--ptt-ink)]">5 days</span>
        <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--ptt-brand)] text-white">
          <Plus className="size-4" />
        </span>
      </div>
      <div className="rounded-[10px] bg-[var(--ptt-brand)] py-2.5 text-center text-sm font-semibold text-white">
        Create trip
      </div>
    </div>
  );
}

function ShareVisual() {
  return (
    <div className="w-full max-w-[290px]">
      <div className="mb-3.5 flex items-center gap-2.5 rounded-[13px] border border-[var(--ptt-green-border)] bg-[var(--ptt-surface)] px-3 py-2.5 shadow-[0_4px_12px_-12px_rgba(16,60,30,0.4)]">
        <span className="flex size-8 items-center justify-center rounded-[10px] bg-[var(--ptt-green-tint-strong)] text-[var(--ptt-brand)]">
          <Link2 className="size-4" />
        </span>
        <span className="min-w-0 flex-1 truncate text-[13.5px] font-bold text-[var(--ptt-ink)]">
          planthetrip.co/ibiza
        </span>
        <span className="flex items-center gap-1 rounded-lg bg-[var(--ptt-brand)] px-2.5 py-1.5 text-xs font-bold text-white">
          Copied
          <Check className="size-3" />
        </span>
      </div>
      <div className="ml-auto max-w-[90%] rounded-[14px_14px_4px_14px] bg-[#DCF8C6] px-3 py-2.5">
        <span className="text-[13.5px] leading-snug font-medium text-[var(--ptt-ink)]">
          everyone PICK YOUR DATES 🙏
        </span>
      </div>
      <div className="mt-2.5 flex gap-1.5 pl-1.5">
        {["👍 4", "🎉 2", "🏝️ 3"].map(reaction => (
          <span
            key={reaction}
            className="rounded-full border border-[var(--ptt-green-border)] bg-[var(--ptt-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--ptt-ink-soft)]"
          >
            {reaction}
          </span>
        ))}
      </div>
    </div>
  );
}

const FILTER_PEOPLE = [
  { name: "Joe", initial: "J", color: "#22C55E", active: true },
  { name: "Sam", initial: "S", color: "#A855F7", active: false },
  { name: "Priya", initial: "P", color: "#EC4899", active: false },
] as const;

const FILTER_HEATMAP = Array.from({ length: 21 }, (_, index) => index % 3 !== 1);

function FilterVisual() {
  return (
    <div className="flex w-full max-w-[250px] flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {FILTER_PEOPLE.map(person => (
          <span
            key={person.initial}
            className="flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-[13px] font-bold text-[var(--ptt-ink)]"
            style={{
              borderColor: person.active ? person.color : "var(--ptt-green-border)",
              background: person.active ? "var(--ptt-green-tint-strong)" : "var(--ptt-surface)",
              opacity: person.active ? 1 : 0.5,
            }}
          >
            <span
              className="flex size-5 items-center justify-center rounded-full text-[10px] font-extrabold text-white"
              style={{ background: person.color }}
            >
              {person.initial}
            </span>
            {person.name}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {FILTER_HEATMAP.map((isFree, index) => (
          <span
            key={index}
            className="aspect-square rounded-md"
            style={{ background: isFree ? HEAT.full : "#FCA5A5" }}
          />
        ))}
      </div>
    </div>
  );
}

function HeatmapVisual() {
  return (
    <div className="flex w-full items-center gap-6 md:gap-7">
      <div className="grid shrink-0 grid-cols-7 gap-[5px]">
        {HEATMAP_DOTS.map((color, index) => (
          <span
            key={index}
            className="size-6 rounded-[7px] sm:size-7"
            style={{ background: color }}
          />
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex flex-col gap-2.5">
          <LegendRow
            color={HEAT.busy}
            label="Busy"
          />
          <LegendRow
            color={HEAT.partial}
            label="Partial"
          />
          <LegendRow
            color={HEAT.full}
            label="All free"
          />
        </div>
        <SampleNote>
          <span className="text-[var(--ptt-brand)]">●</span> Best overlap: <b>Jul 13&ndash;19</b>{" "}
          &middot; 6/7 free
        </SampleNote>
      </div>
    </div>
  );
}

function BestWindowVisual() {
  return (
    <div className="w-full max-w-[250px] rounded-2xl border border-[var(--ptt-green-border)] bg-[var(--ptt-surface)] p-5 text-center shadow-[0_5px_16px_-14px_rgba(16,60,30,0.4)]">
      <div className="mx-auto mb-2.5 flex size-11 items-center justify-center rounded-full bg-[var(--ptt-green-tint-strong)] text-xl">
        🎉
      </div>
      <div className="text-[12.5px] font-semibold text-[var(--ptt-muted)]">Window locked in</div>
      <div className="mt-0.5 mb-3 text-[26px] font-bold tracking-tight text-[var(--ptt-brand)]">
        Jul 13 &ndash; 19
      </div>
      <div className="flex items-center justify-center gap-2 rounded-[10px] bg-[var(--ptt-brand)] py-2.5 text-sm font-semibold text-white">
        <Plane className="size-4" />
        Book flights
      </div>
    </div>
  );
}

const CONFLICT_AVATARS = [
  { initial: "Y", color: "#EF4444", blocked: false },
  { initial: "J", color: "#22C55E", blocked: false },
  { initial: "S", color: "#A855F7", blocked: false },
  { initial: "A", color: "#EAB308", blocked: false },
  { initial: "C", color: "#3B82F6", blocked: true },
  { initial: "P", color: "#EC4899", blocked: false },
  { initial: "M", color: "#14B8A6", blocked: false },
] as const;

function ConflictAvatars() {
  return (
    <div className="flex items-end gap-2.5">
      {CONFLICT_AVATARS.map(avatar => (
        <div
          key={avatar.initial}
          className="relative"
        >
          <span
            className="flex size-9 items-center justify-center rounded-full text-sm font-extrabold text-white"
            style={{
              background: avatar.color,
              opacity: avatar.blocked ? 0.45 : 1,
              border: avatar.blocked ? "2px solid #F87171" : undefined,
            }}
          >
            {avatar.initial}
          </span>
          {avatar.blocked && (
            <span className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full border-2 border-[var(--ptt-sample)] bg-[#F87171] text-[9px] font-extrabold text-white">
              ✕
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-[13.5px] font-semibold text-[var(--ptt-muted)]">
      <span
        className="size-2.5 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

function SampleField({ children, className }: { children: ReactNode; className: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-[11px] px-3 py-2.5 text-sm ${className}`}>
      {children}
    </div>
  );
}

function SampleNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--ptt-green-line)] bg-[var(--ptt-surface)] px-3.5 py-3 text-center text-[13.5px] leading-snug font-semibold text-[var(--ptt-ink)]">
      {children}
    </div>
  );
}
