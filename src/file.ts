import { serializeStyles } from "./utils/styler";
import fileCheck from "./assets/file-check.svg";
import x from "./assets/x.svg";
import type { Dropzone } from "./dropzone";

export class File extends HTMLElement {
  private root: ShadowRoot | null = null;
  private dropzone: Dropzone | null = null;

  private fileName = "";
  private mimeType = "";
  private index = 0;

  constructor(dropzone: Dropzone) {
    super();

    this.dropzone = dropzone;
    this.root = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    if (this.hasAttribute("file-name")) {
      this.fileName = this.getAttribute("file-name") || "";
    }

    if (this.hasAttribute("mime-type")) {
      this.mimeType = this.getAttribute("mime-type") || "";
    }

    if (this.hasAttribute("index")) {
      this.index = parseInt(this.getAttribute("index") || "0", 10);
    }

    this.render();
  }

  render() {
    if (this.root) {
      this.root.innerHTML = `
        <div style="${serializeStyles(this.containerStyle)}">
          <div style="${serializeStyles(this.iconContainerStyle)}">
            <img src="${fileCheck}" alt="File Icon" style="${serializeStyles(this.iconStyle)};" />
          </div>
          <span style="${serializeStyles(this.fileNameStyle)}" title="${this.fileName}">${this.fileName}</span>
          <button style="${serializeStyles(this.xContainerStyle)}" id="remove-button">
            <img src="${x}" alt="Remove File" style="${serializeStyles(this.xStyle)}" />
          </button>
        </div>
      `;

      // Add event listeners
      const removeButton = this.root.querySelector("#remove-button");
      if (removeButton) {
        removeButton.addEventListener("click", () => {
          this.removeFile();
        });
      }
    }
  }

  // Utils

  private removeFile() {
    this.dropzone?.removeFile(this.index);
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
    backgroundColor: "hsl(255 0% 95%)",
    borderRadius: "8px",
    border: "1px solid hsl(255 0% 80%)",
    fontSize: "14px",
    fontFamily: "Arial, sans-serif",
    position: "relative",
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

  private xContainerStyle = {
    position: "absolute",
    top: "-8px",
    right: "-8px",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    backgroundColor: "hsl(208 100% 20%)",
    borderRadius: "9999999px",
    border: "1px solid hsl(208 100% 15%)",
    transition: "background-color 0.3s",
  };

  private xStyle = {
    width: "16px",
    height: "16px",
    // filter to white
    filter: "invert(100%)",
  };
}
