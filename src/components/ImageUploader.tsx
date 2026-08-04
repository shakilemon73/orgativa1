import { useState, useRef } from "react";
import { uploadImageToSupabase } from "@/lib/imageUpload";
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle } from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  folder?: string;
  required?: boolean;
}

const P = "#2D5A27";

export default function ImageUploader({
  value,
  onChange,
  label,
  placeholder = "https://... or upload image",
  folder = "uploads",
  required = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [sizeInfo, setSizeInfo] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    setUploading(true);
    try {
      const res = await uploadImageToSupabase(file, folder);
      onChange(res.url);
      setSizeInfo(res.sizeKB);
    } catch (err) {
      console.error("Failed to upload image:", err);
      alert("Failed to process or upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B726A", fontFamily: "'Inter',sans-serif" }}>
          {label}{required && <span style={{ color: "#DC2626" }}> *</span>}
        </label>
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <input
            type="text"
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              onChange(e.target.value);
              setSizeInfo(null);
            }}
            style={{
              width: "100%",
              border: "1.5px solid #E5EFE2",
              borderRadius: 12,
              padding: "11px 14px",
              fontSize: 13,
              fontFamily: "'Inter',sans-serif",
              color: "#1F2937",
              outline: "none",
              boxSizing: "border-box",
              backgroundColor: "#FAFBF9",
            }}
          />
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: "none" }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "11px 16px",
            borderRadius: 12,
            border: `1.5px solid ${P}`,
            backgroundColor: uploading ? "#F4F7F3" : P,
            color: uploading ? P : "#fff",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'Inter',sans-serif",
            cursor: uploading ? "wait" : "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.2s",
            boxShadow: uploading ? "none" : "0 2px 8px rgba(45,90,39,0.15)",
          }}
        >
          {uploading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Compressing WebP...</span>
            </>
          ) : (
            <>
              <Upload size={15} />
              <span>Upload WebP Image</span>
            </>
          )}
        </button>
      </div>

      {/* Drag & Drop zone / Preview */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: dragOver ? `2px dashed ${P}` : "1.5px dashed #D1E3CF",
          borderRadius: 14,
          backgroundColor: dragOver ? "#F4F7F3" : "#FAFBF9",
          padding: value ? "12px" : "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          transition: "all 0.2s",
        }}
      >
        {value ? (
          <div style={{ display: "flex", alignItems: "center", gap: 14, width: "100%" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 10,
                border: "1px solid #E5EFE2",
                backgroundColor: "#fff",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <img
                src={value}
                alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>

            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <CheckCircle size={13} style={{ color: P }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: P, fontFamily: "'Inter',sans-serif" }}>
                  Image Loaded
                </span>
                {sizeInfo && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      backgroundColor: "#EBF3EA",
                      color: P,
                      padding: "2px 8px",
                      borderRadius: 10,
                      border: "1px solid #D1E3CF",
                    }}
                  >
                    WebP • {sizeInfo} KB (&lt;200KB)
                  </span>
                )}
              </div>
              <p
                style={{
                  fontSize: 11,
                  color: "#6B726A",
                  fontFamily: "'Inter',sans-serif",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {value}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onChange("");
                setSizeInfo(null);
              }}
              style={{
                border: "none",
                background: "none",
                color: "#EF4444",
                cursor: "pointer",
                padding: 6,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div style={{ textAlign: "center", width: "100%", color: "#8B9E88", fontSize: 12, fontFamily: "'Inter',sans-serif" }}>
            <ImageIcon size={20} style={{ color: "#8B9E88", marginBottom: 4 }} />
            <p style={{ margin: 0 }}>Drag and drop an image file here, or click <strong>Upload WebP Image</strong> above</p>
            <span style={{ fontSize: 10, color: "#9CA3AF" }}>Auto-converts to optimized WebP format under 200KB</span>
          </div>
        )}
      </div>
    </div>
  );
}
