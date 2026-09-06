"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils";

import "./lever-switch.css";

export type LeverSwitchProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  id?: string;
  "aria-label"?: string;
};

export function LeverSwitch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  className,
  id,
  "aria-label": ariaLabel = "Toggle",
}: LeverSwitchProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [uncontrolled, setUncontrolled] = useState(defaultChecked);
  const isChecked = checked ?? uncontrolled;

  return (
    <label htmlFor={inputId} className={cn("toggle-container", className)}>
      <input
        id={inputId}
        type="checkbox"
        className="toggle-input"
        role="switch"
        checked={isChecked}
        aria-label={ariaLabel}
        onChange={(event) => {
          const next = event.target.checked;
          if (checked === undefined) {
            setUncontrolled(next);
          }
          onCheckedChange?.(next);
        }}
      />
      <div className="toggle-handle-wrapper">
        <div className="toggle-handle">
          <div className="toggle-handle-knob" />
          <div className="toggle-handle-bar-wrapper">
            <div className="toggle-handle-bar" />
          </div>
        </div>
      </div>
      <div className="toggle-base">
        <div className="toggle-base-inside" />
      </div>
    </label>
  );
}

/** Demo / 21st import alias */
export const Component = LeverSwitch;
