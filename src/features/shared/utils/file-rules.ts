export interface FileRules {
  // What the file picker shows. It is only a filter: the user can still pick
  // "All files", so checkFile below is what actually enforces the rules.
  pickerAccept: string;
  extensions: string[];
  // When set, the file's real type must also match. Left empty for documents,
  // because browsers do not always report a type for Word files.
  mimeTypes: string[];
  maxSizeMb: number;
  description: string; // used in messages, e.g. "JPG, PNG or WEBP image"
}

export const IMAGE_RULES: FileRules = {
  pickerAccept: "image/*", // the picker shows "Image files"
  extensions: [".jpg", ".jpeg", ".png", ".webp"],
  mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  maxSizeMb: 1,
  description: "JPG, PNG or WEBP image",
};

export const DOCUMENT_RULES: FileRules = {
  pickerAccept: ".pdf,.doc,.docx",
  extensions: [".pdf", ".doc", ".docx"],
  mimeTypes: [],
  maxSizeMb: 10,
  description: "PDF or Word document",
};

// Returns an error message, or null when the file is allowed.
export const checkFile = (file: File, rules: FileRules): string | null => {
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const hasAllowedExtension = rules.extensions.includes(extension);
  const hasAllowedType =
    rules.mimeTypes.length === 0 || rules.mimeTypes.includes(file.type);

  if (!hasAllowedExtension || !hasAllowedType) {
    return `Please choose a ${rules.description}`;
  }

  if (file.size > rules.maxSizeMb * 1024 * 1024) {
    return `File is too large. The maximum size is ${rules.maxSizeMb} MB`;
  }

  return null;
};

// For files uploaded before this session, the name is the last part of the URL.
export const fileNameFromUrl = (url: string) =>
  decodeURIComponent(url.split("/").pop()?.split("?")[0] || url);
