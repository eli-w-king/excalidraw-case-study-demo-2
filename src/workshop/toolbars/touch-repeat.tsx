import TouchToolbar from "./touch";

import "./touch-repeat.css";

import type { ToolbarMeta, ToolbarProps } from "../types";

export const meta: ToolbarMeta = {
  name: "Draw Again",
  idea: "A control next to the drawing tools says whether you'll keep using that tool or switch back to Select.",
};

export default function DrawAgainToolbar(props: ToolbarProps) {
  return <TouchToolbar {...props} direction="repeat" />;
}
