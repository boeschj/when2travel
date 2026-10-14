import { useState } from "react";
import { CircleCheck, Copy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const EASE = [0.25, 0.1, 0.25, 1] as const;
const ICON_SWAP_TRANSITION = { duration: 0.2, ease: EASE } as const;
const PRESSED = { scale: 0.95 } as const;
const ICON_HIDDEN = { opacity: 0, filter: "blur(4px)" } as const;
const ICON_VISIBLE = { opacity: 1, filter: "blur(0px)" } as const;
const COPIED_RESET_MILLISECONDS = 2000;
const COPY_LABEL = "Copy link";

const COPY_STATE = {
  IDLE: "idle",
  COPIED: "copied",
} as const;

type CopyState = (typeof COPY_STATE)[keyof typeof COPY_STATE];

const COPY_STATE_ICON = {
  [COPY_STATE.IDLE]: { Icon: Copy, className: "size-4" },
  [COPY_STATE.COPIED]: {
    Icon: CircleCheck,
    className: "fill-primary text-primary [&>path]:stroke-primary-foreground size-4",
  },
} as const;

export function CopyLinkButton() {
  const [copyState, setCopyState] = useState<CopyState>(COPY_STATE.IDLE);

  const { Icon, className } = COPY_STATE_ICON[copyState];

  const handleClick = () => {
    setCopyState(COPY_STATE.COPIED);
    setTimeout(() => setCopyState(COPY_STATE.IDLE), COPIED_RESET_MILLISECONDS);
  };

  return (
    <motion.button
      type="button"
      aria-label={COPY_LABEL}
      className="relative grid size-6 shrink-0 cursor-pointer place-items-center"
      whileTap={PRESSED}
      transition={ICON_SWAP_TRANSITION}
      onClick={handleClick}
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={copyState}
          className="absolute inset-0 grid place-items-center"
          initial={ICON_HIDDEN}
          animate={ICON_VISIBLE}
          exit={ICON_HIDDEN}
          transition={ICON_SWAP_TRANSITION}
        >
          <Icon className={className} />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
