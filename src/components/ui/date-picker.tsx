"use client";

import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function parseYmd(value?: string): Date | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

type DatePickerProps = {
  name: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
};

export function DatePicker({ name, defaultValue, onChange }: DatePickerProps) {
  const [date, setDate] = useState<Date | undefined>(parseYmd(defaultValue));
  const [open, setOpen] = useState(false);
  const value = date ? format(date, "yyyy-MM-dd") : "";

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarDays className="text-muted-foreground" />
            {date ? format(date, "MMM d, yyyy") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(next) => {
              setDate(next);
              onChange?.(next ? format(next, "yyyy-MM-dd") : "");
              setOpen(false);
              requestAnimationFrame(() => {
                (document.activeElement as HTMLElement | null)?.blur();
              });
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </>
  );
}
