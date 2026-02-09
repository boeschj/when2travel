import { TRIP_ROLES } from "@/lib/constants";
import type { TripRole } from "@/lib/constants";
import { formatRangeDisplay } from "@/lib/date/formatter";
import { assertISODateString } from "@/lib/date/types";
import { pluralize } from "@/lib/utils";

export function formatDateRange(startRange: string | null, endRange: string | null): string {
  if (!startRange || !endRange) return "Dates TBD";
  const start = assertISODateString(startRange);
  const end = assertISODateString(endRange);
  const formattedRange = formatRangeDisplay(start, end);
  return formattedRange;
}

export function buildDeleteLabelConfig({
  role,
  planName,
  responseCount,
  isPending,
}: {
  role: TripRole;
  planName: string;
  responseCount: number;
  isPending: boolean;
}): {
  roleBadgeLabel: string;
  deleteLabel: string;
  dialogTitle: string;
  dialogDescription: string;
  confirmLabel: string;
} {
  const isCreator = role === TRIP_ROLES.CREATOR;

  if (isCreator) {
    return {
      roleBadgeLabel: "CREATOR",
      deleteLabel: "Delete Trip",
      dialogTitle: "Delete this trip?",
      dialogDescription: `This action cannot be undone. This will permanently delete "${planName}" and all ${responseCount} ${pluralize(responseCount, "response")}.`,
      confirmLabel: isPending ? "Deleting..." : "Delete",
    };
  }

  return {
    roleBadgeLabel: "RESPONDENT",
    deleteLabel: "Leave Trip",
    dialogTitle: "Leave this trip?",
    dialogDescription: `This will remove your availability from "${planName}". You can rejoin later if you have the link.`,
    confirmLabel: isPending ? "Leaving..." : "Leave",
  };
}
