import { supabase } from "./supabase";

/**
 * Compresses an image file to WebP format with size < 200KB
 */
export async function compressToWebP(file: File, maxDimension = 1200, targetSizeKB = 200): Promise<{ blob: Blob; dataUrl: string; sizeKB: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get 2d context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        let dataUrl = canvas.toDataURL("image/webp", quality);

        // Calculate size in KB
        let head = "data:image/webp;base64,";
        let sizeInBytes = Math.round((dataUrl.length - head.length) * 3 / 4);

        // Reduce quality if larger than target size
        while (sizeInBytes > targetSizeKB * 1024 && quality > 0.3) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/webp", quality);
          sizeInBytes = Math.round((dataUrl.length - head.length) * 3 / 4);
        }

        // Convert dataURL to Blob
        const byteString = atob(dataUrl.split(",")[1]);
        const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const sizeKB = Math.round(blob.size / 1024);

        resolve({ blob, dataUrl, sizeKB });
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Compresses an image to WebP < 200KB and uploads to Supabase Storage (bucket: 'uploads' or 'products').
 * Falls back to WebP base64 data URL if storage upload fails or bucket is unavailable.
 */
export async function uploadImageToSupabase(file: File, folder = "products"): Promise<{ url: string; sizeKB: number }> {
  const compressed = await compressToWebP(file, 1200, 200);

  if (!supabase) {
    return { url: compressed.dataUrl, sizeKB: compressed.sizeKB };
  }

  try {
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;
    
    // Attempt upload to 'uploads' bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(filename, compressed.blob, {
        contentType: "image/webp",
        upsert: true,
      });

    if (uploadError) {
      // Try fallback bucket 'public' or 'images'
      const { data: uploadData2, error: uploadError2 } = await supabase.storage
        .from("images")
        .upload(filename, compressed.blob, {
          contentType: "image/webp",
          upsert: true,
        });

      if (!uploadError2 && uploadData2) {
        const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(filename);
        if (publicUrlData?.publicUrl) {
          return { url: publicUrlData.publicUrl, sizeKB: compressed.sizeKB };
        }
      }

      // If bucket doesn't exist or isn't public, use compressed WebP base64
      return { url: compressed.dataUrl, sizeKB: compressed.sizeKB };
    }

    if (uploadData) {
      const { data: publicUrlData } = supabase.storage.from("uploads").getPublicUrl(filename);
      if (publicUrlData?.publicUrl) {
        return { url: publicUrlData.publicUrl, sizeKB: compressed.sizeKB };
      }
    }
  } catch (err) {
    console.warn("Supabase storage upload error, falling back to compressed WebP data URL:", err);
  }

  return { url: compressed.dataUrl, sizeKB: compressed.sizeKB };
}
