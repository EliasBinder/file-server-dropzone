import { serializeStyles } from "./utils/styler";
import filePlus from "./assets/file-plus.svg";
import type { Dropzone } from "./dropzone";

export class AddFile extends HTMLElement {
  private root: ShadowRoot | null = null;
  private dropzone: Dropzone | null = null;

  constructor(dropzone: Dropzone) {
    super();

    this.dropzone = dropzone;
    this.root = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (this.root) {
      this.root.innerHTML = `
        <div style="${serializeStyles(this.containerStyle)}" id="add-file-container">
          <div style="${serializeStyles(this.iconContainerStyle)}">
            <img src="${filePlus}" alt="Add File Icon" style="${serializeStyles(this.iconStyle)};" />
          </div>
          <span style="${serializeStyles(this.fileNameStyle)}">Hinzufügen</span>
        </div>
      `;

      // Add event listeners
      const container = this.root.querySelector("#add-file-container");
      if (container) {
        container.addEventListener("click", () => {
          this.openFileDialog();
        });
      }
    }
  }

  // Utils

  private openFileDialog() {
    this.dropzone?.openFileDialog();
  }

  // Styling

  private containerStyle = {
    with: "100%",
    height: "120px",
    display: "flex",
    flexDirection: "column",
    overflow: "visible",
    gap: "8px",
    padding: "12px",
    boxSizing: "border-box",
    backgroundColor: "hsl(208 100% 94%)",
    borderRadius: "8px",
    border: "1px solid hsl(208 100% 88%)",
    fontSize: "14px",
    fontFamily: "Arial, sans-serif",
    cursor: "pointer",
  };

  private iconContainerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    flexGrow: "1",
  };

  private iconStyle = {
    width: "65px",
    height: "65px",
  };

  private fileNameStyle = {
    fontSize: "16px",
    textAlign: "center",
    width: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };
}
