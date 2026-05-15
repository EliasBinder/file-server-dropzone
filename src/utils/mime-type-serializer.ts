export const serializeMimeType = (mimeType: string): string => {
  if (mimeType.includes("/")) {
    const left = mimeType.split("/")[0]!;
    const right = mimeType.split("/")[1]!;

    if (left === "*" && right === "*") {
      return "Alle Dateien";
    } else if (left === "*") {
      return right;
    } else if (right === "*") {
      return left + "s";
    } else {
      return right;
    }
  }
  return mimeType;
};

export const isMimeTypeAccepted = (
  fileType: string,
  acceptedFileTypes: string[],
): boolean => {
  for (const acceptedType of acceptedFileTypes) {
    if (acceptedType.includes("/")) {
      const [acceptedLeft, acceptedRight] = acceptedType.split("/");
      const [fileLeft, fileRight] = fileType.split("/");

      if (
        (acceptedLeft === "*" || acceptedLeft === fileLeft) &&
        (acceptedRight === "*" || acceptedRight === fileRight)
      ) {
        return true;
      }
    } else if (acceptedType === fileType) {
      return true;
    }
  }
  return false;
};
