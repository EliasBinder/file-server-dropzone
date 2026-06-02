import { UploadElement } from "./upload-element";
import { serializeStyles } from "./utils/styler";
import octagonAlertIcon from "./assets/octagon-alert.svg";
import fileCheckIcon from "./assets/file-check.svg";
import folderIcon from "./assets/folder.svg";
import cloudUploadIcon from "./assets/cloud-upload.svg";
import checkIcon from "./assets/check.svg";
import { serializeMimeType } from "./utils/mime-type-serializer";
import { translate } from "./lang/language";
import loadingIcon from "./assets/loader-circle.svg";
import { ProgressBar } from "./progress-bar";

export class FileInput extends UploadElement {
  constructor() {
    super();
  }

  override connectedCallback() {
    super.connectedCallback();

    this.config.maxFiles = 1; // FileInput only allows one file

    this.render();
  }

  override render() {
    if (this.root) {
      this.root.innerHTML = `
        ${
          this.error
            ? `
          <div style="${serializeStyles(this.errorContainerStyle)}">
            <img src="${octagonAlertIcon}" alt="Error Icon" style="${serializeStyles(this.errorIconStyle)}" />
            <span style="${serializeStyles(this.errorTextStyle)}">${this.error}</span>
          </div>
        `
            : ""
        }

        <div id="fs-container" style="${serializeStyles(this.containerStyle)}">
          ${
            this.step === "select-files"
              ? `
              <div id="fs-browse" style="${serializeStyles(this.browseStyle)}">
                <img src="${folderIcon}" alt="Upload Icon" style="${serializeStyles(this.browseIcon)}" />
                ${translate("browse")}
              </div>
              ${
                this.files.length === 0
                  ? `<span style="${serializeStyles(this.fileInfoStyle)}">${translate(
                      "accepted_types",
                      {
                        acceptedTypes:
                          this.config.acceptedFileTypes.length > 0
                            ? this.config.acceptedFileTypes
                                .map(serializeMimeType)
                                .join(", ")
                            : translate("all"),
                      },
                    )}</span>
             `
                  : `
                  <div style="${serializeStyles(this.fileInfo)}">
                    <span><img src="${fileCheckIcon}" alt="File Check Icon" style="${serializeStyles(this.fileCheckIconStyle)}" /></span>
                    <span style="${serializeStyles(this.fileNameStyle)}">${this.files[0]?.name}</span>
                  </div>
            `
              }`
              : this.step === "preparing"
                ? `<span style="${serializeStyles(this.infoIconWrapper)}">
              <style>
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              </style>
              <img src="${loadingIcon}" alt="Loading Icon" style="${serializeStyles(this.infoIcon, this.infoIconSpinning)}" />
              ${translate("preparing")}
            </span>`
                : this.step === "uploading"
                  ? `<span style="${serializeStyles(this.infoIconWrapper)}">
              <img src="${cloudUploadIcon}" alt="Loading Icon" style="${serializeStyles(this.infoIcon, this.infoIconSpinning)}" />
              ${translate("uploading")}
            </span><div style="padding: 12px 14px;" id="fs-progress"></div>`
                  : this.step === "completed"
                    ? `<span style="${serializeStyles(this.infoIconWrapper)}">
              <img src="${checkIcon}" alt="Loading Icon" style="${serializeStyles(this.infoIcon, this.infoIconSpinning)}" />
              ${translate("finished")}
              `
                    : ""
          }
        </div>
        `;

      if (this.step === "select-files") {
        const browseButton = this.root.getElementById(
          "fs-browse",
        ) as HTMLDivElement;
        browseButton.addEventListener("click", () => {
          this.openFileDialog();
        });
      } else if (this.step === "uploading") {
        const container = this.root.getElementById(
          "fs-progress",
        ) as HTMLDivElement;
        // Add progress bar
        const progressBar = new ProgressBar();
        progressBar.setAttribute("progress", this.progress.toString());
        container.appendChild(progressBar);
      }
    }
  }

  private containerStyle = {
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "16px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#fff",
    boxSizing: "border-box",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    width: "fit-content",
  };

  private browseStyle = {
    padding: "12px 14px",
    backgroundColor: "hsl(255 0% 90%)",
    color: "hsl(255 0% 30%)",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    userSelect: "none",
    height: "100%",
    display: "flex",
    alignItems: "center",
  };

  private browseIcon = {
    width: "20px",
    height: "20px",
    marginRight: "8px",
  };

  private fileCheckIconStyle = {
    width: "20px",
    height: "20px",
  };

  private fileNameStyle = {
    flex: "1",
    fontSize: "14px",
    fontWeight: "bold",
  };

  private fileInfoStyle = {
    padding: "12px 14px",
    flex: "1",
    fontSize: "12px",
  };

  private fileInfo = {
    padding: "0px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  };

  private errorContainerStyle = {
    width: "100%",
    backgroundColor: "hsl(0 100% 95%)",
    border: "1px solid hsl(0 100% 70%)",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "12px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  private errorTextStyle = {
    color: "hsl(0 100% 50%)",
    fontSize: "14px",
    textAlign: "center",
  };

  private errorIconStyle = {
    width: "20px",
    height: "20px",
    marginRight: "8px",
    // Make the svg icon red by applying a filter
    filter:
      "invert(24%) sepia(100%) saturate(749%) hue-rotate(0deg) brightness(95%) contrast(90%)",
  };

  private infoIconWrapper = {
    padding: "12px 14px",
    display: "flex",
    gap: "8px",
    alignItems: "center",
    fontSize: "12px",
    justifyContent: "center",
  };

  private infoIcon = {
    width: "20px",
    height: "20px",
  };

  private infoIconSpinning = {
    animation: "spin 1s linear infinite",
  };
}
