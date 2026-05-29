import type { Dropzone, TStep } from "./dropzone";
import { interceptFormSubmit } from "./utils/form-submitter";

export class FileInput extends HTMLElement {
  private root: ShadowRoot | null = null;
  private step: TStep = "select-files";

  private progress = 0;
  private error = null as string | null;

  private files = [] as File[];
  private fileInput = document.createElement("input");

  private ghostFileInput = document.createElement("input");
  private filesMetadata: {
    name: string;
    uuid: string;
    type: string;
    size: number;
  }[] = [];

  private config = {
    maxFiles: NaN,
    minFiles: 0,
    acceptedFileTypes: [] as TAcceptedFileType[],
    actionName: "Action",
    inputName: "files",
  };

  constructor() {
    super();

    this.root = this.attachShadow({ mode: "open" });

    // Listen for file selection
    this.fileInput.addEventListener("change", () => {
      if (this.fileInput.files) {
        this.onFilesChanged(this.fileInput.files);
      }
    });
  }

  connectedCallback() {
    if (this.hasAttribute("max-files")) {
      this.config.maxFiles = parseInt(
        this.getAttribute("max-files") || "NaN",
        10,
      );
    }

    if (this.hasAttribute("min-files")) {
      this.config.minFiles = parseInt(
        this.getAttribute("min-files") || "0",
        10,
      );
    }

    if (this.hasAttribute("accepted-file-types")) {
      const types = this.getAttribute("accepted-file-types");
      const typesJson = types ? JSON.parse(types) : [];
      if (Array.isArray(typesJson)) {
        this.config.acceptedFileTypes = typesJson;
      } else {
        console.warn(
          "[FileServer Dropzone] Invalid format for accepted-file-types attribute. Expected a JSON array of objects with type and limit? properties.",
        );
      }
    }

    if (this.hasAttribute("action-name")) {
      this.config.actionName = this.getAttribute("action-name") || "Action";
    }

    if (this.hasAttribute("input-name")) {
      this.config.inputName = this.getAttribute("input-name") || "files";
    }

    // Configure file input
    this.fileInput.type = "file";
    if (!isNaN(this.config.maxFiles)) {
      this.fileInput.multiple = this.config.maxFiles > 1;
    } else {
      this.fileInput.multiple = true;
    }
    if (this.config.acceptedFileTypes.length > 0) {
      this.fileInput.accept = this.config.acceptedFileTypes.join(",");
    } else {
      this.fileInput.accept = "*/*";
    }
    this.fileInput.style.display = "none"; // Hide the file input

    this.render();

    // Upload files using JS, delay form submission until uploads are completed
    interceptFormSubmit(this as unknown as Dropzone); //TODO: This is a bit hacky, we should find a better way to do this
  }

  render() {
    if (this.root) {
      this.root.innerHTML = `
        `;
    }
  }
}
