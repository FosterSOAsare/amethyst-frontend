const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export interface UploadedFile {
  url: string;
  name: string;
}

// Uploads a file straight from the browser to Cloudinary (the API on Vercel
// cannot receive file uploads) and returns the file's public URL.
export const uploadFile = async (file: File): Promise<UploadedFile> => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("File uploads are not configured.");
  }

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", UPLOAD_PRESET);

  // "auto" stores images as images and documents (PDF, Word) as raw files.
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    { method: "POST", body },
  );

  if (!response.ok) {
    throw new Error("Upload failed. Please try again.");
  }

  const data = await response.json();
  return { url: data.secure_url, name: file.name };
};
