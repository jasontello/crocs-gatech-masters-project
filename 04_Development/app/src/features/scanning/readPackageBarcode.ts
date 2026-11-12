import {
  BarcodeFormat,
  BinaryBitmap,
  DecodeHintType,
  HybridBinarizer,
  MultiFormatOneDReader,
  RGBLuminanceSource,
} from "@zxing/library";

export async function readPackageBarcode(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(1, 1800 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image processing unavailable");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const gray = new Uint8ClampedArray(canvas.width * canvas.height);
    for (let i = 0; i < gray.length; i++) {
      const offset = i * 4;
      gray[i] =
        (pixels[offset] + 2 * pixels[offset + 1] + pixels[offset + 2]) / 4;
    }
    const hints = new Map<DecodeHintType, unknown>([
      [
        DecodeHintType.POSSIBLE_FORMATS,
        [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A],
      ],
      [DecodeHintType.TRY_HARDER, true],
    ]);
    const imageData = new RGBLuminanceSource(gray, canvas.width, canvas.height);
    const bitmap = new BinaryBitmap(new HybridBinarizer(imageData));
    return new MultiFormatOneDReader(hints).decode(bitmap, hints).getText();
  } finally {
    URL.revokeObjectURL(url);
  }
}
