import type { Dropzone } from "../dropzone";
import type { UploadElement } from "../upload-element";

type TPresignedUrl = {
  index: number;
  uuid: string;
  url: string;
  fields: {
    "Content-Type": string;
    acl: string;
    key: string;
    policy: string;
    "x-amz-algorithm": string;
    "x-amz-credential": string;
    "x-amz-date": string;
    "x-amz-signature": string;
  };
};

export const interceptFormSubmit = (uploadElement: UploadElement) => {
  // get closest form
  const form = uploadElement.closest("form");

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Disable the submit button to prevent multiple submissions
      const submitButton = form.querySelector(
        'button[type="submit"], input[type="submit"]',
      ) as HTMLButtonElement | HTMLInputElement;
      if (submitButton) {
        submitButton.disabled = true;
      }

      const validation = uploadElement.validateFiles();
      if (validation) {
        uploadElement.setError(validation);
        if (submitButton) {
          submitButton.disabled = false;
        }
        return;
      }

      uploadElement.setStep("preparing");

      const files = uploadElement.getFiles();
      const fileMapping = files.map((file, i) => ({
        index: i,
        filename: file.name,
        content_type: file.type,
        size: file.size,
      }));

      const url = new URL(window.location.href);
      const searchParams = new URLSearchParams(url.search);
      searchParams.append(
        uploadElement.getActionName(),
        "generate_presigned_urls",
      );
      const searchParamsObj = Object.fromEntries(searchParams.entries());

      // Generate S3 pre-signed URLs for each file
      const genLinksFormData = new FormData();
      genLinksFormData.append("files", JSON.stringify(fileMapping));
      for (const [key, value] of Object.entries(searchParamsObj)) {
        genLinksFormData.append(key, value);
      }

      let genLinksResponse;

      const genLinksUrl = `${url.origin}${url.pathname}?${searchParams.toString()}`;
      try {
        genLinksResponse = await fetch(genLinksUrl, {
          method: "POST",
          body: genLinksFormData,
        }).then((res) => res.json());
      } catch (error) {
        uploadElement.setError(
          "Failed to generate pre-signed URLs. Please try again.",
        );
        if (submitButton) {
          submitButton.disabled = false;
        }
        return;
      }

      // Upload Files
      uploadElement.setStep("uploading");
      const progress: number[] = []; // Track progress for each file (0-100)
      const updateProgress = () => {
        let totalProgress = 0;
        for (let i = 0; i < progress.length; i++) {
          totalProgress += progress[i] || 0;
        }
        const overallProgress = Math.round(totalProgress / files.length);
        uploadElement.setProgress(overallProgress);
      };

      // Upload each file to S3 using the pre-signed URLs
      const filesMetadata: {
        name: string;
        uuid: string;
        size: number;
        type: string;
      }[] = [];
      try {
        await Promise.all(
          files.map((file, i) => {
            const respItem = (genLinksResponse.urls as TPresignedUrl[]).find(
              (item: any) => item.index === i,
            );
            if (!respItem) {
              throw new Error(`No pre-signed URL found for file index ${i}`);
            }

            // Configure S3 upload using XMLHttpRequest to track progress
            const formData = new FormData();
            for (const [key, value] of Object.entries(respItem.fields)) {
              formData.append(key, value);
            }
            formData.append("file", file);

            const xmlHttpRequest = new XMLHttpRequest();
            xmlHttpRequest.open("POST", respItem.url, true);
            xmlHttpRequest.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                progress[i] = Math.round((event.loaded / event.total) * 100);
                updateProgress();
              }
            };

            return new Promise((resolve, reject) => {
              xmlHttpRequest.onload = () => {
                if (xmlHttpRequest.status.toString().startsWith("2")) {
                  progress[i] = 100;
                  updateProgress();
                  filesMetadata.push({
                    name: file.name,
                    uuid: respItem.uuid,
                    size: file.size,
                    type: file.type,
                  });
                  resolve(true);
                } else {
                  reject(
                    new Error(
                      `Failed to upload file ${file.name}. Status: ${xmlHttpRequest.status}`,
                    ),
                  );
                }
              };

              xmlHttpRequest.onerror = () => {
                reject(
                  new Error(`Network error while uploading file ${file.name}`),
                );
              };

              xmlHttpRequest.send(formData);
            });
          }),
        );
      } catch (error) {
        uploadElement.setError(
          "Failed to upload files. Please check your network connection and try again.",
        );
        if (submitButton) {
          submitButton.disabled = false;
        }
        console.error("Error during file upload:", error);
        return;
      }

      // Complete
      uploadElement.setFilesMetadata(filesMetadata);
      console.log("All files uploaded successfully. Metadata:", filesMetadata);
      uploadElement.setStep("completed");
      try {
        if (uploadElement.onSubmit) {
          uploadElement.onSubmit(filesMetadata);
        } else {
          const ghostInput = uploadElement.ghostFileInput;
          form.appendChild(ghostInput);
          form.submit();
        }
      } catch (error) {
        console.error(
          "Error submitting form (the form html tag is missing attributes):",
          error,
        );
      }
    });
  }
};
