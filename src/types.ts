export type TStep = "select-files" | "preparing" | "uploading" | "completed";
export type TAcceptedFileType = {
  type: string;
  limit?: number;
};
