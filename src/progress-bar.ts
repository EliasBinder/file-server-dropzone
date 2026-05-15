import { serializeStyles } from "./utils/styler";

export class ProgressBar extends HTMLElement {
  private root: ShadowRoot | null = null;
  private progress = 0;

  constructor() {
    super();

    this.root = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    if (this.hasAttribute("progress")) {
      this.progress = parseFloat(this.getAttribute("progress") || "0");
    }

    this.render();
  }

  render() {
    if (this.root) {
      this.root.innerHTML = `
      <div style="${serializeStyles(this.containerStyle)}">
        <div style="${serializeStyles(this.progressStyle, { width: `${this.progress}%` })}"></div>
      </div>
    `;
    }
  }

  // Styling

  private containerStyle = {
    width: "100%",
    minWidth: "300px",
    height: "12px",
    minHeight: "12px",
    backgroundColor: "hsl(208 100% 92%)",
    borderRadius: "6px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
  };

  private progressStyle = {
    height: "100%",
    backgroundColor: "hsl(208 100% 50%)",
    borderRadius: "4px",
  };
}
