import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const INCOMING_BUBBLE_VARIABLES = "[--ios-bubble:#262628] [--ios-screen:#0d0d0e]";
const OUTGOING_BUBBLE_VARIABLES = "[--ios-bubble:#0a84ff] [--ios-screen:#0d0d0e]";

const THREAD_COPY = {
  groupName: "Hawaii 2026 🌺",
  timestampDay: "Today",
  timestampTime: "9:38 AM",
  deliveredLabel: "Delivered",
  linkTitle: "PlanTheTrip - Find the best dates for your group trip",
  linkDomain: "justplanthetrip.com",
  linkImage: "/og.png",
  accessibleLabel: "A group chat called Hawaii 2026 where a friend shares a PlanTheTrip link",
} as const;

const GROUP_MEMBER_INITIALS = ["JM", "SK", "PR"] as const;

const INCOMING_RUNS = [
  {
    sender: "Joe",
    initials: "JM",
    messages: ["are we actually doing hawaii or is this another group chat fantasy 💀"],
  },
  {
    sender: "Sam",
    initials: "SK",
    messages: ["im so down fr", "but july is lowkey packed for me"],
  },
] as const;

const OUTGOING_MESSAGE = "ok bet. drop ur dates here, no excuses";

interface HeroImessageThreadProps {
  className?: string;
}

export function HeroImessageThread({ className }: HeroImessageThreadProps) {
  return (
    <div
      role="img"
      aria-label={THREAD_COPY.accessibleLabel}
      className={cn(
        "shadow-object w-[330px] overflow-hidden rounded-[30px] bg-[#0d0d0e] font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text',system-ui,sans-serif] text-white antialiased ring-1 ring-white/10",
        className,
      )}
    >
      <ThreadHeader />
      <div className="flex flex-col px-3.5 pt-2 pb-4">
        <p className="mb-1 text-center text-[11px] text-[#8e8e93]">
          <span className="font-semibold">{THREAD_COPY.timestampDay}</span>{" "}
          {THREAD_COPY.timestampTime}
        </p>
        {INCOMING_RUNS.map(run => (
          <IncomingRun
            key={run.sender}
            sender={run.sender}
            initials={run.initials}
            messages={run.messages}
          />
        ))}
        <div className="mt-2.5 flex justify-end">
          <Bubble
            isOutgoing
            hasTail={false}
          >
            {OUTGOING_MESSAGE}
          </Bubble>
        </div>
        <div className="mt-0.5 flex justify-end">
          <LinkPreview />
        </div>
        <p className="mt-[3px] mr-1 self-end text-[11px] font-medium text-[#8e8e93]">
          {THREAD_COPY.deliveredLabel}
        </p>
      </div>
    </div>
  );
}

function ThreadHeader() {
  return (
    <div className="grid justify-items-center gap-1 border-b-[0.5px] border-[#2c2c2e] bg-[#161618] pt-3.5 pb-2.5">
      <GroupAvatarCluster />
      <div className="flex items-center gap-[3px] text-xs font-medium">
        {THREAD_COPY.groupName}
        <DisclosureChevronIcon />
      </div>
    </div>
  );
}

function GroupAvatarCluster() {
  const [leftInitials, centerInitials, rightInitials] = GROUP_MEMBER_INITIALS;

  return (
    <div className="relative h-[44px] w-[60px]">
      <MonogramAvatar
        initials={leftInitials}
        className="absolute top-3 left-0 size-[30px] text-[11px]"
      />
      <MonogramAvatar
        initials={centerInitials}
        className="absolute top-0 left-[13px] z-10 size-[34px] text-[13px] ring-2 ring-[#161618]"
      />
      <MonogramAvatar
        initials={rightInitials}
        className="absolute top-4 right-0 size-[26px] text-[10px]"
      />
    </div>
  );
}

function IncomingRun({
  sender,
  initials,
  messages,
}: {
  sender: string;
  initials: string;
  messages: readonly string[];
}) {
  const lastMessageIndex = messages.length - 1;

  return (
    <>
      <p className="mt-2 mb-0.5 ml-[44px] text-[11px] text-[#8e8e93]">{sender}</p>
      {messages.map((message, index) => {
        const isLastInRun = index === lastMessageIndex;
        return (
          <div
            key={message}
            className="mt-0.5 flex items-end gap-2"
          >
            <MonogramAvatar
              initials={initials}
              className={cn("relative z-10 size-6 text-[10px]", !isLastInRun && "invisible")}
            />
            <Bubble
              isOutgoing={false}
              hasTail={isLastInRun}
            >
              {message}
            </Bubble>
          </div>
        );
      })}
    </>
  );
}

function Bubble({
  isOutgoing,
  hasTail,
  children,
}: {
  isOutgoing: boolean;
  hasTail: boolean;
  children: ReactNode;
}) {
  const bubbleVariables = isOutgoing ? OUTGOING_BUBBLE_VARIABLES : INCOMING_BUBBLE_VARIABLES;
  const tailClassName = isOutgoing ? "ios-tail-outgoing" : "ios-tail-incoming";

  return (
    <div
      className={cn(
        "relative max-w-[230px] rounded-[18px] bg-(--ios-bubble) px-3 pt-[6px] pb-[7px] text-[15px] leading-[20px] tracking-[-0.02em]",
        bubbleVariables,
        hasTail && tailClassName,
      )}
    >
      {children}
    </div>
  );
}

function LinkPreview() {
  return (
    <div
      className={cn(
        "ios-tail-outgoing relative w-[230px] rounded-[18px] bg-(--ios-bubble)",
        INCOMING_BUBBLE_VARIABLES,
      )}
    >
      <img
        src={THREAD_COPY.linkImage}
        alt=""
        className="aspect-[1.91] w-full rounded-t-[18px] object-cover"
      />
      <div className="px-3 pt-2 pb-2.5">
        <p className="line-clamp-2 text-[13px] leading-[17px] font-semibold tracking-[-0.01em]">
          {THREAD_COPY.linkTitle}
        </p>
        <p className="mt-0.5 text-[11.5px] text-[#8e8e93]">{THREAD_COPY.linkDomain}</p>
      </div>
    </div>
  );
}

function MonogramAvatar({ initials, className }: { initials: string; className: string }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-linear-to-b from-[#a5abb8] to-[#858994] font-semibold text-white",
        className,
      )}
    >
      {initials}
    </span>
  );
}

function DisclosureChevronIcon() {
  return (
    <svg
      width="6"
      height="10"
      viewBox="0 0 6 10"
      fill="none"
      stroke="#8e8e93"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m1 1 4 4-4 4" />
    </svg>
  );
}
