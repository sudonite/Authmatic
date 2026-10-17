<script lang="ts">
  import {
    Check,
    ChevronRight,
    ImageOff,
    ImageUp,
    ScanLine,
    X,
  } from "@lucide/svelte";
  import { extractSecretFromQRCode } from "@/services/totp-service";

  let qrFile = $state<File | null>(null);
  let isProcessing = $state(false);

  interface Props {
    handleSubmit: (secretKey: string) => void;
  }

  let { handleSubmit }: Props = $props();

  const QR_MIN_SIZE = 128; // Minimum image width and height in pixels
  const QR_MAX_BYTES = 8 * 1024 * 1024; // 8 MB file size limit

  type QrError = {
    title: string;
    message: string;
    imageFailed: boolean;
  };

  let isDragging = $state(false);

  let qrPreviewUrl = $state("");
  let qrFileName = $state("");
  let qrError = $state<QrError | null>(null);
  let fileInput = $state<HTMLInputElement | null>(null);

  const loadQrFile = (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      qrError = {
        title: "Unsupported file type",
        message:
          "That file isn't an image. Select a PNG or JPG screenshot of the QR code shown by your service or authenticator app.",
        imageFailed: false,
      };
      return;
    }

    if (file.size > QR_MAX_BYTES) {
      qrError = {
        title: "File too large",
        message:
          "The image exceeds the 8 MB limit. Export a smaller copy of the screenshot and try again.",
        imageFailed: false,
      };
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      if (img.naturalWidth < QR_MIN_SIZE || img.naturalHeight < QR_MIN_SIZE) {
        URL.revokeObjectURL(url);
        qrError = {
          title: "Resolution too low",
          message: `The image is ${img.naturalWidth}×${img.naturalHeight} px — below the ${QR_MIN_SIZE}×${QR_MIN_SIZE} px minimum. Use the original screenshot instead of a thumbnail.`,
          imageFailed: false,
        };
        return;
      }

      if (qrPreviewUrl) URL.revokeObjectURL(qrPreviewUrl);

      qrPreviewUrl = url;
      qrFileName = file.name;
      qrError = null;
      qrFile = file;
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      qrError = {
        title: "Image can't be opened",
        message:
          "The file looks like an image but couldn't be decoded. It may be corrupted — try exporting or saving it again.",
        imageFailed: false,
      };
    };

    img.src = url;
  };

  const resetQrImage = () => {
    if (qrPreviewUrl) URL.revokeObjectURL(qrPreviewUrl);

    qrPreviewUrl = "";
    qrFileName = "";
    qrError = null;
    qrFile = null;
  };

  const handleQrDrop = (e: DragEvent) => {
    e.preventDefault();
    isDragging = false;
    loadQrFile(e.dataTransfer?.files?.[0]);
  };

  const handleQrFileChange = (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    loadQrFile(input.files?.[0]);
    input.value = "";
  };

  const handleContinue = async () => {
    if (!qrFile || isProcessing) return;

    isProcessing = true;
    qrError = null;

    try {
      const secret = await extractSecretFromQRCode(qrFile);
      handleSubmit(secret);
    } catch (error) {
      qrError = {
        title: "QR code not recognized",
        message:
          error instanceof Error
            ? error.message
            : "No valid OTP URI or migration data was found in the image.",
        imageFailed: true,
      };
    } finally {
      isProcessing = false;
    }
  };
</script>

<div class="flex flex-1 flex-col justify-center">
  {#if qrError}
    <div
      class="flex flex-1 flex-col items-center justify-center gap-4 text-center"
      role="alert"
    >
      <div
        class="flex h-16 w-16 items-center justify-center rounded-2xl border border-error/40 bg-error/10 text-error"
      >
        {#if qrError.imageFailed}
          <ScanLine size={30} />
        {:else}
          <ImageOff size={30} />
        {/if}
      </div>

      <div class="max-w-68">
        <p class="text-sm font-bold">{qrError.title}</p>
        <p class="mt-1.5 text-xs leading-relaxed text-base-content/60">
          {qrError.message}
        </p>
      </div>

      {#if qrError.imageFailed && qrPreviewUrl}
        <div
          class="flex items-center gap-2.5 rounded-lg border border-base-300 bg-base-200/60 p-2"
        >
          <img
            src={qrPreviewUrl}
            alt="Failed QR code upload"
            class="h-10 w-10 rounded-md border border-error/30 object-cover grayscale"
          />
          <div class="min-w-0 text-left">
            <p class="truncate text-xs font-semibold">{qrFileName}</p>
            <p class="font-mono text-[10px] text-base-content/50">
              Could not be read
            </p>
          </div>
        </div>
      {/if}

      <button
        class="btn btn-error btn-sm w-full max-w-68"
        onclick={resetQrImage}
      >
        <ImageUp size={15} />
        Upload a different image
      </button>
    </div>
  {:else if qrPreviewUrl}
    <div class="flex flex-1 flex-col items-center text-center">
      <div
        class="relative overflow-hidden rounded-2xl border border-success/40 bg-base-300 shadow-lg"
      >
        <img
          src={qrPreviewUrl}
          alt="Uploaded QR code"
          class="h-40 w-40 object-cover"
        />

        <div class="pointer-events-none absolute inset-0 scan-sweep"></div>

        <span
          class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-success text-success-content shadow"
        >
          <Check size={14} />
        </span>
      </div>

      <p class="mt-3 text-sm font-semibold">QR Code Ready</p>

      <p class="mt-1 max-w-[16rem] truncate text-xs text-base-content/60">
        {qrFileName}
      </p>

      <div class="mt-auto flex w-full items-center gap-2 pt-4">
        <button class="btn btn-soft btn-sm flex-1" onclick={resetQrImage}>
          <X size={16} />
          Remove
        </button>

        <button
          class="btn btn-primary btn-sm flex-1"
          onclick={handleContinue}
          disabled={isProcessing}
        >
          {#if isProcessing}
            Processing...
          {:else}
            Continue
            <ChevronRight size={16} />
          {/if}
        </button>
      </div>
    </div>
  {:else}
    <button
      type="button"
      class="group flex flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-primary {isDragging
        ? 'border-primary bg-primary/10'
        : 'border-base-300 bg-base-200/60'}"
      onclick={() => fileInput?.click()}
      ondragover={(e) => {
        e.preventDefault();
        isDragging = true;
      }}
      ondragleave={() => (isDragging = false)}
      ondrop={handleQrDrop}
    >
      <span
        class="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary/25 to-primary/5 text-primary transition-transform duration-200 group-hover:scale-105"
      >
        <ImageUp size={30} />
      </span>

      <span class="text-sm font-semibold">
        Drop an image here or click to browse
      </span>

      <span class="text-[11px] text-base-content/50">
        PNG or JPG, up to 8 MB
      </span>

      <span class="mt-auto text-[11px] text-base-content/60">
        Upload a QR code image from your authenticator app
      </span>
    </button>
  {/if}

  <input
    type="file"
    accept="image/*"
    class="hidden"
    bind:this={fileInput}
    onchange={handleQrFileChange}
  />
</div>
