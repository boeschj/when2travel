import { useState } from "react";
import { useShare } from "@/hooks/use-clipboard";
import { Calendar, Pencil, Plane, Share2, UserPlus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { AlternativeSuggestionsModal } from "./alternative-suggestions-modal";
import { RECOMMENDATION_PRIORITY, RECOMMENDATION_STATUS } from "./recommendation-types";
import type {
  AlternativeWindow,
  RecommendationPriority,
  RecommendationResult,
} from "./recommendation-types";
import {
  buildGoogleCalendarUrl,
  deriveAvailabilityText,
  derivePersonalizedCTA,
  formatDateRangeDisplay,
  getStatusIcon,
  getStatusStyles,
} from "./recommendation-utils";

const ACTION_MODE = {
  DURATION_EDIT: "duration_edit",
  PERFECT_MATCH: "perfect_match",
  ADD_DATES: "add_dates",
  BLOCKER_CTA: "blocker_cta",
  GENERIC_EDIT: "generic_edit",
} as const;

function handleCheckFlights() {
  window.open("https://www.google.com/travel/flights", "_blank", "noopener,noreferrer");
}

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
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);

  const { primary: recommendation, alternatives } = recommendationResult;
  const { status, headline, bestWindow, priority, shorterTripSuggestion } = recommendation;

  const StatusIcon = getStatusIcon(status);
  const statusStyles = getStatusStyles(status);
  const hasAlternatives = alternatives.length > 0;
  const isPerfect = status === RECOMMENDATION_STATUS.PERFECT;
  const needsSuggestions = !isPerfect;

  const isCurrentUserBlocker = currentUserResponseId === recommendation.blockerId;
  const isCurrentUserConstrainer =
    !!currentUserResponseId &&
    !!recommendation.constrainingPersonIds?.includes(currentUserResponseId);
  const personalizedCTA = derivePersonalizedCTA({
    isCurrentUserBlocker,
    isCurrentUserConstrainer,
    priority,
    blockerShiftDirection: recommendation.blockerShiftDirection,
  });

  const isDurationTooLong = priority === RECOMMENDATION_PRIORITY.DURATION_TOO_LONG;
  const actionMode = deriveActionMode({
    priority,
    isPerfect,
    hasResponded,
    hasShorterTripSuggestion: !!shorterTripSuggestion,
    hasEditDurationCallback: !!onEditDuration,
    personalizedCTA,
  });

  const dateRangeDisplay = bestWindow && formatDateRangeDisplay(bestWindow.start, bestWindow.end);
  const availabilityText = deriveAvailabilityText(bestWindow, isPerfect);

  const showAlternativeWindows =
    needsSuggestions && !!recommendation.alternativeWindows?.length && !isDurationTooLong;
  const showShorterTripWindows = needsSuggestions && isDurationTooLong && !!shorterTripSuggestion;

  const handleAddToCalendar = () => {
    if (!bestWindow) return;
    const calendarUrl = buildGoogleCalendarUrl(planName, bestWindow.start, bestWindow.end);
    window.open(calendarUrl, "_blank");
  };

  const handleShare = () => {
    const shareText = dateRangeDisplay
      ? `Check out our trip dates: ${dateRangeDisplay}`
      : "Check out our trip plan!";
    void share({ title: planName, text: shareText, url: globalThis.location.href });
  };

  const handleOpenSuggestions = () => setIsSuggestionsModalOpen(true);

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
          <h2 className="text-foreground text-2xl font-bold md:text-3xl">{headline}</h2>
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

          {needsSuggestions && (
            <SuggestionBox
              recommendationText={recommendation.recommendation}
              secondaryText={recommendation.secondary}
              hasAlternatives={hasAlternatives}
              onSeeAlternatives={handleOpenSuggestions}
            />
          )}

          {showAlternativeWindows && recommendation.alternativeWindows && (
            <AlternativeWindowsList windows={recommendation.alternativeWindows} />
          )}

          {showShorterTripWindows && (
            <div className="w-full max-w-lg">
              <p className="text-text-secondary mb-2 text-sm">
                Perfect {shorterTripSuggestion.duration}-day windows:
              </p>
              <AlternativeWindowsList windows={shorterTripSuggestion.windows} />
            </div>
          )}

          <div className="flex w-full max-w-lg flex-col gap-3 pt-2">
            {actionMode === ACTION_MODE.DURATION_EDIT &&
              shorterTripSuggestion &&
              onEditDuration && (
                <DurationEditActions
                  duration={shorterTripSuggestion.duration}
                  onEditDuration={onEditDuration}
                  onEditAvailability={onEditAvailability}
                />
              )}

            {actionMode === ACTION_MODE.PERFECT_MATCH && (
              <PerfectMatchActions
                onCheckFlights={handleCheckFlights}
                onAddToCalendar={handleAddToCalendar}
                onShare={handleShare}
              />
            )}

            {actionMode === ACTION_MODE.ADD_DATES && (
              <AddDatesActions
                onEditAvailability={onEditAvailability}
                onShare={handleShare}
              />
            )}

            {actionMode === ACTION_MODE.BLOCKER_CTA && personalizedCTA && (
              <BlockerActions
                label={personalizedCTA.label}
                isCreator={isCreator}
                onEditAvailability={onEditAvailability}
                onEditPlan={onEditPlan}
                onShare={handleShare}
              />
            )}

            {actionMode === ACTION_MODE.GENERIC_EDIT && (
              <GenericEditActions
                isCreator={isCreator}
                onEditAvailability={onEditAvailability}
                onEditPlan={onEditPlan}
                onShare={handleShare}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <AlternativeSuggestionsModal
        open={isSuggestionsModalOpen}
        onOpenChange={setIsSuggestionsModalOpen}
        alternatives={alternatives}
      />
    </>
  );
}

const OUTLINE_BUTTON_CLASS =
  "w-full border-border hover:border-primary hover:text-primary font-semibold rounded-full h-auto py-3";

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

interface SuggestionBoxProps {
  recommendationText: string;
  secondaryText?: string;
  hasAlternatives: boolean;
  onSeeAlternatives: () => void;
}

function SuggestionBox({
  recommendationText,
  secondaryText,
  hasAlternatives,
  onSeeAlternatives,
}: SuggestionBoxProps) {
  return (
    <div className="bg-surface-darker w-full max-w-lg rounded-lg p-4 text-left">
      <p className="text-foreground">{recommendationText}</p>
      {secondaryText && <p className="text-text-secondary mt-2 text-sm">{secondaryText}</p>}
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

  return (
    <div className="text-text-secondary text-sm">
      <span className="font-medium">Other options: </span>
      {windows.map((alternativeWindow, index) => (
        <span key={`${alternativeWindow.start}-${alternativeWindow.end}`}>
          {index > 0 && ", "}
          {formatDateRangeDisplay(alternativeWindow.start, alternativeWindow.end)} (
          {alternativeWindow.percentage}%)
        </span>
      ))}
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
          className="border-border hover:border-primary hover:text-primary h-auto rounded-full py-3 font-semibold"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Add to Cal
        </Button>
        <Button
          onClick={onShare}
          variant="outline"
          size="lg"
          className="border-border hover:border-primary hover:text-primary h-auto rounded-full py-3 font-semibold"
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

function deriveActionMode({
  priority,
  isPerfect,
  hasResponded,
  hasShorterTripSuggestion,
  hasEditDurationCallback,
  personalizedCTA,
}: {
  priority: RecommendationPriority;
  isPerfect: boolean;
  hasResponded: boolean;
  hasShorterTripSuggestion: boolean;
  hasEditDurationCallback: boolean;
  personalizedCTA: { label: string } | null;
}): ActionMode {
  const isDurationTooLong = priority === RECOMMENDATION_PRIORITY.DURATION_TOO_LONG;

  if (isDurationTooLong && hasShorterTripSuggestion && hasEditDurationCallback) {
    return ACTION_MODE.DURATION_EDIT;
  }
  if (isPerfect && hasResponded) {
    return ACTION_MODE.PERFECT_MATCH;
  }
  if (!hasResponded && !isDurationTooLong) {
    return ACTION_MODE.ADD_DATES;
  }
  if (hasResponded && !isPerfect && personalizedCTA && !isDurationTooLong) {
    return ACTION_MODE.BLOCKER_CTA;
  }
  return ACTION_MODE.GENERIC_EDIT;
}
