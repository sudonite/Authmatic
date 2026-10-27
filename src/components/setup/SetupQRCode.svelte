<script lang="ts">
  import { onMount } from "svelte";
  import { ImageOff, ImageUp, ScanLine } from "@lucide/svelte";
  import { extractSecretFromQRCode } from "@/services/totp-service";
  import { dataUrlToFile, readImageAsDataUrl } from "@/totp/qrcode";
  import {
    clearSetupQrImage,
    loadSetupQrImage,
    saveSetupQrImage,
  } from "@/state/user-state.svelte";
  import type { StoredQrImage } from "@/state/user-state.svelte";

  interface Props {
    handleSubmit: (secretKey: string) => void;
  }

  let { handleSubmit }: Props = $props();

  const QR_MAX_BYTES = 8 * 1024 * 1024;

  type QrError = {
    title: string;
    message: string;
  };

  let isDragging = $state(false);
  let isProcessing = $state(false);
  let qrError = $state<QrError | null>(null);
  let fileInput = $state<HTMLInputElement | null>(null);

  function validateQrFile(file: File): QrError | null {
    if (!file.type.startsWith("image/")) {
      return {
        title: "Unsupported file type",
        message: "Please select a PNG or JPG image containing your QR code.",
      };
    }

    if (file.size > QR_MAX_BYTES) {
      return {
        title: "File too large",
        message: "The image must be smaller than 8 MB.",
      };
    }

    return null;
  }

  function forgetStoredImage(): void {
    void clearSetupQrImage().catch(() => undefined);
  }

  async function persistImageForRecovery(file: File): Promise<void> {
    // Best effort: session storage has a size quota (~10 MB, less after
    // base64 encoding), so a failed save must not block the normal flow.
    try {
      await saveSetupQrImage({
        name: file.name,
        dataUrl: await readImageAsDataUrl(file),
      });
    } catch {
      // Continue without recovery support.
    }
  }

  async function processQrFile(
    file: File,
    options: { persistForRecovery: boolean },
  ): Promise<void> {
    if (isProcessing) return;

    const validationError = validateQrFile(file);

    if (validationError) {
      qrError = validationError;
      return;
    }

    isProcessing = true;

    try {
      // Save before processing: the popup can be destroyed at any moment
      // (e.g. by the OS file picker), and reopening must be able to restore
      // the image from session storage.
      if (options.persistForRecovery) {
        await persistImageForRecovery(file);
      }

      const secret = await extractSecretFromQRCode(file);

      // Processing succeeded: the temporary stored copy is no longer needed.
      await clearSetupQrImage().catch(() => undefined);

      handleSubmit(secret);
    } catch (error) {
      qrError = {
        title: "QR code not recognized",
        message:
          error instanceof Error
            ? error.message
            : "Could not read a valid OTP QR code from this image.",
      };

      // Deterministic failures would replay identically on every reopen.
      forgetStoredImage();
    } finally {
      isProcessing = false;
    }
  }

  async function handleQrFile(file: File | undefined): Promise<void> {
    if (!file || isProcessing) return;

    qrError = null;
    await processQrFile(file, { persistForRecovery: true });
  }

  async function restoreStoredImage(): Promise<void> {
    let stored: StoredQrImage | null = null;

    try {
      stored = await loadSetupQrImage();
    } catch {
      return;
    }

    if (!stored) return;

    try {
      const file = await dataUrlToFile(stored.dataUrl, stored.name);
      await processQrFile(file, { persistForRecovery: false });
    } catch {
      // Unreadable stored data: drop it so the screen stays usable.
      forgetStoredImage();
    }
  }

  onMount(() => {
    void restoreStoredImage();
  });

  function handleQrFileChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];

    input.value = "";

    void handleQrFile(file);
  }

  function handleQrDrop(event: DragEvent) {
    event.preventDefault();
    isDragging = false;

    void handleQrFile(event.dataTransfer?.files?.[0]);
  }

  function openFilePicker() {
    if (!isProcessing) {
      fileInput?.click();
    }
  }
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
        <ImageOff size={30} />
      </div>

      <div class="max-w-68">
        <p class="text-sm font-bold">{qrError.title}</p>
        <p class="mt-1.5 text-xs leading-relaxed text-base-content/60">
          {qrError.message}
        </p>
      </div>

      <button
        type="button"
        class="btn btn-primary btn-sm w-full max-w-68"
        onclick={() => {
          qrError = null;
          openFilePicker();
        }}
        disabled={isProcessing}
      >
        <ImageUp size={15} />
        Upload another image
      </button>
    </div>
  {:else}
    <button
      type="button"
      class="group flex flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-primary {isDragging
        ? 'border-primary bg-primary/10'
        : 'border-base-300 bg-base-200/60'}"
      onclick={openFilePicker}
      ondragover={(event) => {
        event.preventDefault();
        isDragging = true;
      }}
      ondragleave={() => {
        isDragging = false;
      }}
      ondrop={handleQrDrop}
      disabled={isProcessing}
    >
      <span
        class="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary/25 to-primary/5 text-primary transition-transform duration-200 group-hover:scale-105"
      >
        {#if isProcessing}
          <ScanLine size={30} />
        {:else}
          <ImageUp size={30} />
        {/if}
      </span>

      <span class="text-sm font-semibold">
        {#if isProcessing}
          Processing QR code...
        {:else if isDragging}
          Drop image to scan
        {:else}
          Drop an image here or click to browse
        {/if}
      </span>

      <span class="text-[11px] text-base-content/50">
        {#if isProcessing}
          Please wait while the QR code is read.
        {:else}
          PNG or JPG, up to 8 MB
        {/if}
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
    disabled={isProcessing}
  />
</div>
