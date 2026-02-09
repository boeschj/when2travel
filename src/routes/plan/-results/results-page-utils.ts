import { toISODateString } from "@/lib/date/types";
import { buildAbsoluteUrl } from "@/lib/routes";
import type { PlanResponse } from "@/lib/types";
import type { AvatarColor } from "@/lib/utils";

import type { Respondent } from "./results-context";

export interface DeleteConfig {
  onConfirm: () => void;
  isPending: boolean;
  responsesCount: number;
}

export interface PopoverParticipant {
  id: string;
  name: string;
  isAvailable: boolean;
  isCurrentUser: boolean;
  colorHex?: string;
}

export function mapResponsesToRespondents(
  responses: PlanResponse[] | null,
  hasResponseToken: (id: string) => boolean,
): Respondent[] {
  if (!responses) return [];

  return responses.map(response => ({
    id: response.id,
    name: response.name,
    availableDates: response.availableDates,
    isCurrentUser: hasResponseToken(response.id),
  }));
}

export function buildDeleteConfig({
  isCreator,
  onConfirm,
  isPending,
  responsesCount,
}: {
  isCreator: boolean;
  onConfirm: () => void;
  isPending: boolean;
  responsesCount: number;
}): DeleteConfig | undefined {
  if (!isCreator) return undefined;
  return { onConfirm, isPending, responsesCount };
}

export function getPopoverParticipants({
  popoverDate,
  responses,
  hasResponseToken,
  colorMap,
}: {
  popoverDate: Date | null;
  responses: PlanResponse[];
  hasResponseToken: (id: string) => boolean;
  colorMap: Record<string, AvatarColor>;
}): PopoverParticipant[] {
  if (!popoverDate) return [];

  return mapResponsesToParticipants({
    responses,
    targetDate: popoverDate,
    hasResponseToken,
    colorMap,
  });
}

export function buildShareUrl(planId: string): string {
  const absoluteUrl = buildAbsoluteUrl("/plan/$planId/respond", { planId });
  return absoluteUrl;
}

function mapResponsesToParticipants({
  responses,
  targetDate,
  hasResponseToken,
  colorMap,
}: {
  responses: PlanResponse[];
  targetDate: Date;
  hasResponseToken: (id: string) => boolean;
  colorMap: Record<string, AvatarColor>;
}): PopoverParticipant[] {
  const formattedTargetDate = toISODateString(targetDate);

  return responses.map(response => ({
    id: response.id,
    name: response.name,
    isAvailable: response.availableDates.includes(formattedTargetDate),
    isCurrentUser: hasResponseToken(response.id),
    colorHex: colorMap[response.id]?.hex,
  }));
}
