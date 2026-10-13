import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const INCOMING_BUBBLE_VARIABLES = "[--ios-bubble:#262628] [--ios-screen:#000000]";
const OUTGOING_BUBBLE_VARIABLES = "[--ios-bubble:#0a84ff] [--ios-screen:#000000]";

const THREAD_COPY = {
  groupName: "Hawaii 2026 🌺",
  unreadCount: "12",
  timestampDay: "Today",
  timestampTime: "9:38 AM",
  clockTime: "9:41",
  deliveredLabel: "Delivered",
  composePlaceholder: "iMessage",
  linkTitle: "PlanTheTrip - Find the best dates for your group trip",
  linkDomain: "justplanthetrip.com",
  linkImage: "/og.png",
  accessibleLabel:
    "An iMessage group chat called Hawaii 2026 where a friend shares a PlanTheTrip link",
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
  {
    sender: "Priya",
    initials: "PR",
    messages: ["no bc we said this last year too 😭"],
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
        "shadow-object w-[393px] overflow-hidden rounded-[52px] bg-black font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text',system-ui,sans-serif] text-white antialiased ring-1 ring-white/10",
        className,
      )}
    >
      <StatusBar />
      <ThreadHeader />
      <div className="flex flex-col px-3.5 pt-2.5 pb-1.5">
        <p className="mt-1 mb-2.5 text-center text-[11px] text-[#8e8e93]">
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
      <ComposeBar />
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex h-[54px] items-center justify-between bg-[#161618] pt-1.5 pr-8 pl-[50px]">
      <span className="text-[17px] font-semibold tracking-[-0.02em]">{THREAD_COPY.clockTime}</span>
      <div className="flex items-center gap-1.5">
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  );
}

function ThreadHeader() {
  return (
    <div className="grid grid-cols-[70px_1fr_70px] items-center border-b-[0.5px] border-[#2c2c2e] bg-[#161618] px-3 pt-1 pb-2.5">
      <div className="flex items-center gap-0.5 text-[#0a84ff]">
        <BackChevronIcon />
        <span className="ml-0.5 grid h-5 min-w-[22px] place-items-center rounded-full bg-[#0a84ff] px-1.5 text-[13px] font-semibold text-white">
          {THREAD_COPY.unreadCount}
        </span>
      </div>
      <div className="grid justify-items-center gap-1">
        <GroupAvatarCluster />
        <div className="flex items-center gap-[3px] text-xs font-medium">
          {THREAD_COPY.groupName}
          <DisclosureChevronIcon />
        </div>
      </div>
      <div className="justify-self-end text-[#0a84ff]">
        <VideoIcon />
      </div>
    </div>
  );
}

function GroupAvatarCluster() {
  const [leftInitials, centerInitials, rightInitials] = GROUP_MEMBER_INITIALS;

  return (
    <div className="relative h-[52px] w-[66px]">
      <MonogramAvatar
        initials={leftInitials}
        className="absolute top-3.5 left-0 size-[34px] text-[13px]"
      />
      <MonogramAvatar
        initials={centerInitials}
        className="absolute top-0 left-[15px] z-10 size-10 text-[15px] ring-2 ring-[#161618]"
      />
      <MonogramAvatar
        initials={rightInitials}
        className="absolute top-5 right-0 size-[30px] text-xs"
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
      <p className="mt-2 mb-0.5 ml-[50px] text-[11px] text-[#8e8e93]">{sender}</p>
      {messages.map((message, index) => {
        const isLastInRun = index === lastMessageIndex;
        return (
          <div
            key={message}
            className="mt-0.5 flex items-end gap-2"
          >
            <MonogramAvatar
              initials={initials}
              className={cn("relative z-10 size-7 text-xs", !isLastInRun && "invisible")}
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
        "relative max-w-[255px] rounded-[18px] bg-(--ios-bubble) px-3 pt-[7px] pb-2 text-[17px] leading-[22px] tracking-[-0.025em]",
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
        "ios-tail-outgoing relative w-[255px] rounded-[18px] bg-(--ios-bubble)",
        INCOMING_BUBBLE_VARIABLES,
      )}
    >
      <span className="absolute -top-3.5 -left-4 z-10 grid h-[30px] w-8 place-items-center rounded-full border-2 border-black bg-[#262628]">
        <HeartIcon />
      </span>
      <img
        src={THREAD_COPY.linkImage}
        alt=""
        className="aspect-[1.91] w-full rounded-t-[18px] object-cover"
      />
      <div className="px-[13px] pt-[9px] pb-2.5">
        <p className="line-clamp-2 text-[15px] leading-[19px] font-semibold tracking-[-0.02em]">
          {THREAD_COPY.linkTitle}
        </p>
        <p className="mt-0.5 text-[13px] text-[#8e8e93]">{THREAD_COPY.linkDomain}</p>
      </div>
    </div>
  );
}

function ComposeBar() {
  return (
    <>
      <div className="flex items-center gap-2.5 px-3.5 pt-2 pb-1.5">
        <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-[#262628] text-[#aeaeb2]">
          <PlusIcon />
        </span>
        <div className="flex h-9 flex-1 items-center justify-between rounded-full border border-[#3a3a3c] pr-2.5 pl-3.5 text-[17px] tracking-[-0.02em] text-[#8e8e93]">
          {THREAD_COPY.composePlaceholder}
          <MicIcon />
        </div>
      </div>
      <div className="grid h-[34px] place-items-center">
        <span className="h-[5px] w-[134px] rounded-full bg-white" />
      </div>
    </>
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

function SignalIcon() {
  return (
    <svg
      width="19"
      height="12"
      viewBox="0 0 19 12"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect
        x="0"
        y="8"
        width="3.2"
        height="4"
        rx="1"
      />
      <rect
        x="5"
        y="5.5"
        width="3.2"
        height="6.5"
        rx="1"
      />
      <rect
        x="10"
        y="3"
        width="3.2"
        height="9"
        rx="1"
      />
      <rect
        x="15"
        y="0"
        width="3.2"
        height="12"
        rx="1"
      />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg
      width="17"
      height="12"
      viewBox="0 0 17 12"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8.5 2.4c2.4 0 4.6.9 6.3 2.5l1.2-1.2A10.6 10.6 0 0 0 8.5.7 10.6 10.6 0 0 0 1 3.7l1.2 1.2a8.9 8.9 0 0 1 6.3-2.5Zm0 3.4c1.5 0 2.9.6 4 1.6l1.2-1.2a7.3 7.3 0 0 0-10.4 0l1.2 1.2c1.1-1 2.5-1.6 4-1.6Zm0 3.4c.6 0 1.2.2 1.6.7L8.5 11.5 6.9 9.9c.4-.5 1-.7 1.6-.7Z" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg
      width="27"
      height="13"
      viewBox="0 0 27 13"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="0.5"
        y="0.5"
        width="23"
        height="12"
        rx="3.8"
        stroke="currentColor"
        strokeOpacity="0.4"
      />
      <rect
        x="2"
        y="2"
        width="20"
        height="9"
        rx="2.5"
        fill="currentColor"
      />
      <path
        d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z"
        fill="currentColor"
        fillOpacity="0.4"
      />
    </svg>
  );
}

function BackChevronIcon() {
  return (
    <svg
      width="13"
      height="22"
      viewBox="0 0 13 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 2 2 11l9 9" />
    </svg>
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

function VideoIcon() {
  return (
    <svg
      width="30"
      height="20"
      viewBox="0 0 30 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect
        x="0"
        y="2"
        width="20"
        height="16"
        rx="4"
      />
      <path d="M22 7.6 28.3 3.4c.7-.5 1.7 0 1.7.9v11.4c0 .9-1 1.4-1.7.9L22 12.4Z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      width="16"
      height="15"
      viewBox="0 0 16 15"
      fill="#ff375f"
      aria-hidden="true"
    >
      <path d="M8 14.6 6.9 13.6C2.8 9.9 0 7.4 0 4.4 0 1.9 1.9 0 4.4 0 5.8 0 7.1.7 8 1.7 8.9.7 10.2 0 11.6 0 14.1 0 16 1.9 16 4.4c0 3-2.8 5.5-6.9 9.2Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M8 1v14M1 8h14" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg
      width="14"
      height="20"
      viewBox="0 0 14 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="1"
        width="7"
        height="11"
        rx="3.5"
      />
      <path d="M1 9.5a6 6 0 0 0 12 0M7 15.5V19" />
    </svg>
  );
}
