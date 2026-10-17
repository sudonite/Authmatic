<script lang="ts">
  import { Download, ScanText, RotateCw, Check } from "@lucide/svelte";
  import FlipCard from "@/components/FlipCard.svelte";
  import QRCode from "@/components/QRCode.svelte";
  import { downloadQRCode, generateOTPAuthUri } from "@/services/totp-service";

  interface Props {
    neptunCode: string;
  }

  let { neptunCode }: Props = $props();

  let saved = $state(false);
  let saveTimeout: number | undefined;

  const handleSave = () => {
    downloadQRCode();
    saved = true;

    clearTimeout(saveTimeout);
    saveTimeout = window.setTimeout(() => (saved = false), 2000);
  };
</script>

<div class="screen-in flex flex-1 flex-col items-center justify-center">
  <div class="key-pop">
    <FlipCard
      axis="y"
      width={264}
      height={300}
      radius={22}
      background="var(--color-base-100)"
      color="var(--color-base-content)"
      ariaLabel="QR code for {neptunCode}. Tap to flip"
      shadowOpacity={0.35}
    >
      {#snippet front()}
        <div
          class="relative flex h-full flex-col items-center justify-center bg-linear-to-br from-secondary via-accent to-primary text-secondary-content"
        >
          <div
            class="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/15 blur-2xl"
          ></div>
          <div
            class="pointer-events-none absolute -bottom-14 -left-8 h-28 w-28 rounded-full bg-white/10 blur-2xl"
          ></div>

          <span
            class="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-sm"
          >
            <ScanText size={30} />
          </span>
          <p class="relative mt-4 text-lg font-bold leading-tight">QR Code</p>
          <p class="relative mt-0.5 text-xs text-secondary-content/75">
            Neptun · {neptunCode}
          </p>

          <span
            class="flip-hint absolute bottom-4 flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-semibold backdrop-blur-sm"
          >
            <RotateCw size={12} />
            Tap to reveal
          </span>
        </div>
      {/snippet}

      {#snippet back()}
        <div class="flex h-full flex-col bg-base-100">
          <div class="flex items-center justify-between px-3.5 pt-3">
            <span
              class="rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-bold text-primary"
            >
              {neptunCode}
            </span>
            <span class="text-[10px] font-medium text-base-content/45">
              Scan to set up
            </span>
          </div>

          <div class="flex flex-1 items-center justify-center px-3">
            <div class="relative rounded-2xl bg-white p-2.5 shadow-md">
              <QRCode value={generateOTPAuthUri()} />
            </div>
          </div>

          <button
            class="btn btn-block gap-1.5 h-8 border-none shadow-none transition-colors duration-300 {saved
              ? 'bg-success text-success-content'
              : 'bg-primary text-primary-content hover:bg-primary/85'}"
            aria-label="Save QR Code"
            onclick={handleSave}
          >
            {#if saved}
              <Check size={14} /> Saved to your device
            {:else}
              <Download size={14} /> Save
            {/if}
          </button>
        </div>
      {/snippet}
    </FlipCard>
  </div>
</div>

<style>
  .key-pop {
    animation: key-pop 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  @keyframes key-pop {
    from {
      opacity: 0;
      transform: scale(0.92) translateY(6px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .flip-hint {
    animation: flip-hint 2.4s ease-in-out infinite;
  }

  @keyframes flip-hint {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }
</style>
