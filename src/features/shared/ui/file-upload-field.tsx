import { useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { acceptedTypes, checkFile, type FileRules } from "../utils/file-rules";
import { uploadFile, type UploadedFile } from "../actions/upload-file";

interface FileUploadFieldProps {
  label: string;
  rules: FileRules;
  value: UploadedFile | null;
  onChange: (file: UploadedFile | null) => void;
  error?: string; // a message from the form's own validation, e.g. "required"
  showImagePreview?: boolean;
  testId: string;
}

export const FileUploadField = ({
  label,
  rules,
  value,
  onChange,
  error,
  showImagePreview = false,
  testId,
}: FileUploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be chosen again after an error
    if (!file) return;

    const problem = checkFile(file, rules);
    if (problem) {
      setUploadError(problem);
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    try {
      onChange(await uploadFile(file));
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Upload failed. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const message = uploadError || error;

  return (
    <div className="space-y-2">
      <label
        htmlFor={testId}
        className="text-[10px] font-bold tracking-widest text-gray-700 uppercase"
      >
        {label}
      </label>
      <input
        id={testId}
        ref={inputRef}
        type="file"
        accept={acceptedTypes(rules)}
        onChange={handleFileChosen}
        className="hidden"
        data-testid={`${testId}-input`}
      />

      {value ? (
        <div
          className="flex items-center gap-4 border border-gray-200 p-3"
          data-testid={`${testId}-selected`}
        >
          {showImagePreview ? (
            <img
              src={value.url}
              alt={value.name}
              className="w-16 h-16 object-cover"
            />
          ) : (
            <FileText className="w-5 h-5 text-gray-400 shrink-0" />
          )}
          <span
            className="flex-1 text-sm text-gray-900 truncate"
            data-testid={`${testId}-file-name`}
          >
            {value.name}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label={`Remove ${label}`}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            data-testid={`${testId}-remove`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={`w-full border border-dashed ${message ? "border-primary" : "border-gray-300"} p-6 flex flex-col items-center gap-2 text-gray-500 hover:border-gray-900 transition-colors disabled:opacity-60`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span
                className="text-[10px] font-bold tracking-widest uppercase"
                data-testid={`${testId}-uploading`}
              >
                Uploading...
              </span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-widest uppercase">
                Choose file
              </span>
              <span className="text-[10px] text-gray-400">
                {rules.description}, up to {rules.maxSizeMb} MB
              </span>
            </>
          )}
        </button>
      )}

      {message && (
        <p
          className="text-[10px] text-primary font-bold"
          data-testid={`${testId}-error`}
        >
          {message}
        </p>
      )}
    </div>
  );
};
