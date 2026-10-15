import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const THREAD_COPY = {
  groupName: "Hawaii 2026 🌺",
  memberCount: "7 people",
  timestampDay: "Today",
  timestampTime: "9:38 AM",
  deliveredLabel: "Delivered",
  outgoingMessage: "everyone drop ur dates here and it'll tell us",
  linkTitle: "PlanTheTrip - Find the best dates for your group trip",
  linkDomain: "justplanthetrip.com",
  linkImage: "/og.png",
  accessibleLabel:
    "A 7 person group chat called Hawaii 2026 that cannot agree on dates until a friend shares a PlanTheTrip link",
} as const;

const GROUP_AVATARS = [
  { initials: "AL", className: "size-[18px] text-[7px]" },
  { initials: "JM", className: "size-6 text-[9px]" },
  { initials: "SK", className: "size-[34px] text-[13px]" },
  { initials: "PR", className: "size-6 text-[9px]" },
  { initials: "MC", className: "size-[18px] text-[7px]" },
] as const;

const INCOMING_MESSAGES = [
  {
    sender: "Joe",
    initials: "JM",
    message: "alright people when we doin this. week of july 10th?",
  },
  {
    sender: "Sam",
    initials: "SK",
    message: "i cant, what about aug 25-31st",
  },
  {
    sender: "Priya",
    initials: "PR",
    message: "i cant do either 😅",
  },
] as const;

const BUBBLE_KIND = {
  INCOMING: "incoming",
  OUTGOING: "outgoing",
} as const;

type BubbleKind = (typeof BUBBLE_KIND)[keyof typeof BUBBLE_KIND];

const BUBBLE_KIND_CLASS: Record<BubbleKind, string> = {
  [BUBBLE_KIND.INCOMING]:
    "ios-tail-incoming [--ios-bubble:var(--color-ios-incoming)] [--ios-screen:var(--color-ios-screen)]",
  [BUBBLE_KIND.OUTGOING]: "[--ios-bubble:var(--color-ios-blue)]",
};

const LINK_PREVIEW_BUBBLE =
  "ios-tail-outgoing [--ios-bubble:var(--color-ios-incoming)] [--ios-screen:var(--color-ios-screen)]";

interface HeroImessageThreadProps {
  className?: string;
}

export function HeroImessageThread({ className }: HeroImessageThreadProps) {
  const threadClassName = cn(
    "shadow-object hover-lift bg-ios-screen w-[330px] overflow-hidden rounded-[30px] font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text',system-ui,sans-serif] text-white antialiased ring-1 ring-white/10",
    className,
  );

  return (
    <div
      role="img"
      aria-label={THREAD_COPY.accessibleLabel}
      className={threadClassName}
    >
      <ThreadHeader />
      <ThreadMessages />
    </div>
  );
}

function ThreadHeader() {
  return (
    <div className="border-ios-hairline bg-ios-header grid justify-items-center gap-1 border-b-[0.5px] pt-3.5 pb-2.5">
      <div className="flex h-[38px] items-center gap-0.5">
        {GROUP_AVATARS.map(avatar => (
          <MonogramAvatar
            key={avatar.initials}
            initials={avatar.initials}
            className={avatar.className}
          />
        ))}
      </div>
      <div className="grid justify-items-center">
        <div className="flex items-center gap-[3px] text-xs font-medium">
          {THREAD_COPY.groupName}
          <DisclosureChevronIcon />
        </div>
        <p className="text-ios-secondary text-[10px]">{THREAD_COPY.memberCount}</p>
      </div>
    </div>
  );
}

function ThreadMessages() {
  return (
    <div className="flex flex-col px-3.5 pt-2 pb-4">
      <p className="text-ios-secondary mb-1 text-center text-[11px]">
        <span className="font-semibold">{THREAD_COPY.timestampDay}</span>{" "}
        {THREAD_COPY.timestampTime}
      </p>
      {INCOMING_MESSAGES.map(incoming => (
        <IncomingMessage
          key={incoming.sender}
          sender={incoming.sender}
          initials={incoming.initials}
          message={incoming.message}
        />
      ))}
      <div className="mt-2.5 flex justify-end">
        <Bubble kind={BUBBLE_KIND.OUTGOING}>{THREAD_COPY.outgoingMessage}</Bubble>
      </div>
      <div className="mt-0.5 flex justify-end">
        <LinkPreview />
      </div>
      <p className="text-ios-secondary mt-[3px] mr-1 self-end text-[11px] font-medium">
        {THREAD_COPY.deliveredLabel}
      </p>
    </div>
  );
}

function IncomingMessage({
  sender,
  initials,
  message,
}: {
  sender: string;
  initials: string;
  message: string;
}) {
  return (
    <>
      <p className="text-ios-secondary mt-2 mb-0.5 ml-[44px] text-[11px]">{sender}</p>
      <div className="mt-0.5 flex items-end gap-2">
        <MonogramAvatar
          initials={initials}
          className="relative z-10 size-6 text-[10px]"
        />
        <Bubble kind={BUBBLE_KIND.INCOMING}>{message}</Bubble>
      </div>
    </>
  );
}

function Bubble({ kind, children }: { kind: BubbleKind; children: ReactNode }) {
  const bubbleClassName = cn(
    "relative max-w-[230px] rounded-[18px] bg-(--ios-bubble) px-3 pt-[6px] pb-[7px] text-[15px] leading-[20px] tracking-[-0.02em]",
    BUBBLE_KIND_CLASS[kind],
  );

  return <div className={bubbleClassName}>{children}</div>;
}

function LinkPreview() {
  const previewClassName = cn(
    "relative w-[230px] rounded-[18px] bg-(--ios-bubble)",
    LINK_PREVIEW_BUBBLE,
  );

  return (
    <div className={previewClassName}>
      <img
        src={THREAD_COPY.linkImage}
        alt=""
        className="aspect-[1.91] w-full rounded-t-[18px] object-cover"
      />
      <div className="px-3 pt-2 pb-2.5">
        <p className="line-clamp-2 text-[13px] leading-[17px] font-semibold tracking-[-0.01em]">
          {THREAD_COPY.linkTitle}
        </p>
        <p className="text-ios-secondary mt-0.5 text-[11.5px]">{THREAD_COPY.linkDomain}</p>
      </div>
    </div>
  );
}

function MonogramAvatar({ initials, className }: { initials: string; className: string }) {
  const avatarClassName = cn(
    "grid shrink-0 place-items-center rounded-full bg-linear-to-b from-[#a5abb8] to-[#858994] font-semibold text-white",
    className,
  );

  return <span className={avatarClassName}>{initials}</span>;
}

function DisclosureChevronIcon() {
  return (
    <svg
      width="6"
      height="10"
      viewBox="0 0 6 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-ios-secondary"
    >
      <path d="m1 1 4 4-4 4" />
    </svg>
  );
}
