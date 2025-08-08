import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-6 rounded-xl bg-gradient-to-br from-card via-card to-surface-variant", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-6 sm:space-x-6 sm:space-y-0",
        month: "space-y-6",
        caption: "flex justify-center pt-2 relative items-center mb-4",
        caption_label: "text-lg font-semibold text-foreground tracking-wide",
        nav: "space-x-2 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-9 w-9 bg-background/60 backdrop-blur-sm border-border/50 p-0 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105"
        ),
        nav_button_previous: "absolute left-2",
        nav_button_next: "absolute right-2",
        table: "w-full border-collapse space-y-2 mt-2",
        head_row: "flex mb-2",
        head_cell:
          "text-muted-foreground rounded-lg w-12 h-8 font-medium text-sm uppercase tracking-wider flex items-center justify-center",
        row: "flex w-full mt-1",
        cell: "h-12 w-12 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-xl [&:has([aria-selected].day-outside)]:bg-accent/30 [&:has([aria-selected])]:bg-accent/20 first:[&:has([aria-selected])]:rounded-l-xl last:[&:has([aria-selected])]:rounded-r-xl focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-12 w-12 p-0 font-medium aria-selected:opacity-100 rounded-xl hover:bg-accent/50 hover:text-accent-foreground transition-all duration-200 hover:scale-105 hover:shadow-sm relative overflow-hidden"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground hover:from-primary hover:via-primary hover:to-primary/90 focus:from-primary focus:via-primary focus:to-primary/80 shadow-lg shadow-primary/25 border-2 border-primary-foreground/20",
        day_today: "bg-gradient-to-br from-accent via-accent to-accent/80 text-accent-foreground font-bold shadow-md border-2 border-accent-foreground/30",
        day_outside:
          "day-outside text-muted-foreground/40 opacity-40 aria-selected:bg-accent/20 aria-selected:text-muted-foreground/60 aria-selected:opacity-60",
        day_disabled: "text-muted-foreground/30 opacity-30",
        day_range_middle:
          "aria-selected:bg-accent/30 aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
