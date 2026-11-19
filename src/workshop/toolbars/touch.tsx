import { useId, useRef, useState } from "react";

import {
  DotsHorizontalIcon,
  LockedIcon,
  UnlockedIcon,
} from "@excalidraw/excalidraw/components/icons";
import {
  hideTooltip,
  showTooltip,
} from "@excalidraw/excalidraw/components/Tooltip";

import "./touch.css";

import type { ToolbarMeta, ToolbarProps, ToolbarTool } from "../types";

export const meta: ToolbarMeta = {
  name: "Big and touch friendly",
  idea: "A thumb-reachable dock keeps Select, Pan, Insert image, and Repeat tool visible above a labeled drawing grid on narrow screens.",
};

const repeatDescription =
  "Keep using the same tool after drawing so you can draw again without reselecting it.";

const labels: Partial<Record<ToolbarTool["type"], string>> = {
  selection: "Select",
  hand: "Pan",
  freedraw: "Draw",
  image: "Insert image",
};

const descriptions: Partial<Record<ToolbarTool["type"], string>> = {
  selection: "Select and move objects",
  hand: "Pan the canvas",
};

const navigationTargets: Partial<Record<ToolbarTool["type"], string>> = {
  selection: "Objects",
  hand: "Canvas",
};

export default function TouchToolbar({
  tools,
  locked,
  toggleLock,
  renderHint,
}: ToolbarProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreId = useId();
  const moreButton = useRef<HTMLButtonElement>(null);

  const objectSelection = tools.find((tool) => tool.type === "selection");
  const pan = tools.find((tool) => tool.type === "hand");
  const image = tools.find((tool) => tool.type === "image");
  const drawing = tools.filter(
    (tool) =>
      tool.group === "main" &&
      tool !== objectSelection &&
      tool !== pan &&
      tool.type !== "eraser",
  );
  const extra = tools.filter(
    (tool) =>
      tool.type === "eraser" || (tool.group === "more" && tool !== image),
  );

  const toolButton = (tool: ToolbarTool, inMore = false) => {
    const label = labels[tool.type] ?? tool.label;
    const description = descriptions[tool.type] ?? label;
    return (
      <button
        key={tool.type}
        type="button"
        data-tool={tool.type}
        title={
          tool.shortcut ? `${description} (${tool.shortcut})` : description
        }
        aria-description={descriptions[tool.type]}
        aria-pressed={tool.active}
        disabled={tool.disabled}
        onClick={() => {
          tool.select();
          setMoreOpen(false);
          if (inMore) {
            moreButton.current?.focus();
          }
        }}
      >
        <span aria-hidden="true">{tool.icon}</span>
        {label}
        {navigationTargets[tool.type] && (
          <span className="touch-target" aria-hidden="true">
            {navigationTargets[tool.type]}
          </span>
        )}
      </button>
    );
  };

  return (
    <div
      className="toolbar-touch"
      role="group"
      aria-label="Touch tools"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setMoreOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && moreOpen) {
          event.stopPropagation();
          setMoreOpen(false);
          moreButton.current?.focus();
        }
      }}
    >
      <div className="touch-dock">
        <div className="touch-group" role="group" aria-label="Navigate">
          {objectSelection && toolButton(objectSelection)}
          {pan && toolButton(pan)}
        </div>
        <div
          className="touch-group"
          role="group"
          aria-label="Insert and options"
        >
          {image && toolButton(image)}
          <button
            type="button"
            aria-description={repeatDescription}
            aria-pressed={locked}
            onPointerEnter={(event) => {
              if (event.pointerType !== "touch") {
                showTooltip(event.currentTarget, repeatDescription, {
                  delay: true,
                  long: true,
                  position: "top",
                });
              }
            }}
            onPointerLeave={hideTooltip}
            onFocus={(event) => {
              if (event.currentTarget.matches(":focus-visible")) {
                showTooltip(event.currentTarget, repeatDescription, {
                  long: true,
                  position: "top",
                });
              }
            }}
            onBlur={hideTooltip}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                hideTooltip();
              }
            }}
            onPointerDown={hideTooltip}
            onClick={toggleLock}
          >
            <span aria-hidden="true">{locked ? LockedIcon : UnlockedIcon}</span>
            Repeat tool
            <span className="touch-repeat-state" aria-hidden="true">
              {locked ? "On" : "Off"}
            </span>
          </button>
          <button
            ref={moreButton}
            type="button"
            aria-expanded={moreOpen}
            aria-controls={moreOpen ? moreId : undefined}
            onClick={() => setMoreOpen(!moreOpen)}
          >
            <span aria-hidden="true">{DotsHorizontalIcon}</span>
            More tools
          </button>
        </div>
        <div className="touch-group touch-draw" role="group" aria-label="Draw">
          {drawing.map((tool) => toolButton(tool))}
        </div>
      </div>
      {moreOpen ? (
        <div
          id={moreId}
          className="touch-more"
          role="group"
          aria-label="More tools"
        >
          <p className="touch-more-heading" aria-hidden="true">
            More tools
          </p>
          <div className="touch-group">
            {extra.map((tool) => toolButton(tool, true))}
          </div>
        </div>
      ) : (
        <div className="touch-hint">{renderHint()}</div>
      )}
    </div>
  );
}
