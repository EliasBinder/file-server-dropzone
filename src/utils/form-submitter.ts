import type { Dropzone } from "../dropzone";

export const interceptFormSubmit = (dropzone: Dropzone) => {
  // get closest form
  const form = dropzone.closest("form");

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

      const validation = dropzone.validateFiles();
      if (validation) {
        dropzone.setError(validation);
        if (submitButton) {
          submitButton.disabled = false;
        }
        return;
      }

      dropzone.setStep("preparing");

      const files = dropzone.getFiles();
      const fileMapping = files.map((file, i) => ({
        index: i,
        filename: file.name,
        content_type: file.type,
        size: file.size,
      }));

      const url = new URL(window.location.href);
      const searchParams = new URLSearchParams(url.search);
      searchParams.append(dropzone.getActionName(), "generate_presigned_urls");
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
        dropzone.setError(
          "Failed to generate pre-signed URLs. Please try again.",
        );
        if (submitButton) {
          submitButton.disabled = false;
        }
        return;
      }

      // Upload Files
      dropzone.setStep("uploading");
      const progress: number[] = []; // Track progress for each file (0-100)
      const updateProgress = () => {
        let totalProgress = 0;
        for (let i = 0; i < progress.length; i++) {
          totalProgress += progress[i] || 0;
        }
        const overallProgress = Math.round(totalProgress / files.length);
        dropzone.setProgress(overallProgress);
      };

      // Upload each file to S3 using the pre-signed URLs
      try {
        await Promise.all(
          files.map((file, i) => {
            const url = genLinksResponse.urls.find(
              (item: any) => item.index === i,
            )?.url;
            if (!url) {
              throw new Error(`No pre-signed URL found for file index ${i}`);
            }
            const xmlHttpRequest = new XMLHttpRequest();
            xmlHttpRequest.open("PUT", url, true);
            xmlHttpRequest.setRequestHeader("Content-Type", file.type);
            xmlHttpRequest.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                progress[i] = Math.round((event.loaded / event.total) * 100);
                updateProgress();
              }
            };

            return new Promise((resolve, reject) => {
              xmlHttpRequest.onload = () => {
                if (xmlHttpRequest.status === 200) {
                  progress[i] = 100;
                  updateProgress();
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

              xmlHttpRequest.send(file);
            });
          }),
        );
      } catch (error) {
        dropzone.setError(
          "Failed to upload files. Please check your network connection and try again.",
        );
        if (submitButton) {
          submitButton.disabled = false;
        }
        return;
      }

      // Complete
      dropzone.setStep("completed");
      setTimeout(() => form.submit(), 1000);
    });
  }
};
