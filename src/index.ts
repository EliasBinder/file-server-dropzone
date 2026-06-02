import { AddFile } from "./add-file";
import { Dropzone } from "./dropzone";
import { File } from "./file";
import { FileInput } from "./file-input";
import { ProgressBar } from "./progress-bar";

// Register custom elements
window.customElements.define("fs-file", File);
window.customElements.define("fs-add-file", AddFile);
window.customElements.define("fs-progress-bar", ProgressBar);
window.customElements.define("fs-dropzone", Dropzone);
window.customElements.define("fs-fileinput", FileInput);

// Export the Dropzone class for external use
export { Dropzone, FileInput };
