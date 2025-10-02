"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { getDefaultClassNames } from "react-day-picker";
import { useRouter } from "next/navigation";
import { CalendarDay } from "react-day-picker";

export function WorkoutCalendar() {
  const [loggedDates, setLoggedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.workoutDates) {
          setLoggedDates(new Set(data.workoutDates));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const router = useRouter();

  const hasWorkout = React.useCallback(
    (date: Date): boolean => {
      return loggedDates.has(date.toISOString().split("T")[0]);
    },
    [loggedDates]
  );

  if (loading) {
    return (
      <div className="rounded-md border shadow-sm h-80 motion-safe:animate-pulse">
        <div className="w-full h-full rounded-md bg-muted/50 animate-pulse" />
      </div>
    );
  }

  function CustomDayButton(
    props: React.ComponentProps<typeof CalendarDayButton> & { day: CalendarDay }
  ) {
    const { className, day, modifiers, children, ...rest } = props;
    const defaultClassNames = getDefaultClassNames();

    const ref = React.useRef<HTMLButtonElement>(null);
    React.useEffect(() => {
      if (modifiers.focused) ref.current?.focus();
    }, [modifiers.focused]);

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        className={cn(
          "relative h-full w-full p-0 items-center justify-center",
          "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square min-w-[2.5rem] leading-none font-normal group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-sm [&>span]:opacity-100",
          modifiers.hasWorkout &&
            "border border-green-400 hover:border-green-500 ring-1 ring-green-300/40",
          defaultClassNames.day,
          className
        )}
        data-day={day.date.toLocaleDateString()}
        data-selected-single={
          modifiers.selected &&
          !modifiers.range_start &&
          !modifiers.range_end &&
          !modifiers.range_middle
        }
        data-range-start={modifiers.range_start}
        data-range-end={modifiers.range_end}
        data-range-middle={modifiers.range_middle}
        {...rest}
      >
        {children}
      </Button>
    );
  }

  return (
    <Calendar
      className="rounded-md border shadow-sm"
      modifiers={{ hasWorkout }}
      onDayClick={(date, modifiers) => {
        if (modifiers.hasWorkout) {
          router.push(`/sessions?date=${date.toISOString().split("T")[0]}`);
        }
      }}
      components={{
        DayButton: CustomDayButton,
      }}
    />
  );
}
