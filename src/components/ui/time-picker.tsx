"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addHours,
  endOfDay,
  endOfHour,
  endOfMinute,
  format,
  parse,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
  startOfDay,
  startOfHour,
  startOfMinute,
  subHours,
} from "date-fns";
import { CheckIcon, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface SimpleTimeOption {
  value: number;
  label: string;
  disabled?: boolean;
}

const AM_VALUE = 0;
const PM_VALUE = 1;

export function TimePicker({
  value,
  onChange,
  use12HourFormat,
  min,
  max,
  disabled,
  modal,
  hasError,
  className,
}: {
  use12HourFormat?: boolean;
  value: Date;
  onChange: (date: Date) => void;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  className?: string;
  modal?: boolean;
  hasError?: boolean;
}) {
  const formatStr = useMemo(
    () =>
      use12HourFormat
        ? "yyyy-MM-dd hh:mm:ss.SSS a xxxx"
        : "yyyy-MM-dd HH:mm:ss.SSS xxxx",
    [use12HourFormat],
  );
  const [ampm, setAmpm] = useState(
    format(value, "a") === "AM" ? AM_VALUE : PM_VALUE,
  );
  const [hour, setHour] = useState(
    use12HourFormat ? +format(value, "hh") : value.getHours(),
  );
  const [minute, setMinute] = useState(value.getMinutes());

  useEffect(() => {
    setAmpm(format(value, "a") === "AM" ? AM_VALUE : PM_VALUE);
    setHour(use12HourFormat ? +format(value, "hh") : value.getHours());
    setMinute(value.getMinutes());
  }, [use12HourFormat, value]);

  useEffect(() => {
    onChange(
      buildTime({
        use12HourFormat,
        value,
        formatStr,
        hour,
        minute,
        ampm,
      }),
    );
    // Intentionally sync internal wheels to parent value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hour, minute, ampm, formatStr, use12HourFormat]);

  const hourIn24h = useMemo(() => {
    return use12HourFormat ? (hour % 12) + ampm * 12 : hour;
  }, [hour, use12HourFormat, ampm]);

  const hours: SimpleTimeOption[] = useMemo(
    () =>
      Array.from({ length: use12HourFormat ? 12 : 24 }, (_, i) => {
        let optionDisabled = false;
        const hourValue = use12HourFormat ? (i === 0 ? 12 : i) : i;
        const hDate = setHours(value, use12HourFormat ? i + ampm * 12 : i);
        const hStart = startOfHour(hDate);
        const hEnd = endOfHour(hDate);
        if (min && hEnd < min) optionDisabled = true;
        if (max && hStart > max) optionDisabled = true;
        return {
          value: hourValue,
          label: hourValue.toString().padStart(2, "0"),
          disabled: optionDisabled,
        };
      }),
    [value, min, max, use12HourFormat, ampm],
  );

  const minutes: SimpleTimeOption[] = useMemo(() => {
    const anchorDate = setHours(value, hourIn24h);
    return Array.from({ length: 60 }, (_, i) => {
      let optionDisabled = false;
      const mDate = setMinutes(anchorDate, i);
      const mStart = startOfMinute(mDate);
      const mEnd = endOfMinute(mDate);
      if (min && mEnd < min) optionDisabled = true;
      if (max && mStart > max) optionDisabled = true;
      return {
        value: i,
        label: i.toString().padStart(2, "0"),
        disabled: optionDisabled,
      };
    });
  }, [value, min, max, hourIn24h]);

  const ampmOptions = useMemo(() => {
    const startD = startOfDay(value);
    const endD = endOfDay(value);
    return [
      { value: AM_VALUE, label: "AM" },
      { value: PM_VALUE, label: "PM" },
    ].map((option) => {
      let optionDisabled = false;
      const start = addHours(startD, option.value * 12);
      const end = subHours(endD, (1 - option.value) * 12);
      if (min && end < min) optionDisabled = true;
      if (max && start > max) optionDisabled = true;
      return { ...option, disabled: optionDisabled };
    });
  }, [value, min, max]);

  const [open, setOpen] = useState(false);

  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (open) {
        hourRef.current?.scrollIntoView({ behavior: "auto" });
        minuteRef.current?.scrollIntoView({ behavior: "auto" });
      }
    }, 1);
    return () => window.clearTimeout(timeoutId);
  }, [open]);

  const onHourChange = useCallback(
    (option: SimpleTimeOption) => {
      if (min) {
        const newTime = buildTime({
          use12HourFormat,
          value,
          formatStr,
          hour: option.value,
          minute,
          ampm,
        });
        if (newTime < min) {
          setMinute(min.getMinutes());
        }
      }
      if (max) {
        const newTime = buildTime({
          use12HourFormat,
          value,
          formatStr,
          hour: option.value,
          minute,
          ampm,
        });
        if (newTime > max) {
          setMinute(max.getMinutes());
        }
      }
      setHour(option.value);
    },
    [use12HourFormat, value, formatStr, minute, ampm, min, max],
  );

  const onMinuteChange = useCallback((option: SimpleTimeOption) => {
    setMinute(option.value);
  }, []);

  const onAmpmChange = useCallback(
    (option: SimpleTimeOption) => {
      if (min) {
        const newTime = buildTime({
          use12HourFormat,
          value,
          formatStr,
          hour,
          minute,
          ampm: option.value,
        });
        if (newTime < min) {
          const minH = min.getHours() % 12;
          setHour(minH === 0 ? 12 : minH);
          setMinute(min.getMinutes());
        }
      }
      if (max) {
        const newTime = buildTime({
          use12HourFormat,
          value,
          formatStr,
          hour,
          minute,
          ampm: option.value,
        });
        if (newTime > max) {
          const maxH = max.getHours() % 12;
          setHour(maxH === 0 ? 12 : maxH);
          setMinute(max.getMinutes());
        }
      }
      setAmpm(option.value);
    },
    [use12HourFormat, value, formatStr, hour, minute, min, max],
  );

  const display = useMemo(() => {
    return format(value, use12HourFormat ? "hh:mm a" : "HH:mm");
  }, [value, use12HourFormat]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modal}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 text-sm font-normal shadow-xs",
            disabled && "cursor-not-allowed opacity-50",
            hasError && "border-destructive",
            className,
          )}
          tabIndex={disabled ? -1 : 0}
        >
          {display}
          <Clock className="ml-2 size-4 opacity-50" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" side="top" align="start">
        <div className="p-1.5">
          <div className="flex h-56">
            <ScrollArea className="h-full w-[4.5rem]">
              <div className="flex flex-col items-stretch overflow-y-auto pb-48">
                {hours.map((option) => (
                  <div
                    ref={option.value === hour ? hourRef : undefined}
                    key={option.value}
                  >
                    <TimeItem
                      option={option}
                      selected={option.value === hour}
                      onSelect={onHourChange}
                      disabled={option.disabled}
                      className="h-8"
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
            <ScrollArea className="h-full w-[4.5rem]">
              <div className="flex flex-col items-stretch overflow-y-auto pb-48">
                {minutes.map((option) => (
                  <div
                    ref={option.value === minute ? minuteRef : undefined}
                    key={option.value}
                  >
                    <TimeItem
                      option={option}
                      selected={option.value === minute}
                      onSelect={onMinuteChange}
                      disabled={option.disabled}
                      className="h-8"
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
            {use12HourFormat ? (
              <ScrollArea className="h-full w-[4.5rem]">
                <div className="flex flex-col items-stretch overflow-y-auto">
                  {ampmOptions.map((option) => (
                    <TimeItem
                      key={option.value}
                      option={option}
                      selected={option.value === ampm}
                      onSelect={onAmpmChange}
                      className="h-8"
                      disabled={option.disabled}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : null}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TimeItem({
  option,
  selected,
  onSelect,
  className,
  disabled,
}: {
  option: SimpleTimeOption;
  selected: boolean;
  onSelect: (option: SimpleTimeOption) => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      className={cn("flex justify-start gap-1 px-2", className)}
      onClick={() => onSelect(option)}
      disabled={disabled}
    >
      <div className="flex w-4 shrink-0 justify-center">
        {selected ? <CheckIcon className="size-4" /> : null}
      </div>
      <span className="tabular-nums">{option.label}</span>
    </Button>
  );
}

interface BuildTimeOptions {
  use12HourFormat?: boolean;
  value: Date;
  formatStr: string;
  hour: number;
  minute: number;
  ampm: number;
}

function buildTime(options: BuildTimeOptions) {
  const { use12HourFormat, value, formatStr, hour, minute, ampm } = options;

  if (use12HourFormat) {
    const dateStrRaw = format(value, formatStr);
    let dateStr =
      dateStrRaw.slice(0, 11) +
      hour.toString().padStart(2, "0") +
      dateStrRaw.slice(13);
    dateStr =
      dateStr.slice(0, 14) +
      minute.toString().padStart(2, "0") +
      dateStr.slice(16);
    dateStr = dateStr.slice(0, 17) + "00" + dateStr.slice(19);
    dateStr =
      dateStr.slice(0, 24) +
      (ampm === AM_VALUE ? "AM" : "PM") +
      dateStr.slice(26);
    return parse(dateStr, formatStr, value);
  }

  return setHours(
    setMinutes(setSeconds(setMilliseconds(value, 0), 0), minute),
    hour,
  );
}
