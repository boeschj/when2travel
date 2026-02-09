import * as React from "react";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayPicker, getDefaultClassNames, type DayButton } from "react-day-picker";

import { cn } from "@/lib/utils";
import { MODIFIER_KEYS } from "@/components/calendar/modifier-keys";
import { Button, buttonVariants } from "@/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();
  const rtlRotateNext = String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`;
  const rtlRotatePrev = String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`;

  const rootClass = cn("w-fit", defaultClassNames.root);
  const monthsClass = cn("flex gap-4 flex-col md:flex-row relative", defaultClassNames.months);
  const monthClass = cn("flex flex-col w-full gap-4", defaultClassNames.month);
  const navClass = cn(
    "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
    defaultClassNames.nav,
  );
  const previousButtonClass = cn(
    buttonVariants({ variant: buttonVariant }),
    "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
    defaultClassNames.button_previous,
  );
  const nextButtonClass = cn(
    buttonVariants({ variant: buttonVariant }),
    "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
    defaultClassNames.button_next,
  );
  const monthCaptionClass = cn(
    "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
    defaultClassNames.month_caption,
  );
  const dropdownsClass = cn(
    "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
    defaultClassNames.dropdowns,
  );
  const dropdownRootClass = cn(
    "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
    defaultClassNames.dropdown_root,
  );
  const dropdownClass = cn("absolute bg-popover inset-0 opacity-0", defaultClassNames.dropdown);
  const captionLabelClass = cn(
    "select-none font-medium",
    captionLayout === "label"
      ? "text-sm"
      : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
    defaultClassNames.caption_label,
  );
  const weekdaysClass = cn("flex", defaultClassNames.weekdays);
  const weekdayClass = cn(
    "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none",
    defaultClassNames.weekday,
  );
  const weekClass = cn("flex w-full mt-2", defaultClassNames.week);
  const weekNumberHeaderClass = cn(
    "select-none w-(--cell-size)",
    defaultClassNames.week_number_header,
  );
  const weekNumberClass = cn(
    "text-[0.8rem] select-none text-muted-foreground",
    defaultClassNames.week_number,
  );
  const dayClass = cn(
    "relative w-full h-full p-0 text-center group/day aspect-square select-none",
    defaultClassNames.day,
  );
  const rangeStartClass = cn(defaultClassNames.range_start);
  const rangeMiddleClass = cn(defaultClassNames.range_middle);
  const rangeEndClass = cn(defaultClassNames.range_end);
  const todayClass = cn(defaultClassNames.today);
  const outsideClass = cn(
    "text-muted-foreground aria-selected:text-muted-foreground",
    defaultClassNames.outside,
  );
  const disabledClass = cn("text-muted-foreground opacity-50", defaultClassNames.disabled);
  const hiddenClass = cn("invisible", defaultClassNames.hidden);

  const calendarClass = cn(
    "bg-background group/calendar p-3 [--cell-size:--spacing(8)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
    rtlRotateNext,
    rtlRotatePrev,
    className,
  );

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={calendarClass}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: date => date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: rootClass,
        months: monthsClass,
        month: monthClass,
        nav: navClass,
        button_previous: previousButtonClass,
        button_next: nextButtonClass,
        month_caption: monthCaptionClass,
        dropdowns: dropdownsClass,
        dropdown_root: dropdownRootClass,
        dropdown: dropdownClass,
        caption_label: captionLabelClass,
        table: "w-full border-collapse",
        weekdays: weekdaysClass,
        weekday: weekdayClass,
        week: weekClass,
        week_number_header: weekNumberHeaderClass,
        week_number: weekNumberClass,
        day: dayClass,
        range_start: rangeStartClass,
        range_middle: rangeMiddleClass,
        range_end: rangeEndClass,
        today: todayClass,
        outside: outsideClass,
        disabled: disabledClass,
        hidden: hiddenClass,
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn("relative", className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon
                className={cn("size-4", className)}
                {...props}
              />
            );
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon
              className={cn("size-4", className)}
              {...props}
            />
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const isFocused = modifiers[MODIFIER_KEYS.FOCUSED] ?? false;
  const isSelected = modifiers[MODIFIER_KEYS.SELECTED] ?? false;
  const isRangeStart = modifiers[MODIFIER_KEYS.RANGE_START] ?? false;
  const isRangeEnd = modifiers[MODIFIER_KEYS.RANGE_END] ?? false;
  const isRangeMiddle = modifiers[MODIFIER_KEYS.RANGE_MIDDLE] ?? false;
  const isSelectedSingle = isSelected && !isRangeStart && !isRangeEnd && !isRangeMiddle;
  const isEndpoint = isRangeStart || isRangeEnd;

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (isFocused) ref.current?.focus();
  }, [isFocused]);

  const buttonVariant = isEndpoint ? "default" : "ghost";

  const dayButtonClass = cn(
    "flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 rounded-full leading-none font-normal",
    isEndpoint && "hover:bg-primary hover:shadow-glow-md hover:scale-100",
    !isEndpoint && "hover:bg-primary/10",
    "group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px]",
    "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
    "data-[range-middle=true]:bg-primary/20 data-[range-middle=true]:text-white",
    "data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-start=true]:shadow-glow",
    "data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-end=true]:shadow-glow",
    "[&>span]:text-xs [&>span]:opacity-70",
    defaultClassNames.day,
    className,
  );

  return (
    <Button
      ref={ref}
      variant={buttonVariant}
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={isSelectedSingle}
      data-range-start={isRangeStart}
      data-range-end={isRangeEnd}
      data-range-middle={isRangeMiddle}
      className={dayButtonClass}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
