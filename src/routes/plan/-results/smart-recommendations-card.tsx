import { useState } from "react";
import { useShare } from "@/hooks/use-clipboard";
import { Calendar, Pencil, Plane, Share2, UserPlus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { AlternativeSuggestionsModal } from "./alternative-suggestions-modal";
import type { AlternativeWindow, ShorterTripSuggestion } from "./availability-analysis";
import type { Recommendation, RecommendationResult } from "./recommendation-types";
import { RECOMMENDATION_KIND } from "./recommendation-types";
import {
  buildGoogleCalendarUrl,
  deriveAvailabilityText,
  derivePersonalizedCTA,
  formatDateRangeDisplay,
  getStatusIcon,
  getStatusStyles,
} from "./recommendation-utils";
import type { PersonalizedCTA } from "./recommendation-utils";

const ACTION_MODE = {
  DURATION_EDIT: "duration_edit",
  PERFECT_MATCH: "perfect_match",
  ADD_DATES: "add_dates",
  BLOCKER_CTA: "blocker_cta",
  GENERIC_EDIT: "generic_edit",
} as const;

type ActionMode = (typeof ACTION_MODE)[keyof typeof ACTION_MODE];

interface SmartRecommendationsCardProps {
  recommendationResult: RecommendationResult;
  planName: string;
  isCreator: boolean;
  hasResponded: boolean;
  currentUserResponseId?: string;
  onEditPlan: () => void;
  onEditAvailability: () => void;
  onEditDuration?: () => void;
  className?: string;
}

export function SmartRecommendationsCard({
  recommendationResult,
  planName,
  isCreator,
  hasResponded,
  currentUserResponseId,
  onEditPlan,
  onEditAvailability,
  onEditDuration,
  className,
}: SmartRecommendationsCardProps) {
  const { share } = useShare();
  const [isAlternativesModalOpen, setIsAlternativesModalOpen] = useState(false);

  const { primary, alternativeWindows } = recommendationResult;
  const isPerfect = primary.kind === RECOMMENDATION_KIND.PERFECT_MATCH;
  const shorterTripSuggestion = getShorterTripSuggestion(primary);

  const StatusIcon = getStatusIcon(primary.status);
  const statusStyles = getStatusStyles(primary.status);

  const personalizedCTA = derivePersonalizedCTA({
    recommendation: primary,
    currentUserResponseId,
  });
  const actionMode = deriveActionMode({
    primary,
    hasResponded,
    hasEditDurationCallback: !!onEditDuration,
    personalizedCTA,
  });

  const dateRangeDisplay =
    primary.bestWindow && formatDateRangeDisplay(primary.bestWindow.start, primary.bestWindow.end);
  const availabilityText = deriveAvailabilityText(primary.bestWindow);

  const hasAlternatives = alternativeWindows.length > 0;
  const showAdviceBox = !isPerfect;
  const showAlternativeWindows = !isPerfect && !shorterTripSuggestion && hasAlternatives;
  const showShorterTripWindows = !!shorterTripSuggestion;

  const handleAddToCalendar = () => {
    if (!primary.bestWindow) return;
    const calendarUrl = buildGoogleCalendarUrl({
      planName,
      startDate: primary.bestWindow.start,
      endDate: primary.bestWindow.end,
    });
    window.open(calendarUrl, "_blank");
  };

  const handleShare = () => {
    const shareText = dateRangeDisplay
      ? `Check out our trip dates: ${dateRangeDisplay}`
      : "Check out our trip plan!";
    void share({ title: planName, text: shareText, url: globalThis.location.href });
  };

  const handleOpenAlternatives = () => setIsAlternativesModalOpen(true);

  return (
    <>
      <Card
        variant="action"
        className={cn("h-full p-6 md:p-8", className)}
      >
        <CardContent className="flex h-full flex-col items-center justify-center gap-4 p-0 text-center">
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full",
              statusStyles.bgColor,
            )}
          >
            <StatusIcon className={cn("h-8 w-8", statusStyles.iconColor)} />
          </div>
          <h2 className="text-foreground text-2xl font-bold md:text-3xl">{primary.headline}</h2>
          <p className="text-text-secondary text-lg">Your ideal trip dates are:</p>
          {dateRangeDisplay && (
            <h3 className="text-foreground text-4xl font-black tracking-tight md:text-5xl lg:text-5xl">
              {dateRangeDisplay}
            </h3>
          )}

          {availabilityText && (
            <AvailabilitySection
              icon={StatusIcon}
              iconColor={statusStyles.iconColor}
              text={availabilityText}
            />
          )}

          {showAdviceBox && (
            <AdviceBox
              adviceText={primary.advice}
              hasAlternatives={hasAlternatives}
              onSeeAlternatives={handleOpenAlternatives}
            />
          )}

          {showAlternativeWindows && <AlternativeWindowsList windows={alternativeWindows} />}

          {showShorterTripWindows && (
            <div className="w-full max-w-lg">
              <p className="text-text-secondary mb-2 text-sm">
                Perfect {shorterTripSuggestion.duration}-day windows:
              </p>
              <AlternativeWindowsList windows={shorterTripSuggestion.windows} />
            </div>
          )}

          <RecommendationActions
            actionMode={actionMode}
            shorterTripDuration={shorterTripSuggestion?.duration}
            personalizedCTALabel={personalizedCTA?.label}
            isCreator={isCreator}
            onEditDuration={onEditDuration}
            onEditAvailability={onEditAvailability}
            onEditPlan={onEditPlan}
            onShare={handleShare}
            onAddToCalendar={handleAddToCalendar}
          />
        </CardContent>
      </Card>

      <AlternativeSuggestionsModal
        open={isAlternativesModalOpen}
        onOpenChange={setIsAlternativesModalOpen}
        alternatives={alternativeWindows}
      />
    </>
  );
}

const OUTLINE_BUTTON_CLASS =
  "w-full border-border hover:border-primary hover:text-primary font-semibold rounded-full h-auto py-3";

interface RecommendationActionsProps {
  actionMode: ActionMode;
  shorterTripDuration: number | undefined;
  personalizedCTALabel: string | undefined;
  isCreator: boolean;
  onEditDuration: (() => void) | undefined;
  onEditAvailability: () => void;
  onEditPlan: () => void;
  onShare: () => void;
  onAddToCalendar: () => void;
}

function RecommendationActions({
  actionMode,
  shorterTripDuration,
  personalizedCTALabel,
  isCreator,
  onEditDuration,
  onEditAvailability,
  onEditPlan,
  onShare,
  onAddToCalendar,
}: RecommendationActionsProps) {
  return (
    <div className="flex w-full max-w-lg flex-col gap-3 pt-2">
      {actionMode === ACTION_MODE.DURATION_EDIT && shorterTripDuration && onEditDuration && (
        <DurationEditActions
          duration={shorterTripDuration}
          onEditDuration={onEditDuration}
          onEditAvailability={onEditAvailability}
        />
      )}

      {actionMode === ACTION_MODE.PERFECT_MATCH && (
        <PerfectMatchActions
          onCheckFlights={handleCheckFlights}
          onAddToCalendar={onAddToCalendar}
          onShare={onShare}
        />
      )}

      {actionMode === ACTION_MODE.ADD_DATES && (
        <AddDatesActions
          onEditAvailability={onEditAvailability}
          onShare={onShare}
        />
      )}

      {actionMode === ACTION_MODE.BLOCKER_CTA && personalizedCTALabel && (
        <BlockerActions
          label={personalizedCTALabel}
          isCreator={isCreator}
          onEditAvailability={onEditAvailability}
          onEditPlan={onEditPlan}
          onShare={onShare}
        />
      )}

      {actionMode === ACTION_MODE.GENERIC_EDIT && (
        <GenericEditActions
          isCreator={isCreator}
          onEditAvailability={onEditAvailability}
          onEditPlan={onEditPlan}
          onShare={onShare}
        />
      )}
    </div>
  );
}

interface AvailabilitySectionProps {
  icon: React.ElementType;
  iconColor: string;
  text: string;
}

function AvailabilitySection({ icon: Icon, iconColor, text }: AvailabilitySectionProps) {
  return (
    <>
      <Separator className="w-full max-w-lg" />
      <div className="flex items-center gap-2">
        <Icon className={cn("h-5 w-5", iconColor)} />
        <span className="text-foreground font-bold">{text}</span>
      </div>
      <Separator className="w-full max-w-lg" />
    </>
  );
}

interface AdviceBoxProps {
  adviceText: string;
  hasAlternatives: boolean;
  onSeeAlternatives: () => void;
}

function AdviceBox({ adviceText, hasAlternatives, onSeeAlternatives }: AdviceBoxProps) {
  return (
    <div className="bg-surface-darker w-full max-w-lg rounded-lg p-4 text-left">
      <p className="text-foreground">{adviceText}</p>
      {hasAlternatives && (
        <Button
          variant="link"
          onClick={onSeeAlternatives}
          className="text-primary mt-3 h-auto p-0 font-medium"
        >
          See Alternatives →
        </Button>
      )}
    </div>
  );
}

function AlternativeWindowsList({ windows }: { windows: AlternativeWindow[] }) {
  if (windows.length === 0) return null;

  const formattedWindows = windows
    .map(window => `${formatDateRangeDisplay(window.start, window.end)} (${window.percentage}%)`)
    .join(", ");

  return (
    <div className="text-text-secondary text-sm">
      <span className="font-medium">Other options: </span>
      {formattedWindows}
    </div>
  );
}

interface DurationEditActionsProps {
  duration: number;
  onEditDuration: () => void;
  onEditAvailability: () => void;
}

function DurationEditActions({
  duration,
  onEditDuration,
  onEditAvailability,
}: DurationEditActionsProps) {
  return (
    <>
      <Button
        onClick={onEditDuration}
        size="cta"
      >
        Change to {duration} Days
        <Pencil className="ml-2 h-5 w-5" />
      </Button>
      <Button
        onClick={onEditAvailability}
        variant="outline"
        size="lg"
        className={OUTLINE_BUTTON_CLASS}
      >
        Edit Availability
      </Button>
    </>
  );
}

interface PerfectMatchActionsProps {
  onCheckFlights: () => void;
  onAddToCalendar: () => void;
  onShare: () => void;
}

function PerfectMatchActions({
  onCheckFlights,
  onAddToCalendar,
  onShare,
}: PerfectMatchActionsProps) {
  return (
    <>
      <Button
        onClick={onCheckFlights}
        size="cta"
      >
        Check Flights
        <Plane className="ml-2 h-5 w-5" />
      </Button>
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={onAddToCalendar}
          variant="outline"
          size="lg"
          className={OUTLINE_BUTTON_CLASS}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Add to Cal
        </Button>
        <Button
          onClick={onShare}
          variant="outline"
          size="lg"
          className={OUTLINE_BUTTON_CLASS}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
    </>
  );
}

function AddDatesActions({
  onEditAvailability,
  onShare,
}: {
  onEditAvailability: () => void;
  onShare: () => void;
}) {
  return (
    <>
      <Button
        onClick={onEditAvailability}
        size="cta"
      >
        Add Dates
        <UserPlus className="ml-2 h-5 w-5" />
      </Button>
      <Button
        onClick={onShare}
        variant="outline"
        size="lg"
        className={OUTLINE_BUTTON_CLASS}
      >
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </Button>
    </>
  );
}

interface SecondaryActionButtonProps {
  isCreator: boolean;
  onEditPlan: () => void;
  onShare: () => void;
}

function SecondaryActionButton({ isCreator, onEditPlan, onShare }: SecondaryActionButtonProps) {
  if (isCreator) {
    return (
      <Button
        onClick={onEditPlan}
        variant="outline"
        size="lg"
        className={OUTLINE_BUTTON_CLASS}
      >
        Edit Plan
      </Button>
    );
  }

  return (
    <Button
      onClick={onShare}
      variant="outline"
      size="lg"
      className={OUTLINE_BUTTON_CLASS}
    >
      <Share2 className="mr-2 h-4 w-4" />
      Share
    </Button>
  );
}

interface BlockerActionsProps {
  label: string;
  isCreator: boolean;
  onEditAvailability: () => void;
  onEditPlan: () => void;
  onShare: () => void;
}

function BlockerActions({
  label,
  isCreator,
  onEditAvailability,
  onEditPlan,
  onShare,
}: BlockerActionsProps) {
  return (
    <>
      <Button
        onClick={onEditAvailability}
        size="cta"
      >
        {label}
        <Pencil className="ml-2 h-5 w-5" />
      </Button>
      <SecondaryActionButton
        isCreator={isCreator}
        onEditPlan={onEditPlan}
        onShare={onShare}
      />
    </>
  );
}

interface GenericEditActionsProps {
  isCreator: boolean;
  onEditAvailability: () => void;
  onEditPlan: () => void;
  onShare: () => void;
}

function GenericEditActions({
  isCreator,
  onEditAvailability,
  onEditPlan,
  onShare,
}: GenericEditActionsProps) {
  return (
    <>
      <Button
        onClick={onEditAvailability}
        size="cta"
      >
        Edit Availability
        <Pencil className="ml-2 h-5 w-5" />
      </Button>
      <SecondaryActionButton
        isCreator={isCreator}
        onEditPlan={onEditPlan}
        onShare={onShare}
      />
    </>
  );
}

function handleCheckFlights() {
  window.open("https://www.google.com/travel/flights", "_blank", "noopener,noreferrer");
}

function getShorterTripSuggestion(recommendation: Recommendation): ShorterTripSuggestion | null {
  if (recommendation.kind !== RECOMMENDATION_KIND.SHORTER_TRIP) {
    return null;
  }
  return recommendation.suggestion;
}

function deriveActionMode({
  primary,
  hasResponded,
  hasEditDurationCallback,
  personalizedCTA,
}: {
  primary: Recommendation;
  hasResponded: boolean;
  hasEditDurationCallback: boolean;
  personalizedCTA: PersonalizedCTA | null;
}): ActionMode {
  const isShorterTrip = primary.kind === RECOMMENDATION_KIND.SHORTER_TRIP;
  const isPerfect = primary.kind === RECOMMENDATION_KIND.PERFECT_MATCH;

  if (isShorterTrip && hasEditDurationCallback) {
    return ACTION_MODE.DURATION_EDIT;
  }
  if (isPerfect && hasResponded) {
    return ACTION_MODE.PERFECT_MATCH;
  }
  if (!hasResponded && !isShorterTrip) {
    return ACTION_MODE.ADD_DATES;
  }
  if (hasResponded && personalizedCTA) {
    return ACTION_MODE.BLOCKER_CTA;
  }
  return ACTION_MODE.GENERIC_EDIT;
}
