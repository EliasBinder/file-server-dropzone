import { serializeStyles } from "./utils/styler";
import uploadIcon from "./assets/upload.svg";
import loadingIcon from "./assets/loader-circle.svg";
import cloudUploadIcon from "./assets/cloud-upload.svg";
import checkIcon from "./assets/check.svg";
import octagonAlertIcon from "./assets/octagon-alert.svg";
import { File as UIFile } from "./file";
import { AddFile } from "./add-file";
import { serializeMimeType } from "./utils/mime-type-serializer";
import { ProgressBar } from "./progress-bar";
import { translate } from "./lang/language";
import { UploadElement } from "./upload-element";

export class Dropzone extends UploadElement {
  constructor() {
    super();
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
        <div style="${serializeStyles(
          this.containerStyle,
          this.step === "select-files" && this.files.length !== 0
            ? this.containerStyleWithFiles
            : {},
          this.step === "select-files" && this.files.length === 0
            ? this.containerStyleNoFiles
            : {},
          this.step !== "select-files" ? this.containerStyleInfo : {},
          this.dragCounter > 0 ? this.containerStyleDragging : {},
        )}" id="fs-dropzoneContainer">
          ${
            this.step === "select-files" && this.files.length === 0
              ? `
            <div style="${serializeStyles(this.imageContainerStyle, this.dragCounter > 0 ? this.imageContainerStyleDragging : {})}">
              <img src="${uploadIcon}" alt="Upload Icon" style="${serializeStyles(this.imageStyle)}" />
            </div>
            <span style="${serializeStyles(this.spanStyle)}">${translate("drag_and_drop")}</span>
            <div style="${serializeStyles(this.infoContainerStyle)}">
              <span style="${serializeStyles(this.infoNumFilesStyle, this.dragCounter > 0 ? this.infoNumFilesStyleDragging : {})}">${translate("max_files", { maxFiles: isNaN(this.config.maxFiles) ? translate("unlimited") : this.config.maxFiles.toString() })}</span>
              <span style="${serializeStyles(this.infoFileTypesStyle)}">${translate(
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
            </div>
          `
              : this.step === "preparing"
                ? `
            <style>
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            </style>
            <div style="${serializeStyles(this.imageContainerStyle)}">
              <img src="${loadingIcon}" alt="Loading Icon" style="${serializeStyles(this.imageStyle, this.imageStyleLoading)}" />
            </div>
            <span style="${serializeStyles(this.spanStyle)}">${translate("preparing")}</span>
          `
                : this.step === "uploading"
                  ? `
              <div style="${serializeStyles(this.imageContainerStyle)}">
                <img src="${cloudUploadIcon}" alt="Upload Icon" style="${serializeStyles(this.imageStyle)}" />
              </div>
              <span style="${serializeStyles(this.spanStyle)}">${translate("uploading")}</span>
            `
                  : this.step === "completed"
                    ? `
              <div style="${serializeStyles(this.imageContainerStyle)}">
                <img src="${checkIcon}" alt="Upload Icon" style="${serializeStyles(this.imageStyle)}" />
              </div>
              <span style="${serializeStyles(this.spanStyle)}">${translate("finished")}</span>
            `
                    : ""
          }
        </div>
      `;
      this.root.appendChild(this.fileInput);

      const dropzoneContainer = this.root.getElementById(
        "fs-dropzoneContainer",
      ) as HTMLDivElement;

      if (this.step === "select-files") {
        if (this.files.length !== 0) {
          for (let i = 0; i < this.files.length; i++) {
            const fileElement = new UIFile(this);
            fileElement.setAttribute("file-name", this.files[i]!.name);
            fileElement.setAttribute("mime-type", this.files[i]!.type);
            fileElement.setAttribute("index", i.toString());
            dropzoneContainer.appendChild(fileElement);
          }
          const addFileElement = new AddFile(this);
          dropzoneContainer.appendChild(addFileElement);
        } else {
          dropzoneContainer.addEventListener("click", () =>
            this.openFileDialog(),
          );
        }
        // Add event listeners
        dropzoneContainer.addEventListener("dragenter", (event) =>
          this.onDragEnter(event),
        );
        dropzoneContainer.addEventListener("dragleave", (event) =>
          this.onDragLeave(event),
        );
        dropzoneContainer.addEventListener("dragover", (event) =>
          this.onDragOver(event),
        );
        dropzoneContainer.addEventListener("drop", (event) =>
          this.onDrop(event),
        );
      } else if (this.step === "uploading") {
        // Add progress bar
        const progressBar = new ProgressBar();
        progressBar.setAttribute("progress", this.progress.toString());
        dropzoneContainer.appendChild(progressBar);
      }
    }
  }

  onDragEnter(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.dragCounter++;
    if (this.dragCounter === 1) {
      this.render();
    }
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.dragCounter--;
    if (this.dragCounter === 0) {
      this.render();
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    this.dragCounter = 0;

    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files) {
      this.onFilesChanged(event.dataTransfer.files);
    }
  }

  // Styling

  private containerStyle = {
    width: "100%",
    height: "100%",
    border: "1px solid #ccc",
    borderRadius: "8px",
    minHeight: "240px",
    fontSize: "16px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#fff",
    boxSizing: "border-box",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    transition: "border-color 0.3s, background-color 0.3s",
    overflowY: "auto",
  };

  private containerStyleInfo = {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
  };

  private containerStyleNoFiles = {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    cursor: "pointer",
  };

  private containerStyleWithFiles = {
    padding: "20px",
    gap: "16px",
    display: "inline-grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(100px, 130px))",
  };

  private containerStyleDragging = {
    borderColor: "hsl(208 100% 50%)",
    backgroundColor: "hsl(208 100% 95%)",
  };

  private imageContainerStyle = {
    backgroundColor: "hsl(208 100% 95%)",
    padding: "15px",
    borderRadius: "9999999px",
    transition: "background-color 0.3s",
    aspectRatio: "1 / 1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  private imageContainerStyleDragging = {
    backgroundColor: "hsl(208 100% 90%)",
  };

  private imageStyle = {
    width: "40px",
    height: "40px",
  };
  private imageStyleLoading = {
    animation: "spin 1s linear infinite",
  };

  private spanStyle = {
    fontSize: "18px",
    color: "#121212",
    textAlign: "center",
  };

  private infoContainerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    alignItems: "center",
  };

  private infoNumFilesStyle = {
    fontSize: "12px",
    backgroundColor: "hsl(255 0% 95%)",
    padding: "5px 10px",
    borderRadius: "9999999px",
    color: "#121212",
    textAlign: "center",
    transition: "background-color 0.3s",
  };
  private infoNumFilesStyleDragging = {
    backgroundColor: "hsl(208 100% 90%)",
  };

  private infoFileTypesStyle = {
    fontSize: "12px",
    color: "#121212",
    textAlign: "center",
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
}
