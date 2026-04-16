"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [start, setStart] = useState(searchParams.get("from") ?? "");
  const [end, setEnd] = useState(searchParams.get("to") ?? "");

  const apply = useCallback(() => {
    const params = new URLSearchParams();
    if (start) params.set("from", start);
    if (end) params.set("to", end);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }, [start, end, pathname, router]);

  const clear = useCallback(() => {
    setStart("");
    setEnd("");
    router.push(pathname);
  }, [pathname, router]);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="from" className="text-xs">
          From
        </Label>
        <Input
          id="from"
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="h-8 w-36 text-xs"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="to" className="text-xs">
          To
        </Label>
        <Input
          id="to"
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="h-8 w-36 text-xs"
        />
      </div>
      <Button type="button" size="sm" className="h-8" onClick={apply}>
        Apply
      </Button>
      {(start || end) && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8"
          onClick={clear}
        >
          Clear
        </Button>
      )}
    </div>
  );
}
