import { useId, useState } from "react";

import type { ToolbarMeta, ToolbarProps, ToolbarTool } from "../types";

export const meta: ToolbarMeta = {
  name: "Playful and expressive",
  idea: "Pick from a hand-drawn palette that shows what each tool does and whether it stays active after drawing.",
};

const wells = [
  { name: "Move around", tone: "mint", types: ["selection", "hand"] },
  {
    name: "Make a mark",
    tone: "violet",
    types: ["rectangle", "diamond", "ellipse", "arrow", "line", "freedraw"],
  },
  {
    name: "Add to the page",
    tone: "peach",
    types: ["text", "stickynote", "image"],
  },
  { name: "Tidy up", tone: "mint", types: ["eraser"] },
] as const satisfies readonly {
  name: string;
  tone: string;
  types: readonly ToolbarTool["type"][];
}[];

const guidance: Record<ToolbarTool["type"], string> = {
  selection: "Pick up and move objects.",
  hand: "Drag the canvas, not the objects on it.",
  rectangle: "Drag to sketch a box.",
  diamond: "Drag to sketch a diamond.",
  ellipse: "Drag to sketch an oval.",
  arrow: "Drag to point from one thing to another.",
  line: "Drag between two points.",
  freedraw: "Drag to sketch freehand.",
  text: "Click the canvas and start typing.",
  stickynote: "Click to place a note, or drag to size it.",
  image: "Choose an image from your device.",
  eraser: "Brush over objects to remove them.",
  frame: "Drag around objects to frame them.",
  embeddable: "Drag out a space for a web link.",
  autoshape: "Sketch freehand and turn it into a shape.",
  laser: "Drag to point without leaving a mark.",
  bucketfill: "Click inside an outline to fill it.",
  lasso: "Draw a loop around objects to select them.",
};

const labelFor = (tool: ToolbarTool) => {
  switch (tool.type) {
    case "selection":
      return "Select";
    case "hand":
      return "Pan canvas";
    default:
      return tool.label;
  }
};

const styles = `
.toolbar-playful {
  --paper: #fffcf6;
  --ink: #29233d;
  --muted: #595168;
  --rule: #cec4d7;
  --shadow: #ded3e8;
  --focus: #613cab;
  --picked: #553586;
  --picked-ink: #fff;
  --wash: #f0e8ff;
  --accent: #6a429d;
  box-sizing: border-box;
  inline-size: max-content;
  max-inline-size: min(810px, calc(100vw - 200px));
  padding: 9px 11px 8px;
  border: 1px solid var(--ink);
  border-radius: 12px 16px 13px 15px / 15px 11px 15px 10px;
  background: var(--paper);
  box-shadow: 2px 3px 0 var(--shadow);
  color: var(--ink);
  font-family: var(--ui-font);
}
.excalidraw.theme--dark .toolbar-playful {
  --paper: #272336;
  --ink: #f6edf9;
  --muted: #ddd1e8;
  --rule: #746586;
  --shadow: #16121f;
  --focus: #dfc7ff;
  --picked: #dfc7ff;
  --picked-ink: #2b1643;
  --wash: #3e3057;
  --accent: #e2caff;
}
.toolbar-playful .mint { --wash: #e3f5ec; --accent: #235d4a; }
.toolbar-playful .peach { --wash: #ffeadc; --accent: #893e27; }
.excalidraw.theme--dark .toolbar-playful .mint { --wash: #234039; --accent: #a4e7cb; }
.excalidraw.theme--dark .toolbar-playful .peach { --wash: #503229; --accent: #ffd1b6; }
.toolbar-playful .masthead {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 3px 7px;
  font: 20px/1.1 Excalifont, cursive;
}
.toolbar-playful .masthead svg { color: var(--accent); }
.toolbar-playful .masthead::after {
  content: "";
  flex: 1;
  border-top: 1px dashed var(--rule);
  margin-inline-start: 4px;
}
.toolbar-playful .wells,
.toolbar-playful .pieces,
.toolbar-playful .feedback,
.toolbar-playful .current {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.toolbar-playful .wells { gap: 5px; align-items: stretch; }
.toolbar-playful .well {
  flex: 1 1 auto;
  min-width: 0;
  padding: 4px;
  border-radius: 9px 7px 8px 7px;
  background: var(--wash);
}
.toolbar-playful .well-name {
  display: block;
  padding: 0 5px 3px;
  color: var(--accent);
  font: 15px/1.1 Excalifont, cursive;
}
.toolbar-playful .pieces { gap: 1px; }
.toolbar-playful button {
  box-sizing: border-box;
  border: 1px solid transparent;
  background: transparent;
  color: var(--ink);
  font: inherit;
  cursor: pointer;
}
.toolbar-playful button:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: -2px;
}
.toolbar-playful button:disabled { opacity: 0.5; cursor: default; }
.toolbar-playful .piece {
  position: relative;
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-inline-size: 41px;
  min-block-size: 46px;
  padding: 3px 5px;
  border-radius: 7px 9px 7px 9px / 9px 7px 9px 7px;
  font-size: 11px;
  line-height: 1.15;
  white-space: nowrap;
}
.toolbar-playful .piece svg { display: block; width: 18px; height: 18px; }
.toolbar-playful .piece:hover:where(:not(:disabled, [aria-pressed="true"], [aria-expanded="true"], [data-active="true"])),
.toolbar-playful .keep:hover { background: var(--paper); border-color: var(--rule); }
.toolbar-playful .piece[aria-expanded="true"] {
  border-color: var(--ink);
  background: var(--paper);
  box-shadow: inset 0 -2px var(--rule);
}
.toolbar-playful .piece[aria-pressed="true"],
.toolbar-playful .piece[data-active="true"][aria-expanded="false"] {
  border-color: var(--picked);
  background: var(--picked);
  color: var(--picked-ink);
  box-shadow: none;
}
.toolbar-playful .piece[aria-pressed="true"]:focus-visible,
.toolbar-playful .piece[data-active="true"][aria-expanded="false"]:focus-visible {
  outline-color: var(--picked-ink);
}
.toolbar-playful .piece .picked-check {
  position: absolute;
  inset-block-start: 4px;
  inset-inline-end: 4px;
  width: 10px;
  height: 10px;
}
.toolbar-playful .extras { margin-top: 5px; }
.toolbar-playful .extras[hidden] { display: none; }
.toolbar-playful .feedback {
  justify-content: space-between;
  gap: 5px 12px;
  padding-top: 7px;
  font-size: 12px;
  line-height: 1.25;
}
.toolbar-playful .current { gap: 3px 7px; color: var(--muted); }
.toolbar-playful .stamp {
  color: var(--accent);
  background: var(--wash);
  border-radius: 8px 5px 7px 5px;
  padding: 4px 7px;
}
.toolbar-playful kbd {
  border: 1px solid var(--rule);
  border-radius: 4px;
  padding: 1px 4px;
  font: 11px monospace;
}
.toolbar-playful .keep {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 2px 7px;
  border-color: var(--rule);
  border-radius: 7px 9px 7px 8px;
  white-space: nowrap;
}
.toolbar-playful .keep[aria-pressed="true"] {
  border-color: var(--accent);
  background: var(--wash);
}
.toolbar-playful .keep-state {
  min-width: 2em;
  padding: 2px 3px;
  border-radius: 4px;
  background: var(--wash);
  color: var(--accent);
  text-align: center;
  font-weight: 700;
}
.shapes-section:has(.toolbar-playful) .welcome-screen-decor-hint--toolbar {
  display: none;
}
@media (max-width: 760px) {
  .toolbar-playful { max-inline-size: calc(100vw - 116px); }
}
`;

const ToolButton = ({ tool }: { tool: ToolbarTool }) => {
  const label = labelFor(tool);
  return (
    <button
      className="piece"
      type="button"
      aria-pressed={tool.active}
      disabled={tool.disabled}
      title={tool.shortcut ? `${label} (shortcut: ${tool.shortcut})` : label}
      data-testid={`toolbar-${tool.type}`}
      onClick={tool.select}
    >
      <span aria-hidden="true">{tool.icon}</span>
      {tool.active && (
        <svg
          className="picked-check"
          aria-hidden="true"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m2 6 2.5 2.5L10 3" />
        </svg>
      )}
      {label}
    </button>
  );
};

export default function PlayfulToolbar({
  tools,
  locked,
  toggleLock,
  renderHint,
}: ToolbarProps) {
  const [extrasOpen, setExtrasOpen] = useState(false);
  const extrasId = useId();
  const groups = wells.map(({ types, ...well }) => ({
    ...well,
    tools: types.flatMap((type) => tools.filter((tool) => tool.type === type)),
  }));
  const extras = tools.filter(
    (tool) => !groups.some((group) => group.tools.includes(tool)),
  );
  const active = tools.find((tool) => tool.active);
  const activeTone =
    groups.find((group) => group.tools.some((tool) => tool.active))?.tone ??
    "violet";

  return (
    <div className="toolbar-playful" role="group" aria-label="Sketch palette">
      <style>{styles}</style>
      <div className="masthead">
        <svg
          aria-hidden="true"
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 3c.4 4.9 2.4 7 7.8 7.7-5 .3-7.4 2.8-7.7 8.3-.8-5.3-2.8-7.3-7.7-7.8C8 10.1 10.3 7.9 11 3ZM19 15l1 5m-3-2 5-.9" />
        </svg>
        Sketch palette
      </div>
      <div className="wells">
        {groups.map((group) => (
          <div
            key={group.name}
            className={`well ${group.tone}`}
            role="group"
            aria-label={group.name}
          >
            <span className="well-name" aria-hidden="true">
              {group.name}
            </span>
            <div className="pieces">
              {group.tools.map((tool) => (
                <ToolButton key={tool.type} tool={tool} />
              ))}
              {group.name === "Tidy up" && (
                <button
                  type="button"
                  className="piece"
                  aria-expanded={extrasOpen}
                  aria-controls={extrasId}
                  data-active={extras.some((tool) => tool.active)}
                  onClick={() => setExtrasOpen(!extrasOpen)}
                >
                  <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  >
                  <path
                    d={extrasOpen ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"}
                  />
                  </svg>
                  More tools
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div
        id={extrasId}
        className="well extras"
        role="group"
        aria-label="More tools"
        hidden={!extrasOpen}
      >
        <span className="well-name" aria-hidden="true">
          More from the kit
        </span>
        <div className="pieces">
          {extras.map((tool) => (
            <ToolButton key={tool.type} tool={tool} />
          ))}
        </div>
      </div>
      <div className="feedback">
        <div className={`current ${activeTone}`} role="status">
          <strong className="stamp">
            Picked: {active ? labelFor(active) : "Custom tool"}
          </strong>
          {active && <span>{guidance[active.type]}</span>}
          {active?.keyHint && (
            <kbd aria-label={`Shortcut: ${active.keyHint}`}>{active.keyHint}</kbd>
          )}
        </div>
        <button
          className="keep"
          type="button"
          aria-pressed={locked}
          title="Keep the selected tool active after drawing"
          onClick={toggleLock}
        >
          Keep tool active{" "}
          <span className="keep-state" aria-hidden="true">
            {locked ? "On" : "Off"}
          </span>
        </button>
      </div>
      {renderHint()}
    </div>
  );
}
