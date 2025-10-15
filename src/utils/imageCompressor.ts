import imageCompression from 'browser-image-compression';

interface CompressOptions {
  maxSizeMB: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

/**
 * Kompres gambar menggunakan browser-image-compression.
 * @param imageFile File gambar yang akan dikompres.
 * @param options Opsi kompresi.
 * @returns Promise yang resolve dengan File gambar yang sudah dikompres.
 */
export const compressImage = async (
  imageFile: File,
  options: CompressOptions
): Promise<File> => {
  console.log(
    `[Kompresi Gambar] Ukuran file asli: ${(
      imageFile.size /
      1024 /
      1024
    ).toFixed(2)} MB`
  );

  const compressionOptions = {
    maxSizeMB: options.maxSizeMB,
    maxWidthOrHeight: options.maxWidthOrHeight || 1920, // Resolusi maksimum default
    useWebWorker:
      options.useWebWorker === undefined ? true : options.useWebWorker,
    initialQuality: 0.8,
    preserveExif: false,
    onProgress: (p: number) => {
      console.log(`[Kompresi Gambar] Progres: ${p}%`);
    },
  };

  try {
    const compressedFile = await imageCompression(
      imageFile,
      compressionOptions
    );
    console.log(
      `[Kompresi Gambar] Ukuran file terkompresi: ${(
        compressedFile.size /
        1024 /
        1024
      ).toFixed(2)} MB`
    );
    return compressedFile;
  } catch (error) {
    console.error('[Kompresi Gambar] Gagal melakukan kompresi:', error);
    // Kembalikan file asli jika kompresi gagal
    return imageFile;
  }
};
