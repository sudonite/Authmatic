import jsQR from "jsqr";
import qrcode from "qrcode-generator";
import { browser } from "wxt/browser";

const QR_SCALE = 8;
const QR_MARGIN = 4;

export async function downloadQRCodePng(value: string, filename = "qrcode.png"): Promise<void> {
    const qr = qrcode(0, "M");
    qr.addData(value);
    qr.make();

    const moduleCount = qr.getModuleCount();
    const size = (moduleCount + QR_MARGIN * 2) * QR_SCALE;

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("Failed to process the image.");
    }

    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, size, size);
    context.fillStyle = "#000000";

    for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
            if (qr.isDark(row, col)) {
                context.fillRect(
                    (col + QR_MARGIN) * QR_SCALE,
                    (row + QR_MARGIN) * QR_SCALE,
                    QR_SCALE,
                    QR_SCALE,
                );
            }
        }
    }

    const dataUrl = canvas.toDataURL("image/png");

    await browser.downloads.download({
        url: dataUrl,
        filename,
        saveAs: true,
    });
}

export async function readQRCode(file: Blob): Promise<string> {
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
