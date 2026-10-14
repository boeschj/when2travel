import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const INCOMING_BUBBLE_VARIABLES = "[--ios-bubble:#262628] [--ios-screen:#0d0d0e]";
const OUTGOING_BUBBLE_VARIABLES = "[--ios-bubble:#0a84ff] [--ios-screen:#0d0d0e]";

const THREAD_COPY = {
  groupName: "Hawaii 2026 🌺",
  memberCount: "7 people",
  timestampDay: "Today",
  timestampTime: "9:38 AM",
  deliveredLabel: "Delivered",
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

const INCOMING_RUNS = [
  {
    sender: "Joe",
    initials: "JM",
    messages: ["alright people when we doin this. week of july 10th?"],
  },
  {
    sender: "Sam",
    initials: "SK",
    messages: ["i cant, what about aug 25-31st"],
  },
  {
    sender: "Priya",
    initials: "PR",
    messages: ["i cant do either 😅"],
  },
] as const;

const OUTGOING_MESSAGE = "everyone drop ur dates here and it'll tell us";

interface HeroImessageThreadProps {
  className?: string;
}

export function HeroImessageThread({ className }: HeroImessageThreadProps) {
  return (
    <div
      role="img"
      aria-label={THREAD_COPY.accessibleLabel}
      className={cn(
        "shadow-object hover-lift w-[330px] overflow-hidden rounded-[30px] bg-[#0d0d0e] font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text',system-ui,sans-serif] text-white antialiased ring-1 ring-white/10",
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
      <div className="grid justify-items-center">
        <div className="flex items-center gap-[3px] text-xs font-medium">
          {THREAD_COPY.groupName}
          <DisclosureChevronIcon />
        </div>
        <p className="text-[10px] text-[#8e8e93]">{THREAD_COPY.memberCount}</p>
      </div>
    </div>
  );
}

function GroupAvatarCluster() {
  return (
    <div className="flex h-[38px] items-center gap-0.5">
      {GROUP_AVATARS.map(avatar => (
        <MonogramAvatar
          key={avatar.initials}
          initials={avatar.initials}
          className={avatar.className}
        />
      ))}
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
