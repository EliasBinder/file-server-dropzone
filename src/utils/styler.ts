export const serializeStyles = (
  ...styles: Record<string, string>[]
): string => {
  const mergedStyles = Object.assign({}, ...styles);
  return Object.entries(mergedStyles)
    .map(([key, value]) => `${rewriteKey(key)}: ${value};`)
    .join(" ");
};

const rewriteKey = (key: string): string => {
  // Rewrite backgroundColor to background-color, etc.
  return key.replace(/([A-Z])/g, "-$1").toLowerCase();
};
