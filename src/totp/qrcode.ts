import jsQR from "jsqr";

export async function readQrCode(file: Blob): Promise<string> {
    let bitmap: ImageBitmap | undefined;

    try {
        bitmap = await createImageBitmap(file);

        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;

        const context = canvas.getContext("2d", {
            willReadFrequently: true,
        });

        if (!context) {
            throw new Error("Failed to process the image.");
        }

        context.drawImage(bitmap, 0, 0);

        const imageData = context.getImageData(
            0,
            0,
            bitmap.width,
            bitmap.height,
        );

        const result = jsQR(
            imageData.data,
            imageData.width,
            imageData.height,
        );

        if (!result) {
            throw new Error("No readable QR code was found in the image.");
        }

        return result.data;
    } finally {
        bitmap?.close();
    }
}