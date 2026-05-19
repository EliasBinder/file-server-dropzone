import type { TAcceptedFileType } from "../dropzone";

export const serializeMimeType = (
  acceptedFileType: TAcceptedFileType,
): string => {
  const mimeType = acceptedFileType.type;
  let description = "";
  if (mimeType.includes("/")) {
    const left = mimeType.split("/")[0]!;
    const right = mimeType.split("/")[1]!;

    if (left === "*" && right === "*") {
      description = "Alle Dateien";
    } else if (left === "*") {
      description = right;
    } else if (right === "*") {
      description = left + "s";
    } else {
      description = right;
    }
  }

  const limit = acceptedFileType.limit
    ? ` (max. ${acceptedFileType.limit} MB)`
    : "";
  if (description) {
    return description + limit;
  }
  return mimeType + limit;
};

export const findAcceptedFileType = (
  fileType: string,
  acceptedFileTypes: TAcceptedFileType[],
) => {
  for (const acceptedType of acceptedFileTypes) {
    const mimeType = acceptedType.type;
    if (mimeType.includes("/")) {
      const [acceptedLeft, acceptedRight] = mimeType.split("/");
      const [fileLeft, fileRight] = fileType.split("/");

      if (
        (acceptedLeft === "*" || acceptedLeft === fileLeft) &&
        (acceptedRight === "*" || acceptedRight === fileRight)
      ) {
        return acceptedType;
      }
    } else if (mimeType === fileType) {
      return acceptedType;
    }
  }
  return null;
};
