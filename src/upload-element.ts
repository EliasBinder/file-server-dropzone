import { translate } from "./lang/language";
import type { TAcceptedFileType, TStep } from "./types";
import { interceptFormSubmit } from "./utils/form-submitter";
import { findAcceptedFileType } from "./utils/mime-type-serializer";

export class UploadElement extends HTMLElement {
  protected root: ShadowRoot | null = null;
  protected step: TStep = "select-files";
  protected dragCounter = 0;

  protected progress = 0;
  protected error = null as string | null;

  protected files = [] as File[];
  protected fileInput = document.createElement("input");

  public ghostFileInput = document.createElement("input");
  protected filesMetadata: {
    name: string;
    uuid: string;
    type: string;
    size: number;
  }[] = [];

  public config = {
    maxFiles: NaN,
    minFiles: 0,
    acceptedFileTypes: [] as TAcceptedFileType[],
    actionName: "Action",
    inputName: "files",
  };

  public onSubmit:
    | ((
        metadata: {
          name: string;
          uuid: string;
          size: number;
          type: string;
        }[],
      ) => void)
    | null = null;

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
    interceptFormSubmit(this);
  }

  public render() {}

  // Utils

  openFileDialog() {
    this.fileInput.click();
  }

  onFilesChanged(files: FileList) {
    // Enforce max files limit
    if (
      !isNaN(this.config.maxFiles) &&
      this.files.length + files.length > this.config.maxFiles
    ) {
      if (this.config.maxFiles === 1) {
        // Delete existing file and add the new one
        this.files = [files[0]!];
      } else {
        alert(
          translate("error_max_files_exceeded", {
            maxFiles: this.config.maxFiles.toString(),
          }),
        );
        return this.render();
      }
    }

    // Enforce accepted file types
    if (this.config.acceptedFileTypes.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const acceptedFileType = findAcceptedFileType(
          files[i]!.type,
          this.config.acceptedFileTypes,
        );
        if (!acceptedFileType) {
          alert(
            translate("error_type_not_accepted", {
              fileName: files[i]!.name,
            }),
          );
          return this.render();
        } else {
          // Check file size
          const fileSizeLimit = acceptedFileType.limit
            ? acceptedFileType.limit * 1024 * 1024
            : Infinity;
          if (files[i]!.size > fileSizeLimit) {
            alert(
              translate("error_file_too_large", {
                fileName: files[i]!.name,
                limit: acceptedFileType.limit!.toString(),
                size: (fileSizeLimit / (1024 * 1024)).toString(),
              }),
            );
            return this.render();
          }
        }
      }
    }

    // Add new files to the list
    for (let i = 0; i < files.length; i++) {
      this.files.push(files[i]!);
    }

    // Clear file input to allow re-selection of the same files if needed
    this.fileInput.value = "";

    this.render();
  }

  public removeFile(index: number) {
    this.files.splice(index, 1);

    this.render();
  }

  public getFiles() {
    return this.files;
  }

  public validateFiles() {
    if (this.files.length < this.config.minFiles) {
      return translate("error_min_files_not_met", {
        minFiles: this.config.minFiles.toString(),
      });
    }

    if (
      !isNaN(this.config.maxFiles) &&
      this.files.length > this.config.maxFiles
    ) {
      return translate("error_max_files_exceeded", {
        maxFiles: this.config.maxFiles.toString(),
      });
    }

    if (this.config.acceptedFileTypes.length > 0) {
      for (let i = 0; i < this.files.length; i++) {
        const acceptedFileType = findAcceptedFileType(
          this.files[i]!.type,
          this.config.acceptedFileTypes,
        );
        if (!acceptedFileType) {
          return translate("error_type_not_accepted", {
            fileName: this.files[i]!.name,
          });
        } else {
          // Check file size
          const fileSizeLimit = acceptedFileType.limit
            ? acceptedFileType.limit * 1024 * 1024
            : Infinity;
          if (this.files[i]!.size > fileSizeLimit) {
            return translate("error_file_too_large", {
              fileName: this.files[i]!.name,
              limit: acceptedFileType.limit!.toString(),
              size: (fileSizeLimit / (1024 * 1024)).toString(),
            });
          }
        }
      }
    }

    return null;
  }

  public getActionName() {
    return this.config.actionName;
  }

  public setStep(step: TStep) {
    this.step = step;
    this.render();
  }

  public setProgress(progress: number) {
    this.progress = progress;
    this.render();
  }

  public setError(error: string) {
    this.error = error;
    this.step = "select-files";
    this.render();
  }

  public setFilesMetadata(
    filesMetadata: { name: string; uuid: string; type: string; size: number }[],
  ) {
    this.filesMetadata = filesMetadata;
    this.ghostFileInput.type = "hidden";
    this.ghostFileInput.name = this.config.inputName;
    this.ghostFileInput.value = JSON.stringify(this.filesMetadata);
  }
}
